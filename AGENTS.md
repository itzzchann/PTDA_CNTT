# AGENTS.md — RoPhim

> File này dành cho **cả người lẫn AI agent** (Claude Code, Cursor, Copilot, Codex...).
> Đọc hết file này TRƯỚC khi sửa bất kỳ dòng code nào. Chi tiết nằm trong [docs/](docs/README.md).

---

## 0. Dự án là gì (1 phút)

**RoPhim** là website xem phim trực tuyến, làm theo Scrum (xem [lộ trình](docs/guides/07_lo_trinh_va_backlog.md)):

| Mốc | Nội dung | Trạng thái |
|---|---|---|
| **Release V1** (09/10/2026) | Chức năng nền tảng: duyệt/tìm phim, chi tiết, trình phát, yêu thích, lịch sử | ✅ Đã có |
| **Release V2** (30/10/2026) | Tài khoản (đăng ký/đăng nhập), bình luận & đánh giá thật, **Dashboard Admin**, kiểm duyệt, bảo trì | ⏳ Đang làm |
| **Deploy** | Chạy công khai trên Internet thay vì local | ⏳ Xem [06_trien_khai.md](docs/guides/06_trien_khai.md) |

**Kiến trúc:**
- **Frontend** (repo này): HTML + CSS + JavaScript **thuần**, không framework, không build tool. Host tĩnh.
- **Dữ liệu phim**: API công khai **phimapi.com** (chỉ đọc).
- **Backend riêng** (V2 — tài khoản, bình luận, admin): **Node.js + Express + PostgreSQL**, repo `rophim-api`; giao tiếp qua REST theo
  [backend_api_contract.md](docs/specs/backend_api_contract.md). Frontend gọi **chỉ qua `fetchBackend()`**.
- **localStorage**: yêu thích, lịch sử, phiên đăng nhập.

Dự án tổ chức theo kiểu **"module dùng chung" giống Java**: các file **CORE** (base) cung cấp hàm/hằng/CSS
cho mọi trang; mỗi trang có file **PAGE** riêng chỉ dùng lại CORE. Mọi hàm CORE là **biến toàn cục** —
sửa một hàm CORE là sửa cho **tất cả các trang** và **tất cả thành viên**.

---

## 1. Đọc gì trước khi code

| Khi bạn cần... | Đọc file |
|---|---|
| Hiểu dự án, lộ trình V2, user story nào đã xong | [01_tong_quan_du_an.md](docs/guides/01_tong_quan_du_an.md), [07_lo_trinh_va_backlog.md](docs/guides/07_lo_trinh_va_backlog.md) |
| Hiểu kiến trúc, thứ tự load script, vòng đời trang | [02_kien_truc.md](docs/guides/02_kien_truc.md) |
| Tìm hàm/CSS class **đã có sẵn** để dùng lại | [core_registry.md](docs/specs/core_registry.md) ⭐ |
| Gọi API phim, cấu trúc JSON | [api_spec.md](docs/specs/api_spec.md) |
| Làm tính năng cần backend (tài khoản, bình luận, admin) | [backend_api_contract.md](docs/specs/backend_api_contract.md) + [07_backend_auth_skill.md](docs/skills/07_backend_auth_skill.md) |
| Code backend (Node.js + Express + PostgreSQL) | [08_backend_node_skill.md](docs/skills/08_backend_node_skill.md) |
| Ai làm gì trong V2 | [07_lo_trinh_va_backlog.md §3](docs/guides/07_lo_trinh_va_backlog.md#3-kế-hoạch-v2--phân-công-3-người) |
| Object phim, localStorage, query URL | [data_formats.md](docs/specs/data_formats.md) |
| Quy tắc sửa file CORE (base) | [core_files_rules.md](docs/constraints/core_files_rules.md) ⭐ |
| Style code, giới hạn kỹ thuật, bảo mật | [coding_style.md](docs/constraints/coding_style.md), [technical.md](docs/constraints/technical.md) |
| Deploy lên Internet | [06_trien_khai.md](docs/guides/06_trien_khai.md) |
| Công thức làm một việc cụ thể | [docs/skills/](docs/README.md#skills--công-thức-làm-việc) |
| Những gì đã sửa / nợ kỹ thuật còn lại | [05_no_ky_thuat.md](docs/guides/05_no_ky_thuat.md) |

---

## 2. Luật cứng (KHÔNG được vi phạm)

1. **Dùng lại trước, viết mới sau.** Tra [core_registry.md](docs/specs/core_registry.md) trước khi viết hàm.
   Đã có `createMovieCard`, `renderSkeleton`, `renderEmptyState`, `setupPagination`, `extractMovieItems`,
   `escapeHtml`, `showToast`... thì PHẢI dùng.
2. **Mọi request mạng đi qua `js/api.js`**: phimapi → các hàm `getXxx()`; backend riêng → `fetchBackend()`.
   Không `fetch(` trong file trang. Không hardcode URL — URL nằm trong `API_CONFIG` / `BACKEND_CONFIG` (`js/config.js`).
3. **Không đổi tên, không đổi tham số bắt buộc, không đổi kiểu trả về** của hàm CORE.
   Cần khác → **thêm tham số tùy chọn có default** hoặc **tạo hàm mới**.
4. **Không sửa file CORE** nếu task không yêu cầu rõ. Buộc phải sửa → theo
   [core_files_rules.md](docs/constraints/core_files_rules.md) và **ghi rõ trong PR**.
5. **Mọi dữ liệu không do mình viết** (API, người dùng nhập, URL, bình luận từ backend) vào `innerHTML` **phải qua `escapeHtml()`**,
   hoặc dùng `textContent`. HTML từ API (`movie.content`) → `stripHtml()`.
6. **Không viết CSS chung vào file trang và ngược lại.** CSS trang → `css/<page>.css`, selector bắt đầu bằng `.<page>-page`.
   Không thêm `<style>` / `style="..."` mới.
7. **Không đổi `id` / `class` đang được JS dùng**, không đổi key localStorage / cấu trúc dữ liệu đã lưu.
8. **Một trang HTML = một file JS trang**, file trang bọc trong IIFE `(() => { ... })();`.
9. **Không bí mật trong frontend**: không API key, mật khẩu, khóa admin trong JS/HTML — mọi thứ ở đây ai cũng xem được.
   Quyền admin **luôn do backend kiểm tra**; ẩn nút trên giao diện không phải là bảo mật.
10. **Không thêm framework / build tool / ES module** khi chưa được nhóm đồng ý.

---

## 3. Bản đồ file: CORE vs PAGE

```
🔴 CORE (ảnh hưởng mọi trang — sửa phải báo nhóm)        ✅ PAGE (chỉ ảnh hưởng trang đó)
──────────────────────────────────────────────           ─────────────────────────────────────────────
js/config.js       URL, endpoint, hằng, key storage       index.html     + js/homepage.js + css/homepage.css
js/utils.js        escape, format, storage, phiên,        movies.html  ┐
                   card, skeleton, empty state,           series.html  ├ + js/catalog.js (dùng chung 4 trang)
                   phân trang                             category.html│
js/api.js          fetchAPI, fetchBackend, getXxx()       country.html ┘
js/main.js         header: search, menu, toast, ♥         search.html    + js/search.js
js/components.js   nạp header/footer, initializeApp,      detail.html    + js/detail.js   + css/detail.css
                   bắn sự kiện components:loaded          watch.html     + js/watch.js    + css/watch.css
components/header.html, components/footer.html            favorites.html + js/favorites.js
css/variables.css  design tokens                          history.html   + js/history.js
css/style.css      reset, layout, header, footer,         404.html       (độc lập, đường dẫn tuyệt đối)
                   pagination, responsive header
css/components.css card, grid, badge, toast, skeleton,
                   empty-state, btn, section
```

`js/catalog.js` là file trang nhưng **4 trang dùng chung** → sửa phải test cả 4.

---

## 4. Nguyên tắc hành vi (cho AI và người)

### 4.1 Nghĩ trước khi code
- Nói rõ giả định. Không chắc → hỏi. Có nhiều cách hiểu → nêu ra, đừng tự chọn im lặng.
- Task đụng file CORE hoặc cần backend chưa có → **dừng lại, báo trước**.
- Mỗi task gắn với **mã user story** (US-xx) trong backlog; đọc **tiêu chí chấp nhận** của US đó trước khi code.

### 4.2 Đơn giản trước
- Code tối thiểu để đạt đúng tiêu chí chấp nhận. Không thêm tính năng không được hỏi.
- Không tạo abstraction cho code dùng 1 lần.

### 4.3 Sửa "phẫu thuật"
- Chỉ đụng vào chỗ cần đụng. Không "tiện tay" format lại, đổi tên, refactor code không liên quan.
- Bắt chước style code xung quanh. Thấy lỗi không liên quan → **ghi chú lại, không tự sửa**.

### 4.4 Làm theo mục tiêu kiểm chứng được
Dự án **không có test tự động** → kiểm chứng = chạy các **kịch bản Testing của US** trong backlog +
[06_kiem_thu_thu_cong_skill.md](docs/skills/06_kiem_thu_thu_cong_skill.md). AI không mở được trình duyệt thì phải nói **"chưa kiểm"**, không được báo "đã test".

---

## 5. Definition of Done

- [ ] Đạt đủ các Scenario trong **tiêu chí chấp nhận** của US.
- [ ] Chạy qua HTTP (Live Server), **console không có lỗi đỏ**.
- [ ] Header + footer hiện, ô tìm kiếm gợi ý, nút ♥ bật/tắt được, menu mobile mở được.
- [ ] Đụng CORE: đã test **ít nhất 3 trang** (index, detail, watch + trang bị ảnh hưởng).
- [ ] Không `console.log` debug, không URL/màu hardcode mới, không chuỗi chưa escape trong `innerHTML`.
- [ ] Responsive: 375px, 768px, ≥1200px — không cuộn ngang.
- [ ] Commit Conventional Commits tiếng Anh, có mã US: `feat(category): add category listing (US-26)`. Làm trên **nhánh tên mình** (mỗi người 1 nhánh, xem [CONTRIBUTING §4.1](CONTRIBUTING.md#41-tên-nhánh)), PR vào `develop`.
- [ ] Thêm/sửa CORE → đã cập nhật [core_registry.md](docs/specs/core_registry.md). Thêm endpoint backend → cập nhật [backend_api_contract.md](docs/specs/backend_api_contract.md).
