# 05 — Đã sửa & nợ kỹ thuật còn lại

> "Nợ kỹ thuật" = chỗ code **vẫn chạy** nhưng viết chưa chuẩn (trùng lặp, khó đọc, dễ gây lỗi khi người khác sửa tiếp).
> Phần 1–2: những gì đã sửa (21–22/10/2026) — để biết vì sao code trông khác trước.
> Phần 3: những gì còn lại. Phát hiện nợ mới → thêm vào đây; sửa xong thì xóa mục trong cùng PR.

---

## 1. Đã sửa (21/10/2026)

### Bảo mật
| Vấn đề | Sửa |
|---|---|
| **XSS**: `search.html?q=<img onerror=...>` chạy script; ô tìm kiếm header cũng vậy | Thêm `escapeHtml()`; mọi chuỗi API/người dùng vào `innerHTML` đều escape (search, header, card, detail, watch, bình luận) |
| `movie.content` (HTML) chèn thẳng; mô tả ở watch giải mã entity rồi chèn lại `innerHTML` | `stripHtml()` (DOMParser, không chạy script) + `textContent` / escape |
| `showToast` nhận HTML | Nội dung toast dùng `textContent` |

### Chức năng
| Vấn đề | Sửa | US |
|---|---|---|
| Menu 3 gạch không mở được trên mobile, header vỡ < 1300px | CSS responsive header (≤1400 ẩn "Tải ứng dụng", ≤1200 menu trượt + ô tìm kiếm thả xuống), chạm để mở Thể loại/Quốc gia | US-10 |
| Link Thể loại/Quốc gia trỏ tới trang không tồn tại | Tạo `category.html`, `country.html`; gỡ chặn click | US-26, 27 |
| Gõ rồi xóa nhanh vẫn hiện dropdown; kết quả cũ ghi đè kết quả mới | `debounce().cancel()`, bỏ phản hồi của từ khóa cũ | US-05, 31 |
| `fetchAPI`: header tùy chỉnh bị mất, mọi GET kích hoạt CORS preflight, không timeout | Viết lại: merge header đúng, chỉ gửi `Content-Type` khi có body, timeout 15s, trả thêm `status` | US-06 |
| Các trang tự `fetch` URL hardcode | Chuyển hết sang wrapper `api.js` | US-03, 06 |
| `movies.js`/`series.js` copy nhau; phân trang lặp 4 nơi | Một `js/catalog.js` cho 4 trang + `setupPagination()`; số trang lưu trên URL | US-24, 25, 28 |
| Trạng thái rỗng/lỗi mỗi trang một kiểu, có trang chỉ in chữ | `renderEmptyState()` (icon + thông điệp + nút hành động / Thử lại), ẩn phân trang khi rỗng | US-16, 30 |
| Nút phân trang disable nhưng trông như bấm được | CSS `.page-btn:disabled` | US-28 |
| Watch: auto-next không chạy khi `?ep=` là slug tập | So khớp tập theo tên **hoặc** slug (`isSameEpisode`) | US-46 |
| Watch: regex tìm "Phần N" dùng cờ `y` nên không bao giờ khớp | Đổi sang `gi` | US-48 |
| Watch: Safari không có thanh điều khiển | Gắn custom controls cả nhánh HLS gốc | US-40, 41 |
| Watch: gõ phím cách trong ô bình luận làm dừng video | Bỏ qua phím tắt khi focus INPUT/TEXTAREA/SELECT/contentEditable | US-44 |
| Watch: rò bộ nhớ khi đổi tập (Hls cũ không destroy, listener nhân đôi) | Giữ `hlsInstance` và destroy; listener gắn 1 lần | — |
| Watch: `?server=` bị bỏ qua ở tab server; `alert()` khi lỗi fullscreen | Đồng bộ `selectedServerIdx`; dùng toast; icon fullscreen cập nhật khi nhấn ESC | US-45, 47 |
| Watch: gallery không hiển thị (thiếu `#gallery-grid`) | Thêm widget "Hình ảnh" | US-57 |
| Trang chủ: hero kẹt "Đang tải..." khi API lỗi | Fallback tiêu đề/nút | US-21 |
| `toggleFavorite` trả `undefined` khi bộ nhớ đầy | Toast lỗi + trả trạng thái thật | US-07 |
| localStorage hỏng (không phải mảng) làm vỡ trang | `getStoredList()` luôn trả mảng | US-07 |
| "Tải ứng dụng" không phản hồi | Toast "đang cập nhật" | US-20 |
| Menu "Thêm" rộng 600px cho 2 mục | CSS `.dropdown-narrow` | US-12 |
| Toast `warning` không có màu | CSS | US-15 |
| Ảnh lỗi dùng `via.placeholder.com` (hay chết) | Ảnh nội bộ `assets/images/defaults/no-poster.svg`, avatar mặc định nội bộ | US-09 |

### Cấu trúc / chuẩn
- Thứ tự `<script>` giống nhau ở mọi trang; bỏ `?v=` lẻ tẻ; ghim `hls.js@1.7.3` (trước là `@latest`).
- `components.js`: bỏ `setTimeout(100)`, gọi `initializeApp()` ngay và bắn `components:loaded`; bỏ `console.log`.
- CSS: `homepage.css` không còn đè `*`/`body`; `watch.css` không còn đè `#header`, `.movie-title`, `.loading-spinner`;
  CSS inline của `detail.html` → `css/detail.css`; `body` dùng token và font Inter ở mọi trang; sticky footer; `.page-container`
  thay `style="padding-top:90px..."` lặp lại; bỏ `.movies-grid` không dùng; `.section-header`/`.movie-section` thành component chung.
- Mọi trang: favicon, `meta description`, `theme-color`, title `Tên | RoPhim`; nút icon có `aria-label`; trang cá nhân `noindex`.
- Mọi file trang bọc IIFE. `formatDate` gộp vào `utils.js`.
- Nền tảng V2: `BACKEND_CONFIG`, `fetchBackend()`, `get/save/clearAuthSession()`, `isLoggedIn()`, sự kiện `auth:expired`.
- Thêm `404.html`.

---

## 2. Đợt 2 (22/10/2026) — trả nợ kỹ thuật

| Vấn đề | Đã làm |
|---|---|
| `watch.js` ~950 dòng, toàn bộ là hàm/biến toàn cục, HTML gọi `onclick="toggleSeasonDropdown()"`, `switchServerTab()` | Viết lại: bọc IIFE, state gom vào một object, chia mục (thông tin phim · trình phát · tập/phần/máy chủ · sidebar · thanh công cụ · bình luận), sự kiện gắn **một lần** bằng event delegation, bỏ hàm chết `selectSeason`. Không còn biến toàn cục nào lộ ra |
| Đổi tập tạo một mục lịch sử trình duyệt mới nhưng nút Back không làm gì | `history.replaceState` thay `pushState` |
| `.slider` định nghĩa 2 lần cho 2 công tắc khác nhau → công tắc "Chuyển tập" bị style của công tắc "Tiết lộ" đè | Tách `.switch .slider` và `.spoiler-toggle .slider` |
| `watch.css` có 8 cặp khối trùng (`.sidebar`, `.widget-title`, `.watch-header`, `.back-btn`, `.header-prefix`, `.header-title`, `.rating-box-premium`...) | Gộp, giữ đúng giá trị đang có hiệu lực |
| `watch.css` có `.highlight` không scope → đè màu link "Rổ Bóng" trên header | Scope vào `.login-prompt .highlight` |
| Menu chọn chất lượng (US-43) **không có CSS** → hiện như chữ trơn, luôn mở | Thêm CSS dropdown `.quality-menu`, `.quality-item` |
| `.no-data`, `.cast-item` không có CSS | Thêm |
| Gallery trong sidebar mỗi ảnh chiếm cả hàng → cột rất dài | Lưới 2 cột, tỉ lệ 16:9 |
| ~25 `style="..."` inline trong `watch.html` và trong chuỗi HTML của `watch.js`; một `!important` | Chuyển thành class (`.interaction-widget .action-item`, `.completion-status.is-ongoing/.is-completed`, `.comment-badge-*`...); ô Đánh giá/Bình luận ở sidebar thành `<button>` |
| Bộ đếm ký tự "0 / 1000" là chữ tĩnh; gửi bình luận rỗng không báo | Đếm khi gõ, `maxlength="1000"`, chặn nội dung toàn khoảng trắng (phần không cần backend của US-55) |
| `confirm()` của trình duyệt khi "Xóa tất cả" | Component dùng chung `showConfirmDialog()` (Esc / bấm nền để hủy, focus vào nút xác nhận) — V2 dùng lại cho xóa bình luận, khóa thành viên |
| 47 mã hex trùng giá trị token (`#ffd875`, `#191b24`, `#ef4444`...) | Thay bằng `var(--...)` — giao diện không đổi |
| `--font-heading: "Tektur"` khai báo nhưng không dùng, font không nạp | Xóa |
| `getRecommendedMovies(categories, limit)` bỏ qua `limit` | Cắt danh sách theo `limit`, giữ nguyên dạng response |
| `formatQuality()` sinh class không có CSS | Thêm CSS `.badge.quality-hd/.quality-cam/.badge-status` |
| Hằng không dùng: `SLIDER_ITEMS`, `AUTO_SLIDE_INTERVAL`, `DEFAULT_PARAMS`, `CONTINUE_WATCHING` (trùng mục đích với `progress` trong lịch sử) | Xóa |

---

## 3. Còn lại — không phải nợ code mà là việc tính năng / nội dung

| Mục | Vì sao chưa làm | Thuộc |
|---|---|---|
| Bình luận/đánh giá vẫn là dữ liệu demo (`DEMO_COMMENTS`, `DEMO_RATINGS`) | Cần backend | US-54, 55, 56 |
| `API_CONFIG.BACKUP_URL` chưa dùng | Là tính năng admin đổi máy chủ — cần backend | US-62 |
| Footer: link mạng xã hội, Hỏi-Đáp, Chính sách... là `href="#"` | Cần **nội dung thật** (URL fanpage, trang chính sách) từ nhóm | US-14 |
| Danh sách "Phần" suy ra bằng tìm theo tên | phimapi không có quan hệ giữa các mùa phim — giới hạn của nguồn dữ liệu | US-48 |
| Content-Security-Policy | Còn `onerror="..."` inline trên ảnh (fallback ảnh lỗi) và nhiều nguồn ngoài; bật CSP cần rà kỹ nguồn iframe player | Deploy |
