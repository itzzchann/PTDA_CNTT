// Giới hạn tốc độ theo IP — hợp đồng §4: bắt buộc cho đăng nhập và gửi bình luận.
// Vượt giới hạn → 429 RATE_LIMITED. Tạo limiter mới: createLimiter({ windowMs, limit, message }).
const { rateLimit } = require("express-rate-limit");
const { AppError } = require("../errors");

const MINUTE = 60 * 1000;

function createLimiter({ windowMs, limit, message }) {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    handler: (req, res, next) => next(new AppError(429, "RATE_LIMITED", message)),
  });
}

module.exports = {
  createLimiter,
  // Đăng nhập (mật khẩu + Google): 10 lần / 15 phút / IP.
  loginLimiter: createLimiter({
    windowMs: 15 * MINUTE,
    limit: 10,
    message: "Bạn đăng nhập quá nhiều lần, vui lòng thử lại sau 15 phút",
  }),
  // Đăng ký: 5 tài khoản / giờ / IP.
  registerLimiter: createLimiter({
    windowMs: 60 * MINUTE,
    limit: 5,
    message: "Bạn đăng ký quá nhiều lần, vui lòng thử lại sau",
  }),
};
