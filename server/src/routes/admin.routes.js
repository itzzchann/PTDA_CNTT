// Mọi endpoint /admin/* BẮT BUỘC: requireAuth + requireRole("admin", "super_admin") — hợp đồng §3.5.
// File chia 3 khối theo người sở hữu. Chỉ viết trong khối của mình để không conflict.
const express = require("express");

const router = express.Router();

// ===== Khối Lead — US-60, US-62 =====
//   PATCH /admin/settings

// ===== Khối DEV-1 — US-58, US-61 =====
//   GET    /admin/stats
//   GET    /admin/comments
//   PATCH  /admin/comments/:id
//   DELETE /admin/comments/:id

// ===== Khối DEV-2 — US-63 =====
//   GET   /admin/users
//   PATCH /admin/users/:id

module.exports = router;
