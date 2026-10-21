# 06 — Triển khai (deploy) lên Internet

> Mục tiêu: RoPhim chạy công khai bằng HTTPS, không phụ thuộc máy ai trong nhóm.
> Đã chốt (22/10/2026): backend **Node.js + Express + PostgreSQL**. Nơi host dưới đây là đề xuất — đổi thì cập nhật file này.

---

## 1. Bức tranh tổng

| Thành phần | Bản chất | Gợi ý nơi host (có gói miễn phí) |
|---|---|---|
| **Frontend** (repo này) | File tĩnh, không build | **Netlify** hoặc **Vercel** (cùng có proxy `/api`) · GitHub Pages (có hạn chế, §3.3) |
| **Backend** (repo `rophim-api`) | Node.js 20 + Express, REST theo [backend_api_contract.md](../specs/backend_api_contract.md) | **Render** (Web Service, gói free) |
| **CSDL** | PostgreSQL 16 (users, comments, ratings, favorites, watch_history, view_events, settings) | **Neon** (PostgreSQL managed, gói free) |
| **Dữ liệu phim** | phimapi.com | Bên thứ ba — không host |

Cách dựng và chuẩn code backend: [08_backend_node_skill.md](../skills/08_backend_node_skill.md).
Lưu ý gói free của Render: server "ngủ" sau ~15 phút không có request, lần gọi đầu mất 30–60 giây — trước khi demo hãy mở
`/api/health` một lần để đánh thức. Vì vậy `BACKEND_CONFIG.TIMEOUT_MS` đặt 60s (phimapi vẫn 15s); giao diện nên hiện trạng thái "đang xử lý" khi chờ.

## 2. Môi trường

| Môi trường | Nhánh | URL (ví dụ) | Dùng để |
|---|---|---|---|
| Local | nhánh feature | `http://127.0.0.1:5500` | Code, test tay |
| Preview / Staging | `develop` + mỗi PR | `https://develop--rophim.netlify.app` | Cả nhóm + giảng viên xem trước, test theo Scenario |
| Production | `main` (gắn tag `v1.x`, `v2.0`) | `https://rophim.<ten-mien>` | Bản release chính thức |

Quy tắc: **chỉ merge vào `main` qua PR từ `develop`** sau khi preview đã test; bật **Branch protection** cho `main`
trên GitHub (Settings → Branches) — đây cũng là Scenario 2 của US-01.

## 3. Deploy frontend

### 3.1 Netlify / Vercel (khuyên dùng)

1. Đăng nhập bằng GitHub → **Import project** → chọn repo.
2. Cấu hình build:
   - Build command: **để trống** (không có bước build)
   - Publish / Output directory: **`.`** (thư mục gốc)
   - Production branch: **`main`**
3. Bật **Deploy Previews** cho PR và **Branch deploy** cho `develop`.
4. Gắn tên miền (nếu có) → HTTPS tự cấp.

`404.html` ở gốc được cả hai host tự dùng cho đường dẫn sai.

### 3.2 Gọi backend: dùng proxy `/api` (khuyên dùng)

Thay vì để trình duyệt gọi thẳng `https://rophim-api.onrender.com`, cho host tĩnh **chuyển tiếp** `/api/*` sang backend.
Lợi ích: frontend và API **cùng origin** → không cần CORS, `BACKEND_CONFIG.BASE_URL` chỉ là `"/api"` cho mọi môi trường deploy.

Netlify — tạo `netlify.toml` ở gốc khi đã có backend:
```toml
[[redirects]]
  from = "/api/*"
  to = "https://<backend-host>/api/:splat"
  status = 200
  force = true
```
Vercel — `vercel.json`:
```json
{ "rewrites": [{ "source": "/api/:path*", "destination": "https://<backend-host>/api/:path*" }] }
```
Rồi trong `js/config.js`:
```js
BASE_URL: "/api",
```
Local (Live Server không có proxy): đặt tạm `"http://localhost:3000/api"` trên máy mình, **không commit**.

### 3.3 GitHub Pages (nếu bắt buộc)

- Site nằm ở `https://<user>.github.io/<repo>/` (thư mục con) → `404.html` dùng đường dẫn tuyệt đối `/css/...` sẽ **hỏng**;
  phải sửa thành `/<repo>/css/...`.
- Không có proxy → phải gọi backend trực tiếp (`BASE_URL` = URL đầy đủ của backend) và backend phải bật CORS (§4).

### 3.4 Những gì sẽ bị công khai

Host tĩnh phục vụ **mọi file trong repo**: `docs/`, `AGENTS.md`, `README.md`... ai cũng tải được (file backlog Excel và ảnh lộ trình không nằm trong repo nên không bị lộ).
→ **Không bao giờ commit bí mật** (key, mật khẩu, file `.env`, dữ liệu cá nhân). Không cần giấu docs, nhưng nếu muốn gọn:
Vercel có `.vercelignore`; Netlify thì đặt site vào thư mục con (ví dụ `public/`) — việc lớn, cần nhóm đồng ý.

### 3.5 Cache

Tên file JS/CSS không có hash → nếu cache lâu, người dùng giữ bản cũ sau khi deploy. Mặc định Netlify/Vercel trả
`Cache-Control: max-age=0, must-revalidate` (trình duyệt hỏi lại mỗi lần, dùng ETag) — **giữ mặc định**, đừng đặt cache dài cho `.js/.css`.
Ảnh trong `assets/` có thể cache lâu.

### 3.6 Header bảo mật (khuyến nghị)

Netlify (`netlify.toml`):
```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    X-Frame-Options = "SAMEORIGIN"
    Permissions-Policy = "camera=(), microphone=(), geolocation=()"
```
**Content-Security-Policy**: hiện code còn `onclick="..."` inline và nạp từ cdnjs, jsdelivr, Google Fonts, phimimg, TMDB, iframe player
của nguồn phim → CSP chặt sẽ làm hỏng trang. Chỉ bật CSP sau khi bỏ hết inline handler (xem nợ kỹ thuật) và đã liệt kê đủ nguồn.

## 4. CORS và cấu hình backend

Chỉ cần khi frontend gọi backend **khác origin** (không dùng proxy §3.2, hoặc lúc dev local).
Backend chỉ cho phép đúng các origin của RoPhim — **không dùng `*`** khi có xác thực:
```
CORS_ORIGINS=https://rophim.<ten-mien>,https://develop--rophim.netlify.app,http://127.0.0.1:5500,http://localhost:5500
```
Cho phép header `Authorization`, `Content-Type`; method `GET, POST, PATCH, DELETE`.

Biến môi trường backend (đặt trên trang quản trị của host, **không commit**):

| Biến | Ý nghĩa |
|---|---|
| `DATABASE_URL` | Chuỗi kết nối CSDL |
| `JWT_SECRET` | Khóa ký token — chuỗi ngẫu nhiên ≥ 32 ký tự, mỗi môi trường một khóa |
| `JWT_EXPIRES_IN` | Hạn token, vd `7d` |
| `CORS_ORIGINS` | Như trên |
| `ADMIN_EMAIL`, `ADMIN_INITIAL_PASSWORD` | Tạo tài khoản super admin lần đầu (đổi mật khẩu ngay sau đó) |

Backend nên có `GET /api/health` trả `{ "status": "ok" }` để host kiểm tra sống/chết.

## 5. Checklist trước khi release (merge `develop` → `main`)

- [ ] Preview của `develop` đã chạy hết Scenario của các US trong release ([07](07_lo_trinh_va_backlog.md)).
- [ ] Console sạch trên preview (Chrome + 1 trình duyệt khác + điện thoại thật).
- [ ] `js/config.js`: `BACKEND_CONFIG.BASE_URL` là giá trị production (`"/api"`), **không** phải `localhost`.
- [ ] Không có `console.log` debug, không bí mật trong repo (`git grep -nI "password\|secret\|api_key"`).
- [ ] Backend: migration đã chạy trên CSDL production, `GET /api/health` OK, CORS đúng origin.
- [ ] Tag: `git tag -a v2.0.0 -m "Release V2"` sau khi merge vào `main`.

## 6. Sự cố & quay lui

- Frontend: Netlify/Vercel → Deploys → chọn bản trước → **Publish / Promote** (vài giây). Sau đó `git revert` commit lỗi trên `develop`.
- Backend: rollback deploy trên host; **migration CSDL phải có bước down** hoặc chỉ thêm cột (không xóa) để quay lui an toàn.
- phimapi sập: trang hiện khối lỗi + nút Thử lại (đã có); US-62 sẽ cho admin đổi sang máy chủ dự phòng.
- Cần bảo trì: US-62 — admin bật `maintenance_mode`, frontend hiện thông báo bảo trì.
