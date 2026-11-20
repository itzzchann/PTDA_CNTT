# 10 — Kế hoạch merge code V2: chuongvu + tiendung vào develop

> Ngày lập: **20/11/2026** (Lead). Mục tiêu: đưa code V2 của DEV-1 (`chuongvu`) và DEV-2 (`tiendung`) vào `develop`
> sao cho **khớp nhau và khớp với phần Lead đã có**, xong khâu hồi quy → release `v2.0.0`.
> Trạng thái merge dưới đây **đã mô phỏng bằng `git merge-tree`** trên máy — số file/conflict là kết quả thật, không đoán.
> Đối chiếu với kế hoạch [09_ke_hoach_tuan_cuoi_v2.md](09_ke_hoach_tuan_cuoi_v2.md) và backlog [07 §2](07_lo_trinh_va_backlog.md#2-trạng-thái-user-story).

---

## 0. Đọc trong 2 phút

- `develop` đã có **đủ phần Lead** (wrapper `js/api.js`, header đăng nhập, khung admin + tab Hệ thống/Bộ nhớ, BE `/auth/*` `/settings` `/admin/settings`, bảo trì, deploy Vercel).
- `chuongvu` đứng **trước `develop` đúng 1 commit** (toàn bộ việc DEV-1 gói trong commit `48ed76f`): US-54, 55, 56, 58, 61.
- `tiendung` đứng **trước `develop` đúng 2 commit**: US-50, 51 (đồng bộ) + US-63 (US-62 cũ gộp chung nhánh đã có trên develop).
- Merge **chươngvu trước → tiendung sau**: conflict duy nhất là `js/watch.js` (~6 dòng, giải bằng cách **giữ cả hai dòng**).
- Ngoài conflict, rà code thấy **3 lỗi thật phải sửa trong lúc merge** (§4) — không sửa thì đồng bộ yêu thích/lịch sử của tiendung **không chạy được** dù merge sạch.
- Sau khi 2 PR merge xong: **đủ 52 US có code** → chỉ còn hồi quy + release.

---

## 1. Hiện trạng nhánh (20/11/2026)

| Nhánh | Tip | So với `origin/develop` | Nội dung (đối chiếu US) | File chính |
|---|---|---|---|---|
| `develop` | `ac040a4` | — | **Lead**: wrapper `api.js` (23 hàm + `buildBackendPath`), header trạng thái đăng nhập, khung `admin.html` + tab Hệ thống/Bộ nhớ, BE `/settings` + `/admin/settings` + middleware bảo trì, deploy Vercel | `js/api.js`, `js/main.js`, `js/admin.js`, `server/src/routes/settings.routes.js`, `middlewares/maintenance.js` |
| `chuongvu` (DEV-1) | `48ed76f` | +1 / −0 | **US-54** đọc bình luận, **US-55** gửi bình luận + spoil, **US-56** chấm điểm 1–10, **US-58** lượt xem + Dashboard, **US-61** kiểm duyệt | BE: `movies.routes.js`, `comments.routes.js`, `admin.routes.js` (khối DEV-1), `services/comment|rating|stats.service.js`, `rate-limit.js` (`commentLimiter`). FE: `js/watch.js` (khu bình luận/đánh giá + `recordMovieView`), `js/admin.js` (tab Dashboard + Bình luận), `css/watch.css`, `css/admin.css` |
| `tiendung` (DEV-2) | `e3584f0` | +2 / −0 | **US-50/51** đồng bộ yêu thích + lịch sử lên máy chủ, **US-63** khóa/mở khóa thành viên | BE: `me.routes.js` (5 endpoint), `admin.routes.js` (khối DEV-2), `services/user.service.js`. FE: `js/favorites.js`, `js/history.js`, `js/watch.js` (`syncHistoryToServer`), `js/admin.js` (tab Thành viên), `css/admin.css` |
| `anhtu` | `c84a91f` | −0 / đã merge hết | Toàn bộ PR của Lead đã vào `develop` (PR #13–#16) | — |

Cả hai nhánh đều **basis đúng trên tip `develop`** (đã pull trước khi code) → lịch sử merge sạch, không phải rebase.

**Việc Lead đang để local chưa commit** (tìm thấy khi `git status`): script `server/src/scripts/reset-admin.js` + sửa `server/package.json` (thêm script `reset-admin`) + `server/.env.example` (2 biến `RESET_ADMIN_*`) → commit vào `anhtu` ở Bước 0 (§5).

---

## 2. Đối chiếu kế hoạch V2 ↔ code thật

Các US còn 🔒 ở bảng 07 §2, giờ nằm ở đâu:

| US | Kế hoạch giao | Code nằm ở | Ghi chú khớp hợp đồng |
|---|---|---|---|
| US-54/55/56 | DEV-1 | `chuongvu` | Endpoint + response **khớp** `backend_api_contract.md` §3.3 (`summary { average, total, myScore }` — BE trả `total`, FE đọc `total`, thống nhất) |
| US-58 | DEV-1 | `chuongvu` | `GET /admin/stats` trả đủ `totals / topViewed / topFavorited / recentActivity` — khớp §3.5 |
| US-61 | DEV-1 | `chuongvu` | `GET/PATCH/DELETE /admin/comments` đủ |
| US-50/51 | DEV-2 | `tiendung` | 5 endpoint `/me/*` khớp §3.2; **nhưng FE có 2 lỗi gọi API** → §4 |
| US-63 | DEV-2 | `tiendung` | `CANNOT_BAN_SELF`, chặn khóa `super_admin`, BE trả `403 ACCOUNT_BANNED`; FE đã có bản vá `api.js` tự đăng xuất khi bị ban (`403` + code) |
| US-59/60/62 | Lead | `develop` | Đã có tab Hệ thống/Bộ nhớ, middleware bảo trì |
| US-18 Sc4, US-19 | Lead + DEV-2 | `develop` | Header + hộp thoại mời đăng nhập + `auth:expired` |

**Sau 2 PR bên dưới, toàn bộ 52 US đã có code trên `develop`.** Việc còn lại của V2 chỉ là hồi quy (§6) + release.

---

## 3. Kết quả mô phỏng merge `chuongvu` × `tiendung`

Chạy `git merge-tree --write-tree origin/chuongvu origin/tiendung`:

| File | Kết quả |
|---|---|
| `js/watch.js` | ❌ **Conflict duy nhất**, 1 vùng (~6 dòng) — cách giải bên dưới |
| `js/admin.js` | ✅ Tự gộp: Dashboard + Bình luận (chuongvu) + Thành viên (tiendung), **không trùng hàm**; `initUsersTab` bản thật của tiendung giữ nguyên |
| `css/admin.css` | ✅ Tự gộp, nhưng **3 selector bị khai báo 2 lần** (giá trị giống nhau): `.admin-table`, `.admin-table th`, `.admin-table td` → dọn khi merge (§4.4) |
| `css/watch.css` | ✅ Chỉ chuongvu đụng |
| `js/favorites.js`, `js/history.js`, `js/api.js` | ✅ Chỉ tiendung đụng (ngoài lỗi §4) |
| `server/src/routes/admin.routes.js` | ✅ Tự gộp đủ 3 khối: settings (Lead) + stats/comments (DEV-1) + users (DEV-2); `app.js` không cần sửa |
| `server/src/routes/me|movies|comments.routes.js`, `services/*` | ✅ Mỗi bên một file, không đụng nhau |
| `server/src/middlewares/rate-limit.js` | ✅ Chỉ chuongvu (thêm `commentLimiter`, đã được dùng trong `POST /movies/:slug/comments`) |

### Chi tiết conflict `js/watch.js` (vùng `loadMovie`, sau dòng `saveWatchHistory(...)`)

```text
    saveWatchHistory(movie, state.episode, state.resumeAt);
<<<<<<< origin/chuongvu
    // Ghi nhận lượt xem cho thống kê (US-58)
    recordMovieView(movie.slug, state.episode);
=======
    syncHistoryToServer(movie, state.episode, state.resumeAt);
>>>>>>> origin/tiendung
```

**Giải đúng** — giữ cả hai, không mất cái nào:

```js
    saveWatchHistory(movie, state.episode, state.resumeAt);
    syncHistoryToServer(movie, state.episode, state.resumeAt);

    // Ghi nhận lượt xem cho thống kê (US-58)
    recordMovieView(movie.slug, state.episode);
```

---

## 4. Lỗi bắt buộc sửa trong lúc merge (rà code, không phải conflict)

> Đây là phần **quan trọng nhất** của kế hoạch: merge sạch ≠ chạy đúng. 4 việc dưới đây gắn vào PR tương ứng.

### 4.1. (PR tiendung) `res.ok` → `res.success` — danh sách server không bao giờ tải được

`fetchBackend`/`fetchAPI` trả về `{ success, status, data | error }` — **không có field `ok`**. Điều kiện hiện tại luôn sai → luôn rẽ nhánh "không có dữ liệu".

- `js/favorites.js:36` — `if (res.ok && res.data?.data?.items)` → đổi thành `res.success`
- `js/history.js:33` — `if (res.ok && res.data?.data?.items)` → đổi thành `res.success`

### 4.2. (PR tiendung) Gửi body bị stringify 2 lần → backend trả `400 VALIDATION_ERROR`

`fetchBackend` **tự** làm `JSON.stringify(body)`. Các chỗ dưới đây lại stringify sẵn → request mang chuỗi kép, backend nhận string thay vì object, zod từ chối — và lỗi bị `.catch(() => {})` nuốt nên khó thấy:

- `js/favorites.js` — `addServerFavorite`: `body: JSON.stringify({...})` → `body: { movieSlug: ..., name: ..., poster: ... }` (truyền object thô)
- `js/watch.js` — `syncHistoryToServer`: `body: JSON.stringify({...})` → `body: { movieSlug: ..., ... }`

**Làm tốt hơn (khuyên dùng, đúng Luật cứng #1 "dùng lại trước")**: thay các lệnh gọi tay `fetchBackend(...)` trong `favorites.js` / `history.js` / `syncHistoryToServer` bằng wrapper **đã có sẵn trên develop**: `addMyFavorite(movie)`, `removeMyFavorite(slug)`, `getMyFavorites(page, limit)`, `saveMyHistory({ slug, name, poster, episode, progress })`, `getMyHistory(page, limit)` — vừa hết lỗi 4.1/4.2 vừa bỏ code trùng. (`history.js` đã truyền object đúng; chỉ đổi qua wrapper cho đồng bộ.)

### 4.3. (PR chuongvu) `res.error?.message` → `res.error`

`fetchAPI` đã trả `error` là **chuỗi thông báo** (đã lấy `data?.error?.message` sẵn). Đọc `.message` trên chuỗi → `undefined` → luôn hiện thông báo fallback chung. Không chặn chức năng, sửa 1 dòng mỗi chỗ:

- `js/watch.js:1025` (gửi bình luận), `:1043` (gửi đánh giá), `:1153` (xóa bình luận)

### 4.4. (PR merge sau) Dọn CSS trùng

Sau khi cả hai vào `develop`, `css/admin.css` có `.admin-page .admin-table` + `th` + `td` khai báo 2 lần (giá trị giống nhau, một lần trong khối DEV-1 một lần trong khối DEV-2). Giữ **một** khối (đặt cạnh nhau, comment "dùng chung Dashboard/Bình luận/Thành viên"). Không đổi giá trị.

### 4.5. Kiểm lại sau khi sửa

- `node --check js/watch.js js/admin.js js/favorites.js js/history.js` (hoặc mở Live Server, console sạch).
- Backend: `POST /me/favorites` với body đúng → `201`; log không còn `VALIDATION_ERROR`.

---

## 5. Quy trình merge — 4 bước, mỗi người một phần

> Luật giữ nguyên: PR vào `develop`, review chéo trước, **Lead approve cuối**. Commit Conventional Commits + mã US.
> Hai PR này là **ngoại lệ của luật "1 PR ≤ 1 US"**: code đã xong trọn nhánh nên merge trọn nhánh, bù lại review kỹ hơn (checklist §6).

### Bước 0 — Lead (nay, 15 phút)

1. Commit phần local đang treo vào nhánh `anhtu`:
   `feat(server): add reset-admin script (US-18)`
   (gồm `server/src/scripts/reset-admin.js`, `server/package.json`, `server/.env.example`)
2. PR `anhtu` → `develop`, self-review, merge.

### Bước 1 — chuongvu mở PR (hôm nay, merge trước)

1. `git checkout chuongvu && git pull origin develop` (sẽ fast-forward, không conflict vì đã basis trên tip).
2. Sửa lỗi §4.3 trong commit riêng: `fix(watch): show backend error message on comment actions (US-55)`.
3. Push → PR `chuongvu` → `develop`, tiêu đề:
   `feat(community): comments, ratings, views and admin moderation (US-54, US-55, US-56, US-58, US-61)`
4. Mô tả PR: liệt kê 5 US + từng Scenario đã chạy (Pass/Fail), ghi rõ sửa §4.3.
5. **DEV-2 review chéo → Lead approve → merge.** Không có conflict nào ở PR này.

### Bước 2 — tiendung mở PR (ngay sau khi Bước 1 merge)

1. `git checkout tiendung && git pull origin develop` → merge `develop` vào `tiendung`:
   - Resolve **duy nhất** `js/watch.js` theo §3 (giữ cả `recordMovieView` lẫn `syncHistoryToServer`).
   - Vùng đó nằm trong phần player/lịch sử — đúng phần tiendung sở hữu, chuongvu không phải đụng lại.
2. Sửa lỗi §4.1 + §4.2 (khuyên làm theo phương án "dùng wrapper" — vừa sửa lỗi vừa theo Luật cứng #1):
   `fix(sync): use backend wrappers and correct response field for favorites/history (US-50, US-51)`
3. Dọn CSS trùng nếu đến lượt PR của mình merge sau: `style(admin): dedupe shared admin-table rules`
4. Push → PR `tiendung` → `develop`, tiêu đề:
   `feat(member): server-synced favorites/history and user management (US-50, US-51, US-63)`
5. Mô tả PR: 3 US + Scenario Pass/Fail + cách resolve conflict watch.js + cách sửa §4.1/4.2.
6. **DEV-1 review chéo → Lead approve → merge.**

### Bước 3 — Cả nhóm kiểm trên `develop` (ngay sau 2 merge, ~1 giờ)

Xem §6. Ai phụ trách phần nào chạy phần đó, ghi Pass/Fail vào thread PR.

### Bước 4 — Lead chốt docs (cùng ngày)

1. Cập nhật bảng trạng thái [07 §2](07_lo_trinh_va_backlog.md#2-trạng-thái-user-story): US-54, 55, 56, 58, 61, 63 → ✅; US-50/51 ghi "đồng bộ máy chủ ✅"; US-19 Sc1/Sc3 → ✅ (nếu đã kiểm trên preview).
2. `core_registry.md`: đối chiếu wrapper/hàm mới (nếu tiendung thay bằng wrapper thì không có hàm mới).
3. `backend_api_contract.md`: hợp đồng nói `RatingSummary.count` nhưng BE+FE đang dùng thống nhất `total` → sửa 1 chữ trong hợp đồng cho khớp code (PR docs nhỏ), hoặc đổi BE sang `count` — **chọn sửa hợp đồng** (ít rủi ro hơn, không đụng code đã test).
4. Đánh dấu các mục trong [05_no_ky_thuat.md](05_no_ky_thuat.md) nếu có nợ mới phát hiện.

---

## 6. Kiểm thử sau merge (ma trận tối thiểu)

### FE — chạy qua Live Server, console không có lỗi đỏ, 375px / 768px / ≥1200px không cuộn ngang

| Kịch bản | Người | Mong đợi |
|---|---|---|
| Mở `watch.html` (đã đăng nhập) | DEV-2 | Bình luận/đánh giá tải từ BE; lịch sử lưu local **và** lên server (2 dòng sau `saveWatchHistory` cùng chạy) |
| Gửi bình luận, gửi đánh giá 1–10, xóa bình luận của mình | DEV-1 | Toast đúng, danh sách cập nhật ngay; lỗi sai thông báo hiện **đúng message backend** (hết §4.3) |
| Bình luận spoil bị che, bấm mới hiện | DEV-1 | US-55 Sc2 |
| ♥ một phim ở trình duyệt A → đăng nhập trình duyệt B | DEV-2 | Phim xuất hiện (US-50); lần đăng nhập đầu đẩy dữ liệu local lên đúng 1 lần |
| Xem tập 3 tới phút 10 → thoát → mở lại từ máy khác | DEV-2 | Đúng tập 3 phút 10 (US-52/53 bản máy chủ) |
| `admin.html` 5 tab lần lượt | cả hai + Lead | Dashboard có số liệu thật; Bình luận kiếm duyệt được; Thành viên khóa/mở khóa được; Hệ thống + Bộ nhớ như trước |
| Tự bấm khóa chính mình | DEV-2 | Toast `Không thể tự khóa tài khoản của chính mình` (US-63 Sc3) |
| Khóa 1 tài khoản → tài khoản đó request tiếp | DEV-2 | `403 ACCOUNT_BANNED` → FE tự đăng xuất (bản vá `api.js` của tiendung) |
| Khách mở trang khi bật bảo trì | Lead | Màn hình bảo trì; admin vẫn dùng được (US-62) |

### BE — curl (kể cả mã lỗi)

| Lệnh | Mong đợi |
|---|---|
| `GET /api/health` | `{"status":"ok"}` |
| Member token gọi `GET /admin/stats`, `/admin/users`, `/admin/comments` | `403 FORBIDDEN` (bảo mật — Lead duyệt) |
| Gửi 11 bình luận trong 1 phút | Cái thứ 11 → `429 RATE_LIMITED` (`commentLimiter`) |
| `POST /me/favorites` body object | `201` — **không còn** `400 VALIDATION_ERROR` (hết §4.2) |
| `POST /movies/:slug/views` | `204`, sau đó `GET /admin/stats` tăng lượt xem |
| `PATCH /admin/users/:super_admin_id` `{status:"banned"}` | `403` |

---

## 7. Rủi ro & phương án

| Rủi ro | Dấu hiệu | Phương án |
|---|---|---|
| Sửa §4 bị bỏ sót → đồng bộ im lặng thất bại | ♥/lịch sử không hiện trên máy thứ hai, Network thấy body chuỗi kép / `400` | Checklist §6 bắt buộc chạy trước khi merge Bước 2; reviewer phải hỏi đúng 2 câu này |
| Conflict watch.js resolve sai (mất `recordMovieView` hoặc `syncHistoryToServer`) | Mất lượt xem hoặc mất đồng bộ | Đoạn chuẩn đã ghi sẵn ở §3 — copy nguyên khối; reviewer kiểm bằng grep 2 tên hàm |
| CSS hai khối chèn lệch khiến tab vỡ | Tab Thành viên/Dashboard lỗi hiển thị | Dọn §4.4 ngay trong PR Bước 2; test 5 tab ở 3 width |
| PR merge chồng chéo làm ai đó mất việc | `git log` thiếu commit của một người | Không force-push; merge tuần tự Bước 1 → Bước 2, mỗi PR một lần merge |
| Hợp đồng lệch code (`count` vs `total`) | Người sau code theo hợp đồng bị lỗi | Bước 4.3 sửa hợp đồng trong PR docs nhỏ, cả nhóm ack trên nhóm chat |

---

## 8. Xong khi

- [ ] Bước 0–2 merge xong, `develop` có đủ code 3 người, `git log` tuyến tính, không ai bị mất commit.
- [ ] `js/watch.js` trên `develop` có **cả** `recordMovieView` **lẫn** `syncHistoryToServer`; `node --check` sạch 4 file FE.
- [ ] §4.1–4.4 đã sửa; `POST /me/favorites` trả `201`, danh sách server hiện trên máy thứ hai.
- [ ] Ma trận §6 Pass hết (ghi Pass/Fail vào thread PR), console không lỗi đỏ.
- [ ] Docs cập nhật (07 §2, core_registry, hợp đồng `count/total`).
- [ ] `develop` sẵn sàng cho hồi quy 52 US + release `v2.0.0` theo [09 — 12/11](09_ke_hoach_tuan_cuoi_v2.md#12-11--release-v2) và checklist [06 §5](06_trien_khai.md#5-checklist-trước-khi-release-merge-develop--main).
