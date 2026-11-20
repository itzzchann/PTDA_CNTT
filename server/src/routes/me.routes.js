// Chủ sở hữu: DEV-2 — US-50, US-51, US-52, US-53. Hợp đồng: docs/specs/backend_api_contract.md §3.2.
// Endpoint (đường dẫn KHÔNG có tiền tố /api — app.js đã gắn):
//   GET    /me/favorites        (requireAuth)
//   POST   /me/favorites        (requireAuth)
//   DELETE /me/favorites/:slug  (requireAuth)
//   GET    /me/history          (requireAuth)
//   PUT    /me/history          (requireAuth, upsert, giữ 50 mục)
//
// Lược đồ bảng (migration 1793349455838_init-schema.js):
//   favorites(user_id, movie_slug PK, name, poster, added_at)
//   watch_history(user_id, movie_slug PK, name, poster, episode, progress, watched_at)
const express = require("express");
const { requireAuth } = require("../middlewares/auth");
const { AppError } = require("../errors");
const db = require("../db");

const router = express.Router();

// ─── Helper ──────────────────────────────────────────────────────────────────

function parsePage(query) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

function buildPagination(page, limit, totalItems) {
  return {
    page,
    limit,
    totalItems,
    totalPages: Math.max(1, Math.ceil(totalItems / limit)),
  };
}

// ─── GET /me/favorites ────────────────────────────────────────────────────────
router.get("/favorites", requireAuth, async (req, res, next) => {
  try {
    const { page, limit, offset } = parsePage(req.query);
    const userId = req.user.id;

    const countRes = await db.query(
      "SELECT COUNT(*) FROM favorites WHERE user_id = $1",
      [userId],
    );
    const totalItems = parseInt(countRes.rows[0].count, 10);

    const { rows } = await db.query(
      `SELECT movie_slug, name, poster, added_at
         FROM favorites
        WHERE user_id = $1
        ORDER BY added_at DESC
        LIMIT $2 OFFSET $3`,
      [userId, limit, offset],
    );

    const items = rows.map((r) => ({
      movieSlug: r.movie_slug,
      name: r.name,
      poster: r.poster,
      addedAt: r.added_at,
    }));

    res.json({ data: { items, pagination: buildPagination(page, limit, totalItems) } });
  } catch (err) {
    next(err);
  }
});

// ─── POST /me/favorites ───────────────────────────────────────────────────────
router.post("/favorites", requireAuth, async (req, res, next) => {
  try {
    const { movieSlug, name, poster } = req.body;
    if (!movieSlug) throw new AppError(400, "VALIDATION_ERROR", "movieSlug là bắt buộc");

    const userId = req.user.id;

    // INSERT ... ON CONFLICT DO NOTHING — PK là (user_id, movie_slug)
    const result = await db.query(
      `INSERT INTO favorites (user_id, movie_slug, name, poster)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, movie_slug) DO NOTHING`,
      [userId, movieSlug, name || "", poster || ""],
    );

    // rowCount = 0 → đã tồn tại trước (trả 200); rowCount = 1 → vừa thêm (trả 201)
    if (result.rowCount === 0) {
      return res.status(200).json({ data: { added: false } });
    }
    return res.status(201).json({ data: { added: true } });
  } catch (err) {
    next(err);
  }
});

// ─── DELETE /me/favorites/:slug ───────────────────────────────────────────────
router.delete("/favorites/:slug", requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const movieSlug = req.params.slug;

    await db.query(
      "DELETE FROM favorites WHERE user_id = $1 AND movie_slug = $2",
      [userId, movieSlug],
    );

    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

// ─── GET /me/history ──────────────────────────────────────────────────────────
router.get("/history", requireAuth, async (req, res, next) => {
  try {
    const { page, limit, offset } = parsePage(req.query);
    const userId = req.user.id;

    const countRes = await db.query(
      "SELECT COUNT(*) FROM watch_history WHERE user_id = $1",
      [userId],
    );
    const totalItems = parseInt(countRes.rows[0].count, 10);

    const { rows } = await db.query(
      `SELECT movie_slug, name, poster, episode, progress, watched_at
         FROM watch_history
        WHERE user_id = $1
        ORDER BY watched_at DESC
        LIMIT $2 OFFSET $3`,
      [userId, limit, offset],
    );

    const items = rows.map((r) => ({
      movieSlug: r.movie_slug,
      name: r.name,
      poster: r.poster,
      episode: r.episode,
      progress: r.progress,
      watchedAt: r.watched_at,
    }));

    res.json({ data: { items, pagination: buildPagination(page, limit, totalItems) } });
  } catch (err) {
    next(err);
  }
});

// ─── PUT /me/history ──────────────────────────────────────────────────────────
// Upsert theo movieSlug; giữ tối đa 50 mục mới nhất per user (hợp đồng §3.2)
// PK = (user_id, movie_slug) — không có cột id riêng
router.put("/history", requireAuth, async (req, res, next) => {
  try {
    const { movieSlug, name, poster, episode, progress } = req.body;
    if (!movieSlug) throw new AppError(400, "VALIDATION_ERROR", "movieSlug là bắt buộc");

    const userId = req.user.id;

    // Upsert: cập nhật nếu đã có bản ghi cùng user+slug
    await db.query(
      `INSERT INTO watch_history (user_id, movie_slug, name, poster, episode, progress, watched_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       ON CONFLICT (user_id, movie_slug)
       DO UPDATE SET
         name       = EXCLUDED.name,
         poster     = EXCLUDED.poster,
         episode    = EXCLUDED.episode,
         progress   = EXCLUDED.progress,
         watched_at = NOW()`,
      [userId, movieSlug, name || "", poster || "", episode || "1", Number(progress) || 0],
    );

    // Giữ tối đa 50 mục mới nhất — xóa phần dư bằng CTE (PK không có id riêng)
    await db.query(
      `DELETE FROM watch_history
        WHERE user_id = $1
          AND movie_slug NOT IN (
            SELECT movie_slug FROM watch_history
             WHERE user_id = $1
             ORDER BY watched_at DESC
             LIMIT 50
          )`,
      [userId],
    );

    res.status(200).json({ data: { saved: true } });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
