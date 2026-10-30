// Chủ sở hữu: DEV-1 — US-54, US-55, US-56, US-58. Hợp đồng: docs/specs/backend_api_contract.md §3.3.
// Endpoint cần làm (đường dẫn KHÔNG có tiền tố /api — app.js đã gắn):
//   GET  /movies/:slug/comments
//   POST /movies/:slug/comments  (requireAuth)
//   GET  /movies/:slug/ratings   (optionalAuth → myScore)
//   POST /movies/:slug/ratings   (requireAuth)
//   POST /movies/:slug/views
const express = require("express");

const router = express.Router();

module.exports = router;
