// npm run reset-admin — đổi username + mật khẩu của super_admin, tìm bằng ADMIN_EMAIL trong server/.env.
// Khác seed-admin.js: seed bỏ qua khi email đã tồn tại, KHÔNG đổi được mật khẩu.
// Script này UPDATE trực tiếp: đặt username = RESET_ADMIN_USERNAME, password_hash = bcrypt(RESET_ADMIN_PASSWORD, 12).
// Mặc định username: "admin123", mật khẩu: "88888888" — chỉ là placeholder để test, đổi lại ngay sau khi chạy.
const bcrypt = require("bcryptjs");
const config = require("../config");
const db = require("../db");

const BCRYPT_COST = 12;

async function resetAdmin() {
  const email = config.ADMIN_EMAIL.trim();
  const username = (process.env.RESET_ADMIN_USERNAME || "admin123").trim();
  const password = process.env.RESET_ADMIN_PASSWORD || "88888888";

  if (!email) {
    throw new Error("Cần ADMIN_EMAIL trong server/.env (email của tài khoản super_admin cần reset).");
  }
  if (!username || username.length < 3) {
    throw new Error("RESET_ADMIN_USERNAME phải có ít nhất 3 ký tự.");
  }
  if (password.length < 8) {
    throw new Error("RESET_ADMIN_PASSWORD phải có ít nhất 8 ký tự.");
  }

  const existing = await db.query(
    "SELECT id, username, role FROM users WHERE lower(email) = lower($1)",
    [email],
  );
  if (existing.rows.length === 0) {
    throw new Error(`Không tìm thấy tài khoản nào với email ${email}. Kiểm tra lại ADMIN_EMAIL.`);
  }
  if (existing.rows[0].role !== "super_admin") {
    throw new Error(
      `Tài khoản ${email} hiện là "${existing.rows[0].role}", không phải super_admin. ` +
        "Script này chỉ reset super_admin — nâng role bằng SQL thủ công trước.",
    );
  }

  // Kiểm tra username đích có bị trùng với tài khoản khác không (username unique).
  const conflict = await db.query(
    "SELECT id, email FROM users WHERE lower(username) = lower($1) AND id <> $2",
    [username, existing.rows[0].id],
  );
  if (conflict.rows.length > 0) {
    throw new Error(
      `Username "${username}" đã thuộc tài khoản khác (${conflict.rows[0].email}). Chọn username khác qua RESET_ADMIN_USERNAME.`,
    );
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_COST);
  await db.query(
    "UPDATE users SET username = $1, password_hash = $2 WHERE id = $3",
    [username, passwordHash, existing.rows[0].id],
  );
  console.log(
    `Đã reset super_admin: "${existing.rows[0].username}" → "${username}" (${email}). Đăng nhập bằng username mới + mật khẩu đã đặt.`,
  );
}

resetAdmin()
  .catch((err) => {
    console.error(`✗ ${err.message}`);
    process.exitCode = 1;
  })
  .finally(() => db.pool.end());
