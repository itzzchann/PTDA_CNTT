# Skill 03 — Dữ liệu người dùng (localStorage)

> Dùng khi: yêu thích, lịch sử xem, xem tiếp, cài đặt người dùng.
> Schema: [data_formats.md §2](../specs/data_formats.md#2-localstorage).

---

## 1. Luật

1. Key **chỉ** lấy từ `STORAGE_KEYS` — không viết chuỗi `"rophim_..."` trong file trang.
2. Đọc/ghi **chỉ** qua `getStoredList(key)` (danh sách — luôn trả mảng) / `getFromStorage(key, default)` / `saveToStorage(key, value)` — đã có try/catch và JSON.
3. Yêu thích có hàm riêng — dùng chúng, đừng thao tác mảng tay:

| Muốn | Dùng | Ghi chú |
|---|---|---|
| Bấm ♥ có toast + trả trạng thái | `toggleFavorite(movie)` (main.js) | `movie` cần `{ slug, name, poster_url }` |
| Kiểm tra | `isInFavorites(slug)` | |
| Thêm/bỏ không toast | `addToFavorites(movie)` / `removeFromFavorites(slug)` | |
| Lấy danh sách | `getStoredList(STORAGE_KEYS.FAVORITES)` | |
| Ghi lịch sử | `saveWatchHistory(movie, episodeName, progressSeconds)` | Tự chống trùng, giữ 50 |
| Xóa 1 mục lịch sử | `removeFromWatchHistory(slug)` | |
| Lấy lịch sử | `getStoredList(STORAGE_KEYS.WATCH_HISTORY)` | |
| Phiên đăng nhập | `getAuthSession()`, `saveAuthSession()`, `clearAuthSession()`, `isLoggedIn()` | [07_backend_auth_skill.md](07_backend_auth_skill.md) |

4. **Không đổi cấu trúc** object đã lưu (vd `poster` → `posterUrl`): người dùng có dữ liệu cũ sẽ hỏng.
   Chỉ được **thêm field**, và code đọc phải chịu được bản ghi cũ thiếu field đó.

---

## 2. Nút ♥ — 3 trường hợp

**a) Trong thẻ phim** (`createMovieCard`) → không cần làm gì. Handler toàn cục xử lý.

**b) Nút ♥ riêng ngoài thẻ** (vd trang chi tiết) → class `.btn-favorite` + `data-slug` + `data-movie`, handler toàn cục cũng nhận
và tự đồng bộ với các thẻ cùng phim trên trang:
```js
btn.className = `btn-favorite ${isInFavorites(movie.slug) ? "active" : ""}`;
btn.dataset.slug = movie.slug;
btn.dataset.movie = JSON.stringify({ slug: movie.slug, name: movie.name, poster_url: movie.poster_url });
```
⚠️ `.btn-favorite` có CSS `position: absolute` (thiết kế cho thẻ). Đặt ngoài thẻ → scope lại vị trí trong CSS trang.

**c) Nút tùy biến** (như `#favorite-btn` ở watch) → tự gắn sự kiện:
```js
favBtn.addEventListener("click", () => {
  const isFav = toggleFavorite(currentMovie);
  favBtn.querySelector("i").className = isFav ? "fa-solid fa-heart" : "fa-regular fa-heart";
});
```

---

## 3. Mẫu: thêm dữ liệu mới — cài đặt người dùng

`STORAGE_KEYS.USER_PREFERENCES` đã có sẵn, chưa ai dùng. US-19 Scenario 2 yêu cầu cài đặt trình phát (âm lượng, tắt đèn)
**vẫn giữ sau khi đăng xuất** → lưu ở key này, `clearAuthSession()` không đụng tới. Lưu **một object**, merge với mặc định để chịu được dữ liệu cũ:

```js
const DEFAULT_PREFS = { autoNext: true, volume: 1 };

function getUserPrefs() {
  return { ...DEFAULT_PREFS, ...getFromStorage(STORAGE_KEYS.USER_PREFERENCES, {}) };
}

function setUserPref(name, value) {
  saveToStorage(STORAGE_KEYS.USER_PREFERENCES, { ...getUserPrefs(), [name]: value });
}
```
Nếu chỉ một trang dùng (vd watch) → để trong file trang. Trang thứ hai cần → chuyển vào `utils.js` theo [core_files_rules.md §4](../constraints/core_files_rules.md#4-khi-nào-code-nên-vào-core-khi-nào-để-ở-trang).

## 4. Mẫu: xem tiếp (lưu vị trí giây — US-52)

`saveWatchHistory` đã có tham số `progress` (đang luôn truyền `0`). Dùng lại — **không** tạo key mới cho cùng mục đích:
```js
video.addEventListener("timeupdate", throttle(() => {
  saveWatchHistory(state.movie, state.episode, Math.floor(video.currentTime));
}, 5000));
```
Đọc lại khi mở trang xem:
```js
const entry = getStoredList(STORAGE_KEYS.WATCH_HISTORY).find((h) => h.slug === slug);
if (entry && String(entry.episode) === String(state.episode) && entry.progress > 0) {
  video.currentTime = entry.progress;
}
```
⚠️ `loadMovie()` trong `watch.js` gọi `saveWatchHistory(movie, state.episode, 0)` ngay khi mở trang → phải **đọc vị trí cũ trước** dòng đó, nếu không sẽ luôn đọc ra `0`.
Gắn listener `timeupdate` bằng `addEventListener` trong `initCustomControls` sẽ bị gắn lại mỗi lần đổi tập → dùng `video.ontimeupdate` (đã có, thêm vào đó) hoặc gắn một lần lúc khởi tạo.

## 5. Thêm key mới (nếu thật sự cần)

1. Thêm vào `STORAGE_KEYS` trong `config.js` (CORE — báo nhóm), tiền tố `rophim_`.
2. Ghi schema vào [data_formats.md](../specs/data_formats.md).
3. Giới hạn kích thước (cắt mảng như lịch sử giữ 50). Chỉ lưu field tối thiểu.

## 6. AI Verification Checklist

- [ ] Không có chuỗi `"rophim_` trong file trang; không gọi `localStorage.` trực tiếp trong code mới.
- [ ] Dùng `toggleFavorite` / `isInFavorites` / `saveWatchHistory` thay vì viết lại.
- [ ] Không đổi tên field của dữ liệu đã lưu; code đọc chịu được bản ghi cũ.
- [ ] Đã test: thêm → tải lại trang → còn; xóa → tải lại → mất; mở `favorites.html`/`history.html` hiển thị đúng ảnh.
- [ ] Đã test với localStorage có dữ liệu cũ **và** localStorage trống.
