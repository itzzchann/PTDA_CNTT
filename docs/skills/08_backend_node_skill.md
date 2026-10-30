# Skill 08 — Backend Node.js + Express + PostgreSQL

> Dành cho 2 dev backend (và AI agent làm backend). Đã chốt ngày 22/10/2026: **Node.js 20 LTS + Express 4 + PostgreSQL 16**.
> Hợp đồng phải tuân theo: [backend_api_contract.md](../specs/backend_api_contract.md) — **nguồn sự thật duy nhất** giữa FE và BE.
> Deploy: [06_trien_khai.md](../guides/06_trien_khai.md).

---

## 1. Thư mục `server/` trong repo chung

Backend nằm ở thư mục **`server/`** của repo `PTDA_CNTT` (chốt 30/10/2026: một repo cho dễ quản lý). Cùng Git flow:
`main` / `develop` / mỗi người 1 nhánh tên mình, Conventional Commits, PR vào `develop`.

⚠️ Host tĩnh của frontend phục vụ **mọi file** trong repo → **bắt buộc** chặn `server/` khi deploy
([06 §3.4](../guides/06_trien_khai.md#34-những-gì-sẽ-bị-công-khai)), nếu không ai cũng đọc được mã nguồn server và file migration.
`server/.env` không bao giờ commit (`.gitignore` gốc đã chặn `.env` ở mọi thư mục). Mọi lệnh `npm` chạy **trong `server/`**.

```
server/                       # trong repo PTDA_CNTT, cạnh index.html
├── package.json
├── .env.example              # liệt kê biến môi trường, KHÔNG có giá trị thật
├── .gitignore                # node_modules, .env
├── README.md                 # cách chạy local
├── migrations/               # node-pg-migrate: mỗi thay đổi CSDL một file
├── src/
│   ├── server.js             # đọc env, app.listen
│   ├── app.js                # tạo express app: helmet, cors, json, routes, error handler
│   ├── config.js             # đọc + kiểm tra biến môi trường (thiếu → dừng ngay khi khởi động)
│   ├── db.js                 # pg Pool dùng chung, hàm query()
│   ├── errors.js             # class AppError(status, code, message)
│   ├── middlewares/
│   │   ├── auth.js           # requireAuth, optionalAuth, requireRole("admin")
│   │   ├── validate.js       # validate body/query bằng zod
│   │   ├── maintenance.js    # chặn request ghi khi maintenance_mode (US-62)
│   │   └── error-handler.js  # mọi lỗi → { error: { code, message } }
│   ├── routes/               # 1 file / nhóm endpoint, chỉ khai báo route + validate + gọi service
│   │   ├── auth.routes.js
│   │   ├── me.routes.js
│   │   ├── movies.routes.js  # comments, ratings, views theo :slug
│   │   ├── comments.routes.js
│   │   ├── settings.routes.js
│   │   └── admin.routes.js
│   └── services/             # logic + SQL; không biết gì về req/res
│       ├── auth.service.js
│       ├── user.service.js
│       ├── comment.service.js
│       ├── rating.service.js
│       ├── settings.service.js
│       ├── stats.service.js
│       └── phimapi.service.js   # kiểm tra slug phim tồn tại (US-60)
└── tests/                    # (khuyến khích) supertest cho các endpoint chính
```

Quy tắc phân lớp (giống CORE/PAGE bên frontend): **route** → validate → **service** → **db**.
Route không viết SQL; service không đụng `req`/`res`.

## 2. Thư viện

| Gói | Dùng cho |
|---|---|
| `express` | HTTP server |
| `pg` | Kết nối PostgreSQL (dùng **query có tham số** `$1, $2` — không ghép chuỗi SQL) |
| `node-pg-migrate` | Migration CSDL |
| `bcryptjs` | Băm mật khẩu bằng thuật toán bcrypt (cost 10–12). Bản thuần JS — không cần biên dịch native nên cài được trên mọi máy (Windows không cần build tools) |
| `google-auth-library` | Xác minh `credential` của đăng nhập Google (`verifyIdToken`) |
| `jsonwebtoken` | Ký / kiểm JWT |
| `zod` | Validate body/query |
| `cors`, `helmet` | CORS theo `CORS_ORIGINS`, header bảo mật |
| `express-rate-limit` | Giới hạn `/auth/login`, `/auth/register`, `POST .../comments` |
| `dotenv` | Đọc `.env` khi chạy local |
| `nodemon` (dev) | Tự restart |
| `jest` + `supertest` (dev, khuyến khích) | Test endpoint |

Không thêm ORM nặng (Prisma, Sequelize) — 7 bảng, SQL thuần dễ đọc hơn cho cả nhóm.

## 3. Biến môi trường (`.env.example`)

```
PORT=3000
DATABASE_URL=postgres://rophim:rophim@localhost:5432/rophim
JWT_SECRET=doi-thanh-chuoi-ngau-nhien-it-nhat-32-ky-tu
JWT_EXPIRES_IN=7d
CORS_ORIGINS=http://127.0.0.1:5500,http://localhost:5500
ADMIN_EMAIL=admin@rophim.local
ADMIN_INITIAL_PASSWORD=doi-ngay-sau-lan-dau
PHIMAPI_BASE_URL=https://phimapi.com
```

## 4. Mẫu code chuẩn

### Lỗi thống nhất
```js
// src/errors.js
class AppError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}
module.exports = { AppError };

// src/middlewares/error-handler.js
module.exports = (err, req, res, next) => {
  if (err instanceof AppError) {
    return res.status(err.status).json({ error: { code: err.code, message: err.message } });
  }
  console.error(err); // không trả stack/SQL ra ngoài
  res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Lỗi máy chủ, vui lòng thử lại sau" } });
};
```

### Xác thực
```js
// src/middlewares/auth.js
async function requireAuth(req, res, next) {
  const token = (req.headers.authorization || "").replace(/^Bearer /, "");
  try {
    const payload = jwt.verify(token, config.JWT_SECRET);
    const user = await userService.findById(payload.sub);       // luôn đọc lại từ CSDL
    if (!user) throw new AppError(401, "UNAUTHORIZED", "Phiên đăng nhập không hợp lệ");
    if (user.status === "banned") throw new AppError(403, "ACCOUNT_BANNED", "Tài khoản đã bị khóa");
    req.user = user;
    next();
  } catch (err) {
    next(err instanceof AppError ? err : new AppError(401, "UNAUTHORIZED", "Phiên đăng nhập đã hết hạn"));
  }
}

const requireRole = (...roles) => (req, res, next) =>
  roles.includes(req.user.role)
    ? next()
    : next(new AppError(403, "FORBIDDEN", "Bạn không có quyền thực hiện thao tác này"));
```

### Route + validate + service
```js
// src/routes/movies.routes.js
const commentSchema = z.object({
  content: z.string().trim().min(1, "Nội dung không được để trống").max(1000),
  isSpoiler: z.boolean().default(false),
  episode: z.string().max(50).nullable().optional(),
});

router.post("/movies/:slug/comments", requireAuth, commentLimiter, validate({ body: commentSchema }), async (req, res, next) => {
  try {
    const comment = await commentService.create(req.user, req.params.slug, req.body);
    res.status(201).json({ data: comment });
  } catch (err) {
    next(err);
  }
});
```

### SQL trả đúng tên field của hợp đồng (camelCase)
```js
// src/services/comment.service.js
const { rows } = await db.query(
  `SELECT c.id, c.movie_slug AS "movieSlug", c.episode, c.content, c.is_spoiler AS "isSpoiler", c.created_at AS "createdAt",
          json_build_object('id', u.id, 'username', u.username, 'avatarUrl', u.avatar_url) AS "user"
     FROM comments c JOIN users u ON u.id = c.user_id
    WHERE c.movie_slug = $1 AND c.deleted_at IS NULL
    ORDER BY c.created_at DESC
    LIMIT $2 OFFSET $3`,
  [slug, limit, (page - 1) * limit],
);
```

## 5. Quy tắc bắt buộc

1. Response đúng **từng field** trong hợp đồng: thành công `{ data }`, lỗi `{ error: { code, message } }`, message tiếng Việt.
2. Mọi endpoint `/admin/*` có `requireAuth, requireRole("admin", "super_admin")`. Không tin `role`/`userId` gửi từ client.
3. SQL **chỉ** dùng tham số `$1`; không ghép chuỗi từ input.
4. Không trả `password_hash`; `email` chỉ trả cho chính chủ và admin.
5. Thay đổi CSDL = **file migration mới** (không sửa migration đã chạy trên production).
6. Thay đổi hợp đồng (thêm/đổi field, endpoint) = PR vào repo **frontend** sửa `backend_api_contract.md` trước, dev FE duyệt.
7. Không commit `.env`, không log mật khẩu/token.

## 6. Chạy local

```bash
# PostgreSQL bằng Docker
docker run -d --name rophim-db -e POSTGRES_USER=rophim -e POSTGRES_PASSWORD=rophim -e POSTGRES_DB=rophim -p 5432:5432 postgres:16

cd server                     # mọi lệnh npm chạy trong thư mục server/
cp .env.example .env
npm install
npm run migrate up
npm run seed          # tạo super admin từ ADMIN_EMAIL / ADMIN_INITIAL_PASSWORD
npm run dev           # http://localhost:3000/api/health
```
Frontend local trỏ vào: đặt tạm `BACKEND_CONFIG.BASE_URL = "http://localhost:3000/api"` trong `js/config.js` (không commit).

## 7. Kiểm thử nhanh bằng curl

```bash
curl -s localhost:3000/api/health
curl -s -X POST localhost:3000/api/auth/register -H "Content-Type: application/json" \
  -d '{"username":"tester","email":"t@example.com","password":"12345678"}'
TOKEN=$(curl -s -X POST localhost:3000/api/auth/login -H "Content-Type: application/json" \
  -d '{"login":"tester","password":"12345678"}' | node -pe 'JSON.parse(require("fs").readFileSync(0)).data.token')
curl -s localhost:3000/api/auth/me -H "Authorization: Bearer $TOKEN"
curl -s localhost:3000/api/admin/stats -H "Authorization: Bearer $TOKEN"   # phải 403 với tài khoản thường
```

## 8. AI Verification Checklist (backend)

- [ ] Endpoint, field, mã lỗi khớp từng chữ với `backend_api_contract.md`.
- [ ] Có validate input; lỗi validate → `400 VALIDATION_ERROR` kèm `fields`.
- [ ] Quyền kiểm tra ở server; tài khoản bị ban không ghi được dữ liệu.
- [ ] SQL có tham số; migration mới cho mọi thay đổi bảng.
- [ ] Không lộ hash, stack trace, SQL trong response.
- [ ] Đã thử bằng curl/Postman: luồng đúng + ít nhất 1 luồng lỗi mỗi endpoint.
