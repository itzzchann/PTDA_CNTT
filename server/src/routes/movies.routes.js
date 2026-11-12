// Chủ sở hữu: DEV-1 — US-54, US-55, US-56, US-58. Hợp đồng: docs/specs/backend_api_contract.md §3.3.
const express = require("express");
const { z } = require("zod");
const validate = require("../middlewares/validate");
const { requireAuth, optionalAuth } = require("../middlewares/auth");
const { commentLimiter } = require("../middlewares/rate-limit");
const commentService = require("../services/comment.service");
const ratingService = require("../services/rating.service");

const router = express.Router();

const slugParamSchema = z.object({
  slug: z.string().min(1, "Slug không hợp lệ"),
});

const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
});

// GET /movies/:slug/comments (US-54)
router.get(
  "/movies/:slug/comments",
  validate({ params: slugParamSchema, query: paginationQuerySchema }),
  async (req, res, next) => {
    try {
      const data = await commentService.getCommentsByMovieSlug(req.params.slug, req.query);
      res.json({ data });
    } catch (err) {
      next(err);
    }
  },
);

// POST /movies/:slug/comments (US-55)
const postCommentBodySchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Nội dung bình luận không được để trống")
    .max(1000, "Nội dung bình luận tối đa 1000 ký tự"),
  isSpoiler: z.boolean().optional().default(false),
  episode: z.string().max(50).nullable().optional(),
});

router.post(
  "/movies/:slug/comments",
  requireAuth,
  commentLimiter,
  validate({ params: slugParamSchema, body: postCommentBodySchema }),
  async (req, res, next) => {
    try {
      const comment = await commentService.createComment(req.user, req.params.slug, req.body);
      res.status(201).json({ data: comment });
    } catch (err) {
      next(err);
    }
  },
);

// GET /movies/:slug/ratings (US-56)
router.get(
  "/movies/:slug/ratings",
  optionalAuth,
  validate({ params: slugParamSchema, query: paginationQuerySchema }),
  async (req, res, next) => {
    try {
      const data = await ratingService.getRatingsByMovieSlug(req.params.slug, {
        ...req.query,
        currentUser: req.user,
      });
      res.json({ data });
    } catch (err) {
      next(err);
    }
  },
);

// POST /movies/:slug/ratings (US-56: 1..10)
const postRatingBodySchema = z.object({
  score: z.coerce
    .number()
    .int()
    .min(1, "Điểm đánh giá tối thiểu là 1")
    .max(10, "Điểm đánh giá tối đa là 10"),
  content: z.string().trim().max(1000, "Nội dung đánh giá tối đa 1000 ký tự").nullable().optional(),
});

router.post(
  "/movies/:slug/ratings",
  requireAuth,
  validate({ params: slugParamSchema, body: postRatingBodySchema }),
  async (req, res, next) => {
    try {
      const data = await ratingService.upsertRating(req.user, req.params.slug, req.body);
      res.json({ data });
    } catch (err) {
      next(err);
    }
  },
);

// POST /movies/:slug/views (US-58: ghi nhận lượt xem)
const postViewBodySchema = z
  .object({
    episode: z.string().max(50).nullable().optional(),
  })
  .optional();

router.post(
  "/movies/:slug/views",
  optionalAuth,
  validate({ params: slugParamSchema, body: postViewBodySchema }),
  async (req, res, next) => {
    try {
      await ratingService.recordMovieView(req.params.slug, req.body?.episode, req.user?.id);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  },
);

module.exports = router;
