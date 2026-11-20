# RoPhim — Website xem phim trực tuyến

Bài tập lớn môn Web (BTL-WEB-PRIVATE-2025). Website xem phim viết bằng **HTML + CSS + JavaScript thuần**,
dữ liệu phim lấy từ API công khai [phimapi.com](https://phimapi.com).

| Release | Ngày | Nội dung |
|---|---|---|
| V1 | 09/10/2026 | Trang chủ, phim lẻ/bộ, thể loại, quốc gia, tìm kiếm, chi tiết, trình phát HLS, yêu thích, lịch sử |
| V2 | 30/10/2026 | Tài khoản, bình luận & đánh giá, Dashboard Admin, kiểm duyệt, chế độ bảo trì |

## Chạy thử

```bash
# VS Code: chuột phải index.html → Open with Live Server
# hoặc:
python3 -m http.server 5500
# mở http://localhost:5500/index.html
```
Phải chạy qua HTTP — mở bằng `file://` sẽ không có header/footer.

## Cấu trúc

```
*.html              các trang (đặt ở thư mục gốc)
components/         header.html, footer.html — nạp vào mọi trang
css/                variables → style → components (dùng chung) + css riêng từng trang
js/                 config → utils → api → main → components (dùng chung) + js riêng từng trang
assets/             ảnh, icon
docs/               tài liệu cho thành viên và AI agent
```

## Dành cho thành viên

1. Đọc **[AGENTS.md](AGENTS.md)** — luật chung (cho cả người và AI).
2. Đọc **[docs/README.md](docs/README.md)** — mục lục tài liệu, thứ tự đọc, cách giao việc cho AI.
3. Quy trình Git, commit, PR: **[CONTRIBUTING.md](CONTRIBUTING.md)**.
4. Lộ trình và trạng thái user story: **[docs/guides/07_lo_trinh_va_backlog.md](docs/guides/07_lo_trinh_va_backlog.md)**.
5. Deploy: **[docs/guides/06_trien_khai.md](docs/guides/06_trien_khai.md)**.
