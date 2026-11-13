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

// ===== Khối DEV-2 — US-63 =====
//   GET   /admin/users
//   PATCH /admin/users/:id
const userService = require("../services/user.service");

router.get(
  "/admin/users",
  requireAuth,
  requireRole("admin", "super_admin"),
  async (req, res, next) => {
    try {
      const data = await userService.listUsers(req.query);
      res.json({ data });
    } catch (err) {
      next(err);
    }
  },
);

router.patch(
  "/admin/users/:id",
  requireAuth,
  requireRole("admin", "super_admin"),
  async (req, res, next) => {
    try {
      const status = req.body?.status;
      const user = await userService.updateUserStatus(req.user.id, req.params.id, status);
      res.json({ data: user });
    } catch (err) {
      next(err);
    }
  },
);

module.exports = router;
