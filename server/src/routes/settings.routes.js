// Chủ sở hữu: Lead — US-60, US-62. Hợp đồng: docs/specs/backend_api_contract.md §3.4.
// Endpoint cần làm (đường dẫn KHÔNG có tiền tố /api — app.js đã gắn):
//   GET /settings   (luôn trả, kể cả khi bảo trì)
const express = require("express");

const router = express.Router();

module.exports = router;
