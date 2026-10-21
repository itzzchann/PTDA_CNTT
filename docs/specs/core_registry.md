# Core Registry — danh mục mọi thứ dùng chung

> **Tra file này TRƯỚC khi viết bất kỳ hàm/CSS class nào.** Đã có → dùng lại. Chưa có → xem
> [core_files_rules.md](../constraints/core_files_rules.md) để biết nên thêm vào CORE hay để trong file trang.
> Cột **"Dùng ở"** = file bị ảnh hưởng nếu sửa. Thêm/sửa CORE → **cập nhật bảng này trong cùng PR**.

Mức rủi ro khi sửa: 🔴 ≥ 4 file · 🟡 2–3 file · 🟢 chỉ file định nghĩa / mới, chưa ai dùng

---

## 1. Hằng số — `js/config.js`

| Tên | Nội dung | Dùng ở |
|---|---|---|
| `API_CONFIG.BASE_URL` | `"https://phimapi.com"` | api.js |
| `API_CONFIG.IMAGE_HOST` | `"https://phimimg.com/"` | utils `getImageUrl` |
| `API_CONFIG.TMDB_IMAGE_HOST` | `"https://image.tmdb.org/t/p"` — ảnh diễn viên, gallery, ảnh nền banner | api `getMovieBackdrop`, watch |
| `API_CONFIG.BACKUP_URL` | Máy chủ phim dự phòng (chưa dùng — US-62) | — |
| `API_CONFIG.ENDPOINTS.*` | Endpoint phimapi, placeholder `[slug]`, `[keyword]` — [api_spec.md](api_spec.md) | api.js |
| `API_CONFIG.TIMEOUT_MS` | `15000` | api `fetchAPI` |
| `BACKEND_CONFIG.BASE_URL` | `""` = chưa có backend; production `"/api"` — [06_trien_khai.md](../guides/06_trien_khai.md) | api `fetchBackend` |
| `BACKEND_CONFIG.ENDPOINTS.*` | Endpoint backend, placeholder `[slug]`, `[id]` — [backend_api_contract.md](backend_api_contract.md) | (V2) |
| `BACKEND_CONFIG.TIMEOUT_MS` | `60000` — dài vì Render free cần 30–60s để "thức dậy" | api `fetchBackend` |
| `APP_CONFIG.APP_NAME` | `"RoPhim"` | catalog, detail, search, watch (title) |
| `APP_CONFIG.ITEMS_PER_PAGE` | `24` (= số phim/trang của phimapi) | — |
| `APP_CONFIG.LOCAL_ITEMS_PER_PAGE` | `12` — phân trang dữ liệu cục bộ | favorites, history |
| `APP_CONFIG.MAX_DESCRIPTION_LENGTH` | `200` | utils `truncateText` (default) |
| `APP_CONFIG.SEARCH_DEBOUNCE_TIME` | `500` ms | main, utils `debounce` (default) |
| `APP_CONFIG.SEARCH_MIN_LENGTH` | `2` | main |
| `APP_CONFIG.MAX_HISTORY_ITEMS` | `50` | utils `saveWatchHistory` |
| `APP_CONFIG.DEFAULT_POSTER` | `"./assets/images/defaults/no-poster.svg"` | utils, main, detail, watch |
| `APP_CONFIG.DEFAULT_AVATAR` | `"./assets/images/defaults/default-avatar1.jpg"` | watch (diễn viên), V2 (avatar người dùng) |
| `CATEGORIES` / `COUNTRIES` | Mảng `{ slug, name }` dự phòng khi API danh mục lỗi; dùng lấy tên hiển thị | main, catalog |
| `STORAGE_KEYS.FAVORITES` | `"rophim_favorites"` | utils, favorites |
| `STORAGE_KEYS.WATCH_HISTORY` | `"rophim_watch_history"` | utils, history |
| `STORAGE_KEYS.AUTH_SESSION` | `"rophim_auth_session"` | utils (phiên đăng nhập) |
| `STORAGE_KEYS.USER_PREFERENCES` | Dành sẵn — cài đặt trình phát, giữ sau khi đăng xuất (US-19) | — |

---

## 2. Tiện ích — `js/utils.js`

### 2.1 Chuỗi / format

| Chữ ký | Trả về | Ghi chú | Dùng ở |
|---|---|---|---|
| `escapeHtml(text)` | `string` | ⭐ **Bắt buộc** cho mọi dữ liệu ngoài vào `innerHTML`. `null/undefined` → `""` | 🔴 utils, main, detail, watch |
| `stripHtml(html)` | `string` | Bỏ thẻ HTML, giải mã entity (DOMParser, không chạy script) | 🟡 homepage, detail |
| `truncateText(text, maxLength = 200)` | `string` | Cắt + `"..."` | 🟡 homepage, watch |
| `formatYear(year)` | `string` | Thiếu → `"Đang cập nhật"` | 🟡 detail, watch |
| `formatDuration(time)` | `string` | Thiếu → `"Đang cập nhật"` | 🟡 detail |
| `formatEpisodeName(name)` | `string` | Tên tập để hiển thị: `"1"` → `"Tập 1"`; `"Tập 01"`, `"Full"` giữ nguyên. **Đừng tự ghép chữ "Tập"** — API thường đã có sẵn | 🟡 detail, history, watch |
| `formatDate(dateString)` | `string` | `dd/mm/yyyy` (vi-VN); sai → `"Không rõ"` | 🟡 favorites, history |
| `formatCategories(list)` / `formatCountries(list)` | `string` | Nối `.name` bằng `", "`; rỗng → `"Đang cập nhật"` | 🟡 detail |
| `formatNumber(num)` | `string` | `1234567` → `"1.234.567"` | 🟢 (dùng cho dashboard admin) |
| `formatQuality(q)` / `formatStatus(s)` | HTML | Badge `.quality-hd/.quality-cam/.badge-status` — chưa trang nào dùng | 🟢 |
| `createSlug(title)` | `string` | Bỏ dấu, `đ→d`, khoảng trắng → `-` | 🟢 |

### 2.2 Thời gian

| Chữ ký | Trả về | Ghi chú | Dùng ở |
|---|---|---|---|
| `debounce(func, wait = 500)` | `function` | Hàm trả về có `.cancel()` | 🟡 main |
| `throttle(func, limit = 1000)` | `function` | | 🟡 main |

### 2.3 localStorage — schema ở [data_formats.md](data_formats.md)

| Chữ ký | Trả về | Ghi chú | Dùng ở |
|---|---|---|---|
| `saveToStorage(key, value)` | `boolean` | `false` khi đầy bộ nhớ / bị chặn | 🟡 |
| `getFromStorage(key, default = null)` | `any` | JSON hỏng → `default` | 🟡 |
| `removeFromStorage(key)` | `void` | | 🟡 favorites |
| `getStoredList(key)` | `Array` | **Luôn trả mảng** (kể cả dữ liệu hỏng) — dùng cho danh sách | 🔴 utils, favorites, history |
| `addToFavorites(movie)` / `removeFromFavorites(slug)` / `isInFavorites(slug)` | `boolean` | Không toast. Muốn toast + trạng thái → `toggleFavorite` | 🔴 |
| `saveWatchHistory(movie, episode = 1, progress = 0)` | `boolean` | Chống trùng slug, mới nhất lên đầu, giữ 50 | 🟡 watch |
| `removeFromWatchHistory(slug)` | `boolean` | | 🟡 history |
| `getAuthSession()` | `{ token, user } \| null` | `null` nếu chưa đăng nhập / thiếu token | 🟡 api |
| `saveAuthSession({ token, user })` / `clearAuthSession()` | | Gọi sau login / logout | 🟡 api (V2: login) |
| `isLoggedIn()` | `boolean` | | 🟢 (V2) |

### 2.4 Bóc dữ liệu API

| Chữ ký | Trả về | Ghi chú | Dùng ở |
|---|---|---|---|
| `extractMovieItems(res)` | `Array` | ⭐ Đọc danh sách từ kết quả wrapper — cả dạng v1 (`data.data.items`) lẫn v0 (`data.items`). Luôn trả mảng | 🔴 main, homepage, catalog, search, detail, watch |
| `extractPagination(res)` | `{ currentPage, totalPages, totalItems }` | `totalPages` ≥ 1 | 🟡 catalog |

### 2.5 DOM / UI

| Chữ ký | Trả về | Ghi chú | Dùng ở |
|---|---|---|---|
| `createMovieCard(movie)` | HTML | **Thẻ phim chuẩn.** Đọc `poster_url \|\| thumb_url \|\| poster`, `slug`, `name`, `origin_name`, `year`, `episode_current \|\| quality`. Có nút ♥ | 🔴 8 file |
| `renderSkeleton(gridId, count = 6)` | `void` | Nhận **id** | 🔴 |
| `renderEmptyState(target, options)` | `void` | ⭐ Khối rỗng/lỗi. `target`: id hoặc phần tử. `options`: `{ icon, message, actionText, actionHref }` hoặc `{ message, onRetry }` (nút "Thử lại") | 🔴 catalog, homepage, search, detail, favorites, history |
| `setupPagination(onPageChange)` | `{ update(current, total), setVisible(bool) }` | ⭐ Gắn 4 nút phân trang theo **ID chuẩn** (§5). `onPageChange(page)` chỉ được gọi với trang hợp lệ khác trang hiện tại | 🟡 catalog, favorites, history |
| `getImageUrl(path)` | `string` | URL tuyệt đối giữ nguyên; tương đối → ghép `IMAGE_HOST`; rỗng → `DEFAULT_POSTER` | 🔴 |
| `showError(element, message)` | `void` | Nhận **phần tử**, message được escape | 🟢 |
| `showLoading(element)` | `void` | Spinner tròn trong `.loading-container` | 🟢 |
| `setBackdropImage(container, url)` | `void` | Ảnh nền banner qua lớp `.backdrop-layer` (chữ không bị mờ theo); ảnh phải phóng > 2.5 lần → tự làm mờ. Container cần `position: relative; overflow: hidden` | 🟡 main |
| `smoothScrollTo(element, offset = 0)` | `void` | | 🟢 |
| `copyToClipboard(text)` | `Promise<boolean>` | | 🟡 watch |

**Hợp đồng của `createMovieCard` — không phá:**
- Một phần tử gốc `.movie-card[data-slug]` (favorites/history dùng `firstElementChild`).
- `.movie-poster` (history đổi link sang trang xem), `.movie-info` (favorites/history chèn dòng ngày), `.btn-favorite[data-slug][data-movie]`
  (main.js toggle; favorites xóa nút này).
- Đọc được field `poster` (dữ liệu localStorage cũ) — không bỏ fallback này.

---

## 3. Gọi mạng — `js/api.js`

### 3.1 Lõi

| Chữ ký | Trả về | Ghi chú |
|---|---|---|
| `fetchAPI(url, options = {})` | `Promise<{ success: true, status, data } \| { success: false, status, error, data? }>` | **Không bao giờ throw.** `options`: như `fetch` + `timeout` (ms). `status = 0` khi mất mạng/timeout. `Content-Type: application/json` chỉ gửi khi có `body`. Lỗi HTTP: `error` lấy từ `data.error.message` nếu backend trả |
| `fetchBackend(path, { method, body, headers })` | như trên | Gọi backend RoPhim: ghép `BACKEND_CONFIG.BASE_URL`, tự `JSON.stringify(body)`, gắn `Authorization: Bearer`. `401` khi đang có phiên → xóa phiên + bắn `auth:expired`. `BASE_URL` rỗng → `{ success:false, status:0, error:"BACKEND_NOT_CONFIGURED" }` |

### 3.2 phimapi — chi tiết JSON ở [api_spec.md](api_spec.md)

| Chữ ký | Dùng ở |
|---|---|
| `getNewMovies(page = 1)` (dạng v0) | 🟡 homepage, api |
| `getSingleMovies(page = 1)` / `getSeriesMovies(page = 1)` | 🟡 homepage, catalog |
| `getMoviesByCategory(slug, page = 1)` / `getMoviesByCountry(slug, page = 1)` | 🟡 catalog, api |
| `getMoviesByListSlug(listSlug, page = 1)` | 🟢 |
| `searchMovies(keyword, page = 1)` | 🔴 main, search, watch |
| `getMovieDetail(slug)` → `res.data.data.item` | 🔴 homepage, detail, watch, api |
| `getCategoriesList()` / `getCountriesList()` | 🟡 main |
| `getMovieImages(slug)` / `getMoviePeoples(slug)` / `getMovieKeywords(slug)` | 🟡 watch, api |
| `getMovieBackdrop(slug, targetWidth = 1280)` → `{ url, width } \| null` — ảnh nền ngang TMDB nét nhất, chọn cỡ `w1280`/`original` theo `targetWidth` (px thật). `null` nếu phim không có | 🟡 main `showMovieBackdrop` |
| `getMovieStreamLink(slug, episode = 1)` → `data: { link, slug, name }` | 🟢 |
| `getRecommendedMovies(categories, limit = 12)` — phim cùng thể loại đầu tiên, rỗng/lỗi → phim mới; danh sách đã cắt theo `limit`; có thể là dạng v0 → đọc bằng `extractMovieItems` | 🟡 detail, watch |

---

## 4. App shell — `js/main.js`

| Chữ ký | Ghi chú | Dùng ở |
|---|---|---|
| `initializeApp()` | Gọi bởi `components.js`. **Không gọi lại từ trang** | components |
| `showToast(message, type = "info")` | `type`: `success \| error \| warning \| info`. Nội dung là **text** (an toàn). Tự mất sau 3s | 🔴 main, favorites, watch |
| `showConfirmDialog({ title, message, confirmText, cancelText, danger })` → `Promise<boolean>` | ⭐ Hộp thoại xác nhận (thay `confirm()`); Esc / bấm nền = hủy. `danger: true` → nút đỏ | 🟢 favorites (V2: xóa bình luận, khóa thành viên) |
| `showMovieBackdrop(container, movie)` | ⭐ **Banner ngang của phim** — ưu tiên ảnh TMDB → `thumb_url` → `poster_url`. Đừng đặt `poster_url` (ảnh dọc) làm nền banner: bị cắt và phóng to nên vỡ | 🟡 homepage, detail |
| `toggleFavorite(movie)` → `boolean` | Trạng thái **sau** khi bấm; tự toast (cả khi lỗi bộ nhớ). `movie` cần `{ slug, name, poster_url }` | 🟡 main, watch |
| `handleSearch`, `showSearchResults`, `hideSearchResults`, `goToSearchPage(keyword)`, `renderMenuDropdowns`, `renderDropdown`, `setupMobileMenu`, `setupSearch`, `setupScrollEffects`, `setupGlobalFavoriteHandler`, `setupComingSoonFeatures`, `getToastIcon` | Nội bộ header — không gọi từ trang | main |

Hành vi toàn cục (đừng gắn lại ở trang): click `.btn-favorite[data-movie]` → toggle ♥ · click `.button-login` → toast đăng nhập
(V2: thay bằng menu tài khoản) · click `.app-download-button`, `#nav-basketball` → toast "đang cập nhật" · Esc đóng menu mobile / dropdown tìm kiếm.

## 5. Sự kiện tùy chỉnh (bắn trên `document`)

| Sự kiện | Khi nào | Ai bắn |
|---|---|---|
| `components:loaded` | Header/footer đã vào DOM và `initializeApp()` đã chạy | components.js |
| `auth:expired` | Backend trả 401 khi đang có phiên (phiên đã bị xóa) | api.js `fetchBackend` |

## 6. ID dành riêng (không đổi tên)

| ID | Ở | JS dùng |
|---|---|---|
| `header-placeholder`, `footer-placeholder` | mọi trang (trừ 404) | components.js — **bắt buộc** |
| `header`, `logo`, `search`, `main-search`, `main_menu`, `nav-categories`, `nav-countries`, `nav-more`, `nav-basketball`, `main_user` | header.html | main.js |
| `scroll-to-top` | footer.html | main.js |
| `search-results-dropdown` | tạo động | main.js |
| `firstPage`, `prevPage`, `nextPage`, `lastPage`, `currentPage`, `totalPage` (trong `.pagination`) | trang có phân trang | `setupPagination` |
| `catalog-grid`, `catalog-title`, `catalog-icon`, `<main data-catalog>` | movies, series, category, country | catalog.js |

Class dùng làm "móc" cho JS (không đổi): `.menu-toggle`, `.search-toggle`, `.menu-item-sub`, `.dropdown`, `.button-login`, `.app-download-button`,
`.btn-favorite`, `.movie-card`, `.movie-poster`, `.movie-info`, `.pagination`.

---

## 7. CSS dùng chung

### Token — `css/variables.css`
| Nhóm | Token |
|---|---|
| Nền | `--bg-color` `#191b24`, `--top-bg-default` `#202331`, `--bg-2` `#282b3a`, `--bg-3` `#2f3346`, `--bg-4` `#3e435c`, `--footer-bg` `#0f111a` |
| Chữ | `--text-base` `#aaa`, `--text-light` `#fff` |
| Nhấn | `--primary-color` `#ffd875`, `--primary-color-hover` `#ffde8a`, `--primary-text` |
| Trạng thái | `--success-color` `#22c55e`, `--error-color` `#ef4444`, `--info-color` `#3b82f6` |
| Hình khối | `--radius-sm` 4px, `--radius-md` 8px, `--radius-lg` 12px, `--border-color` |
| Bố cục | `--header-height` 70px, `--container-max-width` 1692px |
| Font | `--font-body` (Inter + fallback hệ thống) |

### `css/style.css`
| Class | Dùng cho |
|---|---|
| `.page-container` | ⭐ Khung `<main>` trang thường: rộng tối đa 1692px, chừa chỗ header cố định |
| `.pagination`, `.page-btn` (`:disabled`), `.page-info` | Phân trang |
| `.dropdown-content` (`.dropdown-narrow`), `.dropdown-grid` (`.dropdown-grid-single`), `.dropdown-item` | Dropdown header |
| `.for-mobile` | Chỉ hiện ≤ 1200px |
| `.ms-1`, `.ms-2`, `.flex-grow-1`, `[hidden]` | Tiện ích |

### `css/components.css`
| Class | Dùng cho |
|---|---|
| `.movie-grid` | Lưới phim 6 → 5 → 4 → 3 → 2 cột |
| `.movie-card` và con | Do `createMovieCard` sinh |
| `.badge`, `.badge-quality/-dubbed/-subbed` | Nhãn |
| `.btn`, `.btn-primary`, `.btn-outline`, `.btn-danger` | ⭐ Nút chuẩn |
| `.dialog-overlay`, `.dialog`, `.dialog-title`, `.dialog-message`, `.dialog-actions` | Do `showConfirmDialog` sinh |
| `.section-title`, `.section-header`, `.movie-section`, `.btn-more-link` | Tiêu đề khu vực |
| `.page-heading` | Hàng tiêu đề + nút hành động (vd favorites) |
| `.empty-state` (+ `-icon`, `-message`, `-action`) | Do `renderEmptyState` sinh |
| `.btn-remove-card`, `.movie-added-at` | Nút xóa trên thẻ, dòng phụ dưới thẻ |
| `.backdrop-layer` (`.is-loaded`, `.is-low-res`) | Do `setBackdropImage` sinh |
| `.skeleton-*`, `.toast*`, `.loading-container`, `.loading-spinner`, `.error-message` | Trạng thái |
| `.text-center`, `.mt-0…5`, `.mb-0…5` | Tiện ích (bước 8px) |
