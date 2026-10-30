# 07 — Lộ trình & trạng thái backlog

> Nguồn: `docs/product_roadmap.xlsx` (lộ trình T1–T8) và `docs/product_backlog.xlsx` (bản **28/10/2026**, 52 US —
> Bảng 1: Epic → US, Bảng 2: Product Backlog có Story Pts / Priority / Sprint, Bảng 3: Acceptance Criteria + Testing).
> `product_backlog.xlsx` không commit lên repo (`.gitignore`) — hỏi Lead nếu chưa có.
> **Tiêu chí chấp nhận ở Bảng 3 là định nghĩa "xong"** của từng US.
> Trạng thái dưới đây đối chiếu với code ngày **28/10/2026** — ai xong US thì cập nhật bảng trong cùng PR.

---

## 1. Lộ trình

```
Tháng 9                    │ Tháng 10                                               │ Tháng 11
T1 11/9  T2 18/9  T3 25/9  │ T4 2/10   T5 9/10      T6 16/10     T7 23/10           │ T8 30/10 →
Khảo sát, kế hoạch,        │ Demo V1: chức năng nền tảng   ▼ Release V1 (09/10)     │ Demo V2: chức năng nâng cao
yêu cầu, thiết kế sơ bộ,   │ T3–T4: trang chủ, layout chung, lưới phim, phim lẻ/bộ  │
thiết kế CSDL, môi trường  │ T4:    bộ lọc, tìm kiếm, trang chi tiết                │
                           │ T5:    trình phát + điều khiển, phím tắt               │
                           │ T6:    đăng ký/đăng nhập, yêu thích, lịch sử (+ UI)    │
                           │ T7:    Dashboard Admin, quản lý thành viên, hiển thị bình luận (+ UI)
                           │ T8:    bình luận, đánh giá, kiểm duyệt, yêu cầu phi chức năng
```

**Thực tế 28/10:** frontend V1 xong; **backend chưa bắt đầu** (chưa có thư mục `server/`, `BACKEND_CONFIG.BASE_URL` rỗng).
Lịch V2 được kéo dài: **Release V2 = 12/11/2026** (chi tiết ở [§3](#3-kế-hoạch-v2--phân-công-3-người)).

## 2. Trạng thái user story

✅ xong (đạt tiêu chí) · 🔍 có code, **cần kiểm lại theo tiêu chí bản 28/10** · 🟡 làm một phần · ❌ chưa làm · 🔒 cần backend

| Sprint | US | Tên | Pri | Trạng thái | Ghi chú / còn thiếu | Phụ trách V2 |
|---|---|---|---|---|---|---|
| 1 | US-23 | Xem toàn bộ phim của danh mục | Must | ✅ | | |
| 1 | US-22 | Nhóm phim mới trên trang chủ | Must | ✅ | | |
| 1 | US-14 | Thông tin liên hệ, mạng xã hội | Must | 🔍 | 30/10: icon mạng xã hội trỏ trang chủ từng mạng, mở thẻ mới; thêm link Phim Lẻ / Phim Bộ / Yêu thích / Lịch sử; bỏ link `#` và tên web khác. Cần kiểm trên trình duyệt | Lead |
| 1 | US-17 | Thẻ phim trong danh sách | Must | 🔍 | 30/10: nhóm Phim mới dùng endpoint `-v3`; phim lẻ hiện chất lượng thay vì "Full". phimapi không trả tổng số tập nên hiện "Tập 7" / "Hoàn Tất (8/8)". Cần kiểm trên trình duyệt | Lead |
| 1 | US-13 | Header dính + lên đầu trang | Must | ✅ | | |
| 1 | US-21 | Phim nổi bật trang chủ | Must | ✅ | | |
| 1 | US-24 | Danh sách phim lẻ | Must | ✅ | | |
| 1 | US-25 | Danh sách phim bộ + số tập | Must | ✅ | | |
| 1 | US-10 | Menu trên điện thoại | Must | ✅ | | |
| 1 | US-28 | Phân trang | Must | ✅ | | |
| 2 | US-39 | Phim tương tự ở trang chi tiết | Must | ✅ | | |
| 2 | US-27 | Lọc theo quốc gia | Must | ✅ | | |
| 2 | US-35 | Nội dung tóm tắt | Must | ✅ | | |
| 2 | US-36 | Diễn viên, đạo diễn | Must | ✅ | | |
| 2 | US-26 | Lọc theo thể loại | Must | ✅ | | |
| 2 | US-33 | Tên + ảnh đầu trang chi tiết | Must | 🔍 | Tiêu chí mới chỉ cần tên, ảnh bìa, ảnh nền, báo không tìm thấy, mở lại bằng link | DEV-2 |
| 2 | US-34 | Năm, thời lượng, chất lượng | Must | ✅ | | |
| 2 | US-31 | Gợi ý khi gõ tìm kiếm | Should | ✅ | | |
| 2 | US-32 | Trang kết quả tìm kiếm | Should | ✅ | | |
| 2 | US-30 | Báo khi không có phim | Should | ✅ | | |
| 3 | US-37 | Chọn tập | Must | ✅ | | |
| 3 | US-47 | Đổi nguồn phát, biết tập đang xem | Must | ✅ | | |
| 3 | US-38 | Xem phim từ trang chi tiết | Must | ✅ | | |
| 3 | US-40 | Tự đổi nguồn khi lỗi | Must | ✅ | HLS → iframe | |
| 3 | US-41 | Dừng/phát/âm lượng | Must | ✅ | | |
| 3 | US-45 | Toàn màn hình | Must | ✅ | | |
| 3 | US-48 | Chuyển giữa các phần | Must | 🟡🔍 | Dò phần theo tên phim, có thể sót; kiểm 3 Scenario | DEV-2 |
| 3 | US-44 | Phím tắt | Must | ✅ | | |
| 3 | US-46 | Tự chuyển tập (tắt được) | Must | ✅ | `#auto-next-toggle` | |
| 4 | US-15 | Thông báo sau thao tác (toast) | Must | ✅ | | |
| 4 | US-18 | Đăng ký / đăng nhập | Must | 🔒❌ | Có nền FE: `fetchBackend`, phiên. **Scenario 4 mới:** khách bấm ♥ → yêu cầu đăng nhập | Lead + DEV-2 |
| 4 | US-52 | Ghi nhớ tập **và thời điểm** | Must | 🟡 | Chỉ lưu tập, `progress` luôn = 0 | DEV-2 |
| 4 | US-19 | Đăng xuất | Must | 🔒❌ | Scenario 2: âm lượng + tắt đèn phải giữ sau đăng xuất — hiện chưa lưu | Lead + DEV-2 |
| 4 | US-50 | Lưu phim yêu thích | Must | ✅ | localStorage; V2 thêm đồng bộ máy chủ cho thành viên | DEV-2 (đồng bộ) |
| 4 | US-51 | Quản lý danh sách yêu thích | Must | ✅ | như trên | DEV-2 (đồng bộ) |
| 4 | US-53 | Xem tiếp phim đang dở | Must | 🟡 | Tiếp tục đúng tập, chưa đúng thời điểm (phụ thuộc US-52) | DEV-2 |
| 4 | US-12 | Mở yêu thích / lịch sử từ menu | Must | ✅ | Menu "Thêm" | |
| 5 | US-58 | Lượt xem + top 10 phim | Must | 🔒❌ | | DEV-1 (+ Lead: chặn quyền) |
| 5 | US-63 | Khóa / mở khóa thành viên | Must | 🔒❌ | | DEV-2 |
| 5 | US-54 | Đọc bình luận | Should | 🔒🟡 | UI có, dữ liệu giả `DEMO_COMMENTS` | DEV-1 |
| 5 | US-59 | Dọn dữ liệu tạm | Should | ❌ | Chạy hoàn toàn ở trình duyệt | Lead |
| 5 | US-60 | Ghim phim nổi bật | Could | 🔒❌ | | Lead |
| 5 | US-62 | Nguồn dự phòng + bảo trì | Could | 🔒❌ | | Lead |
| 6 | US-42 | Thời gian + tua | Should | ✅ | Có dạng `h:mm:ss` | |
| 6 | US-55 | Viết bình luận + đánh dấu spoil | Should | 🔒🟡 | Bộ đếm, giới hạn 1000, chặn rỗng đã có; gửi + che spoil cần backend | DEV-1 |
| 6 | US-61 | Kiểm duyệt bình luận | Should | 🔒❌ | | DEV-1 |
| 6 | US-43 | Chọn chất lượng | Should | ✅🔍 | Kiểm Scenario 3 (chỉ 1 mức → ẩn) | |
| 6 | US-56 | Chấm điểm 1–10 + điểm chung | Should | 🔒🟡 | Tab có, dữ liệu giả; chưa có ô chấm điểm | DEV-1 |
| 6 | US-57 | Bộ ảnh phim | Should | ✅ | | |
| 6 | US-20 | Báo tính năng chưa sẵn sàng | Could | 🚫 Bỏ | 30/10 PO quyết định xóa "Rổ Bóng" và "Tải ứng dụng" (không có thật) → US này không còn đối tượng áp dụng | |
| 6 | US-49 | Tắt đèn + chia sẻ | Could | ✅ | | |
| 6 | US-11 | Xem nhanh thể loại/quốc gia | Could | ✅🔍 | Kiểm Scenario 3 (mất mạng vẫn có danh sách — đã có `fallbackData`) | |

**Tổng (52 US):** ✅ 36 (2 mục cần kiểm lại) · 🔍 1 · 🟡 7 · ❌ 8. Bản backlog 28/10 đã bỏ US-01…09, US-16, US-29 và gộp US-64 vào US-63.

---

## 3. Kế hoạch V2 — phân công 3 người

**Chốt 29/10/2026.** Hạn **Release V2: Thứ Năm 12/11/2026**, chừa 1 ngày dự phòng (13/11).

### 3.1 Ai làm gì

Chia theo **lát dọc**: mỗi người sở hữu trọn một nhóm tính năng **cả backend lẫn frontend**. Không ai phải ngồi chờ "bên kia làm API xong".
Hợp đồng [backend_api_contract.md](../specs/backend_api_contract.md) đã đủ, ai cũng code theo nó được ngay.

| | **Lead** — Nền tảng, Tài khoản, Hệ thống | **DEV-1** — Cộng đồng & Thống kê | **DEV-2** — Cá nhân & Thành viên |
|---|---|---|---|
| **Vai trò** | Dựng khung `server/`, giữ file CORE, deploy, **review mọi PR** | Dev mới | Dev mới |
| **User story** | US-18 (BE + header), US-19 (Scenario 1, 3), US-59, US-60, US-62, chặn quyền admin (US-58 Scenario 3) | US-14 (khởi động), US-54, US-55, US-56, US-58, US-61 | US-33 + US-48 (khởi động), US-18 (trang `login.html`), US-19 (Scenario 2), US-52, US-53, đồng bộ US-50/51, US-63 |
| **Endpoint** | `/auth/*`, `/settings`, `PATCH /admin/settings`, `/api/health` | `/movies/:slug/comments`, `/comments/:id`, `/movies/:slug/ratings`, `/movies/:slug/views`, `/admin/stats`, `/admin/comments*` | `/me/favorites*`, `/me/history`, `/admin/users*` |
| **File BE sở hữu** (`server/`) | `app.js`, `server.js`, `config.js`, `db.js`, `errors.js`, `middlewares/*`, `migrations/*`, `auth.*`, `settings.*`, `phimapi.service.js` | `movies.routes.js`, `comments.routes.js`, `comment.service.js`, `rating.service.js`, `stats.service.js`, khối *DEV-1* trong `admin.routes.js` | `me.routes.js`, `user.service.js`, khối *DEV-2* trong `admin.routes.js` |
| **File FE sở hữu** | **Mọi file CORE** (`js/api.js`, `js/main.js`, `js/components.js`, `components/header.html`, `js/config.js`), `js/homepage.js`, khung `admin.html` / `js/admin.js` / `css/admin.css`, tab *Hệ thống* + *Bộ nhớ* | Khu bình luận / đánh giá trong `js/watch.js` + `css/watch.css`, tab *Dashboard* + *Bình luận* trong `js/admin.js` | `login.html` / `js/login.js` / `css/login.css`, phần player + lịch sử trong `js/watch.js`, `js/favorites.js`, `js/history.js`, tab *Thành viên* trong `js/admin.js` |
| **Story Pts** | ≈ 17 + hạ tầng + review | ≈ 19 | ≈ 19 |

Vì sao chia như vậy:
- **Lead** làm những thứ người khác **phụ thuộc vào** (khung repo, đăng nhập, wrapper `api.js`, deploy) và những file CORE dễ phá cả web.
  Các việc này xong ở **Ngày 0 – Chặng 1**, đúng lúc 2 dev mới còn đang làm quen.
- **DEV-1, DEV-2** làm **file trang + route riêng**. Họ chỉ dùng lại CORE, không phải sửa, nên ít conflict và lỗi không lan sang trang khác.
- Mỗi dev mới **mở đầu bằng 1 task nhỏ** (US-14 / US-33 + US-48) để tập quy trình Git → PR → review theo [CONTRIBUTING.md](../../CONTRIBUTING.md) trước khi vào việc lớn.

### 3.2 Lịch theo chặng

#### Ngày 0 — Thứ Năm 29/10: Khởi động

| Người | Việc | Xong khi |
|---|---|---|
| Lead | ① Mời DEV-1, DEV-2 làm collaborator; bật branch protection cho `main` và `develop` (bắt buộc PR + 1 approve). ② Merge PR tài liệu (CONTRIBUTING mới, file này). ③ 30 phút hướng dẫn Git flow cho 2 bạn. ④ **Tạo khung `server/`** theo [skill 08](../skills/08_backend_node_skill.md): `app.js`, error handler, CORS, `/api/health`, migration **đủ 7 bảng** (hợp đồng §5), README chạy local, `.env.example`; **tạo sẵn mọi file route rỗng và đăng ký trong `app.js`**, chia `admin.routes.js` thành 3 khối có comment *Lead / DEV-1 / DEV-2* → không ai phải sửa `app.js` nữa. ⑤ PR CORE frontend: `buildBackendPath()` + **toàn bộ wrapper backend** trong `js/api.js` (danh sách ở §3.4), cập nhật `core_registry.md` | 2 dev `cd server`, `npm run migrate` + `npm run dev` → `GET /api/health` trả `ok`. Wrapper đã ở trên `develop` |
| DEV-1 | Cài đặt theo [CONTRIBUTING §2](../../CONTRIBUTING.md#2-cài-đặt-lần-đầu-làm-1-lần); đọc `AGENTS.md`, `02_kien_truc.md`. **PR đầu tiên: US-14** — link mạng xã hội mở thẻ mới (`target="_blank" rel="noopener"`), thêm link Phim lẻ / Phim bộ ở footer (`components/footer.html` là CORE nên báo nhóm trước, chỉ sửa link) | PR US-14 được merge, đạt 3 Scenario |
| DEV-2 | Cài đặt như DEV-1. **PR đầu tiên:** chạy 3 Scenario của **US-33** và **US-48** theo tiêu chí mới, sửa chỗ nào Fail (`js/detail.js`, `css/detail.css`, phần chọn phần phim trong `js/watch.js`); cập nhật trạng thái 2 US này ở §2 | PR merge, ghi rõ Pass/Fail từng Scenario |

#### Chặng 1 — 30/10 → 02/11: Đăng nhập chạy được trên preview

| Người | Việc | Xong khi |
|---|---|---|
| Lead | **30/10:** middleware `requireAuth` (đọc lại user từ CSDL mỗi request → bị khóa thì `403 ACCOUNT_BANNED`), `optionalAuth`, `requireRole`, validate, rate limit; 4 endpoint `/auth/*`; script seed super admin. **31/10:** header tài khoản (`header.html` + `main.js`): avatar + tên (US-18 Sc2), menu cá nhân → Đăng xuất + toast (US-19 Sc1), link Admin nếu role admin, xử lý `auth:expired` **không dừng video** (US-19 Sc3); khách bấm ♥ → hộp thoại mời đăng nhập (US-18 Sc4, xem §3.6). **01/11:** deploy `server/` lên Render + Neon; frontend preview (Netlify/Vercel) + proxy `/api`, `BASE_URL = "/api"` ([06_trien_khai.md](06_trien_khai.md)). **02/11:** khung `admin.html`: chặn quyền (không phải admin → về `index.html`, US-58 Sc3), 5 tab với hàm rỗng `initDashboardTab` / `initCommentsTab` / `initUsersTab` / `initSystemTab` / `initStorageTab`, ghi tên người sở hữu từng tab | Trên preview: đăng ký → đăng nhập → header hiện avatar → đăng xuất. Mở `admin.html` bằng tài khoản thường → về trang chủ |
| DEV-1 | **30/10:** `cd server && npm install`, tạo DB dev riêng trên Neon (không cần cài PostgreSQL); viết **endpoint công khai trước** (chưa cần đăng nhập): `GET /movies/:slug/comments`, `GET /movies/:slug/ratings`, `POST /movies/:slug/views`; chèn bình luận mẫu bằng SQL để test. **31/10:** `watch.js` bỏ `DEMO_COMMENTS` / `DEMO_RATINGS`, gọi `getMovieComments` / `getMovieRatings`; hiện "Chưa có bình luận" (US-54 Sc2); gọi `recordMovieView` khi mở trang xem. **01–02/11:** (đã có `requireAuth` của Lead) `POST /movies/:slug/comments`, `DELETE /comments/:id` (chủ hoặc admin), `POST /movies/:slug/ratings` (upsert, tính trung bình) | US-54 đạt 3 Scenario khi chạy local; 3 endpoint ghi chạy đúng bằng curl, kể cả mã lỗi `400` / `401` / `403` |
| DEV-2 | **30/10:** `login.html` + `js/login.js` + `css/login.css` theo [skill 07 §3](../skills/07_backend_auth_skill.md): 2 tab Đăng nhập / Đăng ký, kiểm tra input, gọi `loginUser` / `registerUser`, báo lỗi "Tên đăng nhập hoặc mật khẩu không chính xác" (US-18 Sc3), lưu phiên, quay lại trang trước. Tối 30/10 chạy với auth local của Lead. **31/10–01/11:** việc **không cần backend**: lưu tập + **giây đang xem** (`timeupdate` có throttle + `pagehide`) — US-52 Sc1; mở từ lịch sử → phát tiếp đúng giây — US-53 Sc1; lưu âm lượng + tắt đèn vào `STORAGE_KEYS.USER_PREFERENCES`, đăng xuất không xóa — US-19 Sc2. **02/11:** `GET/POST/DELETE /me/favorites`, `GET/PUT /me/history` (upsert, giữ 50 mục) | US-18 Sc1–3 đạt trên preview; US-52 Sc1 + US-53 Sc1 đạt (xem tập 3 đến phút 10, thoát, mở lại → đúng tập 3 phút 10) |

**Demo cuối chặng — tối 02/11:** cả nhóm chạy thử trên preview 15 phút.

#### Chặng 2 — 03/11 → 06/11: Cộng đồng + Dữ liệu cá nhân + Cấu hình

| Người | Việc | Xong khi |
|---|---|---|
| Lead | BE: `GET /settings`, `PATCH /admin/settings` (kiểm slug với phimapi → `404 MOVIE_NOT_FOUND`), middleware bảo trì (`503 MAINTENANCE` cho request ghi của non-admin). FE CORE: đọc `/settings` khi tải trang → bật bảo trì thì khách chỉ thấy màn hình bảo trì, admin vẫn dùng bình thường (US-62 Sc2–3); `movieApiBaseUrl` → phimapi chuyển sang nguồn dự phòng (US-62 Sc1); `homepage.js` dùng `pinnedHeroSlug`, `null` → phim mới nhất (US-60 Sc1, Sc3). Thêm **hook đồng bộ ♥** trong `main.js` để DEV-2 dùng (gọi `addMyFavorite` / `removeMyFavorite` khi đã đăng nhập) | Sửa `settings` trực tiếp trong DB → trang chủ đổi phim nổi bật; bật bảo trì → cửa sổ ẩn danh thấy thông báo bảo trì |
| DEV-1 | FE `watch.js`: gửi bình luận (US-55 Sc1, Sc3 — bộ đếm và chặn rỗng đã có, nối API), đánh dấu "Tiết lộ nội dung" → bình luận bị che + cảnh báo, bấm mới hiện (US-55 Sc2); ô chấm điểm **1–10** + gửi + điểm trung bình cập nhật ngay (US-56 Sc1–2); nút xóa bình luận của mình; chưa đăng nhập vẫn đọc được (US-54 Sc3) | US-54, US-55, US-56 đạt đủ Scenario trên preview |
| DEV-2 | FE đồng bộ: đăng nhập xong → đẩy yêu thích + lịch sử từ localStorage lên máy chủ (1 lần / máy); `favorites.js`, `history.js` đọc từ máy chủ khi đã đăng nhập; `watch.js` gọi `saveMyHistory` (thời điểm xem). US-52 Sc2 (xem lại → lên đầu) + Sc3 (51 phim → bỏ phim cũ nhất) chạy cả local và máy chủ | Đăng nhập trên trình duyệt A, ♥ một phim → đăng nhập trên trình duyệt B thấy phim đó. US-50, 51, 52, 53 đạt khi đã đăng nhập |

#### Chặng 3 — 07/11 → 10/11: Quản trị

| Người | Việc | Xong khi |
|---|---|---|
| Lead | Tab **Hệ thống**: ghim phim + "Khôi phục tự động" (US-60 Sc1–3), bật/tắt bảo trì + lời nhắn, đổi nguồn dự phòng (US-62). Tab **Bộ nhớ** (US-59): đo dung lượng dữ liệu tạm, "Dọn dẹp" có xác nhận (`showConfirmDialog`), giữ nguyên cấu hình + phiên + yêu thích (Sc3). Duyệt bảo mật mọi `/admin/*` theo [skill 06 §5](../skills/06_kiem_thu_thu_cong_skill.md#5-bảo-mật-nhanh) | US-59, US-60, US-62 đạt đủ Scenario; tài khoản thường gọi `/admin/*` bằng curl → `403` |
| DEV-1 | BE `GET /admin/stats` (tổng lượt xem, top 10 phim xem nhiều, hoạt động gần đây), `GET /admin/comments`, `PATCH /admin/comments/:id` (đánh dấu spoil), `DELETE /admin/comments/:id`. FE tab **Dashboard** (US-58 Sc1–2) + tab **Bình luận** (US-61 Sc1–2); tài khoản thường xóa bình luận người khác → bị từ chối (US-61 Sc3) | US-58, US-61 đạt đủ Scenario trên preview |
| DEV-2 | BE `GET /admin/users` (`q`, `status`, phân trang), `PATCH /admin/users/:id` ban / unban: tự khóa mình → `400 CANNOT_BAN_SELF`, không khóa được super_admin. FE tab **Thành viên**: tìm, lọc, khóa / mở khóa, báo lỗi khi tự khóa (US-63 Sc1–3). Tài khoản bị khóa → request kế tiếp bị `403`, frontend tự đăng xuất | US-63 đạt 3 Scenario: khóa → bị đăng xuất, đăng nhập lại bị từ chối; mở khóa → đăng nhập được |

#### 11/11 — Đóng băng code + kiểm hồi quy toàn bộ 52 US

Không merge tính năng mới, chỉ sửa lỗi chặn. Mỗi người chạy lại **mọi Scenario** trong Bảng 3 của nhóm được giao, trên preview,
cộng checklist [06_kiem_thu_thu_cong_skill.md](../skills/06_kiem_thu_thu_cong_skill.md):

| Lead | DEV-1 | DEV-2 |
|---|---|---|
| Epic 1.1, 1.2 (US-10…15, 28, 30) + Epic 5.1 | Epic 2.1, 2.2 (US-21…27, 31, 32) + Epic 4.3 + US-58, 61 | Epic 2.3 + Epic 3 (US-17, 33…49) + Epic 4.1, 4.2 + US-63 |

#### 12/11 — Release V2

Sáng: sửa nốt lỗi chặn. Chiều (Lead): checklist [06_trien_khai.md §5](06_trien_khai.md#5-checklist-trước-khi-release-merge-develop--main),
chạy migration production, PR `develop` → `main`, tag `v2.0.0`. **13/11:** ngày dự phòng.

### 3.3 Phụ thuộc — ai chờ gì, trong lúc chờ làm gì

| Cần | Người cung cấp | Có lúc | Trong lúc chưa có, làm gì |
|---|---|---|---|
| Khung `server/` + migration | Lead | Tối 29/10 | DEV-1, DEV-2 đang làm PR khởi động (task frontend) |
| Wrapper backend trong `js/api.js` | Lead | Tối 29/10 | Chưa có `BASE_URL` → wrapper trả `BACKEND_NOT_CONFIGURED`, trang vẫn chạy ([skill 07 §9](../skills/07_backend_auth_skill.md)) |
| `requireAuth` + `/auth/login` để lấy token test | Lead | Tối 30/10 | DEV-1 làm endpoint **công khai** trước; DEV-2 làm `login.html` + việc thuần localStorage (US-52/53/19 Sc2) |
| Backend chạy trên Internet | Lead | 01/11 | Mỗi người chạy `server/` ở **máy mình**, đặt tạm `BASE_URL = "http://localhost:3000/api"` (**không commit**) |
| Khung `admin.html` | Lead | 02/11 | Tab admin của DEV-1, DEV-2 nằm ở Chặng 3 → không bị chặn |
| Lượt xem (`view_events`) cho US-58 | DEV-1 | 30/10 | — (cùng một người) |
| Hook đồng bộ ♥ trong `main.js` | Lead | 04/11 | DEV-2 làm phần lịch sử trước |

Quy tắc: **bị chặn quá 2 giờ thì báo ngay trong nhóm**, không ngồi chờ. Lead ưu tiên gỡ chặn trước việc riêng của mình.

### 3.4 Wrapper backend Lead viết sẵn ở Ngày 0 (`js/api.js`)

Tên đã chốt để mọi người code theo, kể cả trước khi PR merge:

| Nhóm | Hàm |
|---|---|
| Tài khoản | `registerUser({ username, email, password })`, `loginUser({ login, password })`, `logoutUser()`, `getCurrentUser()` |
| Cá nhân | `getMyFavorites(page)`, `addMyFavorite(movie)`, `removeMyFavorite(slug)`, `getMyHistory(page)`, `saveMyHistory(entry)` |
| Cộng đồng | `getMovieComments(slug, page)`, `postMovieComment(slug, { content, isSpoiler, episode })`, `deleteComment(id)`, `getMovieRatings(slug, page)`, `postMovieRating(slug, { score, content })`, `recordMovieView(slug, episode)` |
| Cấu hình | `getSiteSettings()` |
| Quản trị | `getAdminStats(days)`, `updateAdminSettings(patch)`, `getAdminUsers(query)`, `setUserStatus(id, status)`, `getAdminComments(query)`, `flagCommentSpoiler(id)`, `deleteAdminComment(id)` |

Tất cả trả về `{ success, data, error, status }` như `fetchBackend()`. Cần thêm hàm → nhắn Lead hoặc tự thêm **ở cuối nhóm**, kèm một PR nhỏ riêng.

### 3.5 Luật phối hợp

- **Hợp đồng trước, code sau.** Muốn thêm hoặc đổi field / endpoint → PR sửa `backend_api_contract.md` trước, Lead duyệt. Không ai tự đổi một mình.
- **CORE frontend chỉ Lead sửa** trong V2 (`api.js`, `main.js`, `components.js`, `header.html`, `config.js`, `style.css`, `components.css`).
  DEV cần đổi gì ở đó → nhắn Lead. Ngoại lệ đã báo trước: DEV-1 sửa link trong `footer.html` (US-14).
- **`js/watch.js` có 2 người cùng sửa** → DEV-1 chỉ sửa khu bình luận / đánh giá (cuối file), DEV-2 chỉ sửa phần player / lịch sử.
  Mỗi sáng `git merge origin/develop`. **Không format lại cả file.**
- **`js/admin.js`**: mỗi người chỉ viết trong hàm `initXxxTab` của tab mình. `css/admin.css`: mỗi tab một khối, selector `.admin-page .<tab>-tab ...`.
- **Backend**: mỗi người chỉ sửa route/service của mình. Cần bảng hay cột mới → **file migration mới** (không sửa migration cũ), báo Lead.
- **Review**: Lead duyệt PR vào 2 khung giờ cố định, **12h và 21h**. DEV-1 và DEV-2 review chéo PR của nhau trước (để học), Lead approve cuối.
- **PR nhỏ**: mỗi PR ≤ 1 US hoặc ≤ 1 nhóm endpoint, mở trong vòng 1–2 ngày.
- **Đồng bộ 10 phút mỗi tối** (21h30): mỗi người nói đã xong gì, mai làm gì, đang chờ ai.

### 3.6 Lead cần chốt trước 30/10

| # | Vấn đề | Đề xuất |
|---|---|---|
| 1 | **US-18 Scenario 4** (khách bấm ♥ → yêu cầu đăng nhập) mâu thuẫn với hợp đồng §3.2 ("khách vẫn dùng localStorage như V1") | Theo tiêu chí chấp nhận: khách bấm ♥ → hộp thoại mời đăng nhập. Dữ liệu ♥ cũ trong localStorage được đẩy lên tài khoản ở lần đăng nhập đầu. Lịch sử xem của khách vẫn lưu local. Sửa §3.2 hợp đồng cho khớp |
| 2 | **US-59**: "dữ liệu tạm" gồm gì? Hiện localStorage chỉ có yêu thích, lịch sử, cài đặt, phiên | Dữ liệu tạm = mọi key **không nằm trong** `STORAGE_KEYS` + `sessionStorage` + cache trình duyệt (Cache Storage nếu có). Giữ nguyên yêu thích, lịch sử, cài đặt, phiên (Scenario 3) |
| 3 | Thang điểm đánh giá | **1–10** theo US-56 (hợp đồng đã khớp). Giao diện không dùng 5 sao |

### 3.7 Rủi ro & phương án

| Rủi ro | Dấu hiệu | Phương án |
|---|---|---|
| Dev mới chậm làm quen Node / Express | Hết 31/10 DEV-1 chưa có endpoint đầu tiên chạy được | Lead pair 1 giờ, viết mẫu 1 endpoint hoàn chỉnh (`GET comments`) để DEV-1 làm theo |
| Lead quá tải (vừa làm vừa review) | PR chờ review > 1 ngày | DEV-1 và DEV-2 review chéo, Lead chỉ xem phần CORE và bảo mật; US-59 chuyển cho người nào xong sớm |
| Deploy trục trặc | 01/11 chưa có URL `/api/health` | Tích hợp tạm ở local, deploy sau; không chặn ai |
| Conflict `watch.js` | Conflict lớn khi merge | Tuân §3.5; nếu vẫn lặp lại → DEV-2 tách phần lưu lịch sử thành các hàm riêng ở đầu file |
| Thiếu thời gian | 08/11 còn > 3 US chưa xong | Bỏ trước US **Could**: US-60, US-62; giữ Must / Should |
| Lỗ hổng phân quyền | Gọi được `/admin/*` bằng tài khoản thường | Lead duyệt bảo mật ở Chặng 3 trước khi merge |
