# Skill 07 — Tài khoản, gọi backend, bình luận, Admin (V2)

> Dùng khi: làm US-18, 19 (tài khoản), US-54, 55, 56 (bình luận/đánh giá), US-58 → 64 (admin), đồng bộ dữ liệu cá nhân.
> Hợp đồng API: [backend_api_contract.md](../specs/backend_api_contract.md). Nền tảng đã có trong CORE:
> `BACKEND_CONFIG`, `fetchBackend()`, `getAuthSession()`, `saveAuthSession()`, `clearAuthSession()`, `isLoggedIn()`, sự kiện `auth:expired`.

---

## 1. Ba luật

1. **Mọi request tới backend qua `fetchBackend(path, { method, body })`.** Không `fetch` tay, không tự gắn token.
2. **Frontend không quyết định quyền.** Ẩn nút Admin chỉ là giao diện — backend phải trả `403` cho người không đủ quyền.
3. **Mọi dữ liệu từ backend là dữ liệu người dùng** (tên, bình luận) → `escapeHtml` / `textContent`. Một bình luận chứa
   `<script>` không được phép chạy — token đăng nhập nằm trong localStorage, XSS = mất tài khoản.

## 2. Mẫu gọi backend

```js
function buildBackendPath(template, params = {}) {
  return Object.entries(params).reduce(
    (path, [key, value]) => path.replace(`[${key}]`, encodeURIComponent(value)),
    template,
  );
}

const res = await fetchBackend(
  buildBackendPath(BACKEND_CONFIG.ENDPOINTS.COMMENTS, { slug }),
  { method: "POST", body: { content, isSpoiler, episode } },
);

if (res.error === "BACKEND_NOT_CONFIGURED") {
  showToast("Tính năng này sắp ra mắt", "info");        // chưa có backend → trang vẫn chạy
} else if (res.status === 401) {
  openLoginPrompt();                                     // phiên hết hạn / chưa đăng nhập
} else if (!res.success) {
  showToast(res.error, "error");                         // message tiếng Việt từ backend
} else {
  const comment = res.data.data;                         // payload nằm ở res.data.data
}
```
> `buildBackendPath` cần ở nhiều trang (login, watch, admin) → người làm đầu tiên thêm vào `api.js` theo
> [05_sua_core_an_toan_skill.md](05_sua_core_an_toan_skill.md) Ví dụ A, rồi người khác dùng lại.

## 3. Đăng ký / đăng nhập — US-18 (`login.html` + `js/login.js`)

```js
async function submitLogin(login, password) {
  const res = await fetchBackend(BACKEND_CONFIG.ENDPOINTS.LOGIN, {
    method: "POST",
    body: { login, password },
  });

  if (!res.success) {
    // 401 INVALID_CREDENTIALS → "Tên đăng nhập hoặc mật khẩu không chính xác" (US-18 Scenario 2)
    showFormError(res.error);
    return;
  }

  saveAuthSession(res.data.data);                         // { token, user }
  showToast(`Xin chào ${res.data.data.user.username}`, "success");
  const next = new URLSearchParams(location.search).get("next");
  window.location.href = next && next.startsWith("/") ? next : "index.html";   // chỉ cho chuyển trong site
}
```
- Form: `<form>` + `<label>` + `autocomplete="username"` / `"current-password"` / `"new-password"`; nút submit bị khóa khi đang gửi.
- Validate phía client chỉ để báo sớm (độ dài, email) — backend vẫn validate lại.
- **Không** lưu mật khẩu ở đâu cả; không `console.log` request đăng nhập.

## 4. Header theo trạng thái — US-18 Scenario 1, US-19

Sửa CORE (`header.html`, `main.js`) — **một người làm**, theo [05 Ví dụ C](05_sua_core_an_toan_skill.md#ví-dụ-c--header-theo-trạng-thái-đăng-nhập-us-18-us-19).

```js
function setupAuthHeader() {
  renderAuthHeader();
  document.addEventListener("auth:expired", () => {
    renderAuthHeader();
    showToast("Phiên đăng nhập đã hết hạn", "warning");
  });
}

async function logout() {
  await fetchBackend(BACKEND_CONFIG.ENDPOINTS.LOGOUT, { method: "POST" });  // lỗi cũng kệ
  clearAuthSession();            // KHÔNG xóa USER_PREFERENCES (US-19 Scenario 2)
  renderAuthHeader();
  showToast("Đã đăng xuất", "success");
}
```
Khi tải trang có phiên: gọi `GET /auth/me` một lần để xác nhận phiên còn hạn (401 → `fetchBackend` tự xóa phiên).

## 5. Bình luận & đánh giá — US-54, 55, 56 (`js/watch.js`)

Trong `js/watch.js`, mục "Bình luận & đánh giá": thay `DEMO_COMMENTS` / `DEMO_RATINGS` bằng dữ liệu thật:
```js
async function loadComments(page = 1) {
  const res = await fetchBackend(
    `${buildBackendPath(BACKEND_CONFIG.ENDPOINTS.COMMENTS, { slug: currentMovie.slug })}?page=${page}`,
  );
  if (res.error === "BACKEND_NOT_CONFIGURED") return renderFakeComments();   // giữ demo cũ khi chưa có backend
  if (!res.success) return renderEmptyState("rich-comment-list", { message: "Không tải được bình luận.", onRetry: () => loadComments(page) });
  renderComments(res.data.data.items);
}

function renderComment(c) {
  const body = escapeHtml(c.content);
  return `
    <div class="comment-item-rich ${c.isSpoiler ? "is-spoiler" : ""}">
      <img src="${escapeHtml(c.user.avatarUrl || APP_CONFIG.DEFAULT_AVATAR)}" class="user-avatar" alt="${escapeHtml(c.user.username)}">
      <div class="comment-content-wrapper">
        <span class="user-name">${escapeHtml(c.user.username)}</span>
        <div class="comment-body">${body}</div>
      </div>
    </div>`;
}
```
Theo tiêu chí US-55: bộ đếm ký tự, `maxlength="1000"` và chặn nội dung toàn khoảng trắng **đã có** (`setupCommentSection`);
còn lại: chưa đăng nhập bấm Gửi → mở hộp đăng nhập; đã đăng nhập → `POST` rồi chèn bình luận mới lên đầu danh sách. Spoil: `.is-spoiler .comment-body { filter: blur(6px) }` + nhãn "Cảnh báo tiết lộ", bấm để xem.

## 6. Trang Admin — US-58 → 64 (`admin.html` + `js/admin.js`)

```js
function initAdminPage() {
  const session = getAuthSession();
  if (!session || !["admin", "super_admin"].includes(session.user.role)) {
    window.location.href = "index.html";          // US-58 Scenario 3 — chỉ là điều hướng, backend mới là chốt chặn
    return;
  }
  loadAdminStats();
}
```
| Khu vực | Endpoint | Ghi chú |
|---|---|---|
| Dashboard (US-58) | `GET /admin/stats` | Thẻ số liệu dùng `formatNumber`; top phim: lấy tên/ảnh bằng `getMovieDetail(slug)` (≤ 10 phim) |
| Ghim Hero (US-60) | `PATCH /admin/settings { pinnedHeroSlug }` | `404 MOVIE_NOT_FOUND` → báo slug sai; nút "Khôi phục tự động" gửi `null`. Trang chủ đọc `GET /settings` |
| Bảo trì / API dự phòng (US-62) | `PATCH /admin/settings { maintenanceMode, movieApiBaseUrl }` | Xem §7 |
| Thành viên (US-63/64) | `GET/PATCH /admin/users` | `400 CANNOT_BAN_SELF` → hiện lỗi |
| Bình luận (US-61) | `GET /admin/comments`, `PATCH`, `DELETE` | Xóa → hộp xác nhận |
| Bộ nhớ (US-59) | — (localStorage) | Tính dung lượng các key `rophim_*`; "Dọn dẹp" chỉ xóa dữ liệu tương tác (yêu thích, lịch sử), **không** xóa `AUTH_SESSION`, `USER_PREFERENCES` |

## 7. Bảo trì & máy chủ dự phòng — US-62

Cần đọc `GET /settings` trên **mọi trang** → thay đổi CORE (`main.js` trong `initializeApp`), một người làm:
- `maintenanceMode && role không phải admin` → thay nội dung `<main>` bằng thông báo bảo trì (`maintenanceMessage`).
- `movieApiBaseUrl` khác `null` → dùng làm base URL phimapi. Cách an toàn: thêm vào `api.js` biến
  `let movieApiBaseUrl = API_CONFIG.BASE_URL` + hàm `setMovieApiBaseUrl(url)`, và các wrapper đọc biến này thay vì hằng.
  Đây là **sửa CORE nhiều hàm** → PR riêng, test toàn bộ trang.
- Chưa có backend (`BACKEND_NOT_CONFIGURED`) → bỏ qua, chạy như thường.

## 8. Đồng bộ yêu thích / lịch sử — T6

- Chưa đăng nhập: localStorage như V1 (không đổi gì).
- Đăng nhập: sau khi `saveAuthSession`, đẩy các mục localStorage lên (`POST /me/favorites`, `PUT /me/history`), sau đó trang
  favorites/history đọc từ máy chủ. **Giữ nguyên field** `slug/name/poster/addedAt` để `createMovieCard` dùng được cả hai nguồn.
- Thay đổi `toggleFavorite` / `saveWatchHistory` để gọi thêm backend = sửa CORE — làm theo tương thích ngược
  (vẫn ghi localStorage, gọi backend thêm khi `isLoggedIn()`).

## 9. Khi backend chưa có

- `BACKEND_CONFIG.BASE_URL = ""` → mọi `fetchBackend` trả `BACKEND_NOT_CONFIGURED` ngay, không gọi mạng.
- Mọi tính năng V2 phải **xử lý nhánh này** (toast "sắp ra mắt" hoặc giữ demo cũ) — trang không được vỡ.
- Muốn test giao diện trước khi có server: giả lập ngay trong console
  ```js
  saveAuthSession({ token: "dev", user: { id: "1", username: "tester", avatarUrl: null, role: "admin" } });
  ```
  (chỉ để xem giao diện; request thật vẫn cần backend).

## 10. AI Verification Checklist

- [ ] Request backend chỉ qua `fetchBackend`; path từ `BACKEND_CONFIG.ENDPOINTS`, tham số `encodeURIComponent`.
- [ ] Xử lý đủ: `BACKEND_NOT_CONFIGURED`, `401`, `403`, lỗi validate (`400`), mất mạng (`status 0`).
- [ ] Mọi dữ liệu backend vào `innerHTML` qua `escapeHtml`.
- [ ] Không bí mật trong code; không tin `role` phía client cho việc gì ngoài hiển thị.
- [ ] Đăng xuất xóa phiên nhưng giữ cài đặt trình phát.
- [ ] Endpoint mới/đổi → đã cập nhật `backend_api_contract.md` + `BACKEND_CONFIG.ENDPOINTS`.
- [ ] Chạy 3 Scenario của US; ghi rõ Scenario nào cần backend thật mà chưa kiểm được.
