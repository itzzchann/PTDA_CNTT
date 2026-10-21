# Data Formats

> Ba loại dữ liệu chảy trong dự án: **object phim** (từ API), **dữ liệu localStorage** (của người dùng), và
> **query string** (truyền giữa các trang). Đổi bất kỳ cấu trúc nào ở đây = thay đổi CORE.

---

## 1. Object phim (từ API)

### 1.1 `MovieListItem` — phần tử trong danh sách

```js
{
  _id: "4f6b7d5d...",
  name: "Tiếng Nói Sợ Hãi",            // tên tiếng Việt
  slug: "tieng-noi-so-hai",            // ⭐ khóa định danh phim trong toàn dự án
  origin_name: "Violet",
  poster_url: "uploads/movies/...jpg", // v1: tương đối · v0: URL đầy đủ → luôn dùng getImageUrl()
  thumb_url:  "uploads/movies/...jpg",
  year: 2021,
  type: "single",                      // single | series | hoathinh | tvshows  (chỉ v1)
  time: "92 phút",                     // (chỉ v1)
  episode_current: "Full",             // "Full" | "Tập 12" | "Hoàn Tất (16/16)" (chỉ v1)
  quality: "FHD",                      // (chỉ v1)
  lang: "Vietsub",                     // (chỉ v1)
  category: [{ id, name, slug }],      // (chỉ v1)
  country:  [{ id, name, slug }],      // (chỉ v1)
  tmdb: { id, type, season, vote_average, vote_count },
  imdb: { id, vote_average, vote_count },
  modified: { time: "2026-10-21T22:19:45.000Z" }
}
```

> Danh sách v0 (`getNewMovies`) **không có** `episode_current`, `quality`, `category`... → code hiển thị phải có fallback
> (như `createMovieCard`: `movie.episode_current || movie.quality || "HD"`).

### 1.2 `MovieDetail` — từ `getMovieDetail`

Gồm mọi field của `MovieListItem` cộng thêm:

```js
{
  content: "<p>Nữ giám đốc...</p>",     // ⚠️ HTML — lọc thẻ hoặc dùng textContent
  status: "completed",                 // completed | ongoing | trailer
  episode_total: 1,                    // có thể là số hoặc chuỗi
  actor: ["Olivia Munn"],              // mảng chuỗi (có thể rỗng / [""])
  director: ["Justine Bateman"],
  trailer_url: "https://www.youtube.com/watch?v=...",
  view: 18,
  episodes: [
    { server_name: "Vietsub", server_data: [
        { name: "1", slug: "tap-1", filename, link_embed, link_m3u8 } ] }
  ]
}
```

---

## 2. localStorage

Mọi key lấy từ `STORAGE_KEYS` (config.js). Đọc/ghi qua `getStoredList` / `getFromStorage` / `saveToStorage` (utils.js) — đã có try/catch.
Khi có backend (V2), thành viên đã đăng nhập đồng bộ yêu thích/lịch sử lên máy chủ ([backend_api_contract.md §3.2](backend_api_contract.md#32-dữ-liệu-cá-nhân-trên-máy-chủ--t6-api-lưu-trữ-dữ-liệu-cá-nhân)) — cùng các field dưới đây.

### 2.1 `rophim_favorites` — `STORAGE_KEYS.FAVORITES`

Mảng, **mới nhất ở đầu**, không trùng `slug`:

```js
[
  { slug: "tieng-noi-so-hai", name: "Tiếng Nói Sợ Hãi", poster: "https://phimimg.com/...", addedAt: "2026-10-21T10:00:00.000Z" }
]
```
Ghi bởi: `addToFavorites` (từ `movie.poster_url`), `removeFromFavorites`. Đọc bởi: `isInFavorites`, `favorites.js`.

### 2.2 `rophim_watch_history` — `STORAGE_KEYS.WATCH_HISTORY`

Mảng, **mới nhất ở đầu**, không trùng `slug`, **tối đa 50 phần tử**:

```js
[
  { slug, name, poster, episode: "3", progress: 0, watchedAt: "2026-10-21T10:00:00.000Z" }
]
```
- `episode`: tên tập thật từ API (`ep.name`, vd `"Tập 03"`, `"Full"`) — `history.js` dùng để mở lại `watch.html?ep=`.
- `progress`: hiện luôn `0` (chưa lưu vị trí giây).

### 2.3 `rophim_auth_session` — `STORAGE_KEYS.AUTH_SESSION` (V2)

```js
{ token: "<JWT>", user: { id, username, avatarUrl, role: "member" | "admin" | "super_admin" } }
```
Ghi bởi `saveAuthSession` sau đăng nhập; xóa bởi `clearAuthSession` (đăng xuất, hoặc `fetchBackend` nhận 401).
`user.role` ở đây **chỉ để hiển thị** (vd hiện link Admin) — quyền thật do backend kiểm tra.
⚠️ Token trong localStorage đọc được bởi mọi script chạy trên trang → càng phải escape mọi dữ liệu ngoài (chống XSS).

### 2.4 Dành sẵn (chưa dùng)

| Key | Gợi ý dùng |
|---|---|
| `rophim_user_prefs` (`USER_PREFERENCES`) | Cài đặt: âm lượng, auto-next, chất lượng mặc định... — một **object** |

### 2.5 Quy tắc

- **Field `poster` (không phải `poster_url`)** trong dữ liệu đã lưu. `createMovieCard` đọc được cả hai.
  Nếu đổi tên field → dữ liệu cũ của người dùng mất ảnh. Không đổi.
- Thêm field mới vào object đã lưu: được, nhưng code đọc phải chịu được dữ liệu cũ **thiếu** field đó.
- Thêm key mới: khai báo trong `STORAGE_KEYS`, tiền tố `rophim_`, cập nhật file này.
- Chỉ lưu **dữ liệu tối thiểu** (slug, name, poster, thời gian) — không lưu cả object phim từ API (đầy bộ nhớ 5MB).

---

## 3. Query string giữa các trang

| Trang | Tham số | Bắt buộc | Ví dụ |
|---|---|---|---|
| `detail.html` | `slug` | ✅ | `detail.html?slug=tieng-noi-so-hai` |
| `watch.html` | `slug` | ✅ | |
| | `ep` | ❌ (mặc định tập đầu) | `ep=Tập 03` hoặc `ep=tap-03` — khớp `name` **hoặc** `slug` của tập, không phân biệt hoa thường |
| | `server` | ❌ (mặc định `0`) | chỉ số trong `episodes[]` |
| `search.html` | `q` | ✅ | `search.html?q=naruto` |
| `movies.html`, `series.html` | `page` | ❌ (mặc định 1) | `movies.html?page=3` |
| `category.html` | `slug` | ✅ | `category.html?slug=hanh-dong&page=2` |
| `country.html` | `slug` | ✅ | `country.html?slug=han-quoc` |

Quy tắc:
- Đọc bằng `new URLSearchParams(window.location.search).get("x")`.
- Ghi link luôn `encodeURIComponent(value)` (như `createMovieCard` làm với slug).
- Thiếu tham số bắt buộc → hiện thông báo trong trang, **không** để trang trắng hoặc lỗi console.
- Trang có phân trang: tham số tên `page`, mặc định `1`, bỏ khỏi URL khi = 1; đổi trang bằng `history.pushState` để nút Back hoạt động
  (mẫu: `js/catalog.js`). Link chia sẻ mở ra đúng trang (US-27 Scenario 3).
