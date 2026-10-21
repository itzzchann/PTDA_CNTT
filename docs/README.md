# Tài liệu dự án RoPhim

> Điểm bắt đầu: đọc [../AGENTS.md](../AGENTS.md) trước, rồi quay lại đây khi cần chi tiết.
> Mọi mô tả **đối chiếu trực tiếp với code thật**. Code đổi mà doc không đổi → AI code sai.
> **Sửa code thì sửa luôn doc liên quan trong cùng PR** (bảng cuối trang).

## Cấu trúc

```
AGENTS.md                         ← Luật chung cho người + AI (đọc đầu tiên)
CLAUDE.md                         ← Trỏ tới AGENTS.md (cho Claude Code)
CONTRIBUTING.md                   ← Git flow, commit, PR
docs/
├── README.md                     ← File này
├── guides/                       ← HIỂU dự án
│   ├── 01_tong_quan_du_an.md         Dự án làm gì, trang nào, tính năng nào
│   ├── 02_kien_truc.md               Kiến trúc hiện tại + kiến trúc đích V2 (có backend)
│   ├── 03_chay_du_an.md              Chạy local, lỗi hay gặp
│   ├── 04_quy_trinh_lam_viec.md      Quy trình 1 task (gắn US) → PR, chia việc tránh conflict
│   ├── 05_no_ky_thuat.md             Đã sửa gì (10/2026) + nợ kỹ thuật còn lại
│   ├── 06_trien_khai.md              ⭐ Deploy frontend + backend lên Internet
│   └── 07_lo_trinh_va_backlog.md     ⭐ Lộ trình V1/V2, trạng thái 64 user story, chia việc V2
├── specs/                        ← THAM CHIẾU khi code
│   ├── core_registry.md              ⭐ Danh mục hàm/hằng/CSS/ID dùng chung
│   ├── api_spec.md                   phimapi.com + hàm wrapper
│   ├── backend_api_contract.md       ⭐ Hợp đồng REST frontend ↔ backend riêng (V2)
│   └── data_formats.md               Object phim, localStorage, query string
├── constraints/                  ← LUẬT
│   ├── core_files_rules.md           ⭐ Quy tắc sửa file CORE
│   ├── coding_style.md               Đặt tên, HTML/CSS/JS style
│   └── technical.md                  Giới hạn kỹ thuật, môi trường, bảo mật
└── skills/                       ← CÔNG THỨC (dùng để vibe code)
    ├── 01_tao_trang_moi_skill.md
    ├── 02_goi_api_va_render_skill.md
    ├── 03_localstorage_skill.md
    ├── 04_css_ui_skill.md
    ├── 05_sua_core_an_toan_skill.md
    ├── 06_kiem_thu_thu_cong_skill.md
    ├── 07_backend_auth_skill.md      (FE) Đăng nhập, gọi backend, bình luận, trang admin
    └── 08_backend_node_skill.md      (BE) Chuẩn repo Node.js + Express + PostgreSQL
```

## Thứ tự đọc cho người mới

1. [AGENTS.md](../AGENTS.md) — 5 phút
2. [guides/01_tong_quan_du_an.md](guides/01_tong_quan_du_an.md) + [guides/07_lo_trinh_va_backlog.md](guides/07_lo_trinh_va_backlog.md) — biết mình làm gì
3. [guides/02_kien_truc.md](guides/02_kien_truc.md) — **quan trọng nhất** để không phá code người khác
4. [guides/03_chay_du_an.md](guides/03_chay_du_an.md) — chạy thử được web
5. [specs/core_registry.md](specs/core_registry.md) — lướt để biết "đã có gì"
6. [constraints/core_files_rules.md](constraints/core_files_rules.md)

## Skills — công thức làm việc

| Việc cần làm | Skill |
|---|---|
| Thêm trang mới (admin, đăng nhập, tài khoản...) | [01_tao_trang_moi_skill.md](skills/01_tao_trang_moi_skill.md) |
| Lấy danh sách phim, render lưới, phân trang, trạng thái rỗng/lỗi | [02_goi_api_va_render_skill.md](skills/02_goi_api_va_render_skill.md) |
| Yêu thích, lịch sử, cài đặt người dùng | [03_localstorage_skill.md](skills/03_localstorage_skill.md) |
| Giao diện, CSS, responsive | [04_css_ui_skill.md](skills/04_css_ui_skill.md) |
| Bắt buộc sửa file CORE | [05_sua_core_an_toan_skill.md](skills/05_sua_core_an_toan_skill.md) |
| Kiểm tra trước khi commit | [06_kiem_thu_thu_cong_skill.md](skills/06_kiem_thu_thu_cong_skill.md) |
| Đăng ký/đăng nhập, bình luận, đánh giá, admin (phía FE) | [07_backend_auth_skill.md](skills/07_backend_auth_skill.md) |
| Viết backend Node.js + Express + PostgreSQL | [08_backend_node_skill.md](skills/08_backend_node_skill.md) |

## Dùng tài liệu này để vibe code

Giao việc cho AI: **đính kèm đúng skill + spec + mã US**, nói rõ file nào được sửa. Mẫu prompt:

```
Đọc AGENTS.md, docs/specs/core_registry.md, docs/specs/backend_api_contract.md
và docs/skills/07_backend_auth_skill.md.

Task: US-18 — trang đăng nhập/đăng ký (login.html).
Tiêu chí chấp nhận: <dán 3 Scenario từ product_backlog.xlsx, sheet "Bảng 3">
Được tạo mới: login.html, js/login.js, css/login.css.
KHÔNG được sửa file CORE; nếu cần, DỪNG và liệt kê thay đổi đề xuất cho tôi duyệt.
Trước khi viết code: liệt kê các hàm CORE sẽ dùng lại.
Sau khi xong: chạy từng Scenario theo docs/skills/06_kiem_thu_thu_cong_skill.md, báo cái nào đã/chưa kiểm.
```

Mẹo:
- Yêu cầu AI **liệt kê hàm CORE sẽ dùng** trước khi code → phát hiện sớm việc viết trùng.
- Sau khi AI xong: `git diff --stat` — có file CORE nào bạn không cho phép → bắt giải thích hoặc revert.
- Dán **tiêu chí chấp nhận** vào prompt: AI làm đúng phạm vi hơn nhiều so với chỉ đưa tên tính năng.

## Cập nhật tài liệu

| Bạn vừa... | Cập nhật |
|---|---|
| Thêm/sửa hàm, hằng, CSS class, ID dùng chung | `specs/core_registry.md` |
| Thêm wrapper phimapi | `specs/api_spec.md` |
| Thêm/đổi endpoint backend | `specs/backend_api_contract.md` (báo cả 2 phía FE/BE) |
| Thêm key localStorage, query param | `specs/data_formats.md` |
| Xong một user story | Bảng trạng thái trong `guides/07_lo_trinh_va_backlog.md` |
| Thêm trang | `guides/01_tong_quan_du_an.md` + bảng CORE/PAGE trong `AGENTS.md` |
| Đổi cách deploy, biến môi trường | `guides/06_trien_khai.md` |
| Sửa một mục nợ kỹ thuật | Xóa mục đó trong `guides/05_no_ky_thuat.md` |
