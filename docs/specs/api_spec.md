# API Spec — phimapi.com

> Nguồn dữ liệu duy nhất của dự án. API công khai, **không cần key**, chỉ có `GET`, trả JSON, cho phép CORS.
> Cấu trúc dưới đây lấy từ response thật (10/2026). API của bên thứ ba có thể đổi bất cứ lúc nào →
> luôn đọc dữ liệu bằng optional chaining (`?.`) và có giá trị mặc định.
>
> **Không gọi các URL này trực tiếp từ file trang** — dùng hàm wrapper trong `js/api.js` (cột "Hàm").
> API riêng của RoPhim (tài khoản, bình luận, admin) là chuyện khác: [backend_api_contract.md](backend_api_contract.md).

```
Base URL:   https://phimapi.com          (API_CONFIG.BASE_URL)
Image CDN:  https://phimimg.com/         (API_CONFIG.IMAGE_HOST)
TMDB ảnh:   https://image.tmdb.org/t/p/{w185|w342|w780}{path}   (ảnh diễn viên, gallery)
```

---

## 1. Hai "kiểu" response — điểm dễ sai nhất

phimapi có 2 thế hệ endpoint, **bọc dữ liệu khác nhau**:

| | Kiểu cũ (v0) | Kiểu mới (v1 — `/v1/api/...`) |
|---|---|---|
| Endpoint | chỉ `/danh-sach/phim-moi-cap-nhat` | mọi endpoint còn lại |
| Danh sách phim | `json.items` | `json.data.items` |
| Phân trang | `json.pagination` | `json.data.params.pagination` |
| `status` | `true` (boolean) | `true` (danh sách) hoặc `"success"` (chi tiết, thể loại) |
| `poster_url`, `thumb_url` | **URL đầy đủ** `https://phimimg.com/...` | **đường dẫn tương đối** `uploads/movies/...` (danh sách); URL đầy đủ (chi tiết) |

Wrapper bọc thêm một lớp `{ success, status, data | error }` (xem `fetchAPI` trong [core_registry.md](core_registry.md#31-lõi)).
**Đừng tự đọc `res.data.data.items`** — dùng helper đã xử lý cả hai kiểu:

```js
const res = await getSingleMovies(page);
if (!res.success) { /* res.error, res.status (0 = mất mạng / quá 15s) */ }
const items = extractMovieItems(res);                 // luôn là mảng, đọc được cả v0 và v1
const { totalPages } = extractPagination(res);        // ≥ 1
```

Ảnh: **luôn đi qua `getImageUrl(path)`** — nó xử lý cả URL đầy đủ lẫn đường dẫn tương đối.

---

## 2. Endpoint danh sách

| Hàm | Endpoint | Kiểu |
|---|---|---|
| `getNewMovies(page)` | `GET /danh-sach/phim-moi-cap-nhat?page={page}` | v0 |
| `getSingleMovies(page)` | `GET /v1/api/danh-sach/phim-le?page={page}` | v1 |
| `getSeriesMovies(page)` | `GET /v1/api/danh-sach/phim-bo?page={page}` | v1 |
| `getMoviesByListSlug(slug, page)` | `GET /v1/api/danh-sach/{slug}?page={page}` — slug: `phim-le`, `phim-bo`, `hoat-hinh`, `tv-shows`... | v1 |
| `getMoviesByCategory(slug, page)` | `GET /v1/api/the-loai/{slug}?page={page}` — slug từ `CATEGORIES` | v1 |
| `getMoviesByCountry(slug, page)` | `GET /v1/api/quoc-gia/{slug}?page={page}` — slug từ `COUNTRIES` | v1 |
| `searchMovies(keyword, page)` | `GET /v1/api/tim-kiem?keyword={kw}&page={page}` | v1 |

Mỗi trang API trả **24 phim**.

### Response v1 (rút gọn)

```json
{
  "status": true,
  "msg": "done",
  "data": {
    "titlePage": "Phim Lẻ",
    "items": [ /* MovieListItem — xem data_formats.md §1.1 */ ],
    "params": {
      "pagination": { "totalItems": 17193, "totalItemsPerPage": 24, "currentPage": 1, "totalPages": 717 }
    },
    "APP_DOMAIN_CDN_IMAGE": "https://phimimg.com"
  }
}
```

### Response v0 (rút gọn)

```json
{
  "status": true,
  "msg": "done",
  "items": [ /* MovieListItem (ít field hơn, ảnh là URL đầy đủ) */ ],
  "pagination": { "totalItems": 30394, "totalItemsPerPage": 24, "currentPage": 1, "totalPages": 1267 }
}
```

---

## 3. Chi tiết phim

| Hàm | Endpoint |
|---|---|
| `getMovieDetail(slug)` | `GET /v1/api/phim/{slug}` |

```json
{
  "status": "success",
  "data": {
    "item": {
      /* MovieDetail — xem data_formats.md §1.2 */
      "episodes": [
        {
          "server_name": "Vietsub",
          "server_data": [
            { "name": "1", "slug": "tap-1", "filename": "...", "link_embed": "https://...", "link_m3u8": "https://....m3u8" }
          ]
        }
      ]
    }
  }
}
```

Đọc trong code: `const movie = res.data?.data?.item;` và `const episodes = movie?.episodes || [];`
(`watch.js` còn thử `res.data?.movie`, `res.data?.item` — dạng của endpoint cũ `/phim/{slug}`, không cần cho code mới.)

- Phim lẻ: thường 1 server, 1 tập tên `"Full"`.
- `link_m3u8` → phát bằng hls.js; `link_embed` → iframe dự phòng.
- Tập được xác định bằng `ep.name` **hoặc** `ep.slug` (code so sánh không phân biệt hoa thường với cả hai).

### Endpoint phụ của phim

| Hàm | Endpoint | Danh sách ở |
|---|---|---|
| `getMovieImages(slug)` | `GET /v1/api/phim/{slug}/images` | `data.images[]` — `{ type: "backdrop" \| "poster", file_path }` → ảnh TMDB |
| `getMoviePeoples(slug)` | `GET /v1/api/phim/{slug}/peoples` | `data.peoples[]` — `{ name, original_name, also_known_as[], character, profile_path }` |
| `getMovieKeywords(slug)` | `GET /v1/api/phim/{slug}/keywords` | (chưa dùng) |

(Tất cả lồng trong wrapper → `res.data.data.images`, `res.data.data.peoples`.)

---

## 4. Danh mục

| Hàm | Endpoint | Response |
|---|---|---|
| `getCategoriesList()` | `GET /v1/api/the-loai` | `{ status: "success", data: { items: [{ _id, name, slug }] } }` |
| `getCountriesList()` | `GET /v1/api/quoc-gia` | như trên |

Lỗi → dùng `CATEGORIES` / `COUNTRIES` trong `config.js` (đã làm trong `renderDropdown`).

---

## 5. Thêm endpoint mới — mẫu

1. Thêm vào `API_CONFIG.ENDPOINTS` (config.js), placeholder dạng `[slug]`:
   ```js
   MOVIE_BY_YEAR: "/v1/api/nam/[year]",
   ```
2. Thêm wrapper vào **cuối** `api.js` (trước khối `module.exports`), theo đúng mẫu có sẵn:
   ```js
   async function getMoviesByYear(year, page = 1) {
     const endpoint = API_CONFIG.ENDPOINTS.MOVIE_BY_YEAR.replace(
       "[year]",
       encodeURIComponent(year),
     );
     const url = `${API_CONFIG.BASE_URL}${endpoint}?page=${page}`;
     return await fetchAPI(url);
   }
   ```
3. Thêm tên hàm vào khối `module.exports` cuối file.
4. Cập nhật bảng trong file này và [core_registry.md](core_registry.md#3-gọi-mạng--jsapijs).

Quy tắc: wrapper **chỉ** ghép URL + gọi `fetchAPI`. Không bóc dữ liệu, không đụng DOM, không toast — để file trang quyết định.
Luôn `encodeURIComponent` cho tham số người dùng/slug.
