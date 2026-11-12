// Service xử lý đánh giá (Rating) & lượt xem (Views) — US-56, US-58.
// Chủ sở hữu: DEV-1. Hợp đồng: docs/specs/backend_api_contract.md §3.3.
const db = require("../db");
const { AppError } = require("../errors");

/**
 * Tính toán tóm tắt điểm đánh giá (summary) cho một phim
 */
async function getRatingSummary(slug) {
  const statRes = await db.query(
    `SELECT COUNT(*)::int AS total,
            COALESCE(ROUND(AVG(score)::numeric, 1), 0)::float AS average
       FROM ratings
      WHERE movie_slug = $1`,
    [slug],
  );

  const total = statRes.rows[0]?.total || 0;
  const average = statRes.rows[0]?.average || 0;

  const distRes = await db.query(
    `SELECT score, COUNT(*)::int AS count
       FROM ratings
      WHERE movie_slug = $1
      GROUP BY score`,
    [slug],
  );

  const distribution = {};
  for (let i = 1; i <= 10; i++) {
    distribution[String(i)] = 0;
  }
  distRes.rows.forEach((r) => {
    distribution[String(r.score)] = r.count;
  });

  return { average, total, distribution };
}

/**
 * Lấy danh sách đánh giá kèm tóm tắt và điểm của tôi (US-56)
 */
async function getRatingsByMovieSlug(slug, { page = 1, limit = 20, currentUser = null } = {}) {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
  const offset = (pageNum - 1) * limitNum;

  const summary = await getRatingSummary(slug);

  let myScore = null;
  if (currentUser) {
    const myRes = await db.query(
      `SELECT score FROM ratings WHERE movie_slug = $1 AND user_id = $2`,
      [slug, currentUser.id],
    );
    if (myRes.rows.length > 0) {
      myScore = myRes.rows[0].score;
    }
  }

  const totalPages = Math.ceil(summary.total / limitNum) || 1;

  const { rows } = await db.query(
    `SELECT r.id, r.score, r.content, r.created_at AS "createdAt", r.updated_at AS "updatedAt",
            json_build_object('id', u.id, 'username', u.username, 'avatarUrl', u.avatar_url) AS "user"
       FROM ratings r
       JOIN users u ON u.id = r.user_id
      WHERE r.movie_slug = $1
      ORDER BY r.updated_at DESC
      LIMIT $2 OFFSET $3`,
    [slug, limitNum, offset],
  );

  return {
    summary,
    myScore,
    items: rows,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total: summary.total,
      totalPages,
    },
  };
}

/**
 * Gửi / Cập nhật đánh giá (US-56: 1 người / 1 phim, gửi lại = cập nhật)
 */
async function upsertRating(user, slug, { score, content = null }) {
  const numScore = parseInt(score, 10);
  if (isNaN(numScore) || numScore < 1 || numScore > 10) {
    throw new AppError(400, "VALIDATION_ERROR", "Điểm đánh giá phải từ 1 đến 10", {
      score: "Điểm đánh giá phải từ 1 đến 10",
    });
  }

  const trimmedContent = content && content.trim() ? content.trim() : null;

  await db.query(
    `INSERT INTO ratings (user_id, movie_slug, score, content, updated_at)
     VALUES ($1, $2, $3, $4, NOW())
     ON CONFLICT (user_id, movie_slug)
     DO UPDATE SET score = EXCLUDED.score, content = EXCLUDED.content, updated_at = NOW()`,
    [user.id, slug, numScore, trimmedContent],
  );

  const summary = await getRatingSummary(slug);
  return { summary };
}

/**
 * Ghi nhận lượt xem phim cho thống kê US-58
 */
async function recordMovieView(slug, episode = null, userId = null) {
  await db.query(
    `INSERT INTO view_events (movie_slug, episode, user_id)
     VALUES ($1, $2, $3)`,
    [slug, episode ? String(episode) : null, userId || null],
  );
}

module.exports = {
  getRatingSummary,
  getRatingsByMovieSlug,
  upsertRating,
  recordMovieView,
};
