# Backend API Contract — RoPhim V2

> **Hợp đồng giữa frontend (repo này) và backend riêng của RoPhim.** Hai bên code song song dựa trên file này.
> Trạng thái: **v0.2 (30/10/2026)** — thêm đăng nhập Google (`POST /auth/google`). Đã chốt **Node.js + Express + PostgreSQL**, thư mục `server/` trong repo này (chốt 30/10)
> ([08_backend_node_skill.md](../skills/08_backend_node_skill.md)). Phân công endpoint: [07_lo_trinh_va_backlog.md §3](../guides/07_lo_trinh_va_backlog.md#31-ai-làm-gì).
> Đổi bất cứ thứ gì ở đây = PR riêng, cả người làm FE và BE cùng duyệt. Tên endpoint khớp `BACKEND_CONFIG.ENDPOINTS` trong `js/config.js`.

---

## 1. Quy ước chung

| Mục | Quy ước |
|---|---|
| Base URL | `<origin>/api` — production đi qua proxy cùng origin (`BACKEND_CONFIG.BASE_URL = "/api"`) |
| Định dạng | JSON UTF-8, field `camelCase`, thời gian ISO-8601 UTC (`2026-10-21T10:00:00.000Z`) |
| Xác thực | `Authorization: Bearer <token>` (JWT). Frontend gắn tự động trong `fetchBackend()` |
| Phim | Định danh bằng **`movieSlug`** của phimapi. Backend **không** lưu thông tin phim (tên, ảnh) trừ khi cần hiển thị ở admin |
| Phân trang | Query `?page=1&limit=20`; response có `pagination: { page, limit, totalItems, totalPages }` |

### Response thành công
```json
{ "data": { ... } }
```
Trong frontend: `const res = await fetchBackend(...)` → payload ở **`res.data.data`**.

### Response lỗi
```json
{ "error": { "code": "INVALID_CREDENTIALS", "message": "Tên đăng nhập hoặc mật khẩu không chính xác" } }
```
`fetchAPI` đưa `error.message` vào `res.error`, mã HTTP vào `res.status`, JSON gốc vào `res.data` (đọc `res.data?.error?.code`).
`message` viết **tiếng Việt, hiển thị được cho người dùng**.

| HTTP | `code` | Khi nào |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Thiếu/sai field. Có thể kèm `"fields": { "email": "Email không hợp lệ" }` |
| 400 | `CANNOT_BAN_SELF` | Admin tự khóa chính mình (US-63 Scenario 3) |
| 401 | `UNAUTHORIZED` | Thiếu / sai / hết hạn token → frontend xóa phiên, bắn `auth:expired` |
| 401 | `INVALID_CREDENTIALS` | Đăng nhập sai (US-18 Scenario 2). Cũng trả mã này khi tài khoản chỉ đăng nhập bằng Google mà lại dùng mật khẩu (không tiết lộ lý do) |
| 401 | `GOOGLE_TOKEN_INVALID` | `credential` Google sai / hết hạn / không dành cho `GOOGLE_CLIENT_ID` của RoPhim |
| 401 | `GOOGLE_EMAIL_NOT_VERIFIED` | Email của tài khoản Google chưa được xác minh |
| 403 | `ACCOUNT_BANNED` | Tài khoản bị khóa |
| 403 | `FORBIDDEN` | Không đủ quyền (không phải admin, không phải chủ bình luận) |
| 404 | `NOT_FOUND`, `MOVIE_NOT_FOUND` | Không có tài nguyên / slug phim không tồn tại trên phimapi (US-60 Scenario 2) |
| 409 | `CONFLICT` | Trùng username/email |
| 429 | `RATE_LIMITED` | Gửi quá nhanh (đăng nhập, bình luận) |
| 503 | `GOOGLE_LOGIN_DISABLED` | Server chưa cấu hình `GOOGLE_CLIENT_ID` — frontend ẩn / tắt nút Google |
| 503 | `MAINTENANCE` | Đang bảo trì — mọi request ghi của non-admin (US-62) |

---

## 2. Đối tượng dữ liệu

```ts
User {
  id: string
  username: string            // 3–30 ký tự, [a-zA-Z0-9_]
  email: string               // chỉ trả cho chính chủ và admin
  avatarUrl: string | null    // null → frontend dùng APP_CONFIG.DEFAULT_AVATAR
  role: "member" | "admin" | "super_admin"
  status: "active" | "banned"
  createdAt: string
}

Comment {
  id: string
  movieSlug: string
  episode: string | null      // tên tập đang xem khi bình luận, vd "Tập 03"
  content: string             // 1–1000 ký tự sau trim, lưu NGUYÊN VĂN — frontend tự escapeHtml khi hiển thị
  isSpoiler: boolean          // true → frontend làm mờ + nhãn "Cảnh báo tiết lộ"
  user: { id, username, avatarUrl }
  createdAt: string
}

RatingSummary {
  average: number             // 1 chữ số thập phân, 0 nếu chưa có
  count: number
  myScore: number | null      // điểm của người đang đăng nhập
}

Settings {                    // cấu hình công khai, frontend đọc khi tải trang
  maintenanceMode: boolean
  maintenanceMessage: string
  pinnedHeroSlug: string | null    // null → trang chủ tự lấy phim mới nhất
  movieApiBaseUrl: string | null   // null → dùng API_CONFIG.BASE_URL
}
```

---

## 3. Endpoint

🔓 công khai · 🔑 cần đăng nhập · 🛡 cần `role` admin/super_admin

### 3.1 Tài khoản — US-18, US-19

| | Method & path | Body | Thành công |
|---|---|---|---|
| 🔓 | `POST /auth/register` | `{ username, email, password }` (password ≥ 8 ký tự) | `201 { data: { token, user } }` |
| 🔓 | `POST /auth/login` | `{ login, password }` (`login` = username hoặc email) | `200 { data: { token, user } }` |
| 🔓 | `POST /auth/google` | `{ credential }` — ID token do nút Google Identity Services trả về | `200 { data: { token, user } }`. Backend tự xác minh `credential` với Google. Lần đầu: tạo tài khoản (username sinh từ email, `avatarUrl` = ảnh Google); email đã có tài khoản mật khẩu → gắn Google vào tài khoản đó |
| 🔑 | `POST /auth/logout` | — | `204` (backend thu hồi token nếu có cơ chế) |
| 🔑 | `GET /auth/me` | — | `200 { data: { user } }` — frontend gọi khi tải trang để xác nhận phiên còn hạn |

### 3.2 Dữ liệu cá nhân trên máy chủ — T6 "API lưu trữ dữ liệu cá nhân"

Khách vãng lai vẫn dùng localStorage như V1. Thành viên đăng nhập: đồng bộ lên máy chủ.

| | Method & path | Body / Query | Thành công |
|---|---|---|---|
| 🔑 | `GET /me/favorites` | `?page&limit` | `{ data: { items: [{ movieSlug, name, poster, addedAt }], pagination } }` |
| 🔑 | `POST /me/favorites` | `{ movieSlug, name, poster }` | `201` (đã có → `200`, không trùng) |
| 🔑 | `DELETE /me/favorites/:slug` | — | `204` |
| 🔑 | `GET /me/history` | `?page&limit` | `{ data: { items: [{ movieSlug, name, poster, episode, progress, watchedAt }], pagination } }` |
| 🔑 | `PUT /me/history` | `{ movieSlug, name, poster, episode, progress }` | `200` (upsert theo movieSlug; giữ 50 mục mới nhất) |

Khi đăng nhập lần đầu trên một máy: frontend gửi các mục localStorage lên (POST/PUT từng mục) rồi dùng dữ liệu máy chủ.

### 3.3 Bình luận & đánh giá — US-54, US-55, US-56

| | Method & path | Body / Query | Thành công |
|---|---|---|---|
| 🔓 | `GET /movies/:slug/comments` | `?page&limit` (mới nhất trước; bỏ bình luận đã bị admin xóa) | `{ data: { items: Comment[], pagination } }` |
| 🔑 | `POST /movies/:slug/comments` | `{ content, isSpoiler, episode }` | `201 { data: Comment }`. Nội dung chỉ khoảng trắng → `400`. Bị ban → `403` |
| 🔑 | `DELETE /comments/:id` | — | `204` (chủ bình luận hoặc admin) |
| 🔓 | `GET /movies/:slug/ratings` | `?page&limit` | `{ data: { summary: RatingSummary, items: [{ score, content, user, createdAt }], pagination } }` |
| 🔑 | `POST /movies/:slug/ratings` | `{ score: 1..10, content? }` (mỗi người 1 đánh giá / phim — gửi lại = sửa) | `200 { data: { summary: RatingSummary } }` |
| 🔓 | `POST /movies/:slug/views` | `{ episode }` | `204` — ghi nhận lượt xem cho thống kê US-58 (gọi 1 lần mỗi lần mở trang xem) |

### 3.4 Cấu hình công khai — US-60, US-62

| | Method & path | Thành công |
|---|---|---|
| 🔓 | `GET /settings` | `{ data: Settings }` — luôn trả kể cả khi bảo trì |

### 3.5 Quản trị — US-58, US-60, US-61, US-62, US-63/64

Mọi endpoint `/admin/*` **bắt buộc** kiểm tra role ở backend. Không phải admin → `403 FORBIDDEN`.

| | Method & path | Body / Query | Thành công |
|---|---|---|---|
| 🛡 | `GET /admin/stats` | `?days=7` | `{ data: { totals: { users, comments, ratings, views }, topViewed: [{ movieSlug, views }], topFavorited: [{ movieSlug, count }], recentActivity: [{ type, movieSlug, username, createdAt }] } }` |
| 🛡 | `PATCH /admin/settings` | Một phần `Settings`. `pinnedHeroSlug` được backend kiểm tra tồn tại trên phimapi → sai `404 MOVIE_NOT_FOUND`; `null` = khôi phục tự động | `200 { data: Settings }` |
| 🛡 | `GET /admin/users` | `?q=&status=&page&limit` | `{ data: { items: User[], pagination } }` |
| 🛡 | `PATCH /admin/users/:id` | `{ status: "banned" \| "active" }` | `200 { data: User }`. Tự khóa mình → `400 CANNOT_BAN_SELF`; khóa super_admin → `403`. Ban → thu hồi phiên người đó |
| 🛡 | `GET /admin/comments` | `?movieSlug=&q=&page&limit` | `{ data: { items: Comment[], pagination } }` |
| 🛡 | `PATCH /admin/comments/:id` | `{ isSpoiler: true }` | `200 { data: Comment }` |
| 🛡 | `DELETE /admin/comments/:id` | — | `204` |

> US-59 (đo bộ nhớ + Flush cache) chạy hoàn toàn ở trình duyệt (localStorage) — **không cần endpoint**.

---

## 4. Yêu cầu bắt buộc phía backend

- Mật khẩu băm bằng **bcrypt/argon2**; **không bao giờ** trả mật khẩu/hash trong response.
- JWT ký bằng `JWT_SECRET` (biến môi trường), có hạn (`exp`). Token chứa `sub` (user id) và `role`, nhưng **luôn đọc lại user từ CSDL** để biết `status` (bị ban giữa chừng).
- Kiểm tra role/quyền sở hữu **ở mọi endpoint**, không tin dữ liệu frontend gửi (vd `role` trong body).
- Validate độ dài/kiểu mọi field; giới hạn tốc độ `POST /auth/login` và `POST .../comments`.
- Lưu nội dung bình luận nguyên văn (không tự escape) — frontend chịu trách nhiệm escape khi hiển thị.
- CORS chỉ cho origin của RoPhim ([06_trien_khai.md §4](../guides/06_trien_khai.md#4-cors-và-cấu-hình-backend)).
- `GET /api/health` → `{ "status": "ok" }` (không bọc trong `data`, để host kiểm tra sống/chết).
- Đăng nhập Google: xác minh `credential` bằng `google-auth-library` (`verifyIdToken` với `audience = GOOGLE_CLIENT_ID`), **không** tin email/tên do frontend gửi.

## 5. Gợi ý lược đồ CSDL

```
users          (id PK, username UNIQUE, email UNIQUE, password_hash NULL, google_id UNIQUE NULL, avatar_url, role, status, created_at)
               -- password_hash NULL = tài khoản chỉ đăng nhập bằng Google
comments       (id PK, user_id FK, movie_slug, episode, content, is_spoiler, deleted_at NULL, created_at)   INDEX(movie_slug, created_at)
ratings        (id PK, user_id FK, movie_slug, score 1..10, content, created_at, UNIQUE(user_id, movie_slug))
favorites      (user_id FK, movie_slug, name, poster, added_at, PRIMARY KEY(user_id, movie_slug))
watch_history  (user_id FK, movie_slug, name, poster, episode, progress, watched_at, PRIMARY KEY(user_id, movie_slug))
view_events    (id PK, movie_slug, episode, user_id NULL, created_at)                                         INDEX(created_at)
settings       (key PK, value JSON)  -- maintenance_mode, maintenance_message, pinned_hero_slug, movie_api_base_url
```

## 6. Frontend dùng hợp đồng này như thế nào

Xem [07_backend_auth_skill.md](../skills/07_backend_auth_skill.md). Tóm tắt:
```js
const path = BACKEND_CONFIG.ENDPOINTS.COMMENTS.replace("[slug]", encodeURIComponent(slug));
const res = await fetchBackend(path, { method: "POST", body: { content, isSpoiler, episode } });
if (res.error === "BACKEND_NOT_CONFIGURED") { /* chưa có backend: báo "tính năng sắp ra mắt" */ }
else if (!res.success) showToast(res.error, "error");
else renderComment(res.data.data);
```
