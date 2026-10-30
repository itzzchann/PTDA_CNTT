# 08 — Kế hoạch tuần 30/10 → 03/11/2026: hoàn thiện trọn V1 + mở đầu V2

> Kế hoạch cho **3 người: Lead, DEV-1, DEV-2** (cùng vai như [07 §3](07_lo_trinh_va_backlog.md#3-kế-hoạch-v2--phân-công-3-người)).
> Lập ngày **30/10/2026**, sau khi **đối chiếu từng tiêu chí chấp nhận (Bảng 3 backlog) với code thật** và dữ liệu thật của phimapi.
> Kế hoạch này **thay cho phần "Ngày 0" và "Chặng 1"** ở 07 §3.2 trong tuần này. Lịch Chặng 2, Chặng 3 giữ nguyên, Lead dời ngày sau khi tuần này xong.

---

## 0. Đọc trong 2 phút

- **Mỗi người chỉ có 1 nhánh Git mang tên mình** và làm **mọi việc** của mình trên nhánh đó (§2). Không tạo `feat/...`, `fix/...` trong tuần này.
- **V1** = các US thuộc **Sprint 1–3** trong Product Backlog (29 US). Đa số đã xong. Qua kiểm code còn **6 US chưa đạt đủ Scenario**:
  US-14, US-17, US-34, US-36, US-37, US-48. Còn **US-33** cần chạy thử trên trình duyệt để xác nhận.
- **Quyết định của PO ngày 30/10** (§1.3): xóa **Rổ Bóng**, **Tải ứng dụng** (hệ thống không có). **Giữ** icon mạng xã hội, trỏ tới trang chủ từng mạng.
  Đăng nhập V2 có **2 cách: tài khoản tự tạo, hoặc Google**.
- Việc V1 còn lại ít, nên tuần này **thêm việc V2 không phụ thuộc người khác**:
  - **DEV-2**: lưu và phát tiếp đúng **giây** đang xem (US-52, US-53), giữ cài đặt trình phát (US-19 Sc2). Làm thuần frontend, xong trọn được.
  - **DEV-1**: trang `login.html`: form đăng nhập / đăng ký + nút **Đăng nhập bằng Google** (US-18, phần giao diện).
  - **Lead**: backend `server/` + đăng ký / đăng nhập bằng mật khẩu và bằng Google.
- **Không ai phải chờ ai**: mỗi người **sở hữu riêng một nhóm file** (§2). Không có file nào hai người cùng sửa trong tuần này.
- Cuối tuần (Ngày 5): kiểm hồi quy đủ 29 US V1 → merge `develop` → `main`, gắn tag **`v1.1.0`** (V1 hoàn chỉnh).

**Lịch** (đánh số theo ngày làm việc. Nếu nhóm nghỉ cuối tuần thì cứ dời theo số ngày, thứ tự giữ nguyên):

| Ngày 1 | Ngày 2 | Ngày 3 | Ngày 4 | Ngày 5 |
|---|---|---|---|---|
| T6 30/10 | T7 31/10 | CN 01/11 | T2 02/11 | T3 03/11 |

---

## 1. Hiện trạng V1: kiểm code ngày 30/10

### 1.1 Chưa đạt, phải sửa

| US | Scenario không đạt | Bằng chứng trong code / dữ liệu | Ai |
|---|---|---|---|
| **US-14** Thông tin liên hệ | Sc2: bấm icon mạng xã hội phải **mở thẻ mới**. Sc3: phải có **link danh mục** (Phim lẻ...) ở cuối trang | `components/footer.html`: 7 icon mạng xã hội `href="#"`, không mở thẻ mới, hàng Hỏi-Đáp / Chính sách... đều `#`, hàng "Dongphim, Ghienphim..." là tên web khác, không có link Phim Lẻ / Phim Bộ | Lead (file CORE) |
| **US-17** Thẻ phim | Sc3: phim bộ hiện **số tập**, phim lẻ hiện **chất lượng** | ① Nhóm "Phim mới" ở trang chủ gọi `/danh-sach/phim-moi-cap-nhat`. Endpoint này **không trả** `episode_current`, `quality`, `type` → mọi thẻ đều hiện chữ "HD" mặc định. Bản `/danh-sach/phim-moi-cap-nhat-v3` thì có đủ (đã thử). ② `createMovieCard` ưu tiên `episode_current`, nên phim lẻ hiện **"Full"** thay vì "FHD" | Lead (file CORE) |
| **US-34** Thông tin chung | Sc2: thiếu thông tin thì hiện "Đang cập nhật" | `js/detail.js`: `movie.quality \|\| "HD"`. Phim thiếu chất lượng vẫn hiện "HD" | DEV-1 |
| **US-36** Diễn viên, đạo diễn | Sc2: phim có ảnh diễn viên thì **hiện ảnh kèm tên** ở trang chi tiết | `detail.html` chỉ có dòng chữ "Diễn viên: ...". Ảnh diễn viên mới chỉ có ở `watch.html` | DEV-1 |
| **US-37** Chọn tập | Sc3: phim lẻ **chỉ có 1 nút "Xem phim"** | `renderEpisodes()` chỉ gộp thành "Xem phim" khi có đúng 1 máy chủ và 1 tập. Phim lẻ có 2 máy chủ (Vietsub + Thuyết minh) sẽ hiện 2 nút "Full" | DEV-1 |
| **US-48** Chuyển giữa các phần | Sc1: phim có nhiều phần phải **thấy đủ** mục chọn phần (và không hiện khi chỉ có 1 phần) | Đã chạy thử thuật toán `renderSeasons()` với dữ liệu thật: ① tên có thêm tên gốc trong ngoặc, ví dụ `"Nhiệm Vụ: Gia Đình Yozakura (Phần 2) (Yozakura-san…)"`, thì **không tìm ra phần nào**; ② không nhận chữ **"Mùa 2"**; ③ so khớp bằng `includes` nên ghép nhầm "Thế Giới **Ma**" với "Thế Giới **Ma Quái** (Phần 2)"; ④ phim chỉ có 1 phần vẫn hiện nút "Phần 1" | DEV-2 |

### 1.2 Có code, cần chạy trên trình duyệt để xác nhận

| US | Kiểm gì | Ai |
|---|---|---|
| US-33 | 3 Scenario: tên + ảnh bìa + ảnh nền; slug sai thì báo không tìm thấy; F5 / mở link ở thẻ mới vẫn đúng phim | DEV-1 |
| US-21 Sc3 | Chặn `phimapi.com` (DevTools → Network → Block request domain) → hero phải có **ảnh nền mặc định** (`home-background.jpg`), không để trống | DEV-1 |
| US-40 Sc3 | Phát được trên Chrome + Firefox (+ Safari nếu có máy Mac/iPhone) | DEV-2 |
| US-43 Sc3 (V2, kiểm luôn) | Phim chỉ có 1 mức chất lượng → không hiện nút chọn chất lượng | DEV-2 |
| US-11 Sc3 (V2, kiểm luôn) | Chặn phimapi → menu Thể loại vẫn có danh sách | Lead |

Các US V1 còn lại đã ✅ trong [07 §2](07_lo_trinh_va_backlog.md#2-trạng-thái-user-story). Ngày 5 vẫn chạy hồi quy toàn bộ (§7).

### 1.3 Quyết định của PO (30/10) và cách xử lý

| Quyết định | Xử lý trong code | Ảnh hưởng tới backlog |
|---|---|---|
| **Xóa "Rổ Bóng"** (menu có nhãn NEW) và **"Tải ứng dụng RoPhim"** (header). Hai thứ này chỉ để trang trí | Xóa hẳn khỏi `header.html`, xóa phần xử lý trong `main.js`, xóa CSS không còn dùng. **Không** thay bằng gì khác: header gọn hơn, ô tìm kiếm rộng hơn | **US-20** (báo tính năng chưa sẵn sàng) không còn đối tượng nào để áp dụng → chuyển trạng thái **"Bỏ, ngoài phạm vi"**. PO tự cập nhật file backlog |
| **Giữ mạng xã hội cho đẹp** (nhóm chưa có kênh riêng) | 7 icon giữ nguyên, `href` trỏ tới **trang chủ** của từng mạng (telegram.org, facebook.com...), mở thẻ mới. Có kênh thật thì chỉ đổi `href`. Bỏ hàng "Dongphim, Ghienphim, Motphim, Subnhanh" (tên các web khác) và hàng Hỏi-Đáp / Chính sách... đang để `#` (không có trang thật), thay bằng **1 hàng link danh mục** | **US-14** giữ nguyên tiêu chí gốc (Sc1 bản quyền + mạng xã hội, Sc2 mở thẻ mới, Sc3 link danh mục) |
| **Đăng nhập 2 cách**: tài khoản tự tạo (tên đăng nhập / email + mật khẩu) **hoặc Google** | Backend thêm `POST /auth/google`. Frontend dùng **Google Identity Services** (nút "Đăng nhập bằng Google" chính chủ của Google). Chi tiết ở L4, D4 | **US-18** thêm Scenario: bấm "Đăng nhập bằng Google" → chọn tài khoản → đăng nhập thành công, menu hiện tên + ảnh Google. PO tự thêm vào backlog |

Nguyên tắc chung cho phần trang trí: **thứ gì không có thật thì xóa**, không để link `#` hay thông báo "đang cập nhật". Người chấm hay người dùng bấm vào mà không có gì xảy ra sẽ thấy web chưa xong, tệ hơn là không có.

---

## 2. Phân công, nhánh Git & quyền sở hữu file

| | **Lead** | **DEV-1** | **DEV-2** |
|---|---|---|---|
| **Nhánh** (tên không dấu, chữ thường) | `<ten-lead>` (dùng cho cả frontend lẫn `server/`) | `<ten-dev1>` | `<ten-dev2>` |
| **V1** | US-14, US-17, dọn Rổ Bóng / Tải ứng dụng, kiểm US-11 | US-34, US-36, US-37, kiểm US-33 + US-21 | US-48, kiểm US-40 + US-43 |
| **V2** | Repo `server/`: khung + `/api/health` + 7 bảng + `/auth/register\|login\|google\|me\|logout` | `login.html` + `js/login.js` + `css/login.css`: form + nút Google (US-18, phần giao diện) | US-52 (Sc1–3), US-53 (Sc1–3), US-19 Sc2 |
| **Chỉ người này được sửa** | `js/config.js`, `js/utils.js`, `js/main.js`, `js/api.js`, `components/*.html`, `css/style.css`, `css/components.css`, `docs/**`, `CONTRIBUTING.md`, `AGENTS.md`, toàn bộ thư mục `server/` | `detail.html`, `js/detail.js`, `css/detail.css`, `login.html`, `js/login.js`, `css/login.css` | `watch.html`, `js/watch.js`, `css/watch.css`, `history.html`, `js/history.js` |
| **Hồi quy Ngày 5** | Epic 1.1, 1.2 | Epic 2.1, 2.2, 2.3 | Epic 3.1, 3.2 + US-52, 53, 19 |

### 2.1 Quy trình "1 người 1 nhánh" (làm theo đúng thứ tự)

**Lần đầu (Ngày 1, sau khi Lead báo "develop đã sẵn sàng"):**
```bash
git checkout develop
git pull origin develop
git checkout -b <ten-cua-ban>          # ví dụ: nguyenvana
git push -u origin <ten-cua-ban>
```

**Mỗi sáng, trước khi code:**
```bash
git checkout <ten-cua-ban>
git pull origin develop                # lấy code mới của cả nhóm vào nhánh mình
```
Có conflict thì **dừng lại, nhắn Lead**, đừng tự xóa đoạn code của người khác.

**Xong mỗi việc nhỏ** (mỗi mục D1, D2, W1... trong file này là 1 commit hoặc vài commit):
```bash
git add <file-vua-sua>                  # chỉ add file của mình, không dùng "git add ." nếu chưa xem git status
git commit -m "fix(detail): single play button for movies (US-37)"
git push
```

**Gửi bài cho Lead duyệt: mở Pull Request `<ten-cua-ban>` → `develop`**
- Mở PR **cuối mỗi ngày** có việc xong (không cần chờ xong hết tuần). Mô tả PR liệt kê các US đã làm + Pass/Fail từng Scenario.
- PR đang mở mà bạn push thêm commit → commit **tự vào PR đó**. Không sao, cứ làm tiếp.
- Lead merge bằng **"Create a merge commit"**, **không dùng "Squash and merge"**. Squash làm nhánh của bạn lệch lịch sử với `develop` và lần sau sẽ conflict.
- Sau khi PR được merge: **không xóa nhánh**. Sáng hôm sau `git pull origin develop` như bình thường, rồi làm tiếp trên nhánh đó.

### 2.2 Luật trong tuần

1. **Không sửa file của người khác.** Cần đổi gì ở file CORE thì nhắn Lead, kèm đoạn code muốn đổi.
2. **Bảng trạng thái ở `07_lo_trinh_va_backlog.md` chỉ Lead cập nhật** (Ngày 5). DEV ghi Pass/Fail **trong mô tả PR**.
3. Commit theo Conventional Commits tiếng Anh, có mã US, mỗi commit một việc (để Lead đọc lịch sử là biết làm gì).
4. Lead review PR vào **12h và 21h**. DEV-1 và DEV-2 **review chéo** PR của nhau trước. Lead approve cuối.
5. Bị chặn quá 2 giờ thì báo nhóm ngay. Theo kế hoạch này thì không có chỗ nào phải chờ. Nếu có, nghĩa là kế hoạch sai, cần sửa kế hoạch.
6. AI agent dùng trong nhóm phải đọc [AGENTS.md](../../AGENTS.md). Nếu không mở được trình duyệt thì ghi **"chưa kiểm"**, không ghi "đã test".

---

## 3. Ngày 1, buổi sáng: chuẩn bị (ai làm việc người nấy, song song)

### Lead (≈ 1,5 giờ, **làm đầu tiên**)

Hai phần dưới đây đang có code / tài liệu **chưa vào `develop`**. Các dev phải tạo nhánh **sau** khi chúng vào `develop`, nếu không sẽ conflict ở `detail.js`, `watch.js`.

1. Nhánh `fix/error-handling-clean` (commit `b491244`: thông báo lỗi + nút Thử lại ở detail/watch) **chưa có trên GitHub**:
   ```bash
   git checkout fix/error-handling-clean
   git push -u origin fix/error-handling-clean
   ```
   Tạo PR vào `develop` → tự review → merge.
2. Tạo nhánh `<ten-lead>` từ `develop`. Commit tài liệu đang sửa dở (AGENTS.md, CONTRIBUTING.md, 04, 06, 07, skill 05, skill 08) + file này.
   CONTRIBUTING.md đã được viết lại theo quy trình "1 người 1 nhánh" (§0, §1.1, §3, §4.1, §5.1, §8): đọc lại một lượt trước khi commit.
   PR → merge. **Không** commit `product_backlog.xlsx` / `product_roadmap.xlsx`.
3. Trên GitHub → Settings → General → Pull Requests: **tắt "Allow squash merging"** và "Allow rebase merging", chỉ để "Allow merge commits" (để không ai lỡ tay chọn squash).
4. Nhắn nhóm: **"develop đã sẵn sàng"**.

### DEV-1 và DEV-2 (trong lúc Lead làm, chưa cần nhánh)

1. Cài đặt theo [CONTRIBUTING §2](../../CONTRIBUTING.md#2-cài-đặt-lần-đầu-làm-1-lần) nếu chưa làm.
2. Đọc: `AGENTS.md` → [02_kien_truc.md](02_kien_truc.md) → [core_registry.md](../specs/core_registry.md) → file này.
3. Mở web bằng Live Server, chạy thử các Scenario ở **§1.2** thuộc phần mình, ghi Pass/Fail ra giấy hoặc file nháp (để đưa vào PR sau).
4. Khi Lead báo "develop đã sẵn sàng" → tạo nhánh tên mình theo §2.1.

---

## 4. Lead: chi tiết từng việc

Tất cả việc (frontend lẫn backend trong `server/`) làm trên cùng nhánh `<ten-lead>`.

### L1. US-17: thẻ phim hiện đúng số tập / chất lượng (Ngày 1) · CORE

**File:** `js/config.js`, `js/utils.js`, `docs/specs/api_spec.md`, `docs/specs/core_registry.md`

1. `js/config.js` → `API_CONFIG.ENDPOINTS.MOVIES_LIST`:
   ```js
   MOVIES_LIST: "/danh-sach/phim-moi-cap-nhat-v3",
   ```
   (v3 trả cùng dạng `{ items, pagination }` như bản cũ, thêm `type`, `episode_current`, `quality`, `lang`. `poster_url` đã là URL đầy đủ, `getImageUrl()` xử lý được.)
2. `js/utils.js` → trong `createMovieCard`, thay dòng `const badge = ...`:
   ```js
   // Phim lẻ hiện chất lượng (FHD), phim bộ hiện tập đã phát hành ("Tập 7", "Hoàn Tất (8/8)") — US-17 Sc3.
   const isSingle = movie.type === "single" || movie.episode_current === "Full";
   const badge = escapeHtml(
     (isSingle ? movie.quality : movie.episode_current) || movie.quality || "HD",
   );
   ```
   Không đổi tên hàm, tham số hay kiểu trả về.
3. Cập nhật `api_spec.md` (endpoint mới) và mô tả `createMovieCard` trong `core_registry.md`.
4. **Kiểm thử** (vì sửa CORE, phải test ít nhất 3 trang):
   - `index.html`: nhóm Phim mới có thẻ "Tập 7" / "Hoàn Tất (8/8)" / "FHD", không còn toàn "HD". Hero vẫn hiện phim.
   - `movies.html`: thẻ hiện "FHD" (không còn "Full"). `series.html`: thẻ hiện "Tập N".
   - `search.html?q=mai`, `detail.html` (khối "Có thể bạn sẽ thích"), `watch.html` (đề xuất): thẻ không vỡ.
   - Console không có lỗi đỏ.
5. Commit `fix(card): show episode count for series and quality for single movies (US-17)`.

> Ghi chú cho PO: phimapi **không trả tổng số tập** trong danh sách, nên thẻ hiện "Tập 7" hoặc "Hoàn Tất (8/8)", chưa được "Tập 12/24" như ví dụ trong Testing. Lead chốt với nhóm rằng như vậy là đạt Sc3, rồi ghi vào 07.

### L2. Dọn header + footer: Rổ Bóng, Tải ứng dụng, link giả, US-14 (Ngày 1) · CORE

**File:** `components/header.html`, `components/footer.html`, `js/main.js`, `css/style.css`, docs

1. `components/header.html`:
   - Xóa cả khối `<div class="menu-item">` chứa `#nav-basketball` ("Rổ Bóng", nhãn NEW).
   - Xóa cả khối `<div class="app-download">...</div>` (gồm SVG).
   - **Giữ** `<div class="flex-grow-1"></div>` để khối "Thành viên" vẫn nằm bên phải.
2. `js/main.js` → `setupComingSoonFeatures()`: xóa phần `#nav-basketball` và phần `.app-download-button`. **Giữ** phần `.button-login` (toast "Vui lòng đăng nhập...") cho tới L5.
   Hàm chỉ còn xử lý nút Thành viên → đổi tên thành `setupMemberButton()` và sửa lời gọi trong `initializeApp()`.
   (Hàm này không được trang nào khác gọi và không nằm trong `module.exports`. Lead vẫn grep lại trước khi đổi tên.)
3. `components/footer.html`:
   - 7 icon mạng xã hội: `href` = trang chủ của mạng đó, thêm `target="_blank" rel="noopener noreferrer" aria-label="<Tên mạng>"`.
   - Thay hàng `Hỏi-Đáp / Chính sách...` (đều `#`) bằng link danh mục:
     ```html
     <div class="footer-menu">
       <a href="movies.html">Phim Lẻ</a>
       <a href="series.html">Phim Bộ</a>
       <a href="favorites.html">Phim yêu thích</a>
       <a href="history.html">Lịch sử xem</a>
     </div>
     ```
   - Xóa hàng `footer-menu sub-links` (Dongphim, Ghienphim, Motphim, Subnhanh).
4. `css/style.css`: xóa các rule không còn phần tử nào dùng: `.new`, `.menu-item .highlight`, `.app-download-button`, `.app-download-button:hover .text strong`, `.inc-icon svg`, `.text.text-light` (+ `span`, `strong`), `.app-download` trong media query `max-width: 1400px`, `.footer-menu.sub-links`.
   Trước khi xóa mỗi rule, grep class đó trong `*.html`, `js/`, `components/` để chắc không còn chỗ nào dùng.
5. Docs: `core_registry.md` (bỏ hook `.app-download-button`, `#nav-basketball`, ghi tên hàm mới), `skills/05_sua_core_an_toan_skill.md` dòng 76 (tên hàm cũ), `skills/06_kiem_thu_thu_cong_skill.md` dòng "Tải ứng dụng, Rổ Bóng → toast", `01_tong_quan_du_an.md` §3–§4, `05_no_ky_thuat.md` §3 (dòng footer `#`).
6. **Kiểm thử** trên `index.html`, `detail.html`, `watch.html`, `404.html` ở 375px / 768px / ≥ 1200px:
   - Header không còn Rổ Bóng / Tải ứng dụng, không lệch, không cuộn ngang. Menu mobile vẫn mở / đóng.
   - US-14: thấy bản quyền + mạng xã hội; bấm icon Telegram → mở thẻ mới, trang cũ vẫn còn; bấm "Phim Lẻ" → đúng trang.
   - Console không có lỗi đỏ (đặc biệt lỗi `null` do JS tìm phần tử đã xóa).
7. Commit (2 commit riêng):
   `refactor(header): remove placeholder basketball and app download entries`
   `fix(footer): open social links in new tab and replace placeholder links with categories (US-14)`

### L3. Cấu hình Google + review (Ngày 1 chiều)

1. **Tạo OAuth Client ID** (15 phút): [Google Cloud Console](https://console.cloud.google.com/) → tạo project `rophim` → *APIs & Services* → *OAuth consent screen* (External, tên app RoPhim, email hỗ trợ) → *Credentials* → *Create credentials* → *OAuth client ID* → loại **Web application**.
   *Authorized JavaScript origins*: `http://localhost:5500`, `http://127.0.0.1:5500` (thêm domain thật khi deploy). Không cần redirect URI.
   Chỉ lấy **Client ID**. **Client secret không dùng ở đâu cả**, không dán vào code hay chat nhóm.
2. `js/config.js` → `BACKEND_CONFIG`: thêm
   ```js
   // Client ID của Google là thông tin công khai (Google thiết kế để nằm trong trang web), không phải bí mật.
   GOOGLE_CLIENT_ID: "<client-id>.apps.googleusercontent.com",
   ```
   và `GOOGLE_LOGIN: "/auth/google",` trong `ENDPOINTS` (ngay dưới `LOGIN`). Cập nhật `core_registry.md`.
   Commit `feat(config): add Google sign-in client id and endpoint (US-18)`.
3. Mở **PR Ngày 1** (L1 + L2 + L3) → merge trước 21h để DEV-1 có `GOOGLE_CLIENT_ID` từ Ngày 2 (DEV-1 tới Ngày 4 mới cần).
4. Review PR của DEV-1, DEV-2 lúc 21h.

### L4. V2: thư mục `server/` + đăng nhập mật khẩu & Google (Ngày 2 → Ngày 4)

Làm theo [skill 08](../skills/08_backend_node_skill.md) và [hợp đồng §3.1](../specs/backend_api_contract.md). Việc này **không ai chờ** trong tuần (DEV-1 làm `login.html` bằng `fetchBackend` và tự xử lý được trường hợp chưa có backend).

| Ngày | Bước | Xong khi |
|---|---|---|
| 2 (sáng) | **Hợp đồng trước:** sửa `docs/specs/backend_api_contract.md`: thêm `POST /auth/google` `{ credential }` → `200 { data: { token, user } }`, lỗi `401 GOOGLE_TOKEN_INVALID`, `401 GOOGLE_EMAIL_NOT_VERIFIED`, `403 ACCOUNT_BANNED`. §5 lược đồ: `users.password_hash` **cho phép NULL** (tài khoản chỉ dùng Google), thêm `google_id TEXT UNIQUE NULL`. Commit vào nhánh `<ten-lead>` | DEV-1 đọc được hợp đồng mới khi tới D4 |
| 2 | Tạo thư mục `server/` ở gốc repo (cạnh `index.html`). Cấu trúc thư mục đúng skill 08 §1. `package.json` + các gói ở §2 + **`google-auth-library`**. `.env.example` thêm `GOOGLE_CLIENT_ID=`, `.gitignore`, README cách chạy local. `src/app.js` (helmet, cors theo `CORS_ORIGINS`, json, error handler), `GET /api/health` → `{ data: { status: "ok" } }`. **Tạo sẵn mọi file route rỗng và đăng ký trong `app.js`**, `admin.routes.js` chia 3 khối có comment *Lead / DEV-1 / DEV-2* | `npm run dev` → `curl localhost:3000/api/health` trả `ok` |
| 3 | Migration **đủ 7 bảng** theo hợp đồng §5 (đã có `google_id`, `password_hash` NULL). `db.js`, `errors.js`. Script seed super admin từ `ADMIN_EMAIL` / `ADMIN_INITIAL_PASSWORD` | `npm run migrate` chạy sạch trên DB mới (Neon hoặc local) |
| 4 | **Mật khẩu:** `POST /auth/register` (zod: username, email, password ≥ 8; trùng → `409`), `POST /auth/login` (`login` = username hoặc email; sai, **hoặc tài khoản chỉ có Google** (`password_hash` NULL) → `401 INVALID_CREDENTIALS` "Tên đăng nhập hoặc mật khẩu không chính xác"). **Google:** `POST /auth/google` (§4.1). **Chung:** `GET /auth/me`, `POST /auth/logout`, middleware `requireAuth` (đọc lại user từ DB mỗi request, bị khóa → `403 ACCOUNT_BANNED`), `optionalAuth`, `requireRole`. Rate limit cho login / register / google. bcrypt cost 10–12 | Chạy được các lệnh `curl` ở §4.2, trả đúng mã. Đăng nhập Google thật từ `login.html` của DEV-1 chạy local |

#### 4.1 Logic `POST /auth/google`
```js
// services/auth.service.js
const { OAuth2Client } = require("google-auth-library");
const googleClient = new OAuth2Client(config.GOOGLE_CLIENT_ID);

async function loginWithGoogle(credential) {
  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: config.GOOGLE_CLIENT_ID });
    payload = ticket.getPayload();          // { sub, email, email_verified, name, picture }
  } catch {
    throw new AppError(401, "GOOGLE_TOKEN_INVALID", "Đăng nhập Google không hợp lệ, vui lòng thử lại");
  }
  if (!payload.email_verified) {
    throw new AppError(401, "GOOGLE_EMAIL_NOT_VERIFIED", "Email Google chưa được xác minh");
  }

  // 1) Đã từng đăng nhập Google → 2) đã có tài khoản mật khẩu cùng email → gắn google_id → 3) tạo mới
  let user = await userService.findByGoogleId(payload.sub)
    || await userService.linkGoogleByEmail(payload.email, payload.sub);
  if (!user) {
    user = await userService.createGoogleUser({
      username: await userService.makeUniqueUsername(payload.email.split("@")[0]),
      email: payload.email,
      googleId: payload.sub,
      avatarUrl: payload.picture,
    });
  }
  if (user.status === "banned") throw new AppError(403, "ACCOUNT_BANNED", "Tài khoản đã bị khóa");
  return { token: signToken(user), user: toPublicUser(user) };
}
```
- **Luôn** xác minh `credential` ở backend bằng `verifyIdToken` + `audience`. Không bao giờ tin email / tên do frontend gửi lên.
- `toPublicUser` không trả `password_hash`, `google_id`.

#### 4.2 Lệnh curl để tự kiểm
```bash
curl -i -X POST localhost:3000/api/auth/register -H 'Content-Type: application/json' \
  -d '{"username":"test1","email":"t1@x.com","password":"12345678"}'          # 201 + token
curl -i -X POST localhost:3000/api/auth/register -H 'Content-Type: application/json' \
  -d '{"username":"test1","email":"t1@x.com","password":"12345678"}'          # 409
curl -i -X POST localhost:3000/api/auth/login -H 'Content-Type: application/json' \
  -d '{"login":"test1","password":"sai"}'                                     # 401 INVALID_CREDENTIALS
curl -i -X POST localhost:3000/api/auth/google -H 'Content-Type: application/json' \
  -d '{"credential":"abc"}'                                                   # 401 GOOGLE_TOKEN_INVALID
curl -i localhost:3000/api/auth/me -H "Authorization: Bearer <token>"         # 200 + user
curl -i localhost:3000/api/auth/me                                            # 401
```
Đăng nhập Google **thành công** chỉ test được bằng trình duyệt (cần credential thật từ nút Google). Làm cùng DEV-1 cuối Ngày 4 / Ngày 5.

### L5. Ngày 5: đóng V1

1. Chạy hồi quy phần của mình (§7).
2. Sau khi PR của DEV-1 (có `login.html`) đã merge: sửa `.button-login` trong `header.html` thành `href="login.html"`, xóa toast "Vui lòng đăng nhập..." trong `setupMemberButton()` (hoặc xóa hẳn hàm nếu không còn gì). Header hiện avatar / tên sau khi đăng nhập là việc của chặng sau.
3. Gom kết quả Pass/Fail từ PR của DEV-1, DEV-2 → cập nhật bảng [07 §2](07_lo_trinh_va_backlog.md#2-trạng-thái-user-story) (US-14, US-20 → "Bỏ", US-17, 33, 34, 36, 37, 48, 52, 53, 19, 11, 43) và [01 §4](01_tong_quan_du_an.md#4-chưa-có--đừng-tưởng-là-có).
4. Nếu cả 29 US V1 đều đạt: làm checklist [06_trien_khai.md §5](06_trien_khai.md#5-checklist-trước-khi-release-merge-develop--main), PR `develop` → `main`, tag `v1.1.0`.
5. Dời ngày Chặng 2, Chặng 3 trong 07 §3.2 theo tiến độ thực tế.

---

## 5. DEV-1: chi tiết từng việc

> Nhánh: `<ten-dev1>`. File của bạn: `detail.html`, `js/detail.js`, `css/detail.css`, `login.html`, `js/login.js`, `css/login.css`.
> Cần sửa file khác thì nhắn Lead, **không tự sửa**.

### D1. US-34 + US-37: thông tin chung và nút "Xem phim" cho phim lẻ (Ngày 1 chiều)

**File:** `js/detail.js`

1. **US-34 Sc2**: trong `renderMovie()`, mảng `chips`:
   ```js
   movie.quality || "Đang cập nhật",
   ```
   (thay cho `|| "HD"`).
2. **US-37 Sc3**: đổi `renderEpisodes(slug, episodes)` thành nhận cả `movie` (hàm nội bộ của trang, được phép đổi). Phim lẻ thì chỉ hiện 1 nút:
   ```js
   function renderEpisodes(movie, episodes) {
     const container = document.getElementById("episodeList");
     if (!container) return;

     const servers = episodes.filter((server) => server.server_data?.length > 0);

     // Phim lẻ hoặc chưa có tập: một nút "Xem phim" duy nhất (US-37 Sc3, US-38 Sc3); đổi máy chủ ở trang xem.
     if (servers.length === 0 || movie.type === "single") {
       const firstEp = servers[0]?.server_data?.[0];
       container.innerHTML = `<a class="episode-btn" href="${buildWatchUrl(movie.slug, firstEp ? firstEp.name : "1")}">Xem phim</a>`;
       return;
     }
     // ... giữ nguyên phần render theo máy chủ bên dưới
   }
   ```
   Sửa lời gọi: `renderEpisodes(movie, episodes);`.
3. **Kiểm thử**:
   - `detail.html?slug=the-gioi-ma` (phim lẻ): đúng 1 nút "Xem phim" → bấm → `watch.html` phát được.
   - Tìm một phim lẻ có **Vietsub + Thuyết minh** (gõ "thuyết minh" ở ô tìm kiếm, chọn phim lẻ) → vẫn chỉ 1 nút.
   - Một phim bộ: vẫn thấy danh sách tập theo từng máy chủ, bấm "Tập 3" → phát đúng tập 3 (US-37 Sc2).
   - Phim thiếu chất lượng (nếu tìm được) → chip "Đang cập nhật".
4. Commit `fix(detail): single play button for movies and placeholder for missing quality (US-34, US-37)` → push → **mở PR Ngày 1**.

### D2. US-36: ảnh diễn viên ở trang chi tiết (Ngày 2)

**File:** `detail.html`, `js/detail.js`, `css/detail.css`

1. `detail.html`: ngay **trước** `<hr class="detail-divider" />`, thêm:
   ```html
   <section class="detail-cast" id="castSection" hidden>
     <h2 class="section-title"><i class="fa-solid fa-users"></i> Diễn viên</h2>
     <div class="detail-cast-grid" id="castGrid"></div>
   </section>
   ```
2. `js/detail.js`:
   - Thêm hằng ở đầu IIFE: `const CAST_COUNT = 12;`
   - Trong `loadDetail()`, sau `loadRecommendations(movie);` gọi `loadCast(movie);`
   - Hàm mới (dùng lại `getMoviePeoples` có sẵn trong `api.js`, ảnh TMDB `w185`, ảnh lỗi → `APP_CONFIG.DEFAULT_AVATAR`):
   ```js
   // Ảnh + tên + vai diễn (US-36 Sc2). Không có ảnh → giữ dòng chữ "Diễn viên: ..." / "Đang cập nhật" (Sc1, Sc3).
   async function loadCast(movie) {
     const section = document.getElementById("castSection");
     const grid = document.getElementById("castGrid");
     if (!section || !grid) return;

     const res = await getMoviePeoples(movie.slug);
     const people = (res.data?.data?.peoples || [])
       .filter((person) => person.profile_path)
       .slice(0, CAST_COUNT);
     if (people.length === 0) return;

     grid.innerHTML = people
       .map(
         (person) => `
           <div class="detail-cast-item">
             <img src="${escapeHtml(`${API_CONFIG.TMDB_IMAGE_HOST}/w185${person.profile_path}`)}"
                  alt="${escapeHtml(person.name)}" loading="lazy"
                  onerror="this.onerror=null;this.src='${APP_CONFIG.DEFAULT_AVATAR}'">
             <span class="detail-cast-name">${escapeHtml(person.name)}</span>
             <small class="detail-cast-role">${escapeHtml(person.character || "")}</small>
           </div>`,
       )
       .join("");
     section.hidden = false;
   }
   ```
3. `css/detail.css`: selector bắt đầu bằng `.detail-page`, chỉ dùng biến trong `css/variables.css` (không thêm mã màu mới):
   ```css
   .detail-page .detail-cast-grid {
     display: grid;
     grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
     gap: 16px;
   }
   .detail-page .detail-cast-item { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 4px; }
   .detail-page .detail-cast-item img { width: 80px; height: 80px; border-radius: 50%; object-fit: cover; }
   ```
   Xem trước [skill 04](../skills/04_css_ui_skill.md) để lấy biến màu/khoảng cách cho tên và vai diễn.
4. **Kiểm thử** 3 Scenario US-36 (phim Âu Mỹ nổi tiếng thường có ảnh; phim ít người biết thì không có). Kiểm ở 375px, 768px, 1200px: không cuộn ngang. Console sạch.
5. Commit `feat(detail): show cast photos with names and roles (US-36)` → push → **mở PR Ngày 2** (hoặc commit tự vào PR Ngày 1 nếu PR đó chưa merge).

### D3. Kiểm US-33, US-21 Sc3 + hồi quy Epic 2 (Ngày 3)

1. Chạy 3 Scenario US-33 và US-21 Sc3. Fail ở file của bạn thì sửa ngay trên nhánh của bạn. Fail ở file CORE thì nhắn Lead kèm cách tái hiện.
2. Chạy toàn bộ Scenario của Epic 2.1, 2.2, 2.3 (§7). Ghi kết quả vào mô tả PR.

### D4. V2: trang đăng nhập / đăng ký + Google (Ngày 4 → Ngày 5)

**File:** `login.html`, `js/login.js`, `css/login.css` · **Đọc trước:** [skill 01](../skills/01_tao_trang_moi_skill.md), [skill 07 §3](../skills/07_backend_auth_skill.md), hợp đồng §3.1 (bản Lead sửa Ngày 2, có `/auth/google`)

1. **Khung trang**: copy từ `history.html`, giữ nguyên thứ tự `<script>` CORE, `header-placeholder`, `footer-placeholder`. Thêm `<meta name="robots" content="noindex">`, title `Đăng nhập | RoPhim`, `<main class="page-container login-page">`.
   Thêm script Google **chỉ ở trang này**, đặt trước `js/login.js`:
   ```html
   <script src="https://accounts.google.com/gsi/client" async defer></script>
   ```
2. **Giao diện** (từ trên xuống):
   - Nút **Đăng nhập bằng Google**: một `<div id="googleButton"></div>`. Google tự vẽ nút, **không tự vẽ nút giả**.
   - Đường kẻ chữ "hoặc".
   - 2 tab **Đăng nhập** / **Đăng ký** (`<button type="button">`, tab đang chọn có class `active`). Dùng `<form>` + `<label>`:
     - Đăng nhập: `login` (`autocomplete="username"`, nhãn "Tên đăng nhập hoặc email"), `password` (`autocomplete="current-password"`).
     - Đăng ký: `username`, `email` (`type="email"`), `password` + nhập lại (`autocomplete="new-password"`).
3. **`js/login.js`** (bọc IIFE):
   - **Form**: kiểm input trước khi gửi (trống, email sai dạng, mật khẩu < 8 ký tự, nhập lại không khớp) → báo lỗi ngay dưới ô bằng `textContent`. Gọi `fetchBackend(BACKEND_CONFIG.ENDPOINTS.LOGIN | REGISTER, { method: "POST", body })` như skill 07 §3. Khóa nút submit khi đang gửi.
   - **Google**:
     ```js
     // Script Google tải async → chờ window "load" mới có window.google.
     window.addEventListener("load", setupGoogleLogin);

     function setupGoogleLogin() {
       const box = document.getElementById("googleButton");
       if (!box) return;
       if (!BACKEND_CONFIG.GOOGLE_CLIENT_ID || !window.google?.accounts?.id) {
         box.hidden = true;                       // không tải được Google → chỉ còn form, trang không vỡ
         return;
       }
       google.accounts.id.initialize({
         client_id: BACKEND_CONFIG.GOOGLE_CLIENT_ID,
         callback: (response) => submitAuth(BACKEND_CONFIG.ENDPOINTS.GOOGLE_LOGIN, { credential: response.credential }),
       });
       google.accounts.id.renderButton(box, { theme: "filled_black", size: "large", text: "continue_with", locale: "vi" });
     }
     ```
   - **Một hàm `submitAuth(endpoint, body)` dùng chung** cho đăng nhập, đăng ký, Google, xử lý kết quả:
     | Kết quả | Hiển thị |
     |---|---|
     | `res.error === "BACKEND_NOT_CONFIGURED"` | "Hệ thống tài khoản đang được hoàn thiện, vui lòng quay lại sau" |
     | `401 INVALID_CREDENTIALS` | "Tên đăng nhập hoặc mật khẩu không chính xác" (US-18 Sc3) |
     | `409` | "Tên đăng nhập hoặc email đã được dùng" |
     | `401 GOOGLE_*`, `403 ACCOUNT_BANNED` | `res.error` (message tiếng Việt từ backend) |
     | Thành công | `saveAuthSession(res.data.data)`, toast "Xin chào <tên>", chuyển về `?next=` (chỉ nhận đường dẫn bắt đầu bằng `/`) hoặc `index.html` |
   - Không `console.log` mật khẩu, credential hay request.
4. **`css/login.css`**: mọi selector bắt đầu bằng `.login-page`. Responsive 375px trở lên. Nút Google căn giữa.
5. **Kiểm thử không cần backend:** mọi lỗi kiểm input hiện đúng; bấm gửi → "đang hoàn thiện"; nút Google hiện ra (cần mở bằng Live Server ở `localhost:5500` hoặc `127.0.0.1:5500`, **không** mở file trực tiếp); bấm Google, chọn tài khoản → "đang hoàn thiện"; Tab / Enter dùng được.
   **Khi Lead xong L4 (Ngày 4–5):** chạy `server/` ở máy mình, tạm đặt `BACKEND_CONFIG.BASE_URL = "http://localhost:3000/api"` (**không commit dòng này**). Thử: đăng ký → đăng nhập → sai mật khẩu → Google lần đầu (tạo tài khoản) → Google lần 2 (vào lại đúng tài khoản).
   Nối nút "Thành viên" trên header vào `login.html` là việc của Lead (L5). Bạn mở thẳng `login.html` để test.
6. Commit `feat(auth): add login page with password and Google sign-in (US-18)` → push → mở PR.

---

## 6. DEV-2: chi tiết từng việc

> Nhánh: `<ten-dev2>`. File của bạn: `watch.html`, `js/watch.js`, `css/watch.css`, `history.html`, `js/history.js`.
> Mọi việc làm nối tiếp trên cùng nhánh, mỗi việc ít nhất 1 commit riêng.

### W1. US-48: chọn phần phim (Ngày 1 chiều → Ngày 2 sáng)

**File:** `js/watch.js` (mục `renderSeasons`, `getSeasonNumber`), `watch.html`

1. Thay `getSeasonNumber` và thêm hàm lấy "tên gốc" của bộ phim:
   ```js
   const SEASON_PATTERN = /(?:Phần|Mùa|Season)\s*(\d+)/i;

   function getSeasonNumber(name) {
     const match = String(name).match(SEASON_PATTERN);
     return match ? parseInt(match[1], 10) : 1;
   }

   // "Nhiệm Vụ: Gia Đình Yozakura (Phần 2) (Yozakura-san…)" → "Nhiệm Vụ: Gia Đình Yozakura"
   function getSeriesBaseName(name) {
     return String(name)
       .replace(new RegExp(SEASON_PATTERN, "gi"), "")
       .split("(")[0]
       .replace(/[\s:–-]+$/, "")
       .trim();
   }
   ```
   (Hằng `SEASON_PATTERN` đặt cùng chỗ với các hằng khác ở đầu IIFE.)
2. Trong `renderSeasons()`:
   - `const baseName = getSeriesBaseName(movieName);`
   - Lọc kết quả tìm kiếm bằng **so khớp bằng nhau**, không dùng `includes`:
     ```js
     .filter((m) => getSeriesBaseName(m.name).toLowerCase() === baseName.toLowerCase())
     .forEach((m) => {
       const num = getSeasonNumber(m.name);
       if (!seasons.has(num)) seasons.set(num, m.slug);
     });
     ```
     Phim đang xem cũng phải có trong `seasons`: `seasons.set(currentSeasonNum, state.movie.slug)` trước khi lọc.
   - **Chỉ hiện mục chọn phần khi có từ 2 phần trở lên** (US-48 Sc1). Ít hơn thì ẩn `.season-selector` và `.divider-vertical` bên cạnh bằng thuộc tính `hidden`. Mặc định để `hidden` trong `watch.html`, để phim lẻ không bị nháy nút "Phần 1" lúc đang tải.
3. **Kiểm thử** (đã thử thuật toán với dữ liệu thật ngày 30/10):
   | Phim (gõ ô tìm kiếm) | Kỳ vọng |
   |---|---|
   | Chú Thuật Hồi Chiến (Phần 2) | Mục chọn có Phần 1, 2, 3. Chọn Phần 3 → sang đúng phim (Sc2) |
   | Thế Giới Ma | **Không** hiện mục chọn phần (trước đây ghép nhầm "Thế Giới Ma Quái") |
   | Thiên Quan Tứ Phúc (Mùa 2) | Không lỗi. Hiện mục chọn nếu phimapi có từ 2 mùa trở lên |
   | Một phim lẻ bất kỳ | Không hiện mục chọn phần |
   | Mở mục chọn rồi bấm ra ngoài | Mục chọn đóng (Sc3, đã có code) |
4. Commit `fix(watch): detect seasons by exact base name and hide selector for single-part movies (US-48)` → push → **mở PR** (cuối Ngày 1 nếu xong, không thì sáng Ngày 2).

### W2. Kiểm US-40 Sc3, US-43 Sc3 (Ngày 2)

Chạy và ghi Pass/Fail vào mô tả PR. Fail thì sửa trong `watch.js` ngay trên nhánh của bạn.

### W3. V2 US-52 + US-53: nhớ tập **và giây** đang xem, phát tiếp đúng chỗ (Ngày 2 chiều → Ngày 4)

**File:** `js/watch.js`, `js/history.js` · **Đọc trước:** [skill 03 §4](../skills/03_localstorage_skill.md)

Dùng lại `saveWatchHistory(movie, episode, progress)` có sẵn (tham số `progress` lâu nay luôn truyền `0`). **Không tạo key localStorage mới.**

1. **Đọc vị trí cũ TRƯỚC khi ghi đè.** Trong `loadMovie()`, dòng `saveWatchHistory(movie, state.episode, 0);` đang ghi `0` ngay khi mở trang. Đổi thành:
   ```js
   const previous = getStoredList(STORAGE_KEYS.WATCH_HISTORY).find((h) => h.slug === movie.slug);
   state.resumeAt =
     previous && String(previous.episode) === String(state.episode) ? Number(previous.progress) || 0 : 0;
   saveWatchHistory(movie, state.episode, state.resumeAt);
   ```
   Thêm `resumeAt: 0` vào object `state`. Giữ đoạn này **đúng chỗ dòng cũ** (sau `renderVideo()`): lúc đó `renderVideo()` đã đổi
   `state.episode` thành tên tập thật (kể cả khi `?ep=` là slug), nên so sánh mới đúng. Video tải metadata **sau** khi `loadMovie()` chạy xong,
   nên `state.resumeAt` luôn có giá trị trước khi bước 3 cần đến.
2. **Ghi giây đang xem**: gắn **một lần** trong `initWatchPage()` (thẻ `#hls-player` không bị tạo lại khi đổi tập. **Đừng** gắn trong `initCustomControls` vì hàm đó chạy lại mỗi lần đổi nguồn):
   ```js
   const video = document.getElementById("hls-player");
   const saveProgress = () => {
     if (!state.movie || !video || !video.duration) return;
     saveWatchHistory(state.movie, state.episode, Math.floor(video.currentTime));
   };
   video?.addEventListener("timeupdate", throttle(saveProgress, 5000));
   video?.addEventListener("pause", saveProgress);
   window.addEventListener("pagehide", saveProgress);
   ```
   `playEpisode()` (đổi tập) giữ `saveWatchHistory(..., 0)`, vì tập mới bắt đầu từ 0.
3. **Phát tiếp đúng giây (US-53 Sc1)**: sau khi video có metadata, nếu `state.resumeAt > 5` và còn cách cuối phim hơn 10 giây → `video.currentTime = state.resumeAt`, toast `"Tiếp tục xem từ 10:05"` (dùng hàm `formatTime` đã có trong `watch.js`). Đặt `state.resumeAt = 0` sau khi dùng, để đổi tập không bị nhảy giây. Gắn trong `renderVideo()` bằng `video.addEventListener("loadedmetadata", ..., { once: true })` cho cả nhánh hls.js và nhánh HLS gốc.
4. **Giới hạn đã biết**: khi phát bằng iframe dự phòng (`link_embed`) thì không đọc được thời gian. Lịch sử vẫn ghi đúng tập, giây = 0. Ghi giới hạn này vào mô tả PR, nhắn Lead thêm vào [05_no_ky_thuat.md](05_no_ky_thuat.md) §3.
5. `js/history.js`: dòng "Đang xem: Tập 3 · 30/10/2026" thêm thời điểm nếu `progress > 0`: `Đang xem: Tập 3 · 10:05 · 30/10/2026`. Viết một hàm định dạng nhỏ trong `history.js` (`formatTime` của `watch.js` nằm trong IIFE, không gọi được). Nút bấm poster giữ nguyên link `watch.html?slug=&ep=` (watch tự đọc giây từ lịch sử).
6. **Kiểm thử** đủ Scenario:
   - US-52 Sc1 / US-53 Sc1: xem tập 3 của một phim bộ đến khoảng phút 10 → đóng thẻ → mở `history.html` thấy "Tập 3 · 10:0x" → bấm → phát tiếp đúng tập 3 phút 10.
   - US-52 Sc2: xem lại một phim cũ trong lịch sử → phim lên đầu danh sách.
   - US-52 Sc3: trong DevTools Console chạy đoạn tạo 50 mục giả rồi xem phim thứ 51 → mục cũ nhất bị xóa, danh sách còn 50:
     ```js
     localStorage.setItem("rophim_watch_history", JSON.stringify(
       Array.from({ length: 50 }, (_, i) => ({ slug: `gia-${i}`, name: `Giả ${i}`, poster: "", episode: "1", progress: 0, watchedAt: new Date().toISOString() }))
     ));
     ```
   - US-53 Sc2, Sc3: xóa 1 phim, xóa hết → có thông báo trống.
   - Đổi tập giữa chừng → tập mới bắt đầu từ 0, không nhảy giây.
7. Commit `feat(watch): remember playback position and resume from history (US-52, US-53)` → push → mở PR.

### W4. V2 US-19 Sc2: giữ âm lượng, tắt đèn, tự chuyển tập (Ngày 4 → Ngày 5)

**File:** `js/watch.js` · **Đọc trước:** [skill 03 §3](../skills/03_localstorage_skill.md)

1. Thêm vào `watch.js` (chỉ trang này dùng nên để trong file trang):
   ```js
   const DEFAULT_PREFS = { volume: 1, lightsOff: false, autoNext: true };

   function getUserPrefs() {
     return { ...DEFAULT_PREFS, ...getFromStorage(STORAGE_KEYS.USER_PREFERENCES, {}) };
   }

   function setUserPref(name, value) {
     saveToStorage(STORAGE_KEYS.USER_PREFERENCES, { ...getUserPrefs(), [name]: value });
   }
   ```
2. Lưu khi đổi:
   - Âm lượng: trong `setVolume()` của `initCustomControls` → `setUserPref("volume", video.volume)`.
   - Tắt đèn: trong handler `#lights-btn` của `setupToolbar()` → `setUserPref("lightsOff", isOff)`.
   - Tự chuyển tập: `#auto-next-toggle` sự kiện `change` → `setUserPref("autoNext", toggle.checked)`.
3. Áp dụng khi mở trang: trong `initWatchPage()` đọc `getUserPrefs()`, đặt `video.volume`, `#auto-next-toggle.checked`, và nếu `lightsOff` thì bật class `lights-off` + đổi chữ nút như khi bấm.
4. Không đụng `clearAuthSession()`. Key `USER_PREFERENCES` là key riêng nên đăng xuất không xóa (đúng Sc2).
5. **Kiểm thử**: chỉnh âm lượng 30%, bật tắt đèn, tắt tự chuyển tập → F5 → vẫn giữ. Xóa key `rophim_auth_session` trong DevTools (giả lập đăng xuất) → vẫn giữ.
6. Commit `feat(watch): persist volume, lights and auto-next preferences (US-19)` → push → mở PR.

### W5. Hồi quy Epic 3 (Ngày 5)

Chạy toàn bộ Scenario của US-37 → US-49 (§7). Ghi kết quả vào mô tả PR cuối của bạn.

---

## 7. Hồi quy V1 (Ngày 5, sáng): ai chạy US nào

Chạy trên `develop` mới nhất, **cửa sổ ẩn danh**, 3 kích thước 375px / 768px / ≥ 1200px, theo Testing ở Bảng 3 và [skill 06](../skills/06_kiem_thu_thu_cong_skill.md).

| Người | US (Sprint 1–3) | Cộng thêm |
|---|---|---|
| Lead | US-10, 13, 14, 28, 30 (Epic 1.1, 1.2) | US-11, 15 + header/footer sau khi dọn + `404.html` |
| DEV-1 | US-21, 22, 23, 24, 25, 26, 27, 31, 32 (Epic 2.1, 2.2) + US-17, 33, 34, 35, 36, 39 (Epic 2.3) | Trang `login.html` |
| DEV-2 | US-37, 38, 40, 41, 44, 45, 46, 47, 48 (Epic 3) | US-42, 43, 49, 52, 53, 19 Sc2 |

Kết quả ghi theo mẫu (dán vào mô tả PR):
```
US-24 | Sc1 Pass | Sc2 Pass | Sc3 Fail – ngắt mạng vẫn hiện skeleton mãi (chụp màn hình)
```
Fail ở file của mình thì sửa ngay trong ngày. Fail ở file người khác thì nhắn người sở hữu (§2), **không tự sửa**.

---

## 8. Lịch tổng (một bảng)

| Ngày | Lead | DEV-1 | DEV-2 |
|---|---|---|---|
| **1** · 30/10 | Sáng: merge `fix/error-handling-clean` + tài liệu, sửa CONTRIBUTING, tắt squash merge → báo "develop sẵn sàng". Chiều: **L1** (US-17), **L2** (dọn header/footer, US-14), **L3** (Google Client ID). **PR** → merge trước 21h | Sáng: cài đặt, đọc docs, chạy §1.2, tạo nhánh. Chiều: **D1** (US-34, 37) → **PR** | Sáng: cài đặt, đọc docs, chạy §1.2, tạo nhánh. Chiều: **W1** (US-48) |
| **2** · 31/10 | Sửa hợp đồng (`/auth/google`). **L4**: khung `server/` + `/api/health`. Review 12h/21h | **D2** (US-36) → push / **PR** | Sáng: xong **W1** → **PR**. **W2**. Chiều: bắt đầu **W3** |
| **3** · 01/11 | **L4**: migration 7 bảng + seed admin. Kiểm US-11 | **D3**: kiểm US-33, US-21 + hồi quy Epic 2, sửa lỗi phát hiện | **W3** (ghi giây + phát tiếp) |
| **4** · 02/11 | **L4**: `/auth/register\|login\|google\|me\|logout` + middleware | **D4**: `login.html` (form + Google) | Xong **W3** → **PR**. Bắt đầu **W4** |
| **5** · 03/11 | Sáng: hồi quy (§7) + test Google cùng DEV-1. Chiều: **L5**: nối nút Thành viên, cập nhật 07, release `v1.1.0` | Sáng: hồi quy. Chiều: xong **D4** → **PR** | Sáng: **W4** → **PR**. Chiều: hồi quy **W5** |

**Đồng bộ 10 phút lúc 21h30 mỗi tối**: đã xong gì, mai làm gì, có bị chặn không.

---

## 9. Xong tuần khi

- [ ] Cả 29 US Sprint 1–3 đạt **mọi Scenario** . Hồi quy §7 không còn Fail.
- [ ] Header / footer không còn Rổ Bóng, Tải ứng dụng, link `#`; icon mạng xã hội mở thẻ mới.
- [ ] US-52, US-53 đạt 3/3 Scenario. US-19 Sc2 đạt. (V2)
- [ ] `login.html` có form + nút Google, báo lỗi đúng, không vỡ khi chưa có backend. (V2, phần giao diện US-18)
- [ ] `server/` chạy local: `/api/health`, đủ 7 bảng, `/auth/*` (cả Google) trả đúng mã. (V2, backend US-18)
- [ ] Mọi PR theo Definition of Done ở [AGENTS.md §5](../../AGENTS.md#5-definition-of-done): console sạch, không `console.log` debug, không chuỗi chưa escape, responsive 3 kích thước.
- [ ] Bảng 07 §2 đã cập nhật (US-20 → Bỏ). `main` có tag `v1.1.0`.

## 10. Rủi ro và xong sớm thì làm gì

| Tình huống | Làm gì |
|---|---|
| phimapi đổi / tắt endpoint `-v3` | Quay lại endpoint cũ. Ở `createMovieCard` vẫn ưu tiên `quality` cho phim lẻ. Báo PO rằng nhóm Phim mới không có số tập (giới hạn nguồn dữ liệu) |
| Hồi quy phát hiện nhiều lỗi ở file CORE | Lead ưu tiên sửa CORE trước, dời L4 (backend) sang tuần sau. V1 quan trọng hơn |
| Lead chưa kịp `/auth/*` | DEV-1 vẫn merge `login.html` (đã xử lý `BACKEND_NOT_CONFIGURED`). Chặng sau nối backend |
| Nút Google không hiện | Kiểm: đang mở qua Live Server đúng `localhost:5500` / `127.0.0.1:5500` (đã khai báo ở Google Console)? `GOOGLE_CLIENT_ID` đã merge vào `develop` và đã `git pull origin develop`? Console có lỗi `origin_mismatch`? |
| Conflict khi `git pull origin develop` | Dừng, nhắn Lead. Thường do lỡ sửa file của người khác (§2) |
| DEV xong sớm | Chỉ làm trong file của mình. DEV-1: review kỹ PR của DEV-2, viết sẵn kịch bản test US-18 (cả Google) cho ngày nối backend. DEV-2: US-57 Sc3 (chữ "Không có hình ảnh" → "Chưa có hình ảnh" trong `watch.js`), kiểm US-44 Sc3 với ô bình luận, US-45 Sc2–3 |
