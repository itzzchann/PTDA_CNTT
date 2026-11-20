# Quy tắc file CORE (base)

> File CORE = code mà **mọi trang** đều nạp. Sửa sai một dòng ở đây → hỏng toàn bộ web của **cả nhóm**,
> và vì không có compiler/test, lỗi thường chỉ lộ ra khi ai đó mở đúng trang bị hỏng.

## 1. Danh sách file CORE

| File | Mức | Lý do |
|---|---|---|
| `js/utils.js` | 🔴 | `escapeHtml`, `createMovieCard`, `renderEmptyState`, `extractMovieItems`... dùng ở 5–9 file |
| `js/main.js` | 🔴 | Chạy trên mọi trang: header, tìm kiếm, ♥ toàn cục, toast |
| `js/components.js` | 🔴 | Lỗi ở đây = mọi trang mất header/footer và `initializeApp` không chạy |
| `components/header.html`, `components/footer.html` | 🔴 | Hiện trên mọi trang; ID trong đó được `main.js` dùng |
| `css/style.css`, `css/components.css` | 🔴 | Style toàn cục; đổi một selector có thể vỡ layout mọi trang |
| `js/api.js` | 🔴 | `fetchAPI` / `fetchBackend` là cửa ngõ mọi request; thêm wrapper mới thì an toàn |
| `js/config.js` | 🟡 | Thêm hằng an toàn; đổi giá trị/tên hằng thì nguy hiểm |
| `css/variables.css` | 🟡 | Đổi giá trị token đổi màu cả web |
| `js/catalog.js` | 🟡 | File trang nhưng 4 trang dùng chung (movies, series, category, country) |

File **PAGE**: mọi `*.html` ở gốc (phần trong `<main>`), `js/<page>.js`, `css/<page>.css`.
Hợp đồng backend [backend_api_contract.md](../specs/backend_api_contract.md) cũng là "CORE" giữa 2 đội: đổi phải cả FE và BE đồng ý.

---

## 2. Ma trận: thay đổi nào được phép?

| Loại thay đổi | Ví dụ | Được không? | Thủ tục |
|---|---|---|---|
| **Thêm** hàm / hằng / CSS class **mới** | thêm `escapeHtml()`, thêm `ENDPOINTS.YEAR` | ✅ | Báo nhóm, cập nhật `core_registry.md` |
| Thêm **tham số tùy chọn có default** vào cuối | `renderSkeleton(gridId, count = 6, variant = "card")` | ⚠️ | Quy trình 4 bước (§3) |
| Sửa **lỗi bên trong** hàm, giữ nguyên input/output | sửa regex trong `createSlug` | ⚠️ | Quy trình 4 bước |
| Đổi **giá trị** hằng | `ITEMS_PER_PAGE: 24 → 30` | ⚠️ | Tìm mọi chỗ dùng, báo nhóm |
| Thêm `id`/class mới vào header/footer | thêm nút mới | ⚠️ | Không đổi id cũ |
| **Đổi tên** hàm / hằng / id / class đang dùng | `formatYear` → `formatMovieYear` | ❌ | Tạo cái mới, giữ cái cũ |
| **Đổi thứ tự / bỏ / thêm tham số bắt buộc** | `createMovieCard(movie)` → `createMovieCard(movie, options)` bắt buộc | ❌ | Dùng tham số tùy chọn |
| **Đổi kiểu trả về** | `fetchAPI` trả `data` thay vì `{success, data}` | ❌ | Tạo hàm mới |
| Đổi **cấu trúc HTML** do `createMovieCard`/`renderSkeleton`/`showToast` sinh ra | bỏ `.movie-poster`, bỏ `data-movie` | ❌ | Chỉ **thêm**, không bỏ/đổi |
| Đổi key / cấu trúc localStorage | đổi `poster` → `posterUrl` | ❌ | Dữ liệu người dùng thật bị hỏng |
| Xóa hàm "trông như không ai dùng" | xóa `formatQuality` | ❌ | Chỉ xóa sau khi `grep` cả repo **và** nhóm đồng ý |
| Bỏ `escapeHtml` ở chỗ đang có | "tên phim thì an toàn mà" | ❌ | Dữ liệu ngoài luôn escape |
| Format lại toàn bộ file CORE | Prettier cả `utils.js` | ❌ trong PR logic | PR riêng, báo trước |
| Đổi thứ tự `<script>`/`<link>` CORE | | ❌ | |
| Viết đè hàm CORE trong file trang | `function showToast(){}` trong `category.js` | ❌ **tuyệt đối** | Đặt tên khác |

---

## 3. Quy trình 4 bước khi SỬA hàm CORE có sẵn

**Bước 1 — Tìm mọi chỗ dùng**
```bash
grep -rnw "createMovieCard" --include=*.js --include=*.html .
```
Đối chiếu cột "Đang dùng ở" trong [core_registry.md](../specs/core_registry.md).

**Bước 2 — Sửa tương thích ngược**
```js
// ❌ Phá vỡ: mọi chỗ gọi renderSkeleton("id") cũ bị hỏng
function renderSkeleton(options) { ... }

// ✅ Tương thích: chỗ cũ vẫn chạy y hệt
function renderSkeleton(gridId, count = 6, variant = "card") { ... }
```
Hành vi khi **không truyền** tham số mới phải **giống hệt trước**.

**Bước 3 — Test mọi chỗ ở bước 1**, cộng tối thiểu: `index.html`, `detail.html`, `watch.html`, và 1 trang có phân trang.
Checklist: [06_kiem_thu_thu_cong_skill.md](../skills/06_kiem_thu_thu_cong_skill.md#2-hồi-quy-khi-sửa-core).

**Bước 4 — Commit riêng, ghi rõ**
```
refactor(utils): add optional variant param to renderSkeleton

- Default "card" keeps existing behavior
- Tested: index, movies, series, search, detail, watch, favorites
```

---

## 4. Khi nào code nên vào CORE, khi nào để ở trang?

```
Code này có được dùng ở ≥ 2 trang (hiện tại hoặc chắc chắn sắp tới)?
├── Không → để trong js/<page>.js. Xong.
└── Có
    ├── Là hằng số / URL / key?            → config.js
    ├── Là gọi API / backend?                → api.js (wrapper, không đụng DOM)
    ├── Là hàm thuần / storage / sinh HTML? → utils.js
    ├── Là hành vi header/footer/toàn trang? → main.js
    └── Là style?                            → components.css (component) / style.css (layout chung)
```

- **"Có thể sau này dùng lại" không phải lý do** để đưa vào CORE. Viết ở trang trước; khi trang thứ hai cần thì mới chuyển (và báo nhóm).
- Khi chuyển code từ trang lên CORE: trang cũ phải **xóa bản riêng** của nó trong cùng PR (tránh ghi đè im lặng — xem
  [02_kien_truc.md §2](../guides/02_kien_truc.md#2-mô-hình-module-kiểu-java--bằng-biến-toàn-cục)).

---

## 5. Hàm mới trong CORE — checklist

- [ ] Tên chưa tồn tại ở **bất kỳ** file JS nào (`grep -rnw "tenHam" js/`).
- [ ] Chỉ dùng thứ ở **file trước nó** trong chuỗi `config → utils → api → main` (không gọi ngược).
- [ ] Có default cho tham số tùy chọn; xử lý input `null`/`undefined`/mảng rỗng mà không throw.
- [ ] Đặt cạnh nhóm hàm cùng loại (vd hàm storage đặt gần `getFromStorage`).
- [ ] Thêm vào khối `module.exports` cuối file.
- [ ] Thêm 1 dòng JSDoc nếu chữ ký chưa tự giải thích (xem [coding_style.md](coding_style.md#3-javascript)).
- [ ] Cập nhật [core_registry.md](../specs/core_registry.md).
- [ ] Báo nhóm trong PR: "Thêm hàm CORE mới `xxx` — có thể dùng ở trang của bạn".

---

## 6. Dành cho AI agent

Khi task **không** nói rõ được sửa CORE mà bạn thấy cần sửa:
1. **Dừng.** Không sửa.
2. Trả lời: file + hàm cần sửa, loại thay đổi (theo bảng §2), lý do, các file bị ảnh hưởng (theo §3 bước 1).
3. Đề xuất phương án **không** đụng CORE nếu có (vd: viết hàm cục bộ trong file trang với tên khác).
4. Chờ người dùng duyệt.
