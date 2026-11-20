// Service xử lý thống kê quản trị (Admin Stats) — US-58.
// Chủ sở hữu: DEV-1. Hợp đồng: docs/specs/backend_api_contract.md §3.5.
const db = require("../db");

/**
 * Lấy dữ liệu thống kê tổng quan, top phim và hoạt động gần đây
 */
async function getAdminStats({ days = 7 } = {}) {
  const daysNum = Math.min(365, Math.max(1, parseInt(days, 10) || 7));

  // 1. Totals
  const userCountRes = await db.query(`SELECT COUNT(*)::int AS count FROM users`);
  const commentCountRes = await db.query(`SELECT COUNT(*)::int AS count FROM comments WHERE deleted_at IS NULL`);
  const ratingCountRes = await db.query(`SELECT COUNT(*)::int AS count FROM ratings`);
  const viewCountRes = await db.query(
    `SELECT COUNT(*)::int AS count FROM view_events WHERE created_at >= NOW() - ($1 || ' days')::interval`,
    [daysNum],
  );

  const totals = {
    users: userCountRes.rows[0]?.count || 0,
    comments: commentCountRes.rows[0]?.count || 0,
    ratings: ratingCountRes.rows[0]?.count || 0,
    views: viewCountRes.rows[0]?.count || 0,
  };

  // 2. Top viewed movies (trong khoảng ngày, nếu rỗng thì lấy toàn thời gian)
  let topViewedRes = await db.query(
    `SELECT movie_slug AS "movieSlug", COUNT(*)::int AS "views"
       FROM view_events
      WHERE created_at >= NOW() - ($1 || ' days')::interval
      GROUP BY movie_slug
      ORDER BY "views" DESC
      LIMIT 10`,
    [daysNum],
  );

  if (topViewedRes.rows.length === 0) {
    topViewedRes = await db.query(
      `SELECT movie_slug AS "movieSlug", COUNT(*)::int AS "views"
         FROM view_events
        GROUP BY movie_slug
        ORDER BY "views" DESC
        LIMIT 10`,
    );
  }

  // 3. Top favorited movies
  const topFavoritedRes = await db.query(
    `SELECT movie_slug AS "movieSlug", COUNT(*)::int AS "count"
       FROM favorites
      GROUP BY movie_slug
      ORDER BY "count" DESC
      LIMIT 10`,
  );

  // 4. Hoạt động gần đây (Union bình luận, đánh giá, đăng ký)
  const recentRes = await db.query(
    `(SELECT 'comment' AS type, c.movie_slug AS "movieSlug", u.username, c.created_at AS "createdAt"
        FROM comments c
        JOIN users u ON u.id = c.user_id
       WHERE c.deleted_at IS NULL
       ORDER BY c.created_at DESC
       LIMIT 10)
     UNION ALL
     (SELECT 'rating' AS type, r.movie_slug AS "movieSlug", u.username, r.updated_at AS "createdAt"
        FROM ratings r
        JOIN users u ON u.id = r.user_id
       ORDER BY r.updated_at DESC
       LIMIT 10)
     UNION ALL
     (SELECT 'register' AS type, NULL AS "movieSlug", username, created_at AS "createdAt"
        FROM users
       ORDER BY created_at DESC
       LIMIT 10)
     ORDER BY "createdAt" DESC
     LIMIT 15`,
  );

  return {
    totals,
    topViewed: topViewedRes.rows,
    topFavorited: topFavoritedRes.rows,
    recentActivity: recentRes.rows,
  };
}

module.exports = {
  getAdminStats,
};
