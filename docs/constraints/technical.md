# Ràng buộc kỹ thuật — RoPhim

## 1. Nền tảng frontend

| Hạng mục | Ràng buộc | Lý do |
|---|---|---|
| Ngôn ngữ | HTML + CSS + **JavaScript thuần** (ES2020) | Yêu cầu môn học; cả nhóm cùng đọc được |
| Framework (React, Vue, jQuery, Bootstrap, Tailwind...) | ❌ | |
| Build tool / bundler / npm / TypeScript | ❌ | Host tĩnh phục vụ thẳng file trong repo |
| ES module (`import`/`export`) | ❌ | CORE dựa trên biến toàn cục |
| `module.exports` cuối file CORE | ✅ giữ, thêm hàm mới vào | Có điều kiện, không chạy trên trình duyệt; cho phép `require` file trong Node để test (US-03 Scenario 3) |
| File CORE không đụng `window`/`document` **lúc nạp** | ✅ | `config.js` phải `require` được trong Node |
| Trang HTML | Ở **thư mục gốc** | `components/*.html` dùng đường dẫn tương đối theo trang |
| Mở trang | Qua HTTP | `components.js` dùng `fetch` |

## 2. Thư viện ngoài (CDN)

| Thư viện | Phiên bản | Ở đâu |
|---|---|---|
| Google Fonts Inter | 300–700 | mọi trang |
| Font Awesome | **6.5.1** (cdnjs) | mọi trang — class `fa-solid`/`fa-regular`/`fa-brands` (code cũ có `fas`/`far`, vẫn chạy) |
| hls.js | **1.7.3** (jsdelivr) | `watch.html` |

Thêm thư viện: **nhóm đồng ý**, CDN uy tín, **ghim phiên bản cụ thể** (không `@latest`), ghi vào bảng này.
Lý do: deploy công khai — thư viện tự nâng phiên bản có thể làm hỏng site mà không ai sửa gì.

## 3. Backend & dữ liệu

| Nguồn | Vai trò | Giao tiếp |
|---|---|---|
| phimapi.com | Dữ liệu phim (chỉ đọc), bên thứ ba | `getXxx()` trong `api.js` |
| Backend RoPhim (V2) — Node.js + Express + PostgreSQL, repo `rophim-api` | Người dùng, bình luận, đánh giá, cấu hình admin, thống kê | `fetchBackend()` theo [backend_api_contract.md](../specs/backend_api_contract.md) |
| localStorage | Yêu thích, lịch sử (khách), phiên đăng nhập, cài đặt | Hàm storage trong `utils.js` |

- Timeout: phimapi 15s (`API_CONFIG.TIMEOUT_MS`), backend 60s (`BACKEND_CONFIG.TIMEOUT_MS` — Render free khởi động chậm). `status === 0` = mất mạng / quá hạn.
- phimapi: 24 phim/trang, không `limit`; có thể chậm/lỗi/đổi cấu trúc → `extractMovieItems`, `?.`, fallback, luôn có trạng thái lỗi.
- Không gọi API trong vòng lặp lớn (vd `getMovieDetail` cho 24 phim).
- localStorage ~5MB/origin; lịch sử cắt ở 50 mục.

## 4. Trình duyệt & màn hình

- Chrome / Edge / Firefox hiện hành, Safari iOS 15+ (Safari phát HLS gốc — đã có nhánh xử lý).
- Được dùng: `async/await`, `?.`, `??`, `fetch`, `AbortController`, `URLSearchParams`, `CSS.escape`, CSS Grid, `inset`, `:focus-visible`.

| Mốc | Lưới phim | Header |
|---|---|---|
| > 1400px | 6 cột | Đầy đủ |
| ≤ 1400px | 6 cột | Ẩn "Tải ứng dụng" |
| ≤ 1200px | 5 cột | Menu 3 gạch + ô tìm kiếm thả xuống |
| ≤ 1024px | 4 cột | |
| ≤ 768px | 3 cột | |
| ≤ 480px | 2 cột | Nút "Thành viên" chỉ còn icon |

Header cao `--header-height` (70px), cố định → nội dung dùng `.page-container` (đã chừa chỗ).

## 5. Môi trường & deploy

Chi tiết: [06_trien_khai.md](../guides/06_trien_khai.md).
- Không có biến môi trường phía frontend (không build). Giá trị khác nhau giữa môi trường chỉ có `BACKEND_CONFIG.BASE_URL`;
  deploy dùng proxy `/api` để giá trị này **giống nhau** ở preview và production.
- Không commit URL `localhost` vào `develop`/`main`.

## 6. Bảo mật

Site công khai + có tài khoản ⇒ bắt buộc:
- **XSS**: mọi dữ liệu ngoài vào `innerHTML` qua `escapeHtml`; `movie.content` qua `stripHtml`; không `eval`, `new Function`,
  không chèn HTML lấy từ URL. Token nằm trong localStorage — một lỗ XSS là lộ tài khoản.
- **Không bí mật trong frontend**: không API key, mật khẩu, khóa ký JWT. Mọi file trong repo đều bị host công khai.
- **Phân quyền ở backend**: frontend kiểm `role` chỉ để ẩn/hiện giao diện.
- Chuyển hướng sau đăng nhập (`?next=`) chỉ cho đường dẫn nội bộ bắt đầu bằng `/`.
- Link ngoài: `target="_blank" rel="noopener"`.
- Trang cá nhân/admin/đăng nhập: `<meta name="robots" content="noindex">`.
- Không `console.log` dữ liệu người dùng / token.

## 7. Hiệu năng

- Ảnh danh sách `loading="lazy"`; ảnh lỗi → ảnh nội bộ `APP_CONFIG.DEFAULT_POSTER`.
- Sự kiện liên tục (scroll, input) → `throttle` / `debounce`; scroll listener `{ passive: true }`.
- Hủy tài nguyên nặng trước khi tạo mới (`hlsInstance.destroy()`); listener toàn cục chỉ gắn **một lần**.
- Không `setTimeout` để "đợi DOM" — dùng `DOMContentLoaded` / `components:loaded`.
- Không cache dài cho `.js/.css` khi deploy (tên file không có hash).
