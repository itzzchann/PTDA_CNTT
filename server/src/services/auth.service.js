// Đăng ký, đăng nhập (mật khẩu / Google), token — hợp đồng §3.1. Chủ sở hữu: Lead.
// findUserById + toPublicUser dùng chung cho middleware auth và các service khác (đừng tự viết lại).
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const config = require("../config");
const db = require("../db");
const { AppError } = require("../errors");

const BCRYPT_COST = 12;
const PG_UNIQUE_VIOLATION = "23505";
const USERNAME_MAX_LENGTH = 30;
// So sánh với hash giả khi không có tài khoản → thời gian phản hồi như nhau, không đoán được username nào tồn tại.
const DUMMY_HASH = bcrypt.hashSync("rophim-dummy-password", BCRYPT_COST);

const USER_COLUMNS = `id, username, email, password_hash, google_id, avatar_url, role, status, created_at`;

const googleClient = new OAuth2Client(config.GOOGLE_CLIENT_ID || undefined);

const invalidCredentials = () =>
  new AppError(401, "INVALID_CREDENTIALS", "Tên đăng nhập hoặc mật khẩu không chính xác");

/** User theo hợp đồng §2 — không bao giờ có password_hash / google_id. Email chỉ khi includeEmail (chính chủ, admin). */
function toPublicUser(row, { includeEmail = false } = {}) {
  const user = {
    id: row.id,
    username: row.username,
    avatarUrl: row.avatar_url,
    role: row.role,
    status: row.status,
    createdAt: row.created_at,
  };
  if (includeEmail) user.email = row.email;
  return user;
}

async function findUserById(id) {
  const { rows } = await db.query(`SELECT ${USER_COLUMNS} FROM users WHERE id = $1`, [id]);
  return rows[0] || null;
}

function signToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRES_IN });
}

function authResult(user) {
  return { token: signToken(user), user: toPublicUser(user, { includeEmail: true }) };
}

function assertNotBanned(user) {
  if (user.status === "banned") throw new AppError(403, "ACCOUNT_BANNED", "Tài khoản đã bị khóa");
}

async function register({ username, email, password }) {
  const passwordHash = await bcrypt.hash(password, BCRYPT_COST);
  try {
    const { rows } = await db.query(
      `INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING ${USER_COLUMNS}`,
      [username, email, passwordHash],
    );
    return authResult(rows[0]);
  } catch (err) {
    if (err.code === PG_UNIQUE_VIOLATION) {
      throw new AppError(409, "CONFLICT", "Tên đăng nhập hoặc email đã được dùng");
    }
    throw err;
  }
}

async function login({ login, password }) {
  const { rows } = await db.query(
    `SELECT ${USER_COLUMNS} FROM users WHERE lower(username) = lower($1) OR lower(email) = lower($1)`,
    [login],
  );
  const user = rows[0];

  // Tài khoản chỉ có Google (password_hash NULL) cũng trả INVALID_CREDENTIALS — không tiết lộ lý do (hợp đồng §1).
  const matches = await bcrypt.compare(password, user?.password_hash || DUMMY_HASH);
  if (!user || !user.password_hash || !matches) throw invalidCredentials();

  assertNotBanned(user);
  return authResult(user);
}

// "nguyen.van-a@gmail.com" → "nguyenvana"; trùng thì thêm số ngẫu nhiên: "nguyenvana_4821".
async function createGoogleUser({ email, googleId, avatarUrl }) {
  let base = email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "").slice(0, USERNAME_MAX_LENGTH - 5);
  if (base.length < 3) base = `user${base}`;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const username = attempt === 0 ? base : `${base}_${Math.floor(1000 + Math.random() * 9000)}`;
    try {
      const { rows } = await db.query(
        `INSERT INTO users (username, email, google_id, avatar_url) VALUES ($1, $2, $3, $4) RETURNING ${USER_COLUMNS}`,
        [username, email, googleId, avatarUrl],
      );
      return rows[0];
    } catch (err) {
      // Trùng username → thử tên khác; trùng thứ khác (email vừa được tạo cùng lúc) → báo lỗi.
      if (err.code !== PG_UNIQUE_VIOLATION || err.constraint !== "users_username_lower_key") throw err;
    }
  }
  throw new AppError(409, "CONFLICT", "Không tạo được tên đăng nhập, vui lòng thử lại");
}

async function loginWithGoogle({ credential }) {
  if (!config.GOOGLE_CLIENT_ID) {
    throw new AppError(503, "GOOGLE_LOGIN_DISABLED", "Đăng nhập bằng Google chưa được bật");
  }

  // Luôn tự xác minh với Google — KHÔNG tin email / tên do frontend gửi lên.
  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: config.GOOGLE_CLIENT_ID });
    payload = ticket.getPayload();
  } catch {
    throw new AppError(401, "GOOGLE_TOKEN_INVALID", "Đăng nhập Google không hợp lệ, vui lòng thử lại");
  }
  if (!payload?.email || !payload.email_verified) {
    throw new AppError(401, "GOOGLE_EMAIL_NOT_VERIFIED", "Email Google chưa được xác minh");
  }

  // 1) Đã từng đăng nhập Google → 2) có tài khoản mật khẩu cùng email → gắn Google vào → 3) tạo mới.
  let { rows } = await db.query(`SELECT ${USER_COLUMNS} FROM users WHERE google_id = $1`, [payload.sub]);
  let user = rows[0];

  if (!user) {
    ({ rows } = await db.query(
      `UPDATE users SET google_id = $2, avatar_url = COALESCE(avatar_url, $3)
        WHERE lower(email) = lower($1) AND google_id IS NULL
        RETURNING ${USER_COLUMNS}`,
      [payload.email, payload.sub, payload.picture || null],
    ));
    user = rows[0];
  }

  if (!user) {
    user = await createGoogleUser({ email: payload.email, googleId: payload.sub, avatarUrl: payload.picture || null });
  }

  assertNotBanned(user);
  return authResult(user);
}

module.exports = { toPublicUser, findUserById, register, login, loginWithGoogle };
