// Chủ sở hữu: Lead — US-18, US-19. Hợp đồng: docs/specs/backend_api_contract.md §3.1.
// Endpoint cần làm (đường dẫn KHÔNG có tiền tố /api — app.js đã gắn):
//   POST /auth/register
//   POST /auth/login
//   POST /auth/google
//   POST /auth/logout   (requireAuth)
//   GET  /auth/me       (requireAuth)
const express = require("express");

const router = express.Router();

module.exports = router;
