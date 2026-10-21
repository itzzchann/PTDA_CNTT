# 02 — Kiến trúc

> Đọc kỹ. Hầu hết lỗi "tôi sửa trang A mà trang B hỏng" đến từ mục 2 và 3.

---

## 1. Tổng quan

### 1.1 Hiện tại (V1)

```
Trình duyệt
  xxx.html ─nạp─► CORE JS ─► PAGE JS ──getXxx()──► api.js ─fetchAPI─► https://phimapi.com
     │                 │                                                (dữ liệu phim, chỉ đọc)
     │ #header-placeholder ◄─fetch─ components/header.html
     │ #footer-placeholder ◄─fetch─ components/footer.html
     └──────────────► localStorage (♥ yêu thích, lịch sử xem)
```

### 1.2 Kiến trúc đích (V2 + deploy)

```
                           ┌────────────────────────────┐
  Người dùng ──HTTPS──►    │ Host tĩnh (Vercel/Netlify) │  ← repo này: HTML/CSS/JS, không build
                           └─────────────┬──────────────┘
                                         │ trình duyệt chạy JS
              ┌──────────────────────────┼───────────────────────────┐
              ▼                          ▼                           ▼
     https://phimapi.com        Backend RoPhim (REST /api)     localStorage
     getXxx() — dữ liệu phim    fetchBackend() — Bearer token  ♥, lịch sử, phiên đăng nhập
                                 │
                                 ▼
                           CSDL (users, comments, ratings,
                                 settings, view_events)
```

- **Frontend không bao giờ nói chuyện trực tiếp với CSDL**, không giữ bí mật nào.
- Phim vẫn lấy từ phimapi; backend chỉ lưu **dữ liệu của RoPhim** (người dùng, bình luận, điểm, cấu hình admin, thống kê).
  Phim được tham chiếu bằng **`slug`** — khóa chung giữa hai hệ thống.
- Hợp đồng giữa 2 phía: [backend_api_contract.md](../specs/backend_api_contract.md). Frontend và backend phát triển
  song song được nhờ hợp đồng này.

### 1.3 Multi-page app

Mỗi trang là một file `.html` riêng; điều hướng = đổi trang thật. Không router, không state toàn cục giữa trang.
Truyền dữ liệu giữa trang bằng **query string** hoặc **localStorage** ([data_formats.md](../specs/data_formats.md)).

---

## 2. Mô hình "module" kiểu Java — bằng biến toàn cục

Không dùng ES module. Mỗi file JS nạp bằng `<script src>` thường, nên:
- `function xxx()` top-level → **hàm toàn cục**, file nạp sau gọi được.
- `const`/`let` top-level → chung **một phạm vi toàn cục** cho cả trang.

| Java | RoPhim |
|---|---|
| `public static` method trong class tiện ích | `function` top-level trong `js/utils.js` |
| `import util.Utils;` | `<script src="./js/utils.js">` đặt **trước** file dùng nó |
| Chữ ký method là hợp đồng | Tên hàm + thứ tự tham số + kiểu trả về là hợp đồng |
| Đổi chữ ký → **compile error** | Đổi chữ ký → **không báo gì**, trang khác hỏng âm thầm ⚠️ |
| Overload | Không có → dùng **tham số mặc định** |
| `private` | Bọc file trang trong **IIFE** `(() => { ... })();` |
| Override bị kiểm soát | Khai báo trùng tên ở file sau → **ghi đè im lặng** ⚠️ |

**Hệ quả:**
1. Trùng tên hàm = ghi đè im lặng → tra [core_registry.md](../specs/core_registry.md) trước khi đặt tên.
2. Trùng `const`/`let` top-level giữa 2 file = **SyntaxError, cả file chết** → mỗi HTML một file JS trang, bọc IIFE.
3. Không compiler → sửa CORE xong phải `grep` mọi chỗ gọi và test tay.

> Mọi file trang đều đã bọc IIFE và gắn sự kiện bằng `addEventListener` — trong HTML không có `onclick="..."`.

---

## 3. Thứ tự nạp script & vòng đời trang

### 3.1 Thứ tự chuẩn — mọi trang đều dùng

```html
<script src="./js/components.js"></script>   <!-- 1. đăng ký nạp header/footer -->
<script src="./js/config.js"></script>       <!-- 2. API_CONFIG, BACKEND_CONFIG, APP_CONFIG, CATEGORIES, COUNTRIES, STORAGE_KEYS -->
<script src="./js/utils.js"></script>        <!-- 3. cần config -->
<script src="./js/api.js"></script>          <!-- 4. cần config + utils (getAuthSession) -->
<script src="./js/main.js"></script>         <!-- 5. cần tất cả ở trên; định nghĩa initializeApp -->
<script src="./js/<page>.js" defer></script> <!-- 6. file trang, LUÔN cuối -->
```

Phụ thuộc một chiều: **config → utils → api → main → page**. File trước không bao giờ gọi file sau
(ngoại lệ an toàn: hàm trong `utils.js` chỉ *đọc* `APP_CONFIG`/`STORAGE_KEYS` lúc **được gọi**, không lúc nạp).
Thư viện ngoài cần cho trang (vd hls.js) đặt **trước** `components.js`.

### 3.2 Vòng đời

```
t0  Parse <head>: các script chạy theo thứ tự → định nghĩa hàm toàn cục.
    components.js đăng ký DOMContentLoaded → loadAllComponents.
    File trang (defer) chạy sau khi parse xong, đăng ký DOMContentLoaded của nó.

t1  DOMContentLoaded — listener chạy theo thứ tự đăng ký:
      (a) loadAllComponents(): bắt đầu fetch header/footer   (CHƯA xong)
      (b) init của trang (initCatalogPage, initDetailPage...)   ← header CHƯA có trong DOM

t2  fetch xong → thay #header-placeholder / #footer-placeholder
    → initializeApp()  (gắn search, menu, dropdown, scroll, ♥, coming-soon)
    → document.dispatchEvent("components:loaded")
```

**Quy tắc rút ra:**
- Init trang **chỉ** đụng phần tử trong `<main>` của chính trang.
- Cần phần tử header/footer (vd điền lại ô tìm kiếm, đổi nút "Thành viên" thành avatar) → nghe sự kiện:
  ```js
  document.addEventListener("components:loaded", () => { /* header đã có */ });
  ```
  **Không dùng `setTimeout` đoán giờ.**
- Nút ♥ không cần gắn sự kiện — `main.js` dùng event delegation trên `document`.

### 3.3 Header/footer nạp bằng `fetch`
- Mở bằng `file://` → **không có header/footer**. Luôn chạy qua HTTP.
- Đường dẫn trong `components/*.html` **tương đối theo trang** (`./assets/...`) → mọi trang HTML phải ở **thư mục gốc**.
  (Riêng `404.html` dùng đường dẫn tuyệt đối và không nạp header — vì host trả nó cho mọi URL sai.)

---

## 4. Các lớp và trách nhiệm

| Lớp | File | Được làm | KHÔNG được làm |
|---|---|---|---|
| Config | `config.js` | Hằng: URL, endpoint, giới hạn, danh sách tĩnh, key storage | Logic, DOM, bí mật |
| Utils | `utils.js` | Hàm thuần (escape, format), storage + phiên, sinh HTML (card, skeleton, empty state), phân trang | Gọi mạng, gắn sự kiện header |
| API | `api.js` | Ghép URL, `fetchAPI` (timeout, status), `fetchBackend` (token, 401), wrapper `getXxx()` | DOM, toast, bóc dữ liệu cho UI |
| App shell | `main.js` | Header/menu/search/scroll, `showToast`, `toggleFavorite`, ♥ toàn cục | Logic riêng một trang |
| Loader | `components.js` | Nạp header/footer, gọi `initializeApp`, bắn `components:loaded` | Thứ khác |
| Page | `js/<page>.js` | Đọc URL, gọi API, render vào `<main>`, sự kiện trong trang | Định nghĩa lại hàm CORE, sửa header/footer trực tiếp lúc init |

### Luồng dữ liệu chuẩn của trang danh sách (xem `js/catalog.js`)

```
URLSearchParams(slug, page) ─► getMoviesByCategory(slug, page)          [api.js]
                                   │ { success, status, data }
                                   ▼
                  !success ─► renderEmptyState(grid, { onRetry })       [utils.js]
                  items = extractMovieItems(res)  (đọc được cả v0/v1)
                  items rỗng ─► renderEmptyState(...) + ẩn phân trang
                  có items ─► items.map(createMovieCard).join("")
                              pagination.update(page, extractPagination(res).totalPages)
```

---

## 5. CSS — các tầng

```
variables.css   ← design tokens (:root)                                  CORE
style.css       ← reset, body (sticky footer), .page-container, header   CORE
                   + responsive header, footer, dropdown, pagination
components.css  ← movie-card, grid, badge, skeleton, toast, btn,         CORE
                   section-title/header, empty-state, btn-remove-card, page-heading
<page>.css      ← chỉ cho 1 trang, selector bắt đầu bằng .<page>-page    PAGE
```

Thứ tự `<link>`: `variables → style → components → <page>.css`. CSS trang nạp sau nên **đè được** CORE —
vì vậy **bắt buộc scope theo class trang**. Chi tiết: [04_css_ui_skill.md](../skills/04_css_ui_skill.md).
