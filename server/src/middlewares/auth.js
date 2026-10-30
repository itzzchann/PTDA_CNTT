// requireAuth / optionalAuth / requireRole — dùng cho mọi route cần biết người gọi là ai.
//   router.get("/me/history", requireAuth, handler)                      → req.user (bản ghi CSDL đầy đủ)
//   router.get("/movies/:slug/ratings", optionalAuth, handler)           → req.user hoặc null
//   router.get("/admin/stats", requireAuth, requireRole("admin", "super_admin"), handler)
const jwt = require("jsonwebtoken");
const config = require("../config");
const { AppError } = require("../errors");
const { findUserById } = require("../services/auth.service");

const unauthorized = () => new AppError(401, "UNAUTHORIZED", "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");

function readToken(req) {
  const header = req.headers.authorization || "";
  return header.startsWith("Bearer ") ? header.slice(7).trim() : "";
}

// Token hợp lệ → user đọc LẠI từ CSDL (biết ngay nếu vừa bị khóa / đổi quyền). Không có token → null.
async function resolveUser(req) {
  const token = readToken(req);
  if (!token) return null;

  let payload;
  try {
    payload = jwt.verify(token, config.JWT_SECRET);
  } catch {
    throw unauthorized();
  }

  const user = await findUserById(payload.sub);
  if (!user) throw unauthorized();
  if (user.status === "banned") throw new AppError(403, "ACCOUNT_BANNED", "Tài khoản đã bị khóa");
  return user;
}

async function requireAuth(req, res, next) {
  try {
    const user = await resolveUser(req);
    if (!user) throw unauthorized();
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

// Khách vẫn qua được; có token thì token phải hợp lệ (token hỏng → 401 để frontend xóa phiên cũ).
async function optionalAuth(req, res, next) {
  try {
    req.user = await resolveUser(req);
    next();
  } catch (err) {
    next(err);
  }
}

// Luôn đặt SAU requireAuth.
const requireRole =
  (...roles) =>
  (req, res, next) =>
    req.user && roles.includes(req.user.role)
      ? next()
      : next(new AppError(403, "FORBIDDEN", "Bạn không có quyền thực hiện thao tác này"));

module.exports = { requireAuth, optionalAuth, requireRole };
