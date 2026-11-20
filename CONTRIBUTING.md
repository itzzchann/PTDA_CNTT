# Hướng dẫn làm việc nhóm — RoPhim

> Viết cho **người mới**, kể cả khi bạn chưa từng làm Git theo nhóm.
> Đọc từ trên xuống một lần (~20 phút). Sau đó chỉ cần mở [§3 — Quy trình một task](#3-quy-trình-một-task-từng-bước) mỗi khi làm việc.
>
> Luật code (được viết gì, không được viết gì) nằm ở [AGENTS.md](AGENTS.md). File này nói về **cách làm việc cùng nhau bằng Git + GitHub**.

## Mục lục

0. [Tóm tắt 1 phút](#0-tóm-tắt-1-phút)
1. [Hiểu Git flow của nhóm (bằng hình)](#1-hiểu-git-flow-của-nhóm)
2. [Cài đặt lần đầu (làm 1 lần)](#2-cài-đặt-lần-đầu-làm-1-lần)
3. [Quy trình một task, từng bước](#3-quy-trình-một-task-từng-bước)
4. [Đặt tên nhánh và viết commit](#4-đặt-tên-nhánh-và-viết-commit)
5. [Pull Request và review](#5-pull-request-và-review)
6. [Làm việc cùng nhau mà không giẫm chân nhau](#6-làm-việc-cùng-nhau-mà-không-giẫm-chân-nhau)
7. [Xử lý conflict](#7-xử-lý-conflict)
8. [Lỡ tay thì cứu thế nào](#8-lỡ-tay-thì-cứu-thế-nào)
9. [Release và hotfix (trưởng nhóm làm)](#9-release-và-hotfix)
10. [Checklist trước khi tạo PR](#10-checklist-trước-khi-tạo-pr)
11. [Từ điển thuật ngữ](#11-từ-điển-thuật-ngữ)

---

## 0. Tóm tắt 1 phút

```
1. Không bao giờ code thẳng trên develop hoặc main.
2. Mỗi người MỘT nhánh mang tên mình (vd: nguyenvana), tạo 1 lần từ develop, làm mọi task trên đó.
3. Mỗi task (mỗi mã US) = một hoặc vài commit nhỏ, tiếng Anh, có mã US:   feat(login): add login form (US-18)
4. Xong việc trong ngày → push → mở Pull Request vào develop → trưởng nhóm duyệt → merge (merge commit, không squash).
5. Mỗi sáng trước khi code: git pull origin develop (trộn develop mới nhất vào nhánh của mình).
6. Sắp sửa file CORE (js/utils.js, js/main.js, header...) → báo nhóm TRƯỚC.
7. Bối rối → DỪNG, đừng gõ lệnh lạ trên mạng, hỏi nhóm.
```

---

## 1. Hiểu Git flow của nhóm

### 1.1 Ba loại nhánh

Hình dung dự án là một **cuốn sách đang viết chung**:

| Nhánh | Giống như | Ai được ghi vào | Ghi chú |
|---|---|---|---|
| `main` | Bản **đã in ra phát hành** | Chỉ trưởng nhóm, khi release | Bản người dùng thật thấy. Có tag `v1.0.0`, `v2.0.0` |
| `develop` | **Bản thảo chung** của cả nhóm | Không ai push thẳng — chỉ vào qua **Pull Request** | Luôn phải chạy được |
| `<ten-cua-ban>` (vd `nguyenvana`) | **Nháp riêng** của từng người, **mỗi người đúng 1 nhánh** | Chỉ bạn | Làm mọi task của bạn ở đây. Viết thoải mái, hỏng cũng không ảnh hưởng ai |

```
main        ●─────────────────────────────────────●  v2.0.0    ← bản phát hành
             \                                   /
develop       ●────●─────────●──────●─────────●─●              ← bản chung, vào qua PR
               \    \       / \    / \       /
nguyenvana      \    ●──●──●───●──●───●──●──●                  ← nhánh của bạn A (dùng suốt dự án)
                 \                 /
tranthib          ●──●──●─────────●                            ← nhánh của bạn B
```

Quy tắc vàng: **nhánh của bạn tạo ra từ `develop` một lần duy nhất, mỗi sáng lấy `develop` mới về, và đưa việc đã xong về `develop` bằng Pull Request.**
Sau khi PR được merge, bạn **giữ nguyên nhánh** và làm tiếp task sau trên đó.

> Vì sao 1 người 1 nhánh: nhóm còn mới, ít nhánh thì ít nhầm lẫn "đang ở nhánh nào", không phải nhớ tạo/xóa nhánh cho từng task.
> Đổi lại, phải giữ kỷ luật: **chỉ sửa file của mình** (§6.1), **trộn `develop` mỗi sáng**, **mở PR mỗi ngày** để nhánh không lệch xa `develop`.

### 1.2 Repo nằm ở đâu

- **Một repo duy nhất** cho cả frontend lẫn backend: `https://github.com/itzzchann/PTDA_CNTT` — làm việc trực tiếp trên repo này, **không cần fork**.
  Trưởng nhóm sẽ mời bạn làm collaborator; nhận lời mời qua email/GitHub trước khi clone.
- Frontend: các file ở thư mục gốc (`*.html`, `js/`, `css/`, `components/`, `assets/`).
- Backend: thư mục **`server/`** (Node.js + Express + PostgreSQL), chuẩn code xem [08_backend_node_skill.md](docs/skills/08_backend_node_skill.md).
  Cùng nhánh tên mình, cùng PR — sửa cả frontend lẫn backend cho một US thì để chung một PR.
- Mọi PR đều cần **chủ repo duyệt** (xem [.github/CODEOWNERS](.github/CODEOWNERS)) thì mới merge được.

---

## 2. Cài đặt lần đầu (làm 1 lần)

### Bước 1 — Cài công cụ

- [Git](https://git-scm.com/downloads) (Windows: chọn mặc định hết khi cài).
- [VS Code](https://code.visualstudio.com/).
- Tài khoản GitHub, đã nhận lời mời collaborator.

### Bước 2 — Khai báo bạn là ai với Git

Mở Terminal (Windows: **Git Bash**), gõ — thay tên và email **trùng với tài khoản GitHub**:

```bash
git config --global user.name "Ten Cua Ban"
git config --global user.email "email-github-cua-ban@example.com"
git config --global init.defaultBranch main
git config --global pull.rebase false     # git pull = trộn (merge), dễ hiểu hơn cho người mới

# Chỉ trên Windows: tránh việc cả file bị coi là "đã sửa" do khác kiểu xuống dòng
git config --global core.autocrlf true
```

### Bước 3 — Tải code về máy (clone)

```bash
git clone https://github.com/itzzchann/PTDA_CNTT.git
cd PTDA_CNTT
git checkout develop          # chuyển sang nhánh chung
git status                    # phải thấy: "On branch develop ... nothing to commit, working tree clean"
```

> Lần đầu push, GitHub sẽ hỏi đăng nhập. Trên Windows sẽ hiện cửa sổ đăng nhập trình duyệt.
> Trên Linux/macOS, nếu bị hỏi mật khẩu: GitHub **không nhận mật khẩu tài khoản** — tạo
> [Personal Access Token](https://github.com/settings/tokens) và dán vào chỗ mật khẩu, hoặc cài [GitHub CLI](https://cli.github.com/) rồi chạy `gh auth login`.

### Bước 4 — Mở bằng VS Code và cài extension

```bash
code .
```
Góc phải dưới hiện "This workspace has extension recommendations" → **Install All**
(Live Server, Prettier, GitLens, Auto Rename Tag, Material Icon Theme — danh sách ở `.vscode/extensions.json`).

### Bước 5 — Cấu hình Prettier ⚠️ đọc kỹ

Nhiều file cũ **chưa được format** theo Prettier. Nếu bật format cả file khi lưu, chỉ một Ctrl+S là cả file đổi →
PR của bạn có hàng trăm dòng thay đổi vô nghĩa và **người khác bị conflict khắp nơi**.

Vì vậy chỉ format **những dòng bạn sửa**:

`File → Preferences → Settings`, tìm và đặt:

| Setting | Giá trị |
|---|---|
| `Editor: Default Formatter` | **Prettier - Code formatter** |
| `Editor: Format On Save` | ✅ bật |
| `Editor: Format On Save Mode` | **`modifications`** (chỉ những dòng đã sửa) |

Tự kiểm tra: sửa 1 dòng trong `js/homepage.js` → Ctrl+S → `git diff` chỉ được thấy dòng đó. Sau đó `git checkout -- js/homepage.js` để trả lại.

### Bước 6 — Chạy thử web

Chuột phải `index.html` → **Open with Live Server** → mở `http://127.0.0.1:5500/index.html`.
Phải thấy header, phim, footer. Không chạy được → [03_chay_du_an.md §5](docs/guides/03_chay_du_an.md#5-lỗi-hay-gặp).

### Bước 7 — Đọc tài liệu (theo đúng thứ tự)

1. [AGENTS.md](AGENTS.md) — luật cứng, 5 phút.
2. [docs/guides/07_lo_trinh_va_backlog.md](docs/guides/07_lo_trinh_va_backlog.md) — bạn được giao US nào, hạn khi nào.
3. [docs/guides/02_kien_truc.md](docs/guides/02_kien_truc.md) — kiến trúc, **quan trọng nhất để không phá code người khác**.
4. [docs/specs/core_registry.md](docs/specs/core_registry.md) — lướt để biết "đã có hàm gì".
5. File `product_backlog.xlsx` (tiêu chí chấp nhận của từng US) **không nằm trong repo** — xin trưởng nhóm.

✅ Xong phần cài đặt khi: clone được, đang ở `develop`, Live Server chạy, Prettier chỉ format dòng đã sửa.

---

## 3. Quy trình một task, từng bước

Ví dụ: bạn được giao **US-18 — Đăng ký / đăng nhập**.

### Bước 1 — Đọc yêu cầu trước khi code

- Mở `product_backlog.xlsx` → đọc User Story (Bảng 2) + **Acceptance Criteria & Testing** (Bảng 3) của US-18.
  Tiêu chí chấp nhận = định nghĩa "xong".
- Tự hỏi: tạo file mới hay sửa file cũ? Có đụng **file CORE** không ([AGENTS.md §3](AGENTS.md#3-bản-đồ-file-core-vs-page))?
  Có → [§6.2](#62-trước-khi-sửa-file-core).

### Bước 2 — Có nhánh của mình chưa?

**Chưa có (chỉ làm 1 lần trong cả dự án):**
```bash
git checkout develop
git pull origin develop
git checkout -b nguyenvana          # tên của bạn, cách đặt: §4.1
git push -u origin nguyenvana       # đưa nhánh lên GitHub ngay, từ giờ chỉ cần "git push"
```
`-b` = tạo nhánh mới và chuyển sang luôn.

**Đã có rồi (mọi lần sau):** chỉ cần chuyển sang nhánh của mình và lấy code mới của nhóm:
```bash
git checkout nguyenvana
git pull origin develop             # trộn develop mới nhất vào nhánh của bạn (= Bước 7)
```

### Bước 3 — Kiểm tra đang đứng đúng nhánh

Trước khi gõ code, luôn chắc chắn mình đang ở **nhánh tên mình**, không phải `develop`:
```bash
git branch        # nhánh có dấu * là nhánh hiện tại
git status        # cũng ghi "On branch ..." ở dòng đầu
```

### Bước 4 — Code

- Tra [core_registry.md](docs/specs/core_registry.md) trước: đã có `createMovieCard`, `renderEmptyState`, `showToast`, `fetchBackend`... thì **dùng lại**.
- Làm theo công thức trong [docs/skills/](docs/README.md#skills--công-thức-làm-việc) (vd thêm trang mới → skill 01).
- Chạy Live Server, mở DevTools (F12) → tab Console luôn mở.

### Bước 5 — Commit (lưu một mốc)

Làm xong **một phần nhỏ có ý nghĩa** (vd xong form, xong gọi API) thì commit một lần:

```bash
git status                          # 1. Xem đã sửa những file nào
git diff                            # 2. Đọc lại thay đổi — có file lạ, console.log, dòng thừa không?
git add login.html js/login.js css/login.css   # 3. Chọn file muốn commit (nên ghi rõ tên file)
git commit -m "feat(login): add login and register form (US-18)"   # 4. Lưu mốc
```

> Tránh `git add .` khi chưa xem `git status` — rất dễ commit nhầm file rác hoặc file CORE mà bạn chỉ sửa thử.

### Bước 6 — Push lên GitHub (sao lưu + cho người khác thấy)

```bash
git push        # nhánh đã được đưa lên GitHub ở Bước 2 nên chỉ cần thế này
```
Nên push **ít nhất cuối mỗi ngày** — máy hỏng cũng không mất code.

### Bước 7 — Cập nhật nhánh với `develop` (mỗi sáng + trước khi tạo PR)

Trong lúc bạn code, người khác đã merge thứ mới vào `develop`. Kéo về và trộn vào nhánh của bạn:

```bash
git checkout nguyenvana           # chắc chắn đang ở nhánh của mình
git pull origin develop           # tải develop mới từ GitHub và trộn vào nhánh của bạn
```
(Cách viết dài tương đương: `git fetch origin` rồi `git merge origin/develop`.)

- Không có conflict → mở web kiểm lại nhanh → `git push`.
- Có conflict → [§7](#7-xử-lý-conflict).

> Nhóm dùng **merge**, không dùng rebase, để không bao giờ phải `push --force`.

### Bước 8 — Tự kiểm thử

Dự án không có test tự động → bạn là người kiểm:
- Chạy **từng Scenario** trong tiêu chí chấp nhận của US, ghi Pass/Fail.
- Chạy checklist [06_kiem_thu_thu_cong_skill.md](docs/skills/06_kiem_thu_thu_cong_skill.md) (console sạch, responsive 375/768/≥1200px...).
- Đụng CORE → test **ít nhất 3 trang**: `index`, `detail`, `watch` + trang bị ảnh hưởng.

### Bước 9 — Tạo Pull Request

Xem [§5](#5-pull-request-và-review).

### Bước 10 — Sau khi PR được merge

```bash
git checkout nguyenvana
git pull origin develop             # lấy bản develop vừa có code của bạn + của người khác
```
- ⚠️ **Không xóa nhánh** — kể cả khi GitHub hiện nút **Delete branch** trên trang PR, **đừng bấm**. Đây là nhánh dùng suốt dự án.
- Task tiếp theo → quay lại Bước 1, vẫn làm trên nhánh `nguyenvana`.
- Nếu bạn đã push thêm commit **trong lúc PR chưa merge**: các commit đó tự nằm trong PR đang mở, không sao. Commit đến **sau** khi merge thì sẽ vào PR mới (mở như Bước 9).

### Bảng lệnh hằng ngày (in ra dán cạnh màn hình)

| Muốn... | Lệnh |
|---|---|
| Xem đang ở nhánh nào, sửa file gì | `git status` |
| Xem chi tiết đã sửa gì | `git diff` (đã `add` rồi: `git diff --staged`) |
| Bắt đầu ngày làm việc / task mới | `git checkout <ten-cua-ban>` → `git pull origin develop` |
| Lưu mốc | `git add <file>` → `git commit -m "..."` |
| Đẩy lên GitHub | `git push` (chỉ lần tạo nhánh mới cần `git push -u origin <ten-cua-ban>`) |
| Lấy code mới của nhóm vào nhánh mình | `git pull origin develop` |
| Xem lịch sử commit | `git log --oneline -10` |
| Xem thử nhánh của bạn cùng nhóm | `git checkout <ten-ban-kia>` (commit hoặc stash trước — xem §8), xem xong `git checkout <ten-cua-ban>` |

---

## 4. Đặt tên nhánh và viết commit

### 4.1 Tên nhánh

Mỗi người **đúng một nhánh**, đặt bằng **họ tên không dấu, chữ thường, viết liền** (trùng tên thì thêm số hoặc chữ cái đầu tên đệm):

| Họ tên | Tên nhánh |
|---|---|
| Nguyễn Văn A | `nguyenvana` |
| Trần Thị B | `tranthib` |

- Backend (`server/`) nằm cùng repo nên dùng luôn nhánh đó, không có nhánh riêng cho backend.
- **Không** tạo thêm `feat/...`, `fix/...`, `docs/...` cho từng task. Loại việc (tính năng, sửa lỗi, tài liệu) đã thể hiện ở **commit message** (§4.2).
- Ngoại lệ duy nhất: `hotfix/<mô-tả>` cho lỗi khẩn trên `main` — **chỉ trưởng nhóm** tạo ([§9.2](#92-hotfix-lỗi-nghiêm-trọng-trên-bản-đã-phát-hành)).

### 4.2 Commit message

Mẫu (Conventional Commits, **tiếng Anh**): **`<type>(<phạm vi>): <làm gì> (US-xx)`**

```
feat(login): add login and register tabs (US-18)
fix(watch): stop comment counter going negative (US-55)
refactor(utils): add optional variant param to renderSkeleton
docs(contract): add rating endpoints
```

| `type` | Dùng khi |
|---|---|
| `feat` | Thêm tính năng |
| `fix` | Sửa lỗi |
| `refactor` | Sửa cấu trúc code, hành vi giữ nguyên |
| `style` | Chỉ đổi CSS / giao diện |
| `docs` | Chỉ đổi tài liệu |
| `chore` | Việc lặt vặt: `.gitignore`, cấu hình, CODEOWNERS |

- **Phạm vi** = tên trang hoặc file: `login`, `watch`, `detail`, `admin`, `utils`, `api`, `header`, `config`...
- **Làm gì**: động từ thì hiện tại, chữ thường, không dấu chấm cuối, ≤ 72 ký tự: `add`, `fix`, `remove`, `show`, `update`.
- **Mỗi commit một việc.** Sửa CORE → commit **riêng** trước, rồi mới đến commit trang dùng nó:
  ```
  feat(api): add buildBackendPath helper          ← commit 1: chỉ CORE
  feat(login): call auth endpoints (US-18)        ← commit 2: trang
  ```
- Cần giải thích thêm → để trống 1 dòng rồi viết phần thân:
  ```bash
  git commit -m "refactor(utils): add optional variant param to renderSkeleton" \
             -m "Default \"card\" keeps existing behavior. Tested: index, movies, detail, watch."
  ```

❌ Tránh: `update`, `fix bug`, `WIP`, `sua loi`, `Added login.`

---

## 5. Pull Request và review

**Pull Request (PR)** = "Mình làm xong mấy việc này trên nhánh của mình rồi, mời nhóm xem và cho trộn vào `develop`."

### 5.1 Tạo PR

**Khi nào mở:** cuối mỗi ngày có ít nhất một task xong (đạt Scenario). Không đợi xong hết mọi việc mới mở — PR càng to càng khó duyệt, nhánh càng lệch `develop`.
Mỗi lúc chỉ có **một PR đang mở** từ nhánh của bạn; push thêm commit thì chúng tự vào PR đó.

1. Đã làm [Bước 7](#bước-7--cập-nhật-nhánh-với-develop-mỗi-sáng--trước-khi-tạo-pr) (trộn `develop` mới nhất) và [checklist §10](#10-checklist-trước-khi-tạo-pr).
2. `git push` → lên GitHub, bấm **Compare & pull request** (hoặc tab *Pull requests* → *New pull request*).
3. ⚠️ **base: `develop`** ← **compare: nhánh tên bạn**. Mặc định GitHub có thể chọn `main` — **đổi lại**.
4. Tiêu đề = tên bạn + các US trong PR: `nguyenvana: detail page fixes (US-34, US-36, US-37)`.
5. Dán mẫu mô tả dưới đây, điền vào — **mỗi US một mục** nếu PR có nhiều US.
6. Reviewer: trưởng nhóm được gán tự động (CODEOWNERS). Muốn bạn cùng nhóm xem → thêm ở mục *Reviewers*.

Chưa xong nhưng muốn hỏi ý kiến sớm → chọn **Create draft pull request**.

> **Trưởng nhóm merge bằng "Create a merge commit"**, không dùng *Squash and merge* hay *Rebase and merge*.
> Squash gộp commit thành một commit mới trên `develop`, nhánh của bạn vẫn giữ commit cũ → lần trộn sau Git tưởng là
> hai bản khác nhau và **conflict ở chính code của bạn**. (Repo đã tắt sẵn 2 kiểu kia trong Settings → General → Pull Requests.)

### 5.2 Mẫu mô tả PR

```markdown
## US
- US-18 — Đăng ký / đăng nhập
- (PR có nhiều US thì liệt kê đủ, phần Kiểm thử bên dưới ghi theo từng US)

## Đã làm
- Thêm login.html, js/login.js, css/login.css (2 tab đăng nhập / đăng ký)
- ...

## Sửa CORE: Có / Không
- (nếu Có) js/api.js: thêm hàm buildBackendPath() — chỉ THÊM, không đổi hàm cũ

## Kiểm thử
- [x] Scenario 1: ... — Pass
- [x] Scenario 2: ... — Pass
- [ ] Scenario 3: ... — chưa kiểm (cần backend)
- [x] Console không lỗi đỏ
- [x] Responsive 375px / 768px / ≥1200px
- Trang đã test (nếu đụng CORE): index, detail, watch, ...

## Ảnh chụp
(bắt buộc nếu đổi giao diện)
```

Ghi **thật**: chưa kiểm thì ghi "chưa kiểm", đừng tick cho đẹp.

### 5.3 Khi được review

- Reviewer comment yêu cầu sửa → sửa **trên nhánh tên bạn**, commit mới, `git push`. PR tự cập nhật, **không cần tạo PR mới**.
- Sửa xong mỗi comment → trả lời ngắn ("Đã sửa ở commit abc123") → bấm **Resolve conversation**.
- Không đồng ý → trả lời lý do, thảo luận. Review là xem **code**, không phải đánh giá **người**.
- Xong hết → bấm 🔄 *Re-request review*.
- **Ai merge?** Trưởng nhóm, sau khi Approve. Bạn không tự merge PR của mình.

### 5.4 Khi bạn review PR của người khác

Dùng [checklist review trong 04_quy_trinh_lam_viec.md §5](docs/guides/04_quy_trinh_lam_viec.md#5-review-checklist).
Kéo nhánh về chạy thử:
```bash
git fetch origin
git checkout tranthib                   # tên nhánh của người mở PR (đã commit/stash việc dở của bạn trước)
git pull                                # lấy commit mới nhất của PR
# mở Live Server kiểm tra, xong thì: git checkout <ten-cua-ban>
# KHÔNG commit gì trên nhánh của người khác — góp ý bằng comment trong PR
```

---

## 6. Làm việc cùng nhau mà không giẫm chân nhau

### 6.1 Ai sở hữu gì (V2)

Phân công chi tiết: [07_lo_trinh_va_backlog.md §3](docs/guides/07_lo_trinh_va_backlog.md#3-kế-hoạch-v2--phân-công-3-người). Nguyên tắc:

| File | Mức rủi ro conflict | Cách làm |
|---|---|---|
| File trang **của bạn** (`login.html`, `js/login.js`, `css/login.css`...) | 🟢 Thấp | Tự do |
| `js/config.js`, `js/api.js`, `js/catalog.js` | 🟡 Vừa | Chỉ **thêm vào cuối nhóm liên quan**, báo nhóm |
| `js/utils.js`, `js/main.js`, `js/components.js`, `css/style.css`, `css/components.css`, `components/header.html` | 🔴 Cao | **Một người một lúc**, phải báo trước. Trong V2 chỉ **Lead** sửa CORE frontend (header, `main.js`, `api.js`...) |
| `docs/specs/backend_api_contract.md` | 🔴 | Hợp đồng giữa FE và BE — đổi phải **PR riêng**, cả hai bên duyệt |

### 6.2 Trước khi sửa file CORE

Nhắn nhóm **trước khi code**, theo mẫu:

```
[CORE] Mình sẽ sửa js/utils.js — THÊM hàm formatRelativeTime() (không đổi hàm cũ).
Lý do: US-54 cần hiển thị "5 phút trước".
Có ai đang sửa utils.js không? Dự kiến mở PR: chiều 26/10.
```

Đợi xác nhận không ai đang sửa, rồi làm theo [core_files_rules.md](docs/constraints/core_files_rules.md).
Không được đổi tên / đổi tham số bắt buộc / đổi kiểu trả về của hàm CORE — cần khác thì **thêm tham số tùy chọn** hoặc **hàm mới**.

### 6.3 Thói quen giúp nhóm chạy êm

- **PR nhỏ, mở mỗi ngày**: nhánh dùng lâu dài nên phải đưa việc về `develop` thường xuyên. Nhánh lệch `develop` càng lâu, conflict càng to.
- **Trộn `develop` vào nhánh mỗi sáng** (Bước 7).
- **Chỉ sửa file mình sở hữu** (§6.1). Cả nhóm ai cũng làm trên nhánh riêng lâu dài, nên hai người cùng sửa một file là cách nhanh nhất để conflict.
- **Không format lại / đổi tên / "tiện tay dọn"** code không liên quan đến task. Thấy lỗi khác → ghi lại, báo người sở hữu file đó.
- **Sửa code thì sửa doc liên quan trong cùng PR** (bảng cuối [docs/README.md](docs/README.md#cập-nhật-tài-liệu)). Kết quả Pass/Fail của US ghi trong mô tả PR; **bảng trạng thái trong `07_lo_trinh_va_backlog.md` chỉ trưởng nhóm cập nhật** (tránh 3 người cùng sửa một bảng).
- **Không commit bí mật**: mật khẩu, token, file `.env`, URL backend local (`localhost`) trong `js/config.js`.
- **Đồng bộ 10 phút mỗi tối**: đã xong gì, mai làm gì, đang chờ ai.
- Bị kẹt quá **30 phút** → hỏi. Hỏi sớm rẻ hơn sửa muộn.

### 6.4 Dùng AI (Claude Code, Cursor, Copilot...)

Được dùng, nhưng **bạn chịu trách nhiệm** với code AI viết:
- Giao việc theo mẫu prompt trong [docs/README.md](docs/README.md#dùng-tài-liệu-này-để-vibe-code) (đính kèm mã US + tiêu chí chấp nhận + file được sửa).
- Trước khi commit: `git diff --stat` — có file CORE nào bạn không cho phép → bắt AI giải thích hoặc trả lại.
- Tự chạy Scenario trên trình duyệt; AI nói "đã test" chưa chắc đã test.

---

## 7. Xử lý conflict

### 7.1 Conflict là gì

Bạn và một người khác **sửa cùng một chỗ** trong cùng file. Git không biết giữ bản nào nên dừng lại hỏi bạn.
Conflict **không phải lỗi**, không mất code của ai — chỉ cần chọn đúng.

### 7.2 Nhận biết

Khi `git merge origin/develop` mà thấy:
```
CONFLICT (content): Merge conflict in js/api.js
Automatic merge failed; fix conflicts and then commit the result.
```

### 7.3 Gỡ từng bước

```bash
git status            # file "both modified" là file bị conflict
```

Mở file trong VS Code, sẽ thấy:
```js
<<<<<<< HEAD
async function getMyComments() { ... }          ← code CỦA BẠN
=======
async function getMovieRatings(slug) { ... }    ← code MỚI từ develop
>>>>>>> origin/develop
```

VS Code hiện các nút phía trên:
- **Accept Current Change** — giữ của bạn
- **Accept Incoming Change** — giữ của develop
- **Accept Both Changes** — giữ cả hai ← **hay dùng nhất**, vì thường hai người cùng *thêm* hàm mới ở cùng chỗ

Nguyên tắc chọn:
- Hai người cùng **thêm** thứ khác nhau (hàm, dòng `module.exports`, hằng) → **giữ cả hai**.
- Hai người cùng **sửa** một dòng → đọc hiểu cả hai, viết lại bản đúng; không chắc → **hỏi người kia** (xem ai viết: GitLens hoặc `git log -p origin/develop -- <file>`).
- Xóa hết các dòng `<<<<<<<`, `=======`, `>>>>>>>`.

Xong thì:
```bash
git add js/api.js                 # đánh dấu đã gỡ xong file này
git commit                        # Git tự điền message "Merge remote-tracking branch..." → lưu và đóng editor
# Mở web kiểm tra lại các Scenario — gỡ conflict sai rất hay làm hỏng trang
git push
```

Rối quá, muốn **hủy merge, quay về như trước khi merge**:
```bash
git merge --abort
```
Rồi nhờ người cùng sửa file đó ngồi gỡ cùng.

---

## 8. Lỡ tay thì cứu thế nào

> ⛔ **Không bao giờ** chạy trên `develop`/`main`: `git push --force`, `git push -f`.
> ⛔ Đừng dùng `git reset --hard`, `git clean -fd` khi chưa hiểu — chúng **xóa vĩnh viễn** code chưa commit.
> Không chắc → chụp màn hình `git status` gửi nhóm trước khi làm gì tiếp.

| Tình huống | Cách cứu |
|---|---|
| **Sửa file rồi muốn bỏ hết thay đổi của file đó** (chưa commit) | `git checkout -- <file>` (mất thay đổi của file đó) |
| **Lỡ `git add` file không muốn commit** | `git restore --staged <file>` (file vẫn giữ nguyên nội dung) |
| **Commit message viết sai** (chưa push) | `git commit --amend -m "message đúng"` |
| **Quên thêm 1 file vào commit vừa rồi** (chưa push) | `git add <file>` → `git commit --amend --no-edit` |
| **Commit lỡ code thẳng vào `develop` ở máy** (chưa push) | Gửi `git status` + `git log --oneline -5` cho trưởng nhóm, nhờ chuyển giúp sang nhánh tên bạn. Đừng tự `reset` |
| **Code dở trên `develop` chưa commit** | `git stash` → `git checkout <ten-cua-ban>` → `git stash pop` — thay đổi chuyển sang nhánh của bạn, rồi commit bình thường. Có conflict khi `pop` → dừng, hỏi nhóm (stash vẫn còn, không mất) |
| **Lỡ bấm "Delete branch" trên GitHub sau khi PR merge** | Không mất gì: nhánh ở máy bạn vẫn còn. Chạy `git push -u origin <ten-cua-ban>` để đưa lại lên |
| **Đang code dở, cần chuyển nhánh gấp** | `git stash` (cất tạm) → chuyển nhánh làm việc khác → quay lại → `git stash pop` |
| **Commit đã push mà sai, cần bỏ** | `git revert <mã-commit>` — tạo commit mới đảo ngược, an toàn với người khác. **Không** sửa lịch sử đã push |
| **`git push` bị từ chối** (`rejected ... fetch first`) | Có commit mới trên GitHub mà máy bạn chưa có: `git pull` → (gỡ conflict nếu có) → `git push`. **Không** dùng `--force` |
| **PR hiện hàng trăm dòng thay đổi lạ** | Thường do Prettier format cả file hoặc kiểu xuống dòng. Xem lại [§2 Bước 5](#bước-5--cấu-hình-prettier-️-đọc-kỹ); nhờ nhóm giúp trả các dòng thừa |
| **PR nhắm nhầm vào `main`** | Trên trang PR, bấm **Edit** cạnh tiêu đề → đổi base thành `develop` |
| **Commit nhầm mật khẩu / token** | Báo trưởng nhóm **ngay**, đổi mật khẩu/token đó. Xóa khỏi code thôi là chưa đủ: nó vẫn nằm trong lịch sử |

Xem mã commit: `git log --oneline -10` (dãy 7 ký tự đầu mỗi dòng).

---

## 9. Release và hotfix

> Phần này **trưởng nhóm** làm. Thành viên chỉ cần biết để hiểu `main` và tag từ đâu ra.

### 9.1 Release (vd V2 ngày 30/10/2026)

1. Cả nhóm chạy lại toàn bộ Scenario của release trên bản preview của `develop`.
2. Đi qua checklist [06_trien_khai.md §5](docs/guides/06_trien_khai.md#5-checklist-trước-khi-release-merge-develop--main).
3. Mở PR **`develop` → `main`**, merge.
4. Gắn tag:
   ```bash
   git checkout main && git pull origin main
   git tag -a v2.0.0 -m "Release V2"
   git push origin v2.0.0
   ```

### 9.2 Hotfix (lỗi nghiêm trọng trên bản đã phát hành)

```bash
git checkout main && git pull origin main
git checkout -b hotfix/player-crash
# sửa, commit: fix(watch): ...
git push -u origin hotfix/player-crash
```
Mở PR vào **`main`**. Merge xong, mở thêm PR `main` → `develop` để `develop` cũng có bản sửa.
Bạn thấy lỗi khẩn trên bản thật → **báo trưởng nhóm**, đừng tự tạo hotfix.

---

## 10. Checklist trước khi tạo PR

Đầy đủ: [Definition of Done trong AGENTS.md §5](AGENTS.md#5-definition-of-done). Bản rút gọn:

- [ ] Đang ở nhánh tên mình, đã `git pull origin develop` mới nhất, mở web vẫn chạy.
- [ ] Đạt đủ các Scenario trong tiêu chí chấp nhận của US (chưa kiểm được cái nào → ghi rõ trong PR).
- [ ] Console không có lỗi đỏ; header, footer, tìm kiếm, nút ♥, menu mobile vẫn chạy.
- [ ] Responsive 375px / 768px / ≥1200px, không cuộn ngang.
- [ ] Không `console.log` debug, không `fetch(` trong file trang, không màu/URL hardcode, không `style="..."` mới.
- [ ] Dữ liệu ngoài đưa vào `innerHTML` đã qua `escapeHtml()`.
- [ ] Không bí mật (mật khẩu, token, `.env`), `js/config.js` không còn `localhost`.
- [ ] `git diff origin/develop --stat` chỉ có file bạn sở hữu / liên quan đến các US trong PR; không có file bị format lại toàn bộ.
- [ ] Đụng CORE: đã báo nhóm, commit CORE tách riêng, đã test ≥ 3 trang, đã cập nhật [core_registry.md](docs/specs/core_registry.md).
- [ ] Commit tiếng Anh, có mã US. PR base = `develop`, mô tả theo mẫu [§5.2](#52-mẫu-mô-tả-pr).

---

## 11. Từ điển thuật ngữ

| Từ | Nghĩa |
|---|---|
| **Repository (repo)** | Thư mục dự án có lịch sử Git |
| **Clone** | Tải repo từ GitHub về máy lần đầu |
| **Branch (nhánh)** | Một dòng phát triển riêng; sửa trên nhánh này không ảnh hưởng nhánh khác |
| **Commit** | Một mốc lưu thay đổi, có message mô tả |
| **Stage / `git add`** | Chọn thay đổi nào sẽ vào commit kế tiếp |
| **Push** | Đẩy commit từ máy lên GitHub |
| **Fetch** | Tải thông tin mới từ GitHub về, **chưa** trộn vào code của bạn |
| **Pull** | Fetch + merge: tải về **và** trộn vào nhánh hiện tại |
| **Merge** | Trộn thay đổi của nhánh này vào nhánh kia |
| **Conflict** | Hai bên sửa cùng chỗ, Git cần bạn chọn |
| **Pull Request (PR)** | Đề nghị trộn nhánh của bạn vào `develop`, kèm review |
| **Review / Approve** | Người khác đọc code, góp ý / đồng ý cho merge |
| **`origin`** | Tên mặc định của repo trên GitHub mà bạn clone về |
| **`origin/develop`** | Bản `develop` trên GitHub mà máy bạn biết ở lần `fetch` gần nhất |
| **HEAD** | Vị trí bạn đang đứng (nhánh/commit hiện tại) |
| **Stash** | Cất tạm thay đổi chưa commit để chuyển nhánh |
| **Revert** | Tạo commit mới đảo ngược một commit cũ |
| **Tag** | Nhãn đánh dấu một phiên bản, vd `v2.0.0` |
| **Hotfix** | Sửa gấp lỗi trên bản đã phát hành (`main`) |
| **CODEOWNERS** | File chỉ định ai bắt buộc phải duyệt PR |
| **US-xx** | Mã User Story trong backlog — mỗi task gắn với một mã |
| **CORE / PAGE** | File dùng chung cho mọi trang / file riêng của một trang ([AGENTS.md §3](AGENTS.md#3-bản-đồ-file-core-vs-page)) |

---

Có gì trong file này chưa rõ hoặc sai với thực tế → sửa nó trên nhánh của bạn và mở PR (commit `docs(contributing): ...`). Đó cũng là cách tốt để tập quy trình lần đầu. 🎬
