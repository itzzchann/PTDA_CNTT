// Chủ sở hữu: DEV-2 — US-50, US-51, US-52, US-53. Hợp đồng: docs/specs/backend_api_contract.md §3.2.
// Endpoint cần làm (đường dẫn KHÔNG có tiền tố /api — app.js đã gắn):
//   GET    /me/favorites        (requireAuth)
//   POST   /me/favorites        (requireAuth)
//   DELETE /me/favorites/:slug  (requireAuth)
//   GET    /me/history          (requireAuth)
//   PUT    /me/history          (requireAuth, upsert, giữ 50 mục)
const express = require("express");

const router = express.Router();

module.exports = router;
