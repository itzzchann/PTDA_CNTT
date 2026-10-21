# Coding Style — RoPhim

> Rút ra từ code đang có trong repo (phần được viết tốt nhất), không phải lý thuyết.
> Nguyên tắc số 1: **bắt chước code xung quanh.** Nhưng đừng bắt chước những gì nằm trong [05_no_ky_thuat.md](../guides/05_no_ky_thuat.md).
> Format: **Prettier mặc định** (2 space, dấu nháy kép, có dấu `;`, trailing comma) — bật Format On Save.

---

## 1. Đặt tên

| Thứ | Quy ước | Ví dụ thật trong repo |
|---|---|---|
| File HTML / JS / CSS | chữ thường, gạch ngang nếu nhiều từ; JS/CSS trang **trùng tên** HTML (trừ JS dùng chung nhiều trang như `catalog.js`) | `detail.html` + `js/detail.js` + `css/detail.css` |
| File ảnh/icon | chữ thường, gạch ngang, không dấu | `default-avatar1.jpg`, `vn_flag.svg` (⚠️ cái này dùng `_`, đừng theo) |
| Hàm | `camelCase`, **bắt đầu bằng động từ** | `getMovieDetail`, `renderSkeleton`, `setupSearch`, `isInFavorites` |
| Biến | `camelCase` | `currentPage`, `moviesGrid` |
| Hằng cấu hình | `UPPER_SNAKE_CASE` | `API_CONFIG`, `STORAGE_KEYS`, `ITEMS_PER_PAGE` |
| Biến boolean | `is/has/can...` | `isFav`, `isPlaying` |
| CSS class | `kebab-case`, theo khối: `khoi-phantu` | `.movie-card`, `.movie-poster`, `.btn-favorite`, `.page-btn` |
| CSS trạng thái | class phụ: `.active`, `.visible`, `.show` | `.btn-favorite.active`, `.scroll-to-top.visible` |
| HTML id | `kebab-case` cho id mới | `favorites-grid`, `play-pause-btn` (code cũ có `camelCase` như `movieGrid`, `heroTitle` — giữ nguyên, đừng đổi) |

### Tiền tố động từ cho hàm

| Tiền tố | Nghĩa | Ví dụ |
|---|---|---|
| `get...` | gọi API hoặc đọc dữ liệu, có trả về | `getMovieDetail`, `getFromStorage` |
| `load...` | (trang) lấy dữ liệu **và** render | `loadMovies`, `loadFavorites` |
| `render...` | ghi HTML vào DOM | `renderEpisodes`, `renderSkeleton` |
| `create...` | sinh chuỗi HTML / object, **không** ghi DOM | `createMovieCard`, `createSlug` |
| `setup...` / `init...` | gắn sự kiện, chạy 1 lần | `setupSearch`, `initToolbar` |
| `format...` | biến đổi giá trị để hiển thị | `formatYear`, `formatNumber` |
| `show.../hide...` | hiện/ẩn UI | `showToast`, `hideSearchResults` |
| `is.../has...` | trả boolean | `isInFavorites` |

### Đặt tên trong file trang — tránh đụng toàn cục

Mọi `function` top-level trong file trang đều là toàn cục. Đặt tên **cụ thể theo trang** để không trùng CORE và không trùng nhau
khi sau này có ai gộp code:

```js
// ❌ Chung chung — dễ trùng: init, loadData, render, showError, formatDate
function init() { ... }

// ✅ Cụ thể
function initCategoryPage() { ... }
function loadCategoryMovies(page) { ... }
```

**Bắt buộc với trang mới**: gói cả file trang vào một IIFE để không lộ biến ra ngoài (mọi file trang hiện có đã làm vậy):
```js
(() => {
  let currentPage = 1;            // không còn là biến toàn cục
  document.addEventListener("DOMContentLoaded", () => { ... });
})();
```
> ⚠️ Nếu HTML có `onclick="tenHam()"` thì hàm đó phải toàn cục — trong IIFE thì dùng `addEventListener` thay vì `onclick=""`.

---

## 2. HTML

- `<!doctype html>`, `<html lang="vi">`, `charset UTF-8`, `viewport`. Indent 2 space.
- Thẻ ngữ nghĩa: `<main>`, `<section>`, `<header>`, `<footer>`, `<nav>`, `<article>`, `<aside>`, `<button>` (không dùng `<div onclick>` cho nút).
- Mọi `<img>` có `alt`. Ảnh danh sách có `loading="lazy"`.
- Nút chỉ có icon → có `title` (vd nút phân trang).
- **Không thêm** `style="..."` và `<style>` mới. Dùng class.
- Trang mới dùng [khung chuẩn](../skills/01_tao_trang_moi_skill.md#2-khung-html-chuẩn).
- Văn bản hiển thị: **tiếng Việt có dấu**. Viết hoa chữ đầu câu ("Phim yêu thích"), tiêu đề khu vực có thể viết HOA như trang chủ.

---

## 3. JavaScript

### 3.1 Cú pháp
- `const` mặc định, `let` khi phải gán lại. **Không `var`.**
- `async/await` thay vì `.then()` chuỗi dài.
- Đọc danh sách phim: `extractMovieItems(res)`; field khác: optional chaining + fallback (`movie.episodes || []`).
- Template literal cho chuỗi ghép. `===` thay vì `==`.
- Arrow function cho callback ngắn.

### 3.2 Comment
Code hiện tại **gần như không có comment** — giữ phong cách đó: tên hàm/biến phải tự giải thích.
Chỉ comment khi lý do **không hiển nhiên** (workaround, ràng buộc của API):
```js
// Phân trang do phimapi trả cố định 24 phim/trang, không có tham số limit
const items = extractMovieItems(res).slice(0, 6);
```
Hàm CORE mới có chữ ký chưa rõ → 1 khối JSDoc ngắn:
```js
/** @param {string} gridId id phần tử (không có "#") */
```
Không comment kiểu nhật ký ("sửa bởi A ngày X"), không để code bị comment-out.

### 3.3 Xử lý lỗi
```js
// ✅ Mẫu chuẩn khi gọi API từ trang
const res = await getMoviesByCategory(slug, page);
const items = extractMovieItems(res);
if (!res.success) {
  renderEmptyState(gridId, { message: "Không tải được danh sách phim.", onRetry: () => load(page) });
  return;
}
if (items.length === 0) {
  renderEmptyState(gridId, { message: "Không có phim nào." });
  return;
}
grid.innerHTML = items.map(createMovieCard).join("");
```
- Wrapper API **không throw** → dùng `res.success`, không cần `try/catch` quanh nó.
- `try/catch` khi parse JSON tự viết, hoặc khi gọi API trình duyệt có thể lỗi (clipboard, fullscreen).
- **Không `catch {}` rỗng** (watch.js có một chỗ — đừng theo). Ít nhất `console.error("Ngữ cảnh:", err)`.
- Lỗi phải **hiện cho người dùng** trong trang (thông báo / toast), không chỉ trong console.
- **Không `alert()` / `confirm()` / `prompt()`** — thông báo dùng `showToast`, xác nhận dùng `await showConfirmDialog({...})`.

### 3.4 DOM
- Lấy phần tử 1 lần, kiểm tra null: `const grid = document.getElementById("x"); if (!grid) return;`
- Render danh sách: **một lần** `innerHTML = items.map(...).join("")`, không `+=` trong vòng lặp.
- Gán chữ đơn thuần → `textContent`. Dựng HTML bằng template string → **mọi giá trị ngoài** (API, URL, người dùng, backend)
  bọc `escapeHtml(...)`; giá trị trong URL bọc `encodeURIComponent(...)`. HTML từ API (`movie.content`) → `stripHtml(...)`.
- Gắn sự kiện: `addEventListener` (cho trang mới). Không gán `document.onkeydown = ...` (ghi đè người khác).
- Nhiều phần tử giống nhau → event delegation trên container, như `setupGlobalFavoriteHandler`.

### 3.5 `console`
- Giữ `console.error` cho lỗi thật. **Không commit `console.log` debug.**
  (`components.js` và `watch.js` có sẵn vài `console.log` — không thêm nữa.)

---

## 4. CSS

Chi tiết + token: [04_css_ui_skill.md](../skills/04_css_ui_skill.md). Tóm tắt:

- Màu, nền, font → `var(--token)` từ `variables.css`. Không hex mới nếu đã có token tương đương.
- CSS trang → `css/<page>.css`, **mọi selector bắt đầu bằng class gốc của trang** (`.category-page ...`).
- Không dùng `!important` (trừ utility có sẵn).
- Không selector theo `id` cho style mới (khó đè). Dùng class.
- Responsive: thêm media query cho 1024px / 768px / 480px theo đúng breakpoint của `.movie-grid`.
- Thứ tự thuộc tính: vị trí → box model → typography → màu/nền → hiệu ứng.

---

## 5. Git

Theo [CONTRIBUTING.md](../../CONTRIBUTING.md): branch `feat/...` từ `develop`, commit **Conventional Commits tiếng Anh**,
scope là tên trang hoặc file CORE: `feat(category):`, `fix(watch):`, `refactor(utils):`, `style(card):`, `docs:`.
