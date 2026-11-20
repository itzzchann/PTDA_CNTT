# Skill 01 — Tạo trang mới

> Dùng khi: thêm một trang HTML (đăng nhập, tài khoản, admin, danh sách phim mới...).
> Đọc trước: [02_kien_truc.md](../guides/02_kien_truc.md), [core_registry.md](../specs/core_registry.md).

---

## 0. Trang danh sách phim? → KHÔNG tạo JS mới

`js/catalog.js` đã lo trọn: skeleton, phân trang, số trang trên URL, rỗng/lỗi/Thử lại. Thêm một nguồn là đủ.

Ví dụ: trang **Phim hoạt hình** (`animation.html`, dùng `getMoviesByListSlug("hoat-hinh")`).

1. Thêm vào `CATALOG_SOURCES` trong `js/catalog.js` (file dùng chung 4 trang → test cả 4 sau khi sửa):
   ```js
   animation: {
     title: "Hoạt hình",
     icon: "fa-solid fa-dragon",
     fetchPage: (slug, page) => getMoviesByListSlug("hoat-hinh", page),
   },
   ```
2. Copy `movies.html` → `animation.html`, đổi `<title>`, `meta description`, `data-catalog="animation"`, icon/tiêu đề mặc định.
3. Thêm link vào menu nếu cần (§5). Xong — không viết dòng render nào.

---

## 1. Các file cho trang loại khác

```
<ten-trang>.html        ← thư mục GỐC (không đặt trong thư mục con)
js/<ten-trang>.js       ← logic trang, bọc IIFE
css/<ten-trang>.css     ← chỉ khi cần style riêng; mọi selector bắt đầu bằng .<ten-trang>-page
```

Không cần sửa file nào khác để trang chạy: header/footer, tìm kiếm, ♥, toast, menu mobile tự có.

## 2. Khung HTML chuẩn

```html
<!doctype html>
<html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Tên trang | RoPhim</title>
    <meta name="description" content="Một câu mô tả trang cho Google." />
    <!-- Trang cá nhân / admin / đăng nhập: thêm dòng dưới để Google không index -->
    <!-- <meta name="robots" content="noindex" /> -->
    <meta name="theme-color" content="#191b24" />
    <link rel="icon" type="image/svg+xml" href="./assets/images/logos/ro-icon.svg" />

    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
      rel="stylesheet"
    />
    <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
    />

    <link rel="stylesheet" href="./css/variables.css" />
    <link rel="stylesheet" href="./css/style.css" />
    <link rel="stylesheet" href="./css/components.css" />
    <link rel="stylesheet" href="./css/<ten-trang>.css" />

    <script src="./js/components.js"></script>
    <script src="./js/config.js"></script>
    <script src="./js/utils.js"></script>
    <script src="./js/api.js"></script>
    <script src="./js/main.js"></script>
    <script src="./js/<ten-trang>.js" defer></script>
  </head>

  <body>
    <div id="header-placeholder"></div>

    <main class="page-container <ten-trang>-page">
      <section class="mt-3 mb-4">
        <h1 class="section-title"><i class="fa-solid fa-..."></i> Tên trang</h1>
        <!-- nội dung -->
      </section>
    </main>

    <div id="footer-placeholder"></div>
  </body>
</html>
```

Bắt buộc: `#header-placeholder`, `#footer-placeholder`, 5 script CORE đúng thứ tự, file trang cuối có `defer`, `<main class="page-container ...">`.
Mỗi trang **một `<h1>`**.

## 3. Khung JS trang

```js
(() => {
  document.addEventListener("DOMContentLoaded", initTenTrangPage);

  function initTenTrangPage() {
    const id = new URLSearchParams(window.location.search).get("id");
    const container = document.getElementById("ten-trang-content");
    if (!container) return;

    if (!id) {
      renderEmptyState(container, {
        message: "Thiếu thông tin cần thiết.",
        actionText: "Về trang chủ",
        actionHref: "index.html",
      });
      return;
    }

    loadTenTrang(id);
  }

  async function loadTenTrang(id) {
    // renderSkeleton / gọi api.js / renderEmptyState khi lỗi / render khi có dữ liệu
  }
})();
```

- IIFE ⇒ biến/hàm của trang không thành toàn cục, không đụng CORE và trang khác.
- Cần phần tử header (avatar, ô tìm kiếm) → `document.addEventListener("components:loaded", ...)`.
- Không `onclick="..."` trong HTML (hàm trong IIFE không gọi được từ đó) → `addEventListener`.

## 4. Trang cần đăng nhập / chỉ admin

```js
function initAccountPage() {
  if (!isLoggedIn()) {
    window.location.href = `login.html?next=${encodeURIComponent(location.pathname + location.search)}`;
    return;
  }
  // ...
}
```
Trang admin: kiểm tra `getAuthSession()?.user.role` **chỉ để điều hướng/ẩn giao diện**; mọi request `/admin/*` backend phải tự kiểm role.
Chi tiết: [07_backend_auth_skill.md](07_backend_auth_skill.md).

## 5. Thêm link vào menu

- Menu "Thêm ▾": thêm một phần tử vào `items` của `id: "nav-more"` trong `renderMenuDropdowns()` (`main.js`, CORE — báo nhóm):
  ```js
  { url: "animation.html", icon: "fa-solid fa-dragon", text: "Phim hoạt hình" },
  ```
- Menu chính: thêm `<div class="menu-item"><a href="...">...</a></div>` vào `components/header.html` (CORE).
  Kiểm tra lại header ở 1250px (không tràn) và mobile (menu trượt).

## 6. AI Verification Checklist

- [ ] Trang danh sách phim → dùng `catalog.js`, không viết JS mới.
- [ ] HTML ở gốc, đủ head chuẩn (title, description, favicon), placeholder header/footer, 5 script CORE đúng thứ tự.
- [ ] JS trang bọc IIFE; không `fetch(`; không tên hàm trùng `core_registry.md`.
- [ ] Có trạng thái đang tải / rỗng / lỗi / thiếu tham số URL (dùng `renderSkeleton`, `renderEmptyState`).
- [ ] Mọi dữ liệu ngoài vào `innerHTML` qua `escapeHtml`.
- [ ] CSS trong `css/<trang>.css`, selector có tiền tố `.<trang>-page`; không `style=""`.
- [ ] Test theo [06_kiem_thu_thu_cong_skill.md](06_kiem_thu_thu_cong_skill.md) + Scenario của US.
- [ ] Cập nhật [01_tong_quan_du_an.md](../guides/01_tong_quan_du_an.md) và bảng CORE/PAGE trong `AGENTS.md`.
