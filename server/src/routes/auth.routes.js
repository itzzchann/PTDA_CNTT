// Chủ sở hữu: Lead — US-18, US-19. Hợp đồng: docs/specs/backend_api_contract.md §3.1.
// Route chỉ: rate limit → validate → gọi service. Logic + SQL nằm ở services/auth.service.js.
const express = require("express");
const { z } = require("zod");
const authService = require("../services/auth.service");
const validate = require("../middlewares/validate");
const { requireAuth } = require("../middlewares/auth");
const { loginLimiter, registerLimiter } = require("../middlewares/rate-limit");

const router = express.Router();

const registerSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Tên đăng nhập cần 3–30 ký tự")
    .max(30, "Tên đăng nhập cần 3–30 ký tự")
    .regex(/^[a-zA-Z0-9_]+$/, "Tên đăng nhập chỉ gồm chữ không dấu, số và dấu _"),
  email: z.string().trim().max(255, "Email quá dài").email("Email không hợp lệ"),
  // bcrypt chỉ dùng 72 byte đầu → chặn dài hơn để không có 2 mật khẩu "khác nhau" mà vẫn khớp.
  password: z.string().min(8, "Mật khẩu cần ít nhất 8 ký tự").max(72, "Mật khẩu tối đa 72 ký tự"),
});

const loginSchema = z.object({
  login: z.string().trim().min(1, "Nhập tên đăng nhập hoặc email").max(255),
  password: z.string().min(1, "Nhập mật khẩu").max(72, "Mật khẩu tối đa 72 ký tự"),
});

const googleSchema = z.object({
  credential: z.string().min(1, "Thiếu thông tin đăng nhập Google").max(4096),
});

router.post("/auth/register", registerLimiter, validate({ body: registerSchema }), async (req, res, next) => {
  try {
    res.status(201).json({ data: await authService.register(req.body) });
  } catch (err) {
    next(err);
  }
});

router.post("/auth/login", loginLimiter, validate({ body: loginSchema }), async (req, res, next) => {
  try {
    res.json({ data: await authService.login(req.body) });
  } catch (err) {
    next(err);
  }
});

router.post("/auth/google", loginLimiter, validate({ body: googleSchema }), async (req, res, next) => {
  try {
    res.json({ data: await authService.loginWithGoogle(req.body) });
  } catch (err) {
    next(err);
  }
});

// JWT không lưu ở server → đăng xuất = frontend xóa token (clearAuthSession). Endpoint để frontend gọi thống nhất
// và kiểm tra token; tài khoản bị khóa thì requireAuth đã chặn ở mọi request sau đó (hợp đồng §4).
router.post("/auth/logout", requireAuth, (req, res) => {
  res.status(204).end();
});

router.get("/auth/me", requireAuth, (req, res) => {
  res.json({ data: { user: authService.toPublicUser(req.user, { includeEmail: true }) } });
});

module.exports = router;
