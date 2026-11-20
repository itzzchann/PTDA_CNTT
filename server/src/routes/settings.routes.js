// Chủ sở hữu: Lead — US-60, US-62. Hợp đồng: docs/specs/backend_api_contract.md §3.4.
// GET /settings công khai (luôn trả, kể cả khi bảo trì).
const express = require("express");
const settingsService = require("../services/settings.service");

const router = express.Router();

router.get("/settings", async (req, res, next) => {
  try {
    res.json({ data: await settingsService.getSettings() });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
