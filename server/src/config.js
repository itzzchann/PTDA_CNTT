// Đọc + kiểm tra biến môi trường một lần. Thiếu biến bắt buộc → dừng ngay khi khởi động, không chạy nửa vời.
require("dotenv").config({ quiet: true });

const REQUIRED = ["DATABASE_URL", "JWT_SECRET"];

const missing = REQUIRED.filter((name) => !process.env[name]);
if (missing.length > 0) {
  console.error(`Thiếu biến môi trường: ${missing.join(", ")}. Copy server/.env.example thành server/.env rồi điền.`);
  process.exit(1);
}

if (process.env.JWT_SECRET.length < 32) {
  console.error("JWT_SECRET phải dài ít nhất 32 ký tự.");
  process.exit(1);
}

const splitList = (value) =>
  String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

module.exports = {
  PORT: Number(process.env.PORT) || 3000,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  CORS_ORIGINS: splitList(process.env.CORS_ORIGINS),
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || "",
  ADMIN_INITIAL_PASSWORD: process.env.ADMIN_INITIAL_PASSWORD || "",
  PHIMAPI_BASE_URL: process.env.PHIMAPI_BASE_URL || "https://phimapi.com",
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
  // Số proxy đứng trước server (Render = 1). Sai số này → rate limit đọc nhầm IP, mọi người dùng chung một giới hạn.
  TRUST_PROXY: Number(process.env.TRUST_PROXY) || 0,
};
