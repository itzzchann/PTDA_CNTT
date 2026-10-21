# Skill 05 — Sửa file CORE an toàn

> Dùng khi: task **bắt buộc** thêm/sửa trong `js/config.js`, `utils.js`, `api.js`, `main.js`, `components.js`,
> `components/*.html`, `css/variables.css`, `style.css`, `components.css`.
> Luật: [core_files_rules.md](../constraints/core_files_rules.md). File này là **ví dụ làm mẫu**.

---

## 0. Trước khi gõ phím

```
[ ] Chắc chắn không làm được trong file trang?          → làm được thì làm ở trang
[ ] Đã báo nhóm: file nào, hàm nào, thêm hay sửa?
[ ] git pull upstream develop ngay trước khi sửa
[ ] grep mọi chỗ dùng (nếu là SỬA)
```

---

## Ví dụ A — THÊM hàm mới: `formatRelativeTime` (cho bình luận "42 phút trước", US-54)

Kiểm tra: `grep -rnw "formatRelativeTime" js/` → không có. Bình luận + dashboard admin đều cần → đáng vào CORE.

**`js/utils.js`** — đặt cạnh `formatDate`:
```js
function formatRelativeTime(dateString) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "Không rõ";

  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "Vừa xong";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} phút trước`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} giờ trước`;
  if (seconds < 7 * 86400) return `${Math.floor(seconds / 86400)} ngày trước`;
  return formatDate(dateString);
}
```
Thêm `formatRelativeTime,` vào `module.exports`. Commit riêng: `feat(utils): add formatRelativeTime helper`.
Cập nhật [core_registry.md §2.1](../specs/core_registry.md#21-chuỗi--format).

---

## Ví dụ B — Mở rộng hàm có sẵn bằng tham số tùy chọn

Yêu cầu giả định: trang admin cần skeleton dạng hàng ngang.

```js
// ❌ Phá vỡ mọi chỗ gọi renderSkeleton(gridId, count)
function renderSkeleton({ gridId, count, variant }) { ... }

// ❌ Phá ngầm: đổi hành vi mặc định
function renderSkeleton(gridId, count = 12) { ... }   // trước là 6

// ✅ Thêm tham số CUỐI, default giữ nguyên hành vi cũ
function renderSkeleton(gridId, count = 6, variant = "card") {
  const grid = document.getElementById(gridId);
  if (!grid) return;
  const cardClass = variant === "row" ? "skeleton-card skeleton-row" : "skeleton-card";
  // ...phần còn lại giữ nguyên, chỉ thay class="skeleton-card" bằng class="${cardClass}"
}
```
Kiểm: gọi không có `variant` → HTML sinh ra **giống từng ký tự** trước đó. Test mọi file trong cột "Dùng ở".

---

## Ví dụ C — Header theo trạng thái đăng nhập (US-18, US-19)

Header là CORE nặng nhất (mọi trang). Cách làm an toàn — **thêm**, không phá phần cũ:

1. `components/header.html`: giữ nguyên `#main_user` và `.button-login`; thêm khối menu tài khoản **ẩn sẵn**:
   ```html
   <div id="user-menu" class="user-menu" hidden> ... avatar, tên, Tài khoản, Admin (ẩn), Đăng xuất ... </div>
   ```
2. `js/main.js`: thêm `setupAuthHeader()` và gọi trong `initializeApp()`:
   - `isLoggedIn()` → ẩn `.button-login`, hiện `#user-menu`, điền tên bằng `textContent`.
   - Gỡ nhánh `.button-login` trong `setupComingSoonFeatures` (thay bằng chuyển tới `login.html`).
   - Nghe `auth:expired` → về trạng thái khách + toast (US-19 Scenario 3).
3. CSS mới vào `components.css` (`.user-menu ...`), kiểm tra header ở 1250px và menu mobile.
4. Test tất cả trang (header có ở mọi trang) khi **đã** và **chưa** đăng nhập.

Chi tiết luồng: [07_backend_auth_skill.md](07_backend_auth_skill.md).

---

## Ví dụ D — Đổi tên hàm? Đừng.

```js
function getMovieDetail(slug) { ... }        // giữ nguyên

function getMovieBySlug(slug) {              // nếu nhóm thật sự muốn tên mới
  return getMovieDetail(slug);
}
```

---

## Ví dụ E — Thêm token CSS

```css
/* variables.css — THÊM là an toàn */
--warning-color: #f59e0b;
```
Rồi dùng ở chỗ mới. **Đổi giá trị** token cũ (`--primary-color`) = đổi màu cả web → cần cả nhóm đồng ý.
Thay hex cũ bằng token có **cùng giá trị** (vd `#ffd875` → `var(--primary-color)`) là an toàn, nên làm dần.

---

## Lỡ làm hỏng

```bash
git log --oneline -- js/utils.js
git revert <hash>          # tạo commit đảo ngược, không viết lại lịch sử
```
Báo nhóm ngay. Không `push --force` lên `develop`/`main`.

---

## AI Verification Checklist

- [ ] Thay đổi thuộc loại ✅/⚠️ trong [core_files_rules.md §2](../constraints/core_files_rules.md#2-ma-trận-thay-đổi-nào-được-phép), không phải ❌.
- [ ] Không đổi tên, không đổi/bỏ tham số cũ, không đổi kiểu trả về, không đổi HTML/class/ID được sinh ra.
- [ ] Gọi theo cách cũ cho kết quả **y hệt** trước.
- [ ] Đã `grep` mọi chỗ dùng; test từng trang đó + index, detail, watch.
- [ ] Hàm mới trong `module.exports` + `core_registry.md`.
- [ ] Commit CORE tách riêng; PR có mục "Sửa CORE".
