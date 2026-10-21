# Skill 02 — Gọi API và render dữ liệu

> Dùng khi: hiển thị danh sách phim, chi tiết, tập phim, đề xuất... dữ liệu từ phimapi.
> Dữ liệu từ backend RoPhim (bình luận, admin): cùng nguyên tắc, xem thêm [07_backend_auth_skill.md](07_backend_auth_skill.md).
> Tham chiếu: [api_spec.md](../specs/api_spec.md), [data_formats.md](../specs/data_formats.md).

---

## 1. Bốn trạng thái bắt buộc

| Trạng thái | Dùng | US |
|---|---|---|
| **Đang tải** | `renderSkeleton(gridId, n)` | US-16 |
| **Lỗi mạng / server** (`!res.success`) | `renderEmptyState(grid, { icon, message, onRetry })` → có nút **Thử lại** | US-16, US-06 |
| **Rỗng** (thành công nhưng không có dữ liệu) | `renderEmptyState(grid, { icon, message, actionText, actionHref })` + ẩn phân trang | US-30 |
| **Không tồn tại** (`res.status === 404` hoặc thành công nhưng không có `item`) | Như "Rỗng" — **không** có nút Thử lại (thử lại cũng vô ích), có lối về trang chủ | |
| **Có dữ liệu** | `grid.innerHTML = items.map(createMovieCard).join("")` | |

Không bao giờ để khu vực trắng trơn hoặc chỉ báo lỗi trong console.

---

## 2. Mẫu: một lưới phim

```js
async function loadSeriesSection() {
  const gridId = "series-section-grid";
  const grid = document.getElementById(gridId);
  if (!grid) return;

  renderSkeleton(gridId, 6);

  const res = await getSeriesMovies(1);
  const items = extractMovieItems(res);

  if (!res.success) {
    renderEmptyState(gridId, {
      icon: "fa-solid fa-triangle-exclamation",
      message: "Không tải được danh sách phim.",
      onRetry: loadSeriesSection,
    });
    return;
  }

  if (items.length === 0) {
    renderEmptyState(gridId, { message: "Đang cập nhật phim..." });
    return;
  }

  grid.innerHTML = items.slice(0, 6).map(createMovieCard).join("");
}
```

- API luôn trả 24 phim/trang, không có `limit` → `.slice(0, n)`.
- Không gắn sự kiện cho nút ♥ — handler toàn cục lo.
- Muốn thẻ đi trang khác `detail.html` (như history → watch): sau khi render, gán lại `.movie-poster`. **Không** sửa `createMovieCard`.

## 3. Nhiều khu vực độc lập (trang chủ — US-22)

Mỗi khu vực tự tải, tự xử lý lỗi → lỗi một khu vực không ảnh hưởng khu vực khác. Mẫu thật: `js/homepage.js`.
```js
HOME_SECTIONS.forEach((section) => loadHomeSection(section));  // không await nối tiếp → chạy song song
```

## 4. Phân trang

### Theo API (mẫu thật: `js/catalog.js`)
```js
const pagination = setupPagination((page) => loadPage(page));   // gắn 1 lần lúc init

async function loadPage(page) {
  renderSkeleton(GRID_ID, 12);
  const res = await getMoviesByCountry(slug, page);
  const items = extractMovieItems(res);
  if (!res.success || items.length === 0) {
    pagination.setVisible(false);
    /* renderEmptyState ... */
    return;
  }
  grid.innerHTML = items.map(createMovieCard).join("");
  pagination.setVisible(true);
  pagination.update(page, extractPagination(res).totalPages);
}
```
HTML phân trang: copy khối `<nav class="pagination" hidden>` từ `movies.html` (giữ nguyên các ID).

### Dữ liệu cục bộ (mẫu: `js/favorites.js`)
`items.slice((page - 1) * perPage, page * perPage)`, `totalPages = Math.max(1, Math.ceil(items.length / perPage))`.
Còn ≥ 1 mục → `setVisible(true)` kể cả khi chỉ 1 trang (4 nút mờ — US-28 Scenario 3).

## 5. Chi tiết phim (mẫu thật: `js/detail.js`)

```js
const res = await getMovieDetail(slug);
const movie = res.data?.data?.item;
if (!res.success || !movie) { /* renderEmptyState ... */ return; }

setText("title", movie.name);                                  // text → textContent
posterEl.src = getImageUrl(movie.poster_url || movie.thumb_url);
setText("desc", stripHtml(movie.content) || "Chưa có mô tả.");  // HTML từ API → stripHtml
chipsEl.innerHTML = [formatYear(movie.year), formatDuration(movie.time)]
  .map((c) => `<span class="chip">${escapeHtml(c)}</span>`)   // vào innerHTML → escapeHtml
  .join("");
```

## 6. Tập phim

```js
(movie.episodes || []).forEach((server, serverIdx) => {
  server.server_data.forEach((ep) => {
    // ep.name: "Tập 03" | "Full"    ep.slug: "tap-03" | "full"
    const params = new URLSearchParams({ slug: movie.slug, ep: ep.name });
    if (serverIdx > 0) params.set("server", serverIdx);
    const href = `watch.html?${params}`;
  });
});
```

## 7. Đề xuất

```js
const res = await getRecommendedMovies(movie.category, 6);
const items = extractMovieItems(res).filter((m) => m.slug !== movie.slug).slice(0, 6);
```

---

## 8. Sai lầm hay gặp

| ❌ Sai | ✅ Đúng |
|---|---|
| `fetch("https://phimapi.com/...")` trong file trang | Wrapper trong `api.js`; chưa có thì thêm ([api_spec.md §5](../specs/api_spec.md#5-thêm-endpoint-mới--mẫu)) |
| `res.data.data.items` / `res.data.items` tự viết | `extractMovieItems(res)` |
| `img.src = movie.poster_url` | `getImageUrl(movie.poster_url)` |
| `` `<h3>${movie.name}</h3>` `` | `` `<h3>${escapeHtml(movie.name)}</h3>` `` hoặc `textContent` |
| `desc.innerHTML = movie.content` | `desc.textContent = stripHtml(movie.content)` |
| Tự viết HTML thẻ phim / khối "Không có dữ liệu" | `createMovieCard`, `renderEmptyState` |
| `try { await getXxx() } catch {}` | Kiểm `res.success` (wrapper không throw) |
| Gọi `getMovieDetail` cho từng phim trong lưới | Danh sách đã đủ dữ liệu cho thẻ |
| `grid.innerHTML += card` trong vòng lặp | Một lần `innerHTML = ...join("")` |

## 9. AI Verification Checklist

- [ ] Dữ liệu qua `api.js`; danh sách đọc bằng `extractMovieItems`.
- [ ] Đủ 4 trạng thái; lỗi mạng có nút Thử lại; rỗng thì ẩn phân trang.
- [ ] Ảnh qua `getImageUrl`; thẻ qua `createMovieCard`.
- [ ] Không chuỗi ngoài nào vào `innerHTML` mà chưa `escapeHtml`.
- [ ] Test DevTools → Network → **Offline** và **Slow 3G**: thấy skeleton, rồi khối lỗi + Thử lại; console không lỗi đỏ chưa bắt.
