// Pool PostgreSQL dùng chung. Pool chỉ mở kết nối khi có truy vấn đầu tiên.
// Luôn dùng tham số $1, $2... — KHÔNG ghép chuỗi SQL từ input.
const { Pool } = require("pg");
const config = require("./config");

const pool = new Pool({
  connectionString: config.DATABASE_URL,
  // Neon / Render yêu cầu SSL; Postgres local (Docker) thì không.
  ssl: /localhost|127\.0\.0\.1/.test(config.DATABASE_URL) ? false : { rejectUnauthorized: false },
});

// Tự động kiểm tra và tạo bảng comment_likes nếu chưa có (phòng khi deploy chưa chạy migration)
async function ensureTables() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS comment_likes (
        comment_id uuid NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
        user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at timestamptz DEFAULT now() NOT NULL,
        PRIMARY KEY (comment_id, user_id)
      );
      CREATE INDEX IF NOT EXISTS comment_likes_comment_id_idx ON comment_likes(comment_id);
    `);
  } catch (err) {
    // Không crash server nếu DB chưa kết nối lúc boot
  }
}
ensureTables();

function query(text, params) {
  return pool.query(text, params);
}

module.exports = { pool, query };
