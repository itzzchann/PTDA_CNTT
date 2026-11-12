// Mọi endpoint /admin/* BẮT BUỘC: requireAuth + requireRole("admin", "super_admin") — hợp đồng §3.5.
// File chia 3 khối theo người sở hữu. Chỉ viết trong khối của mình để không conflict.
const express = require("express");

const router = express.Router();

// ===== Khối Lead — US-60, US-62 =====
//   PATCH /admin/settings
const { z } = require("zod");
const settingsService = require("../services/settings.service");
const validate = require("../middlewares/validate");
const { requireAuth, requireRole } = require("../middlewares/auth");
const { invalidateMaintenanceCache } = require("../middlewares/maintenance");

const patchSchema = z
  .object({
    maintenanceMode: z.boolean().optional(),
    maintenanceMessage: z.string().max(500, "Lời nhắn tối đa 500 ký tự").optional(),
    pinnedHeroSlug: z.string().max(255).nullable().optional(),
    movieApiBaseUrl: z.string().max(255).nullable().optional(),
  })
  .strict();

router.patch(
  "/admin/settings",
  requireAuth,
  requireRole("admin", "super_admin"),
  validate({ body: patchSchema }),
  async (req, res, next) => {
    try {
      const settings = await settingsService.updateSettings(req.body);
      invalidateMaintenanceCache();
      res.json({ data: settings });
    } catch (err) {
      next(err);
    }
  },
);

// ===== Khối DEV-1 — US-58, US-61 =====
//   GET    /admin/stats
//   GET    /admin/comments
//   PATCH  /admin/comments/:id
//   DELETE /admin/comments/:id
const statsService = require("../services/stats.service");
const commentService = require("../services/comment.service");

const statsQuerySchema = z.object({
  days: z.coerce.number().int().min(1).max(365).optional().default(7),
});

router.get(
  "/admin/stats",
  requireAuth,
  requireRole("admin", "super_admin"),
  validate({ query: statsQuerySchema }),
  async (req, res, next) => {
    try {
      const data = await statsService.getAdminStats({ days: req.query.days });
      res.json({ data });
    } catch (err) {
      next(err);
    }
  },
);

const adminCommentsQuerySchema = z.object({
  movieSlug: z.string().optional(),
  q: z.string().optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
});

router.get(
  "/admin/comments",
  requireAuth,
  requireRole("admin", "super_admin"),
  validate({ query: adminCommentsQuerySchema }),
  async (req, res, next) => {
    try {
      const data = await commentService.getAdminComments(req.query);
      res.json({ data });
    } catch (err) {
      next(err);
    }
  },
);

const commentIdParamSchema = z.object({
  id: z.string().uuid("ID bình luận không hợp lệ"),
});

const patchCommentSchema = z.object({
  isSpoiler: z.boolean().default(true),
});

router.patch(
  "/admin/comments/:id",
  requireAuth,
  requireRole("admin", "super_admin"),
  validate({ params: commentIdParamSchema, body: patchCommentSchema }),
  async (req, res, next) => {
    try {
      const comment = await commentService.flagCommentSpoiler(req.params.id, req.body.isSpoiler);
      res.json({ data: comment });
    } catch (err) {
      next(err);
    }
  },
);

router.delete(
  "/admin/comments/:id",
  requireAuth,
  requireRole("admin", "super_admin"),
  validate({ params: commentIdParamSchema }),
  async (req, res, next) => {
    try {
      await commentService.adminDeleteComment(req.params.id);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  },
);

// ===== Khối DEV-2 — US-63 =====
//   GET   /admin/users
//   PATCH /admin/users/:id

module.exports = router;
