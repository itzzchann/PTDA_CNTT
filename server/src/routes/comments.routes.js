// Chủ sở hữu: DEV-1 — US-55. Hợp đồng: docs/specs/backend_api_contract.md §3.3.
const express = require("express");
const { z } = require("zod");
const validate = require("../middlewares/validate");
const { requireAuth } = require("../middlewares/auth");
const commentService = require("../services/comment.service");

const router = express.Router();

const idParamSchema = z.object({
  id: z.string().uuid("ID bình luận không hợp lệ"),
});

// DELETE /comments/:id (chủ bình luận hoặc admin)
router.delete(
  "/comments/:id",
  requireAuth,
  validate({ params: idParamSchema }),
  async (req, res, next) => {
    try {
      await commentService.deleteComment(req.user, req.params.id);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  },
);

module.exports = router;
