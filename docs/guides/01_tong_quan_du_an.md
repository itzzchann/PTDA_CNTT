# 01 — Tổng quan dự án RoPhim

> Đề tài: **Phát triển dự án xây dựng website xem phim trực tuyến RoPhim**. Làm theo Scrum, 2 release:
> **V1 (09/10/2026)** chức năng nền tảng · **V2 (30/10/2026)** chức năng nâng cao.
> Nguồn yêu cầu: `product_backlog.xlsx` (64 user story + tiêu chí chấp nhận) và ảnh lộ trình — **nhóm lưu ngoài repo** (không commit, đã có trong `.gitignore`).
> Trạng thái từng user story: [07_lo_trinh_va_backlog.md](07_lo_trinh_va_backlog.md).

---

## 1. Mục tiêu sản phẩm

| Nhóm người dùng | Làm được gì |
|---|---|
| **Khách vãng lai** | Duyệt phim mới / lẻ / bộ / thể loại / quốc gia, tìm kiếm, xem chi tiết, xem phim, ♥ yêu thích, lịch sử (lưu trên trình duyệt) |
| **Thành viên** (V2) | + Đăng ký / đăng nhập / đăng xuất, bình luận (có cờ spoil), chấm điểm sao |
| **Quản trị viên** (V2) | Dashboard chỉ số, ghim phim Hero, chế độ bảo trì & máy chủ API dự phòng, kiểm duyệt bình luận, khóa/mở khóa thành viên, dọn bộ nhớ |

Sản phẩm sẽ được **deploy công khai** ([06_trien_khai.md](06_trien_khai.md)), không chỉ chạy local.

## 2. Công nghệ

| Thành phần | Dùng gì |
|---|---|
| Frontend | HTML5, CSS3, JavaScript ES2020 **thuần** (không framework, không build) |
| Dữ liệu phim | API công khai `https://phimapi.com` (ảnh: `phimimg.com`, ảnh diễn viên: TMDB) |
| Phát video | **hls.js 1.7.3** (CDN, ghim version) + iframe `link_embed` dự phòng; Safari phát HLS gốc |
| Font / icon | Google Fonts **Inter**, Font Awesome **6.5.1** |
| Dữ liệu cá nhân (V1) | `localStorage` |
| Backend (V2) | **Node.js 20 + Express + PostgreSQL**, repo riêng `rophim-api` — giao tiếp theo [hợp đồng REST](../specs/backend_api_contract.md) |
| Dev | VS Code + Live Server, Prettier |

---

## 3. Các trang ĐANG CÓ

| Trang | File | Nội dung |
|---|---|---|
| Trang chủ | `index.html` + `js/homepage.js` + `css/homepage.css` | Hero (phim mới nhất), 3 lưới tải song song: phim mới / lẻ / bộ, nút "Xem thêm" |
| Phim lẻ / Phim bộ | `movies.html`, `series.html` + `js/catalog.js` | Lưới 24 phim, phân trang 4 nút, số trang trên URL |
| Thể loại / Quốc gia | `category.html?slug=`, `country.html?slug=` + `js/catalog.js` | Như trên, theo thể loại / quốc gia; slug sai → trạng thái rỗng |
| Tìm kiếm | `search.html?q=` + `js/search.js` | Lưới kết quả, trạng thái không có kết quả |
| Chi tiết | `detail.html?slug=` + `js/detail.js` + `css/detail.css` | Backdrop + poster, chip meta, mô tả sạch, diễn viên/đạo diễn, tập theo server, 6 phim đề xuất |
| Xem phim | `watch.html?slug=&ep=&server=` + `js/watch.js` + `css/watch.css` | Player HLS tự viết (play/pause, tua, âm lượng, seekbar, chất lượng, auto-next, fullscreen, phím tắt), fallback iframe, tab server, danh sách phần, tắt đèn, ♥, chia sẻ, diễn viên, gallery, đề xuất, **bình luận (dữ liệu demo)** |
| Yêu thích | `favorites.html` + `js/favorites.js` | Danh sách, ngày thêm, xóa lẻ, xóa tất cả, phân trang 12 |
| Lịch sử | `history.html` + `js/history.js` | Danh sách, tập đang xem, bấm poster xem tiếp đúng tập, xóa lẻ |
| 404 | `404.html` | Trang lỗi cho host tĩnh |

### Tính năng chung (CORE)
- **Header**: logo, tìm kiếm gợi ý tức thì (debounce 0.5s, tối đa 5 kết quả, hủy khi xóa nhanh), menu Phim Lẻ / Phim Bộ /
  Thể loại ▾ / Quốc gia ▾ / Thêm ▾ (dữ liệu dự phòng khi API lỗi), **menu 3 gạch trên mobile**.
- **Footer** + nút về đầu trang. **Toast** 4 loại. **Skeleton**, **trạng thái rỗng/lỗi có nút Thử lại**.
- **Nút ♥** trên mọi thẻ phim (một handler toàn cục, đồng bộ mọi nút cùng phim).
- Nền tảng cho V2: `BACKEND_CONFIG`, `fetchBackend()` (tự gắn token, xử lý hết phiên), lưu phiên đăng nhập.

---

## 4. CHƯA có — đừng tưởng là có

| Hạng mục | Hiện trạng | US |
|---|---|---|
| **Backend + CSDL** | Chưa có. `BACKEND_CONFIG.BASE_URL = ""` → `fetchBackend()` trả `BACKEND_NOT_CONFIGURED` | — |
| Đăng ký / đăng nhập / đăng xuất | Nút "Thành viên" chỉ hiện toast | US-18, US-19 |
| Bình luận / đánh giá thật | Dữ liệu demo `DEMO_COMMENTS`, `DEMO_RATINGS` trong `watch.js`; bộ đếm ký tự, chặn nội dung rỗng đã có; Gửi → toast yêu cầu đăng nhập | US-54, 55, 56 |
| Trang Admin | Chưa có trang nào | US-58 → US-64 |
| Lưu vị trí xem (phút/giây) | Chỉ lưu **tập**, `progress` luôn 0 | US-52 |
| Backdrop mờ + poster 3D | Có backdrop + poster, chưa hiệu ứng mờ/3D | US-33 |
| Link mạng xã hội, link footer | `href="#"` | US-14 |
| Máy chủ API dự phòng | `API_CONFIG.BACKUP_URL` có nhưng chưa dùng | US-62 |
| Rổ Bóng, Tải ứng dụng | Toast "đang cập nhật" (đúng theo US-20) | US-20 |

---

## 5. Luồng người dùng

```
index ──► detail?slug=X ──(Xem ngay / chọn tập)──► watch?slug=X&ep=Tập 01&server=0 ──► lưu lịch sử
  │                                                    │
  ├─ ô tìm kiếm ─► dropdown 5 kết quả ─(Enter)─► search?q=K
  ├─ menu Phim Lẻ/Bộ ─► movies / series ?page=N
  ├─ menu Thể loại/Quốc gia ─► category / country ?slug=S&page=N
  └─ menu Thêm ─► favorites / history ─(bấm poster)─► watch đúng tập

V2:  header "Thành viên" ─► login ─► (token) ─► bình luận / đánh giá ở watch
     admin (role=admin) ─► admin.html: dashboard, ghim hero, bảo trì, kiểm duyệt, thành viên
```
