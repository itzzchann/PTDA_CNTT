# 07 — Lộ trình & trạng thái backlog

> Nguồn: ảnh lộ trình và `product_backlog.xlsx` — **lưu ngoài repo**, hỏi trưởng nhóm nếu chưa có (Bảng 1: Epic → US, Bảng 2: Product Backlog có Story Pts / Priority / Sprint,
> Bảng 3: Acceptance Criteria + Testing). **Tiêu chí chấp nhận là định nghĩa "xong"** của từng US.
> Trạng thái dưới đây đối chiếu với code ngày **21/10/2026** — ai xong US thì cập nhật bảng trong cùng PR.

---

## 1. Lộ trình

```
Tháng 9                               Tháng 10                                   Tháng 11
T1 11/9  T2 18/9  T3 25/9  │ T4 2/10   T5 9/10    T6 16/10   T7 23/10   │ T8
Khảo sát, kế hoạch         │ Demo V1: nền tảng       ▼ Release V1      Demo V2: nâng cao     ▼ Release V2 (30/10)
Yêu cầu + thiết kế sơ bộ   │                         (09/10)
                           │ T3: kết nối API, luồng dữ liệu  · giao diện trang chủ, layout chung, lưới phim
                           │ T4: bộ lọc, phân trang, chi tiết · giao diện danh mục, chi tiết (metadata)
                           │ T5: trình phát + điều khiển      · giao diện player, phím tắt
                           │ T6: QUẢN LÝ TÀI KHOẢN + API lưu dữ liệu cá nhân · đăng ký/đăng nhập, yêu thích, lịch sử
                           │ T7: DASHBOARD ADMIN, kiểm soát người dùng · giao diện admin, kết quả tìm kiếm, bình luận
                           │ T8: KIỂM DUYỆT tương tác cộng đồng, tối ưu · khung bình luận, đánh giá sao, trạng thái hệ thống
```

Hôm nay (21/10) đang ở **T6 → T7**: phần tài khoản + backend là đường găng (critical path) cho mọi việc V2 còn lại.

## 2. Trạng thái user story

✅ xong (đạt tiêu chí) · 🟡 làm một phần · ❌ chưa làm · 🔒 cần backend

| Sprint | US | Tên | Pri | Trạng thái | Ghi chú / còn thiếu |
|---|---|---|---|---|---|
| 1 | US-06 | Đồng bộ xử lý kết nối máy chủ phim | Must | ✅ | `fetchAPI` timeout, `{success,status}` |
| 1 | US-23 | "Xem thêm" ở tiêu đề danh mục | Must | ✅ | |
| 1 | US-39 | 6 phim đề xuất cuối trang chi tiết | Must | ✅ | Loại chính phim đang xem |
| 1 | US-01 | Luồng phân nhánh chuẩn | Must | 🟡 | Cần bật branch protection `main` trên GitHub |
| 1 | US-14 | Footer bản quyền + mạng xã hội | Must | 🟡 | Link `href="#"`, chưa có link Phim lẻ/bộ ở footer |
| 1 | US-07 | Lưu lịch sử/yêu thích an toàn | Must | ✅ | JSON hỏng → mảng rỗng; đầy bộ nhớ → `false` + toast |
| 1 | US-13 | Header dính + nút lên đầu trang | Must | ✅ | |
| 1 | US-21 | Banner phim nổi bật | Must | ✅ | Fallback khi lỗi |
| 1 | US-24 | Phim lẻ lưới 24 phim | Must | ✅ | |
| 1 | US-25 | Phim bộ + tiến độ tập | Must | ✅ | Badge `episode_current` |
| 1 | US-36 | Diễn viên + đạo diễn | Must | ✅ | |
| 1 | US-04 | Chuẩn hóa dữ liệu thô | Must | ✅ | |
| 1 | US-10 | Menu 3 gạch trên điện thoại | Must | ✅ | |
| 1 | US-28 | Phân trang 4 nút | Must | ✅ | |
| 1 | US-33 | Backdrop mờ + poster nổi 3D | Must | 🟡 | Có backdrop + poster; thiếu blur & hiệu ứng 3D |
| 2 | US-34 | Metadata dạng chip | Must | ✅ | |
| 2 | US-45 | Toàn màn hình + tự ẩn controls | Must | ✅ | |
| 2 | US-48 | Menu chọn Phần phim | Must | 🟡 | Chạy theo tìm kiếm tên; có thể sót phần |
| 2 | US-64 | Quản lý thành viên (ban/unban) | Must | 🔒❌ | |
| 2 | US-05 | Tối ưu gõ tìm kiếm / cuộn | Must | ✅ | |
| 2 | US-15 | Toast | Must | ✅ | |
| 2 | US-27 | Lọc theo quốc gia | Must | ✅ | `country.html` |
| 2 | US-37 | Tập theo máy chủ | Must | ✅ | |
| 2 | US-17 | Thẻ card đồng bộ | Must | ✅ | |
| 2 | US-35 | Cốt truyện sạch | Must | ✅ | |
| 2 | US-38 | Nút "Xem phim" vàng | Must | ✅ | |
| 3 | US-12 | Menu "Thêm" | Must | ✅ | |
| 3 | US-44 | Phím tắt player | Must | ✅ | |
| 3 | US-46 | Tự chuyển tập | Must | ✅ | |
| 3 | US-02 | Màu & font tập trung | Must | 🟡 | Token có; nhiều CSS cũ còn hardcode |
| 3 | US-09 | Xử lý ảnh bìa | Must | ✅ | |
| 3 | US-19 | Đăng xuất | Must | 🔒❌ | |
| 3 | US-26 | Lọc theo thể loại | Must | ✅ | `category.html` |
| 3 | US-29 | Lưới co giãn mọi màn hình | Must | ✅ | |
| 3 | US-40 | HLS + fallback iframe | Must | ✅ | |
| 3 | US-41 | Bộ điều khiển tùy biến | Must | ✅ | |
| 3 | US-50 | Nút tim yêu thích | Must | ✅ | |
| 4 | US-51 | Trang yêu thích | Must | ✅ | |
| 4 | US-53 | Tiếp tục xem từ lịch sử | Must | ✅ | Theo tập |
| 4 | US-03 | Tập trung cấu hình máy chủ | Must | ✅ | `API_CONFIG`, `BACKEND_CONFIG` |
| 4 | US-18 | Đăng ký / đăng nhập | Must | 🔒❌ | Nền tảng FE sẵn: `fetchBackend`, phiên |
| 4 | US-22 | 3 danh sách song song | Must | ✅ | Lỗi 1 danh sách không ảnh hưởng 2 cái kia |
| 4 | US-47 | Tab máy chủ + đánh dấu tập | Must | ✅ | |
| 5 | US-52 | Tự lưu lịch sử theo thời gian thực | Must | 🟡 | Chỉ lưu tập, chưa lưu phút/giây |
| 5 | US-58 | Dashboard admin | Must | 🔒❌ | |
| 5 | US-63 | Quản lý thành viên | Must | 🔒❌ | Trùng nội dung US-64 |
| 5 | US-16 | Skeleton + lỗi có nút Thử lại | Should | ✅ | |
| 5 | US-31 | Dropdown gợi ý | Should | ✅ | |
| 5 | US-32 | Trang kết quả tìm kiếm | Should | ✅ | |
| 5 | US-42 | Seekbar vàng | Should | ✅ | |
| 5 | US-54 | Danh sách bình luận | Should | 🔒🟡 | UI có, dữ liệu giả |
| 6 | US-55 | Khung bình luận + đếm ký tự + spoil | Should | 🔒🟡 | Bộ đếm, giới hạn 1000, chặn rỗng đã có; gửi + làm mờ spoil cần backend |
| 6 | US-59 | Đo bộ nhớ + Flush cache | Should | ❌ | Làm được không cần backend (localStorage) |
| 6 | US-61 | Kiểm duyệt bình luận | Should | 🔒❌ | |
| 6 | US-08 | Header/footer dùng chung | Should | ✅ | |
| 6 | US-30 | Trạng thái rỗng | Should | ✅ | |
| 6 | US-43 | Chọn chất lượng | Should | ✅ | |
| 6 | US-56 | Tab bình luận / đánh giá | Should | 🔒🟡 | UI có, dữ liệu giả |
| 6 | US-57 | Diễn viên nâng cao + gallery | Should | ✅ | |
| 6 | US-20 | Thông báo tính năng đang phát triển | Could | ✅ | |
| 6 | US-49 | Thanh công cụ nhanh | Could | ✅ | |
| 6 | US-60 | Ghim phim Hero | Could | 🔒❌ | |
| 6 | US-62 | API dự phòng + bảo trì | Could | 🔒❌ | |
| 6 | US-11 | Rê chuột xem thể loại/quốc gia | Could | ✅ | |

**Tổng (64 US):** ✅ 46 · 🟡 9 · ❌ 9 — phần lớn việc còn thiếu của V2 xoay quanh **backend**.

## 3. Kế hoạch V2 — phân công 3 người (chốt 22/10/2026)

**Đội:** 2 dev backend (**BE-A**, **BE-B**) · 1 dev frontend (**FE**).
**Công nghệ backend:** Node.js 20 + Express + PostgreSQL — repo riêng `rophim-api` ([08_backend_node_skill.md](../skills/08_backend_node_skill.md)).
**Hạn:** Release V2 **30/10/2026**. Còn 8 ngày → chia 3 chặng, mỗi chặng kết thúc bằng **tích hợp FE ↔ BE trên preview**.

### 3.1 Ai làm gì

| | BE-A — Nền tảng + Cộng đồng | BE-B — Tài khoản + Quản trị | FE — Toàn bộ giao diện V2 |
|---|---|---|---|
| **Sở hữu** | Repo `rophim-api` (khung, CSDL, deploy), bình luận, đánh giá, lượt xem, thống kê | Auth, phân quyền, dữ liệu cá nhân, cấu hình, quản lý thành viên, kiểm duyệt | Repo frontend: mọi trang, **header**, `js/*` |
| **User story** | US-54, 55, 56 (phần BE), US-58, US-61 | US-18, 19, 63/64, US-60, US-62 (phần BE), đồng bộ yêu thích/lịch sử | US-18, 19, 54, 55, 56, 58–64 (phần FE), US-52, US-59 |
| **Endpoint** ([hợp đồng](../specs/backend_api_contract.md)) | `/movies/:slug/comments`, `/comments/:id`, `/movies/:slug/ratings`, `/movies/:slug/views`, `/admin/stats`, `/admin/comments*` | `/auth/*`, `/me/*`, `/settings`, `/admin/settings`, `/admin/users*` | gọi tất cả qua `fetchBackend()` |

### 3.2 Lịch theo chặng

#### Chặng 1 — 22/10 → 24/10: Nền móng + Đăng nhập

| Người | Việc | Xong khi |
|---|---|---|
| BE-A | Tạo repo `rophim-api` theo cấu trúc skill 08; `app.js`, error handler, CORS, `/api/health`; migration **toàn bộ 7 bảng** (lược đồ ở hợp đồng §5); deploy **Render** + **Neon** (PostgreSQL) | `GET https://<api>/api/health` → `{status:"ok"}`; BE-B clone về chạy được |
| BE-B | (song song khi BE-A dựng khung) viết `auth.service`, middleware `requireAuth`/`requireRole`, rate limit; endpoint `/auth/register`, `/auth/login`, `/auth/me`, `/auth/logout`; script seed super admin | 4 endpoint auth chạy đúng mã lỗi `401 INVALID_CREDENTIALS`, `409 CONFLICT`, `403 ACCOUNT_BANNED` |
| FE | `login.html` (đăng nhập + đăng ký, 2 tab) + **header tài khoản** (avatar, tên, menu: Đăng xuất, link Admin nếu role admin), xử lý `auth:expired`; tạo `buildBackendPath()` trong `api.js`; đặt `BACKEND_CONFIG.BASE_URL = "/api"` + file proxy (`netlify.toml`/`vercel.json`); deploy frontend preview | Trên preview: đăng ký → đăng nhập → header đổi thành avatar → đăng xuất (US-18, US-19 đủ 3 Scenario) |

#### Chặng 2 — 25/10 → 27/10: Cộng đồng + Dữ liệu cá nhân + Cấu hình

| Người | Việc | Xong khi |
|---|---|---|
| BE-A | Comments (GET phân trang, POST, DELETE chủ/admin), ratings (GET summary + list, POST upsert, tính trung bình), `POST /views` | Bình luận + đánh giá chạy bằng curl; tài khoản bị ban gửi bị `403` |
| BE-B | `/me/favorites`, `/me/history` (upsert, giữ 50); `GET /settings` + middleware bảo trì (`503 MAINTENANCE` cho request ghi của non-admin) | Đồng bộ yêu thích/lịch sử chạy; bật `maintenance_mode` trong DB → request ghi bị chặn |
| FE | `watch.js`: thay `DEMO_COMMENTS`/`DEMO_RATINGS` bằng API thật, gửi bình luận, làm mờ spoil, chấm sao, gọi `/views`; đồng bộ yêu thích/lịch sử khi đăng nhập; trang chủ đọc `pinnedHeroSlug`; màn hình bảo trì; **US-52** lưu phút/giây (không cần BE) | US-54, 55, 56, 52 đủ Scenario trên preview |

#### Chặng 3 — 28/10 → 29/10: Quản trị

| Người | Việc | Xong khi |
|---|---|---|
| BE-A | `/admin/stats` (tổng số, top xem, top yêu thích, hoạt động gần đây), `/admin/comments` (lọc, gắn cờ spoil, xóa) | Số liệu khớp dữ liệu thật trong DB |
| BE-B | `/admin/users` (tìm, lọc, ban/unban, chặn tự khóa, không khóa super_admin, thu hồi phiên khi ban), `PATCH /admin/settings` (kiểm slug với phimapi → `404 MOVIE_NOT_FOUND`) | US-63/64 Scenario 3 (tự khóa) bị chặn đúng |
| FE | `admin.html` + `js/admin.js` + `css/admin.css`: tab Dashboard / Ghim Hero / Hệ thống (bảo trì, máy chủ dự phòng) / Thành viên / Bình luận / Bộ nhớ (**US-59**, chạy hoàn toàn bằng localStorage) | US-58 → US-64 đủ Scenario trên preview |

#### 30/10 — Release

Sáng: cả 3 chạy lại toàn bộ Scenario V2 trên preview ([06_kiem_thu_thu_cong_skill.md](../skills/06_kiem_thu_thu_cong_skill.md)), sửa lỗi chặn.
Chiều: merge `develop` → `main` ở cả 2 repo, chạy migration production, tag `v2.0.0`, kiểm tra checklist [06_trien_khai.md §5](06_trien_khai.md#5-checklist-trước-khi-release-merge-develop--main).

### 3.3 Luật phối hợp

- **Hợp đồng trước, code sau.** BE muốn đổi/thêm field → PR sửa `docs/specs/backend_api_contract.md` ở repo frontend, FE duyệt. Không ai tự đổi một mình.
- **FE không chờ BE**: code theo hợp đồng, nhánh `BACKEND_NOT_CONFIGURED` giữ trang chạy được; khi BE lên preview thì đổi sang gọi thật.
- **Header là của FE** — chỉ FE sửa `components/header.html`, `js/main.js` trong V2.
- BE-A và BE-B cùng repo: BE-A sở hữu `app.js`, `db.js`, `migrations/` (BE-B cần bảng/cột mới → nhờ BE-A hoặc báo trước rồi tự thêm **file migration mới**).
- Mỗi tối: 10 phút đồng bộ — mỗi người nói đã xong gì, mai làm gì, đang chờ ai.

### 3.4 Rủi ro & phương án

| Rủi ro | Dấu hiệu | Phương án |
|---|---|---|
| FE quá tải (khối lượng FE lớn nhất) | Hết 25/10 chưa xong header tài khoản | BE nào xong sớm nhận **US-59** (thuần localStorage) hoặc tab "Thành viên" của `admin.html` theo [skill 07](../skills/07_backend_auth_skill.md) |
| Deploy backend trục trặc | 24/10 chưa có URL `/api/health` | Tích hợp tạm ở local (`BASE_URL = "http://localhost:3000/api"`), deploy sau |
| Thiếu thời gian | 28/10 còn > 3 US | Bỏ trước US loại **Could**: US-60 (ghim Hero), US-62 (máy chủ dự phòng); giữ Must/Should |
| Lỗ hổng phân quyền | Endpoint admin gọi được bằng tài khoản thường | Checklist mục 5 trong skill 06 cho mọi endpoint `/admin/*` trước khi merge |
