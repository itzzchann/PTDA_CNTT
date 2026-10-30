// Chủ sở hữu: DEV-1 — US-55. Hợp đồng: docs/specs/backend_api_contract.md §3.3.
// Endpoint cần làm (đường dẫn KHÔNG có tiền tố /api — app.js đã gắn):
//   DELETE /comments/:id   (requireAuth; chủ bình luận hoặc admin)
const express = require("express");

const router = express.Router();

module.exports = router;
