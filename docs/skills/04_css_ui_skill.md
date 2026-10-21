# Skill 04 — Giao diện & CSS

> Dùng khi: làm UI mới, sửa style, responsive.
> Mục tiêu: trang mới trông **như cùng một website** với các trang cũ — nhất quán quan trọng hơn sáng tạo.
> Không tự đổi phong cách thương hiệu (nền tối, nhấn vàng) nếu không có quyết định của nhóm.

---

## 1. Design tokens

Đã khai báo trong `css/variables.css` — **code mới dùng biến, không viết lại mã màu**:

| Token | Giá trị | Dùng cho |
|---|---|---|
| `--bg-color` | `#191b24` | Nền trang |
| `--top-bg-default` | `#202331` | Nền khối nổi phía trên |
| `--bg-2` / `--bg-3` / `--bg-4` | `#282b3a` / `#2f3346` / `#3e435c` | Nền thẻ, ô, hover — đậm dần |
| `--footer-bg` | `#0f111a` | Footer, dropdown |
| `--border-color` | `#ffffff10` | Viền mảnh |
| `--text-base` | `#aaa` | Chữ thường |
| `--text-light` | `#fff` | Tiêu đề, chữ nổi |
| `--primary-color` | `#ffd875` | **Màu nhấn duy nhất**: nút chính, hover link, badge, vạch tiêu đề |
| `--primary-color-hover` | `#ffde8a` | Hover nút chính |
| `--font-body` | Inter + font hệ thống dự phòng | Toàn bộ chữ (body đã dùng) |
| `--success-color` / `--error-color` / `--info-color` | `#22c55e` / `#ef4444` / `#3b82f6` | Trạng thái, toast, nút xóa |
| `--radius-sm` / `--radius-md` / `--radius-lg` | `4px` / `8px` / `12px` | Input & badge / nút & ô / thẻ, khung, dropdown |
| `--header-height` | `70px` | Chừa chỗ cho header cố định |
| `--container-max-width` | `1692px` | Bề rộng nội dung tối đa |

Giá trị lặp lại chưa thành token (dùng đúng các giá trị này cho đồng bộ):

| Thuộc tính | Giá trị đang dùng |
|---|---|
| Bo góc đặc biệt | `50%` (nút tròn) · `100px` / `999px` (nút viên thuốc, chip) |
| Cảnh báo | `#f59e0b` (toast warning) |
| Chuyển động | `transition: all 0.2s ease` (nhỏ) · `0.3s cubic-bezier(0.4, 0, 0.2, 1)` (thẻ, dropdown) |
| Nền trong suốt | `rgba(255, 255, 255, 0.03 → 0.1)` cho bề mặt, `backdrop-filter: blur(...)` cho lớp nổi |
| Khoảng cách | bội số 4/8px; utility `.mt-1…5` / `.mb-1…5` = 8/16/24/32/40px |

> Cần token mới (vd `--radius-md`) → thêm vào `variables.css` = sửa CORE, theo [core_files_rules.md](../constraints/core_files_rules.md). **Thêm** thì an toàn, **đổi giá trị** token cũ thì không.

---

## 2. Dùng lại component có sẵn trước

| Cần | Dùng | Ở |
|---|---|---|
| Khung trang | `<main class="page-container <trang>-page">` | style.css |
| Lưới phim | `<div class="movie-grid" id="...">` + `createMovieCard` | components.css |
| Hàng tiêu đề + nút | `<div class="page-heading">` | components.css |
| Trạng thái rỗng / lỗi | `renderEmptyState(...)` → `.empty-state` | utils.js + components.css |
| Nút xóa trên thẻ | `.btn-remove-card` | components.css |
| Tiêu đề khu vực | `<h2 class="section-title"><i class="fa-solid ..."></i> Tiêu đề</h2>` | components.css |
| Nút chính / phụ | `.btn .btn-primary` / `.btn .btn-outline` | components.css |
| Nhãn | `.badge .badge-quality` | components.css |
| Phân trang | `.pagination` + `.page-btn` + `.page-info` | style.css |
| Thông báo | `showToast(msg, type)` | main.js |
| Đang tải | `renderSkeleton(gridId, n)` | utils.js |
| Báo lỗi ngắn | `<p class="error-message">` | components.css |
| Khoảng cách | `.mt-3`, `.mb-4`... | components.css |

Không tạo `.my-card`, `.my-button` mới khi các class trên đáp ứng được.

---

## 3. CSS riêng của trang

```css
/* css/category.css — MỌI selector bắt đầu bằng class gốc của trang */
.category-page { ... }
.category-page .filter-bar { ... }
.category-page .movie-grid { gap: 20px; }   /* đè component chung CHỈ trong trang này */

/* ❌ Không viết */
.movie-grid { gap: 20px; }      /* đè cho cả web nếu sau này ai đó link file này */
body { background: #000; }      /* muốn đổi nền riêng 1 trang: body.<trang>-page (như body.home-page) */
#header { ... }                 /* header là CORE */
```

Lý do: CSS trang nạp **sau** CSS CORE nên đè được mọi thứ. Trước đây `watch.css` đè `#header` và `.movie-title` không scope →
header trang xem hết cố định, tiêu đề thẻ phim đề xuất bị đổi style (đã sửa 21/10). Scope bằng class trang tránh được toàn bộ.

---

## 4. Responsive

Dùng đúng 4 mốc của dự án (desktop-first, `max-width`):

```css
@media (max-width: 1200px) { ... }
@media (max-width: 1024px) { ... }
@media (max-width: 768px)  { ... }   /* tablet dọc / mobile ngang */
@media (max-width: 480px)  { ... }   /* mobile */
```

- `.movie-grid` tự đổi cột — đừng viết lại cột cho lưới phim.
- Header: ≤ 1400px ẩn "Tải ứng dụng"; ≤ 1200px chuyển menu 3 gạch + ô tìm kiếm thả xuống (CSS cuối `style.css`).
  Thêm mục vào header → kiểm tra cả 1250px và 375px.
- Khối 2 cột (poster + thông tin, nội dung + sidebar) → 1 cột ở `≤ 768px`.
- Chữ lớn (tiêu đề hero `3.5rem`) giảm ở `≤ 768px`.
- Nút bấm trên mobile cao ≥ 40px.
- Kiểm tra không có thanh cuộn ngang ở 375px.

---

## 5. Icon & ảnh

- Font Awesome 6: `fa-solid fa-...`, `fa-regular fa-...`, `fa-brands fa-...`. Tra icon: fontawesome.com/v6/icons (bản Free).
- Ảnh phim: luôn `getImageUrl()`. Ảnh lỗi: `onerror` gán ảnh mặc định (`assets/images/defaults/`) thay vì dịch vụ placeholder bên ngoài.
- Ảnh tĩnh mới: đặt đúng thư mục theo `assets/README.md` (chữ thường, gạch ngang, không dấu).

---

## 6. Chữ trên giao diện

- Tiếng Việt có dấu, ngắn, nói đúng việc: nút "Xem ngay", "Xóa tất cả" — không "Submit", "OK".
- Cùng một hành động dùng cùng một từ ở nút và toast: nút "Thêm vào yêu thích" → toast "Đã thêm vào danh sách yêu thích".
- Thông báo lỗi nói chuyện gì xảy ra + làm gì tiếp: "Không tìm thấy phim. Quay lại trang chủ", không chỉ "Lỗi!".
- Trạng thái trống là lời mời hành động: "Bạn chưa có phim yêu thích nào. Khám phá phim ngay →" (favorites đang làm tốt).

---

## 7. Accessibility tối thiểu

- Nút là `<button>`, link là `<a href>`. Nút chỉ có icon → `title` (hoặc `aria-label`).
- Ảnh có `alt` (tên phim).
- Không bỏ `outline` khi focus mà không có style focus thay thế.
- Độ tương phản: chữ `--text-base` (#aaa) trên nền tối là mức thấp nhất — không dùng xám tối hơn cho nội dung chính.

---

## 8. AI Verification Checklist

- [ ] Màu/nền/font dùng `var(--...)`; không có mã hex mới trùng với token.
- [ ] Dùng lại `.movie-grid`, `.section-title`, `.btn`, `.pagination`, `.error-message`... thay vì tạo class mới tương đương.
- [ ] CSS mới nằm trong `css/<trang>.css`, mọi selector có tiền tố `.<trang>-page`.
- [ ] Không `style=""`, `<style>`, `!important` mới; không đụng `#header`/`#footer`.
- [ ] Đã xem ở 375 / 768 / 1024 / ≥1440px; không cuộn ngang.
- [ ] Hover/focus có phản hồi; nhìn đồng bộ với trang chủ và trang phim lẻ.
