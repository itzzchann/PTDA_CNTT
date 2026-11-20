// Quản lý người dùng — hợp đồng §3.5. Chủ sở hữu: DEV-2 (US-63).
const db = require("../db");
const { AppError } = require("../errors");
const { toPublicUser } = require("./auth.service");

/**
 * Lấy danh sách thành viên cho admin (hỗ trợ tìm kiếm, lọc trạng thái, phân trang).
 * @param {Object} query - { q, status, page, limit }
 */
async function listUsers({ q, status, page = 1, limit = 20 } = {}) {
  const p = Math.max(1, parseInt(page, 10) || 1);
  const l = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const offset = (p - 1) * l;

  const conditions = [];
  const params = [];

  if (q && q.trim()) {
    params.push(`%${q.trim()}%`);
    conditions.push(`(username ILIKE $${params.length} OR email ILIKE $${params.length})`);
  }

  if (status && (status === "active" || status === "banned")) {
    params.push(status);
    conditions.push(`status = $${params.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  // Đếm tổng số bản ghi
  const countQuery = `SELECT COUNT(*) FROM users ${whereClause}`;
  const countRes = await db.query(countQuery, params);
  const totalItems = parseInt(countRes.rows[0].count, 10);

  // Lấy dữ liệu phân trang
  const dataParams = [...params, l, offset];
  const dataQuery = `
    SELECT id, username, email, avatar_url, role, status, created_at
      FROM users
     ${whereClause}
     ORDER BY created_at DESC
     LIMIT $${params.length + 1} OFFSET $${params.length + 2}
  `;
  const { rows } = await db.query(dataQuery, dataParams);

  return {
    items: rows.map((r) => toPublicUser(r, { includeEmail: true })),
    pagination: {
      page: p,
      limit: l,
      totalItems,
      totalPages: Math.max(1, Math.ceil(totalItems / l)),
    },
  };
}

/**
 * Cập nhật trạng thái người dùng (active / banned) — US-63.
 * Tự khóa mình → 400 CANNOT_BAN_SELF (Sc3).
 * Khóa super_admin → 403 FORBIDDEN.
 */
async function updateUserStatus(currentUserId, targetId, status) {
  if (status !== "active" && status !== "banned") {
    throw new AppError(400, "VALIDATION_ERROR", "Trạng thái không hợp lệ (chỉ chấp nhận active hoặc banned)");
  }

  const { rows } = await db.query(
    "SELECT id, username, email, avatar_url, role, status, created_at FROM users WHERE id = $1",
    [targetId],
  );
  const targetUser = rows[0];

  if (!targetUser) {
    throw new AppError(404, "NOT_FOUND", "Không tìm thấy người dùng này");
  }

  if (status === "banned") {
    if (String(currentUserId) === String(targetUser.id)) {
      throw new AppError(400, "CANNOT_BAN_SELF", "Không thể tự khóa tài khoản của chính mình");
    }
    if (targetUser.role === "super_admin") {
      throw new AppError(403, "FORBIDDEN", "Không thể khóa tài khoản Super Admin");
    }
  }

  const updateRes = await db.query(
    `UPDATE users
        SET status = $1
      WHERE id = $2
    RETURNING id, username, email, avatar_url, role, status, created_at`,
    [status, targetId],
  );

  return toPublicUser(updateRes.rows[0], { includeEmail: true });
}

module.exports = { listUsers, updateUserStatus };
