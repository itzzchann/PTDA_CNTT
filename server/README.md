# RoPhim API (`server/`)

Backend V2 của RoPhim: **Node.js 20+ + Express 4 + PostgreSQL**.

- Hợp đồng API (nguồn sự thật duy nhất giữa FE và BE): [docs/specs/backend_api_contract.md](../docs/specs/backend_api_contract.md)
- Chuẩn code, cấu trúc thư mục, mẫu code: [docs/skills/08_backend_node_skill.md](../docs/skills/08_backend_node_skill.md)
- Deploy (Render + Neon): [docs/guides/06_trien_khai.md](../docs/guides/06_trien_khai.md)

> ⚠️ Thư mục này nằm chung repo với frontend nhưng **không bao giờ** được host tĩnh phát ra web
> ([06 §3.4](../docs/guides/06_trien_khai.md#34-những-gì-sẽ-bị-công-khai)). Không commit `server/.env`.

## Chạy lần đầu

Cần: Node.js ≥ 20 (`node -v`). Chưa cần PostgreSQL để chạy thử `/api/health`.

```bash
cd server
cp .env.example .env        # Windows (cmd): copy .env.example .env
npm install
npm run dev                 # tự khởi động lại khi sửa code
```

Mở <http://localhost:3000/api/health> → phải thấy `{"status":"ok"}`.

### Tạo CSDL (cần cho mọi endpoint trừ `/api/health`)

Mỗi người **một CSDL dev riêng**, chọn 1 trong 2:
- **Docker** (máy có Docker) — khớp sẵn `DATABASE_URL` trong `.env.example`:
  ```bash
  docker run -d --name rophim-db -e POSTGRES_USER=rophim -e POSTGRES_PASSWORD=rophim -e POSTGRES_DB=rophim -p 5432:5432 postgres:16
  ```
  Lần sau chỉ cần `docker start rophim-db`.
- **Neon** (không cần cài gì): tạo project miễn phí ở neon.tech → copy *connection string* → dán vào `DATABASE_URL` trong `.env`.
  Không dán chuỗi này vào chat / commit.

Rồi:
```bash
npm run migrate up          # tạo 7 bảng + cấu hình mặc định
npm run seed                # tạo super_admin từ ADMIN_EMAIL / ADMIN_INITIAL_PASSWORD (chạy lại không sao)
```

## Lệnh

| Lệnh | Làm gì |
|---|---|
| `npm run dev` | Chạy dev, tự restart khi sửa file (nodemon) |
| `npm start` | Chạy như production (Render dùng lệnh này) |
| `npm run migrate up` / `npm run migrate down` | Chạy / lùi migration trong `migrations/` |
| `npm run migrate create <ten-thay-doi>` | Tạo file migration mới — **không sửa** migration đã chạy. Viết kiểu CommonJS (`exports.up = (pgm) => {...}`) như `migrations/*_init-schema.js`, không dùng `export` của mẫu sinh ra |
| `npm run seed` | Tạo tài khoản super_admin đầu tiên |

## Cấu trúc

```
server/
├── .env.example          biến môi trường (copy thành .env)
├── migrations/           node-pg-migrate — mỗi thay đổi CSDL một file (init-schema: 7 bảng)
└── src/
    ├── server.js         listen
    ├── app.js            helmet, CORS, JSON, gắn routes, 404, error handler
    ├── config.js         đọc + kiểm tra biến môi trường (thiếu → dừng ngay)
    ├── db.js             Pool PostgreSQL dùng chung, query($1, $2...)
    ├── errors.js         AppError(status, code, message, fields?)
    ├── middlewares/      error-handler, validate (zod) — auth, maintenance: sắp có
    ├── routes/           1 file / nhóm endpoint, MỖI FILE MỘT NGƯỜI SỞ HỮU (ghi ở đầu file)
    ├── services/         logic + SQL (tạo khi cần)
    └── scripts/          seed-admin.js
```

Đã đăng ký sẵn mọi file route trong `app.js` → thêm endpoint chỉ cần sửa file route của mình.
`admin.routes.js` chia 3 khối Lead / DEV-1 / DEV-2 — chỉ viết trong khối của mình.

## Bảng (đã có)

`users` (mật khẩu **hoặc** `google_id`; username/email trùng không phân biệt hoa thường) · `comments` (xóa mềm `deleted_at`) ·
`ratings` (1 người 1 điểm / phim) · `favorites` · `watch_history` (giây đang xem `progress`) · `view_events` · `settings` (JSONB).
Chi tiết: `migrations/*_init-schema.js`. Tên cột `snake_case` → SQL trả về phải `AS "camelCase"` đúng hợp đồng (skill 08 §4).

## Thử nhanh bằng curl

```bash
curl -s localhost:3000/api/health              # {"status":"ok"}
curl -s localhost:3000/api/khong-co            # 404 NOT_FOUND
```
