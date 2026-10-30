# Skill 06 — Kiểm thử

> Dự án **không có test tự động**. Nguồn kiểm thử chính thức: cột **Testing** trong `product_backlog.xlsx` (Bảng 3) —
> mỗi US có 3 kịch bản. File này bổ sung phần **hồi quy** (đảm bảo không phá thứ khác).
> AI agent: không mở được trình duyệt thì liệt kê rõ mục **chưa kiểm**, không được báo "đã test".

Chuẩn bị: chạy Live Server, mở DevTools (F12) → **Console** luôn mở; **Network → Disable cache**.

---

## 1. Kiểm US vừa làm

- [ ] Chạy đủ 3 Scenario trong cột Testing của US. Ghi kết quả Pass/Fail vào PR.
- [ ] Console không có lỗi đỏ (cảnh báo của bên thứ ba có thể bỏ qua).
- [ ] Tham số URL sai/thiếu → có thông báo, không trắng trang.
- [ ] Network → **Offline** → tải lại → khối lỗi + nút Thử lại; bật mạng, bấm Thử lại → có dữ liệu.
  Lưu ý: chọn Offline **sau khi** trang đã tải xong HTML/JS (hoặc dùng Network → Request blocking chặn `phimapi.com`),
  nếu không cả trang sẽ không mở được.
- [ ] Phân biệt 2 loại lỗi: **mất mạng / máy chủ lỗi** → có nút Thử lại; **không tồn tại** (slug sai) → không có Thử lại, có lối về trang chủ.
- [ ] Network → **Slow 3G** → thấy skeleton trước khi có dữ liệu.

## 2. Hồi quy khi sửa CORE

Đụng `utils.js`, `main.js`, `components.js`, `style.css`, `components.css`, `components/*.html` → chạy **toàn bộ** bảng.
Chỉ đụng `api.js`/`config.js`/`catalog.js` → chạy các dòng liên quan.

| Trang | Kiểm |
|---|---|
| `index.html` | Hero có tên + nền; 3 lưới đủ 6 thẻ; nút "›" sang movies/series |
| `movies.html`, `series.html` | 24 thẻ; trang sau/cuối/đầu đúng; URL có `?page=`; F5 giữ đúng trang; nút Back quay lại trang trước |
| `category.html?slug=hanh-dong`, `country.html?slug=han-quoc` | Tiêu đề đúng tên; có phim; `?slug=sai` → trạng thái rỗng; không slug → thông báo chọn |
| `search.html?q=naruto` | Có kết quả; `?q=zzzzqq` → không tìm thấy; ô tìm kiếm header điền sẵn từ khóa |
| `detail.html?slug=<slug>` | Poster, chip, mô tả không lộ thẻ HTML, tập theo server, 6 đề xuất; "Xem ngay" sang watch; không slug → lỗi thân thiện |
| `watch.html?slug=<slug>` | Video phát (hoặc iframe); đổi tập/server; auto-next; phím tắt; gõ trong ô bình luận không ảnh hưởng video; ♥/chia sẻ/tắt đèn; diễn viên, hình ảnh, đề xuất |
| `favorites.html` | Phim đã ♥ có ảnh + ngày thêm; xóa 1; xóa tất cả; trống → khối rỗng, ẩn phân trang |
| `history.html` | Phim vừa xem + tập; bấm poster → watch đúng tập; xóa 1 |

**Toàn cục — kiểm trên ≥ 3 trang khác nhau:**
- [ ] Header + footer hiện; không có lỗi `initializeApp is not defined`.
- [ ] Gõ ≥ 2 ký tự → dropdown sau ~0.5s, tối đa 5 phim; gõ rồi xóa nhanh → không hiện; Enter → `search.html?q=`.
- [ ] Hover Thể loại / Quốc gia / Thêm → dropdown; click một thể loại → đúng trang.
- [ ] ♥ trên thẻ → toast + icon đổi, mọi thẻ cùng phim đổi theo; F5 vẫn giữ; có trong `favorites.html`.
- [ ] Cuộn > 300px → nút về đầu trang; bấm → trượt lên.
- [ ] "Thành viên" → toast đúng (cho tới khi có `login.html`).

## 3. Responsive

DevTools → Toggle device toolbar (Ctrl+Shift+M):
- [ ] **375px**: menu 3 gạch mở/đóng (icon ☰ ↔ ✕), chạm "Thể loại" mở danh sách, chạm ra ngoài đóng menu; icon kính lúp mở ô tìm kiếm; lưới 2 cột; không cuộn ngang.
- [ ] **768px**: lưới 3 cột. **1024px**: 4 cột. **1250px**: header đủ menu, không tràn. **≥ 1440px**: 6 cột.

## 4. Dữ liệu localStorage

- [ ] Test với localStorage **trống** và với dữ liệu **cũ** sẵn có.
- [ ] Sửa tay giá trị thành JSON hỏng (`abc`) → trang vẫn chạy, coi như rỗng (US-07 Scenario 2).

## 5. Bảo mật nhanh

- [ ] Trang hiển thị chuỗi từ URL / ô nhập / backend: thử `<img src=x onerror=alert(1)>` → hiện nguyên văn, **không** bật hộp thoại.
- [ ] Không có token, mật khẩu, key trong code hay trong `git diff`.
- [ ] (V2) Đăng nhập tài khoản thường, gọi thử endpoint `/admin/*` bằng DevTools → bị `403`.

## 6. Trước khi commit

```bash
git status            # chỉ file mình định sửa
git diff --stat       # có file CORE ngoài dự định? → revert
git diff              # đọc lại; xóa console.log debug
```

## 7. Mẫu báo cáo (dán vào PR / AI trả lời)

```
US-26 — Lọc phim theo thể loại
- Scenario 1 (chọn Hành động → lưới đúng): Pass
- Scenario 2 (slug sai → thông báo): Pass
- Scenario 3 (trang 2 giữ slug, page=2): Pass
Hồi quy: index, movies, detail, watch (desktop + 375px) — console sạch
Sửa CORE: không
Chưa kiểm: Safari iOS
```
