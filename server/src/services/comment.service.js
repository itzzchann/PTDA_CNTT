// Service xử lý nghiệp vụ bình luận — US-54, US-55, US-61.
// Chủ sở hữu: DEV-1. Hợp đồng: docs/specs/backend_api_contract.md §3.3 & §3.5.
const db = require("../db");
const { AppError } = require("../errors");

/**
 * Lấy danh sách bình luận công khai theo slug phim (US-54)
 */
async function getCommentsByMovieSlug(slug, { page = 1, limit = 20 } = {}) {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
  const offset = (pageNum - 1) * limitNum;

  const countRes = await db.query(
    `SELECT COUNT(*)::int AS total FROM comments WHERE movie_slug = $1 AND deleted_at IS NULL`,
    [slug],
  );
  const total = countRes.rows[0]?.total || 0;
  const totalPages = Math.ceil(total / limitNum) || 1;

  const { rows } = await db.query(
    `SELECT c.id, c.movie_slug AS "movieSlug", c.episode, c.content, c.is_spoiler AS "isSpoiler", c.created_at AS "createdAt",
            json_build_object('id', u.id, 'username', u.username, 'avatarUrl', u.avatar_url) AS "user"
       FROM comments c
       JOIN users u ON u.id = c.user_id
      WHERE c.movie_slug = $1 AND c.deleted_at IS NULL
      ORDER BY c.created_at DESC
      LIMIT $2 OFFSET $3`,
    [slug, limitNum, offset],
  );

  return {
    items: rows,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages,
    },
  };
}

/**
 * Tạo bình luận mới (US-55)
 */
async function createComment(user, slug, { content, isSpoiler = false, episode = null }) {
  const trimmed = (content || "").trim();
  if (!trimmed) {
    throw new AppError(400, "VALIDATION_ERROR", "Nội dung bình luận không được để trống", {
      content: "Nội dung không được để trống",
    });
  }

  const { rows } = await db.query(
    `INSERT INTO comments (user_id, movie_slug, episode, content, is_spoiler)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, movie_slug AS "movieSlug", episode, content, is_spoiler AS "isSpoiler", created_at AS "createdAt"`,
    [user.id, slug, episode || null, trimmed, Boolean(isSpoiler)],
  );

  const comment = rows[0];
  comment.user = {
    id: user.id,
    username: user.username,
    avatarUrl: user.avatarUrl || user.avatar_url || null,
  };

  return comment;
}

/**
 * Xóa bình luận (chủ bình luận hoặc admin) (US-55)
 */
async function deleteComment(user, id) {
  const { rows } = await db.query(
    `SELECT id, user_id, deleted_at FROM comments WHERE id = $1`,
    [id],
  );

  if (rows.length === 0 || rows[0].deleted_at !== null) {
    throw new AppError(404, "NOT_FOUND", "Không tìm thấy bình luận");
  }

  const comment = rows[0];
  const isOwner = comment.user_id === user.id;
  const isAdmin = user.role === "admin" || user.role === "super_admin";

  if (!isOwner && !isAdmin) {
    throw new AppError(403, "FORBIDDEN", "Bạn không có quyền xóa bình luận này");
  }

  // Soft delete để lưu vết cho quản trị (US-61)
  await db.query(`UPDATE comments SET deleted_at = NOW() WHERE id = $1`, [id]);
}

/**
 * Danh sách bình luận cho admin kiểm duyệt (US-61)
 */
async function getAdminComments({ movieSlug, q, page = 1, limit = 20 } = {}) {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
  const offset = (pageNum - 1) * limitNum;

  const conditions = ["c.deleted_at IS NULL"];
  const params = [];

  if (movieSlug) {
    params.push(movieSlug);
    conditions.push(`c.movie_slug = $${params.length}`);
  }

  if (q && q.trim()) {
    params.push(`%${q.trim()}%`);
    conditions.push(`(c.content ILIKE $${params.length} OR u.username ILIKE $${params.length})`);
  }

  const whereSql = `WHERE ${conditions.join(" AND ")}`;

  const countRes = await db.query(
    `SELECT COUNT(*)::int AS total
       FROM comments c
       JOIN users u ON u.id = c.user_id
     ${whereSql}`,
    params,
  );

  const total = countRes.rows[0]?.total || 0;
  const totalPages = Math.ceil(total / limitNum) || 1;

  params.push(limitNum);
  const limitIndex = params.length;
  params.push(offset);
  const offsetIndex = params.length;

  const { rows } = await db.query(
    `SELECT c.id, c.movie_slug AS "movieSlug", c.episode, c.content, c.is_spoiler AS "isSpoiler", c.created_at AS "createdAt",
            json_build_object('id', u.id, 'username', u.username, 'avatarUrl', u.avatar_url) AS "user"
       FROM comments c
       JOIN users u ON u.id = c.user_id
     ${whereSql}
      ORDER BY c.created_at DESC
      LIMIT $${limitIndex} OFFSET $${offsetIndex}`,
    params,
  );

  return {
    items: rows,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages,
    },
  };
}

/**
 * Admin gắn cờ spoiler (US-61)
 */
async function flagCommentSpoiler(id, isSpoiler = true) {
  const { rows } = await db.query(
    `UPDATE comments
        SET is_spoiler = $2
      WHERE id = $1 AND deleted_at IS NULL
  RETURNING id, movie_slug AS "movieSlug", episode, content, is_spoiler AS "isSpoiler", created_at AS "createdAt"`,
    [id, Boolean(isSpoiler)],
  );

  if (rows.length === 0) {
    throw new AppError(404, "NOT_FOUND", "Không tìm thấy bình luận");
  }

  const userRes = await db.query(
    `SELECT u.id, u.username, u.avatar_url AS "avatarUrl"
       FROM comments c JOIN users u ON u.id = c.user_id WHERE c.id = $1`,
    [id],
  );

  const comment = rows[0];
  comment.user = userRes.rows[0] || null;
  return comment;
}

/**
 * Admin xóa bình luận (US-61)
 */
async function adminDeleteComment(id) {
  const { rows } = await db.query(
    `SELECT id, deleted_at FROM comments WHERE id = $1`,
    [id],
  );

  if (rows.length === 0 || rows[0].deleted_at !== null) {
    throw new AppError(404, "NOT_FOUND", "Không tìm thấy bình luận");
  }

  await db.query(`UPDATE comments SET deleted_at = NOW() WHERE id = $1`, [id]);
}

module.exports = {
  getCommentsByMovieSlug,
  createComment,
  deleteComment,
  getAdminComments,
  flagCommentSpoiler,
  adminDeleteComment,
};
