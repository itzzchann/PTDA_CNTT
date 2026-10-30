# 03 — Chạy dự án ở máy local

> Frontend không cần Node/npm, chỉ cần một HTTP server tĩnh. Deploy lên Internet: [06_trien_khai.md](06_trien_khai.md).

## 1. Cách khuyên dùng — VS Code Live Server

1. Mở thư mục dự án bằng VS Code, cài extension đề xuất (popup "Install All") — danh sách ở `.vscode/extensions.json`.
2. Chuột phải `index.html` → **Open with Live Server**.
3. Mở `http://127.0.0.1:5500/index.html`. Lưu file → trang tự reload.

## 2. Không có VS Code

```bash
cd BTL-WEB-PRIVATE-2025
python3 -m http.server 5500          # Windows: py -m http.server 5500
# hoặc: npx serve -l 5500 .
# mở http://localhost:5500/index.html
```

## 3. Chạy kèm backend (khi đã có — V2)

```
Terminal 1: cd server && npm run dev   (theo server/README.md, vd http://localhost:3000)
Terminal 2: Live Server cho frontend (http://127.0.0.1:5500)
```
Rồi đặt tạm trong `js/config.js` (KHÔNG commit giá trị local):
```js
BASE_URL: "http://localhost:3000/api",
```
Backend phải cho phép CORS từ `http://127.0.0.1:5500` và `http://localhost:5500` — xem [06_trien_khai.md §4](06_trien_khai.md#4-cors-và-cấu-hình-backend).
Chưa có backend → để `BASE_URL: ""`; các tính năng tài khoản/bình luận sẽ báo "chưa sẵn sàng" thay vì lỗi.

## 4. URL để thử

| Trang | URL mẫu |
|---|---|
| Trang chủ | `/index.html` |
| Phim lẻ / bộ | `/movies.html`, `/series.html?page=3` |
| Thể loại / quốc gia | `/category.html?slug=hanh-dong`, `/country.html?slug=han-quoc` |
| Tìm kiếm | `/search.html?q=naruto` |
| Chi tiết | `/detail.html?slug=<slug>` (click một thẻ phim để lấy slug) |
| Xem phim | `/watch.html?slug=<slug>&ep=<tên hoặc slug tập>&server=0` |
| Yêu thích / lịch sử | `/favorites.html`, `/history.html` |
| 404 | `/404.html` (server Python không tự trả trang này cho URL sai — host thật thì có) |

## 5. Lỗi hay gặp

| Hiện tượng | Nguyên nhân | Xử lý |
|---|---|---|
| Không có header/footer, console lỗi CORS / `Failed to fetch components/header.html` | Mở bằng `file://` | Chạy qua HTTP |
| `initializeApp is not defined — thiếu js/main.js?` | Trang thiếu `main.js` hoặc `main.js` lỗi cú pháp | Thêm script / sửa lỗi đỏ đầu tiên |
| `Identifier 'X' has already been declared` | 2 file JS khai báo trùng `const/let` top-level | Bọc file trang trong IIFE; mỗi HTML 1 file trang |
| `XXX is not defined` | Sai thứ tự `<script>` | components → config → utils → api → main → page |
| Lưới hiện "Không tải được danh sách phim" + nút Thử lại | phimapi lỗi/chậm (>15s) hoặc mất mạng | Bấm Thử lại; mở thẳng URL API để kiểm tra |
| Sửa CSS/JS không thấy đổi | Cache | DevTools → Network → "Disable cache", Ctrl+Shift+R |
| Video chỉ hiện iframe | `.m3u8` lỗi → tự fallback (bình thường) | Đổi server ở trang xem |
| Yêu thích/lịch sử "biến mất" | localStorage tách theo origin: `127.0.0.1:5500` ≠ `localhost:5500` | Luôn dùng một URL gốc |
| Backend báo lỗi CORS | Backend chưa cho phép origin của frontend | Thêm origin vào cấu hình CORS backend |

## 6. Xem / xóa localStorage

DevTools → **Application** → **Local Storage**. Key: `rophim_favorites`, `rophim_watch_history`, `rophim_auth_session`.
```js
JSON.parse(localStorage.getItem("rophim_favorites"))
localStorage.removeItem("rophim_watch_history")
```
