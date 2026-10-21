# 04 — Quy trình làm việc

> Git flow, commit, PR template đầy đủ: [CONTRIBUTING.md](../../CONTRIBUTING.md). File này tóm tắt **quy trình một task**
> và **cách chia việc để không giẫm chân nhau**.

## 1. Một task, từ đầu tới cuối

```
1. Nhận US    → mở product_backlog.xlsx: đọc User Story (Bảng 2) + Acceptance Criteria & Testing (Bảng 3)
2. Phân loại  → tạo file mới hay sửa file cũ? Đụng CORE? Cần backend? (AGENTS.md §3)
3. Sync       → git checkout develop && git pull upstream develop
4. Branch     → git checkout -b feat/us-26-category-page
5. Tra cứu    → core_registry.md: liệt kê hàm/class dùng lại
6. Code       → theo skill trong docs/skills/
7. Kiểm       → chạy từng Scenario của US + 06_kiem_thu_thu_cong_skill.md
8. Commit     → feat(category): add category listing page (US-26)
9. Sync lại   → git fetch upstream && git merge upstream/develop  (giải conflict, kiểm lại bước 7)
10. PR        → base: develop. Mô tả: US, Scenario đã pass, "Sửa CORE: Có/Không — file nào"
11. Doc       → cập nhật docs/ liên quan + bảng trạng thái trong 07_lo_trinh_va_backlog.md
```

## 2. Task đụng CORE

- **Trước khi code:** báo nhóm — file nào, hàm nào, thêm hay sửa, dự kiến merge.
- **Commit CORE tách riêng** khỏi commit trang:
  ```
  feat(utils): add formatRelativeTime helper     ← commit 1: chỉ CORE
  feat(watch): show comment time ago (US-54)     ← commit 2: trang dùng hàm mới
  ```
- PR có mục **"Ảnh hưởng"**: liệt kê trang đã test.
Chi tiết: [core_files_rules.md](../constraints/core_files_rules.md).

## 3. Task cần backend (V2)

- Frontend **không đợi** backend xong: code theo [backend_api_contract.md](../specs/backend_api_contract.md), xử lý nhánh
  `error === "BACKEND_NOT_CONFIGURED"` để trang vẫn chạy khi chưa có server.
- **Đổi hợp đồng** (thêm field, đổi endpoint) → sửa `backend_api_contract.md` trong một PR riêng, cả người làm FE và BE cùng duyệt.

## 4. Chia việc tránh conflict

| Rủi ro | File | Cách chia |
|---|---|---|
| 🔴 Cao | `js/main.js`, `js/utils.js`, `js/components.js`, `css/style.css`, `css/components.css`, `components/header.html` | **Một người một lúc.** Báo nhóm; người khác đợi merge rồi sync |
| 🟡 Vừa | `js/config.js`, `js/api.js`, `js/catalog.js` | Thêm ở **cuối nhóm liên quan**; conflict thường nhỏ |
| 🟢 Thấp | File trang riêng (`login.html`, `admin.html`, `js/<page>.js`, `css/<page>.css`) | Mỗi người sở hữu trang của mình |

Mẹo:
- Thêm hàm vào `utils.js`/`api.js` → **thêm cả vào `module.exports`** cuối file; khi giải conflict ở đây, giữ **cả hai** dòng.
- Không format lại cả file CORE trong PR logic — diff phình, người khác conflict toàn file.
- Việc V2 chạm nhiều vào header (avatar, menu cá nhân, link admin) → **giao cho 1 người làm "header tài khoản"**, người khác dùng lại.

## 5. Review checklist

- [ ] PR ghi mã US, các Scenario đã pass?
- [ ] Có `fetch(` ngoài `js/api.js` / `js/components.js`? → chuyển vào `api.js`.
- [ ] Hàm mới trùng chức năng trong `core_registry.md`? → dùng lại.
- [ ] Đổi tên/tham số/kiểu trả về hàm CORE? → từ chối.
- [ ] `innerHTML` chứa dữ liệu API / người dùng / backend chưa `escapeHtml`?
- [ ] Có bí mật (key, mật khẩu) trong code? Kiểm tra quyền admin chỉ ở frontend?
- [ ] Màu/kích thước hardcode thay vì `var(--...)`? `style=""` / `<style>` mới?
- [ ] Doc liên quan đã cập nhật?
