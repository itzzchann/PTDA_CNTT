// npm run seed — tạo tài khoản super_admin đầu tiên từ ADMIN_EMAIL / ADMIN_INITIAL_PASSWORD.
// Chạy lại nhiều lần vẫn an toàn: email đã có thì bỏ qua, không đổi mật khẩu.
const bcrypt = require("bcryptjs");
const config = require("../config");
const db = require("../db");

const ADMIN_USERNAME = "admin";
const BCRYPT_COST = 12;
const EXAMPLE_PASSWORD = "doi-ngay-sau-lan-dau"; // giá trị mẫu trong .env.example

async function seedAdmin() {
  const email = config.ADMIN_EMAIL.trim();
  const password = config.ADMIN_INITIAL_PASSWORD;

  if (!email || password.length < 8) {
    throw new Error("Cần ADMIN_EMAIL và ADMIN_INITIAL_PASSWORD (≥ 8 ký tự) trong server/.env.");
  }
  if (password === EXAMPLE_PASSWORD) {
    console.warn("⚠️  ADMIN_INITIAL_PASSWORD đang là giá trị mẫu — chỉ dùng ở máy mình, đổi ngay trên CSDL chung / production.");
  }

  const existing = await db.query("SELECT id, role FROM users WHERE lower(email) = lower($1)", [email]);
  if (existing.rows.length > 0) {
    console.log(`Đã có tài khoản ${email} (role: ${existing.rows[0].role}) — bỏ qua.`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_COST);
  await db.query(
    `INSERT INTO users (username, email, password_hash, role)
     VALUES ($1, $2, $3, 'super_admin')`,
    [ADMIN_USERNAME, email, passwordHash],
  );
  console.log(`Đã tạo super_admin "${ADMIN_USERNAME}" (${email}).`);
}

seedAdmin()
  .catch((err) => {
    console.error(err.message);
    process.exitCode = 1;
  })
  .finally(() => db.pool.end());
