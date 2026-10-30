// Pool PostgreSQL dùng chung. Pool chỉ mở kết nối khi có truy vấn đầu tiên.
// Luôn dùng tham số $1, $2... — KHÔNG ghép chuỗi SQL từ input.
const { Pool } = require("pg");
const config = require("./config");

const pool = new Pool({
  connectionString: config.DATABASE_URL,
  // Neon / Render yêu cầu SSL; Postgres local (Docker) thì không.
  ssl: /localhost|127\.0\.0\.1/.test(config.DATABASE_URL) ? false : { rejectUnauthorized: false },
});

function query(text, params) {
  return pool.query(text, params);
}

module.exports = { pool, query };
