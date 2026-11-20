# 09 — Kế hoạch tuần cuối V2: hoàn thiện các US còn lại (09 → 12/11/2026)

> Kế hoạch cho **3 người: Lead, DEV-1, DEV-2** (cùng vai như [07 §3.1](07_lo_trinh_va_backlog.md#31-ai-làm-gì)).
> Lập ngày **08/11/2026**, sau khi V1 hoàn chỉnh (`v1.1.0`) và Chặng 1 đã xong trên `develop`.
> Kế hoạch này **thay cho Chặng 2, Chặng 3** trong [07 §3.2](07_lo_trinh_va_backlog.md#32-lịch-theo-chặng) — các mốc cũ đã trễ, tính lại từ hiện trạng code thật.
> **Hạn Release V2: Thứ Năm 12/11/2026.** Đóng băng code **tối 11/11**. 13/11 là ngày dự phòng.

---

## 0. Đọc trong 2 phút

- **Hiện trạng 08/11 (đối chiếu code, không theo kế hoạch cũ):**
  - ✅ Backend: khung `server/` + 7 bảng + `/auth/*` (mật khẩu + Google) + middleware + rate limit + seed admin.
  - ✅ FE: `login.html` hoàn chỉnh; US-52/53 (lưu giây, phát tiếp); US-19 Sc2 (nhớ âm lượng/tắt đèn/auto-next); nút "Thành viên" → `login.html`.
  - ❌ **Chưa có:** 24 wrapper backend trong `js/api.js`; mọi endpoint `/movies/*`, `/comments/*`, `/me/*`, `/settings`, `/admin/*` (file route còn rỗng); header trạng thái đăng nhập; `admin.html`; đồng bộ ♥/lịch sử; ô chấm điểm; US-59/60/62; deploy.
- **Mỗi việc = 1 PR nhỏ** (≤ 1 US hoặc ≤ 1 nhóm endpoint), review chéo trước, Lead approve cuối vào **12h và 21h**.
- Mỗi sáng: `git pull origin develop` vào nhánh mình trước khi code. Bị chặn quá 2 giờ → báo nhóm ngay.
- **Đóng băng tối 11/11:** sau mốc đó chỉ nhận PR sửa lỗi chặn, không nhận tính năng mới.

---

## 1. Phân công 3 ngày

### Ngày 1 — Chủ nhật 09/11: Nền tảng còn thiếu

| Người | Việc | Xong khi |
|---|---|---|
| **Lead** | ① **Wrapper `js/api.js`**: `buildBackendPath()` + toàn bộ 24 hàm ở [07 §3.4](07_lo_trinh_va_backlog.md#34-wrapper-backend-lead-viết-sẵn-ở-ngày-0-jsapijs) (các nhóm Tài khoản, Cá nhân, Cộng đồng, Cấu hình, Quản trị). Cập nhật `core_registry.md`. **PR riêng, merge trước 12h** — DEV-1, DEV-2 đang chờ. ② Header trạng thái đăng nhập: `setupAuthHeader()` trong `main.js` — đã đăng nhập → ẩn `.button-login`, hiện avatar + tên (US-18 Sc2) + menu cá nhân (Đăng xuất + toast — US-19 Sc1; admin thấy link `admin.html`); nghe `auth:expired` → về trạng thái khách + toast, **không dừng video** (US-19 Sc3); khách bấm ♥ → hộp thoại mời đăng nhập (US-18 Sc4, mẫu [skill 07 §2](../skills/07_backend_auth_skill.md#2-mẫu-gọi-backend)). ③ Deploy `server/` lên Render + Neon; FE preview (Netlify/Vercel) + proxy `/api` → `BASE_URL = "/api"` ([06_trien_khai.md](06_trien_khai.md)) | Preview: đăng ký → đăng nhập → header hiện tên → đăng xuất. Chưa deploy xong thì nhóm dùng `BASE_URL = "http://localhost:3000/api"` cục bộ (**không commit**) |
| **DEV-1** | BE file của mình: `movies.routes.js` — `GET /movies/:slug/comments`, `GET /movies/:slug/ratings` (`optionalAuth` → `myScore`), `POST /movies/:slug/views`; `comments.routes.js` — `POST` (`requireAuth`, nội dung toàn khoảng trắng → `400`), `DELETE /comments/:id` (chủ bình luận hoặc admin → không phải → `403`). Service: `comment.service.js`, `rating.service.js` (upsert theo `(user_id, movie_slug)`, tính trung bình 1 chữ số). Chèn 5 bình luận mẫu bằng SQL để test | curl 5 endpoint trả đúng `200/201/400/401/403`, kể cả `429` khi gửi quá nhanh |
| **DEV-2** | BE `me.routes.js`: `GET /me/favorites` (`?page&limit`), `POST /me/favorites` (đã có → `200`, chưa → `201`), `DELETE /me/favorites/:slug`, `GET /me/history`, `PUT /me/history` (upsert, giữ 50 mục mới nhất). FE: `watch.js` — khi `isLoggedIn()` gọi thêm `saveMyHistory` (giây đang xem) cạnh `saveWatchHistory` cục bộ; `favorites.js`, `history.js` — đọc từ máy chủ khi đăng nhập, khách vẫn localStorage như V1 | Đăng nhập trình duyệt A, ♥ một phim → đăng nhập trình duyệt B thấy phim đó; lịch sử hai máy giống nhau |

### Ngày 2 — Thứ Hai 10/11: Cộng đồng + Admin

| Người | Việc | Xong khi |
|---|---|---|
| **Lead** | ① BE `settings.routes.js`: `GET /settings` (công khai), `PATCH /admin/settings` (`requireRole`, kiểm `pinnedHeroSlug` với phimapi → sai → `404 MOVIE_NOT_FOUND`), middleware bảo trì (`503 MAINTENANCE` cho request **ghi** của non-admin). ② FE: `homepage.js` dùng `pinnedHeroSlug`, `null` → phim mới nhất (US-60 Sc1, Sc3); `initializeApp` đọc `/settings` → bật bảo trì thì khách chỉ thấy màn hình bảo trì, admin vẫn dùng (US-62 Sc2–3); `movieApiBaseUrl` → nguồn phim dự phòng (US-62 Sc1). ③ Khung `admin.html` + `js/admin.js` + `css/admin.css`: không phải admin → về `index.html` (US-58 Sc3); 5 tab với hàm rỗng `initDashboardTab` / `initCommentsTab` / `initUsersTab` / `initSystemTab` / `initStorageTab`, comment tên người sở hữu từng tab | Sửa `settings` trực tiếp trong DB → trang chủ đổi phim nổi bật; bật bảo trì → cửa sổ ẩn danh thấy thông báo; mở `admin.html` bằng tài khoản thường → về trang chủ |
| **DEV-1** | BE khối DEV-1 trong `admin.routes.js`: `GET /admin/stats?days=7` (tổng users/comments/ratings/views, top 10 xem nhiều, hoạt động gần đây), `GET /admin/comments`, `PATCH /admin/comments/:id` (đánh dấu spoil), `DELETE /admin/comments/:id`. FE `watch.js` (chỉ khu bình luận/đánh giá cuối file): bỏ `DEMO_COMMENTS` / `DEMO_RATINGS`, nối `getMovieComments` / `getMovieRatings` (chưa đăng nhập vẫn đọc — US-54 Sc3); **gửi bình luận** + spoil che mờ + bấm mới hiện (US-55); **ô chấm điểm 1–10** + điểm trung bình cập nhật ngay (US-56); nút xóa bình luận của mình; gọi `recordMovieView` khi mở trang xem | US-54, 55, 56 đủ Scenario trên preview; US-58 có số liệu thật |
| **DEV-2** | BE khối DEV-2 trong `admin.routes.js`: `GET /admin/users` (`q`, `status`, phân trang), `PATCH /admin/users/:id` ban/unban — tự khóa mình → `400 CANNOT_BAN_SELF`, không khóa được super_admin → `403`. FE: lần đăng nhập đầu trên một máy → đẩy yêu thích + lịch sử từ localStorage lên (chạy 1 lần, đánh dấu bằng field riêng trong `USER_PREFERENCES`); US-52 Sc2 (xem lại → lên đầu) + Sc3 (51 phim → bỏ cũ nhất) chạy cả local lẫn máy chủ; tab **Thành viên**: tìm, lọc, khóa/mở khóa, báo lỗi khi tự khóa (US-63 Sc1–3) | Khóa user → request kế tiếp của user đó bị `403`, FE tự đăng xuất; mở khóa → đăng nhập lại được |

### Ngày 3 — Thứ Ba 11/11: Hoàn thiện + đóng băng

| Người | Việc |
|---|---|
| **Lead** | Tab **Hệ thống**: ghim phim + nút "Khôi phục tự động" (US-60 Sc1–3), bật/tắt bảo trì + lời nhắn, đổi nguồn dự phòng (US-62). Tab **Bộ nhớ** (US-59): đo dung lượng các key `rophim_*` + sessionStorage, "Dọn dẹp" có `showConfirmDialog`, **giữ nguyên** phiên + `USER_PREFERENCES` + yêu thích/lịch sử (Sc3). Duyệt bảo mật mọi `/admin/*` theo [skill 06 §5](../skills/06_kiem_thu_thu_cong_skill.md#5-bảo-mật-nhanh). **Tối: ĐÓNG BĂNG** — chỉ merge PR sửa lỗi |
| **DEV-1** | Tab **Dashboard** (US-58 Sc1–2: thẻ số liệu dùng `formatNumber`, top 10 phim) + tab **Bình luận** (US-61 Sc1–2); tài khoản thường xóa bình luận người khác → bị từ chối (Sc3). Hồi quy Epic 2 + US-58, 61 |
| **DEV-2** | Hoàn tất nốt tab Thành viên. Hồi quy Epic 3 + Epic 4.1/4.2 + US-63 |
| **Cả nhóm** | Chạy lại **mọi Scenario** Bảng 3 của phần mình trên preview (bảng chia việc hồi quy ở [07 §3.2](07_lo_trinh_va_backlog.md#32-lịch-theo-chặng)), ghi Pass/Fail vào mô tả PR. Console không có lỗi đỏ ở 375px / 768px / ≥1200px |

### 12/11 — Release V2

- Sáng: sửa nốt lỗi chặn.
- Chiều (Lead): checklist [06_trien_khai.md §5](06_trien_khai.md#5-checklist-trước-khi-release-merge-develop--main), chạy migration production, PR `develop` → `main`, tag **`v2.0.0`**.
- **13/11:** ngày dự phòng.

---

## 2. Phụ thuộc — ai chờ gì, trong lúc chờ làm gì

| Cần | Người cung cấp | Có lúc | Trong lúc chưa có, làm gì |
|---|---|---|---|
| Wrapper `js/api.js` | Lead | 12h ngày 09/11 | DEV-1 viết BE + test bằng curl (không cần wrapper); DEV-2 viết `me.routes.js` + test curl |
| Backend chạy trên Internet | Lead | 09/11 | Mỗi người chạy `server/` ở máy mình, `BASE_URL = "http://localhost:3000/api"` tạm (**không commit**) |
| Khung `admin.html` | Lead | 10/11 | Tab admin của DEV-1, DEV-2 là việc ngày 10–11 → không bị chặn |
| Lượt xem `view_events` cho US-58 | DEV-1 (tự viết) | 09/11 | — (cùng một người) |
| Hook đồng bộ ♥ | Lead | 09/11 (trong `setupAuthHeader`) | DEV-2 làm phần lịch sử trước |

Quy tắc: **bị chặn quá 2 giờ thì báo ngay trong nhóm**. Lead ưu tiên gỡ chặn trước việc riêng.

---

## 3. Rủi ro & cắt giảm

| Rủi ro | Dấu hiệu | Phương án |
|---|---|---|
| Thiếu thời gian | Tối 10/11 còn > 3 US chưa xong | **Bỏ trước US Could: US-60 (ghim hero), US-62 (nguồn dự phòng)** — giữ Must/Should. Bảo trì mode FE làm sau release vì không chặn chức năng chính |
| Deploy trục trặc | 09/11 chưa có URL `/api/health` | Tích hợp local trước, deploy sau — không chặn ai (mọi tính năng FE xử lý được `BACKEND_NOT_CONFIGURED`) |
| Conflict `watch.js` | Conflict khi merge | DEV-1 chỉ sửa khu bình luận/đánh giá (cuối file), DEV-2 chỉ sửa phần player/lịch sử; mỗi sáng pull `develop`; **không format lại cả file** |
| Lead quá tải | PR chờ review > nửa ngày | DEV-1, DEV-2 review chéo trước; Lead chỉ xem phần CORE + bảo mật |
| Lỗ hổng phân quyền | Gọi được `/admin/*` bằng tài khoản thường | Lead duyệt bảo mật ngày 11/11 trước khi merge; test: curl `/admin/*` bằng token member → `403` |
| Ô chấm điểm chưa kịp làm | 11/11 US-56 thiếu ô gửi điểm | Chỉ đọc được điểm trung bình cũng đạt Sc2 một nửa; ghi rõ vào bảng 07, dời phần gửi điểm sang bản sửa sau release |

---

## 4. Xong V2 khi

- [ ] Mọi US **Must** đạt đủ Scenario: US-18 (cả Sc4), US-19, US-50/51 (đồng bộ), US-52/53 (máy chủ), US-58, US-63.
- [ ] Mọi US **Should** đạt: US-54, 55, 56, 61, 59.
- [ ] US **Could**: US-60, 62 — làm được thì tốt, trễ thì bỏ theo §3 và ghi vào 07.
- [ ] `admin.html` 5 tab hoạt động, tài khoản thường không vào được (Sc3) và bị `403` khi gọi API.
- [ ] Deploy: backend Render + Neon, FE preview với proxy `/api`; `BASE_URL = "/api"` trên `develop`.
- [ ] Hồi quy toàn bộ 52 US, bảng [07 §2](07_lo_trinh_va_backlog.md#2-trạng-thái-user-story) cập nhật đúng.
- [ ] `main` có tag `v2.0.0`.
