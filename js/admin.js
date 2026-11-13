// Khung trang quản trị — US-58 Sc3: không phải admin → về index.html.
// 5 tab, mỗi tab một người sở hữu (07_lo_trinh_va_backlog.md §3.5): chỉ viết trong hàm initXxxTab của mình.
//   initDashboardTab — DEV-1 (US-58)      initCommentsTab — DEV-1 (US-61)
//   initUsersTab     — DEV-2 (US-63)      initSystemTab   — Lead (US-60, US-62)   initStorageTab — Lead (US-59)
(() => {
  document.addEventListener("DOMContentLoaded", initAdminPage);

  const TAB_OWNERS = {
    dashboard: { init: initDashboardTab, owner: "DEV-1" },
    comments: { init: initCommentsTab, owner: "DEV-1" },
    users: { init: initUsersTab, owner: "DEV-2" },
    system: { init: initSystemTab, owner: "Lead" },
    storage: { init: initStorageTab, owner: "Lead" },
  };

  function initAdminPage() {
    const session = getAuthSession();
    const isAdmin = session?.user?.role === "admin" || session?.user?.role === "super_admin";
    if (!isAdmin) {
      // US-58 Sc3 — kiểm tra giao diện; mọi request /admin/* backend vẫn tự kiểm role.
      window.location.href = "index.html";
      return;
    }

    renderAdminGreeting(session.user);

    const tabs = document.querySelectorAll(".admin-tab");
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => activateTab(tab.dataset.tab));
    });

    const initial = new URLSearchParams(window.location.search).get("tab");
    activateTab(TAB_OWNERS[initial] ? initial : "dashboard");
  }

  function renderAdminGreeting(user) {
    const title = document.querySelector(".admin-container .section-title");
    if (!title) return;
    const badge = document.createElement("span");
    badge.className = "admin-role-badge";
    badge.textContent = user.role === "super_admin" ? "Super admin" : "Admin";
    badge.title = user.username;
    title.appendChild(badge);
  }

  function activateTab(tabName) {
    const panel = document.getElementById("admin-tab-panel");
    if (!panel) return;

    document.querySelectorAll(".admin-tab").forEach((tab) => {
      const active = tab.dataset.tab === tabName;
      tab.classList.toggle("active", active);
      tab.setAttribute("aria-selected", String(active));
    });

    panel.innerHTML = "";
    const tab = TAB_OWNERS[tabName];
    if (tab) tab.init(panel);
  }

  /* ===== Tab Dashboard — DEV-1 (US-58) ===== */
  function initDashboardTab(panel) {
    renderTabPlaceholder(panel, "Tab Dashboard — DEV-1 đang làm (US-58)");
  }

  /* ===== Tab Bình luận — DEV-1 (US-61) ===== */
  function initCommentsTab(panel) {
    renderTabPlaceholder(panel, "Tab Bình luận — DEV-1 đang làm (US-61)");
  }

  /* ===== Tab Thành viên — DEV-2 (US-63) ===== */
  function initUsersTab(panel) {
    let currentPage = 1;
    let currentQuery = "";
    let currentStatus = "";
    let pagination = null;
    const session = getAuthSession();
    const currentUserId = session?.user?.id;

    panel.innerHTML = `
      <div class="admin-card users-tab">
        <h2 class="admin-card-title"><i class="fa-solid fa-users"></i> Quản lý thành viên</h2>
        <p class="admin-card-desc">Tìm kiếm thành viên theo tên hoặc email, quản lý quyền hạn và khóa / mở khóa tài khoản (US-63).</p>

        <div class="admin-field-row users-filter-row">
          <input type="text" class="admin-input" id="admin-users-search" placeholder="Tìm theo tên hoặc email..." />
          <select class="admin-input admin-select" id="admin-users-status">
            <option value="">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="banned">Bị khóa</option>
          </select>
          <button type="button" class="btn btn-primary" id="admin-users-search-btn">
            <i class="fa-solid fa-magnifying-glass"></i> Tìm
          </button>
        </div>

        <div id="admin-users-list" class="admin-users-list mt-3">
          <div class="admin-loading"><i class="fa-solid fa-spinner fa-spin"></i> Đang tải danh sách thành viên...</div>
        </div>

        <div class="pagination mt-4" id="admin-users-pagination" hidden>
          <button type="button" class="btn btn-outline" id="firstPage" title="Trang đầu"><i class="fa-solid fa-angles-left"></i></button>
          <button type="button" class="btn btn-outline" id="prevPage" title="Trang trước"><i class="fa-solid fa-angle-left"></i></button>
          <span class="pagination-info"><span id="currentPage">1</span> / <span id="totalPage">1</span></span>
          <button type="button" class="btn btn-outline" id="nextPage" title="Trang sau"><i class="fa-solid fa-angle-right"></i></button>
          <button type="button" class="btn btn-outline" id="lastPage" title="Trang cuối"><i class="fa-solid fa-angles-right"></i></button>
        </div>
      </div>
    `;

    pagination = setupPagination((page) => {
      currentPage = page;
      loadUsers();
      panel.scrollIntoView({ behavior: "smooth" });
    });

    const searchInput = panel.querySelector("#admin-users-search");
    const statusSelect = panel.querySelector("#admin-users-status");
    const searchBtn = panel.querySelector("#admin-users-search-btn");

    searchBtn?.addEventListener("click", () => {
      currentQuery = searchInput.value.trim();
      currentStatus = statusSelect.value;
      currentPage = 1;
      loadUsers();
    });

    searchInput?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        currentQuery = searchInput.value.trim();
        currentStatus = statusSelect.value;
        currentPage = 1;
        loadUsers();
      }
    });

    statusSelect?.addEventListener("change", () => {
      currentQuery = searchInput.value.trim();
      currentStatus = statusSelect.value;
      currentPage = 1;
      loadUsers();
    });

    async function loadUsers() {
      const listContainer = panel.querySelector("#admin-users-list");
      if (!listContainer) return;

      listContainer.innerHTML = '<div class="admin-loading"><i class="fa-solid fa-spinner fa-spin"></i> Đang tải...</div>';

      const res = await getAdminUsers({
        q: currentQuery,
        status: currentStatus,
        page: currentPage,
        limit: 10,
      });

      if (!res.success) {
        pagination?.setVisible(false);
        renderEmptyState(listContainer, {
          icon: "fa-solid fa-triangle-exclamation",
          message: res.error === "BACKEND_NOT_CONFIGURED" ? "Chưa kết nối backend." : (res.error || "Không tải được danh sách thành viên."),
          onRetry: loadUsers,
        });
        return;
      }

      const { items, pagination: pageInfo } = res.data?.data || { items: [], pagination: { totalPages: 1 } };

      if (!items || items.length === 0) {
        pagination?.setVisible(false);
        renderEmptyState(listContainer, {
          icon: "fa-solid fa-user-slash",
          message: currentQuery || currentStatus ? "Không tìm thấy thành viên nào khớp bộ lọc." : "Chưa có thành viên nào.",
        });
        return;
      }

      renderUsersTable(listContainer, items);
      pagination?.setVisible(pageInfo.totalPages > 1);
      pagination?.update(pageInfo.page, pageInfo.totalPages);
    }

    function renderUsersTable(container, users) {
      container.innerHTML = `
        <div class="admin-table-responsive">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Thành viên</th>
                <th>Email</th>
                <th>Vai trò</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th class="text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              ${users.map((u) => renderUserRow(u)).join("")}
            </tbody>
          </table>
        </div>
      `;

      container.querySelectorAll(".btn-toggle-ban").forEach((btn) => {
        btn.addEventListener("click", async () => {
          const userId = btn.dataset.id;
          const currentAction = btn.dataset.action;
          const username = btn.dataset.username;

          if (currentAction === "ban") {
            if (userId === currentUserId) {
              showToast("Không thể tự khóa tài khoản của chính mình", "error");
              return;
            }

            const confirmed = await showConfirmDialog({
              title: "Khóa tài khoản?",
              message: `Bạn có chắc muốn khóa tài khoản "${username}"? Người dùng này sẽ bị đăng xuất và không thể tiếp tục sử dụng.`,
              confirmText: "Khóa tài khoản",
              danger: true,
            });
            if (!confirmed) return;

            btn.disabled = true;
            const res = await setUserStatus(userId, "banned");
            if (res.success) {
              showToast(`Đã khóa tài khoản "${username}"`, "success");
              loadUsers();
            } else {
              btn.disabled = false;
              showToast(res.error || "Không thể khóa tài khoản", "error");
            }
          } else {
            const confirmed = await showConfirmDialog({
              title: "Mở khóa tài khoản?",
              message: `Mở khóa cho tài khoản "${username}"? Người dùng này sẽ có thể đăng nhập lại bình thường.`,
              confirmText: "Mở khóa",
            });
            if (!confirmed) return;

            btn.disabled = true;
            const res = await setUserStatus(userId, "active");
            if (res.success) {
              showToast(`Đã mở khóa tài khoản "${username}"`, "success");
              loadUsers();
            } else {
              btn.disabled = false;
              showToast(res.error || "Không thể mở khóa tài khoản", "error");
            }
          }
        });
      });
    }

    function renderUserRow(u) {
      const isSelf = u.id === currentUserId;
      const isSuper = u.role === "super_admin";
      const isBanned = u.status === "banned";
      const avatar = u.avatarUrl || APP_CONFIG.DEFAULT_AVATAR;

      let roleBadgeClass = "badge-member";
      let roleText = "Thành viên";
      if (u.role === "super_admin") {
        roleBadgeClass = "badge-super";
        roleText = "Super Admin";
      } else if (u.role === "admin") {
        roleBadgeClass = "badge-admin";
        roleText = "Admin";
      }

      let statusBadge = isBanned
        ? '<span class="user-status-badge status-banned"><i class="fa-solid fa-lock"></i> Bị khóa</span>'
        : '<span class="user-status-badge status-active"><i class="fa-solid fa-circle-check"></i> Hoạt động</span>';

      let actionBtn = "";
      if (isSelf) {
        actionBtn = '<span class="text-muted text-sm"><i class="fa-solid fa-user-tag"></i> Chính bạn</span>';
      } else if (isSuper) {
        actionBtn = '<span class="text-muted text-sm"><i class="fa-solid fa-shield"></i> Không thể khóa</span>';
      } else if (isBanned) {
        actionBtn = `
          <button type="button" class="btn btn-sm btn-outline btn-toggle-ban" data-id="${escapeHtml(u.id)}" data-username="${escapeHtml(u.username)}" data-action="unban">
            <i class="fa-solid fa-lock-open"></i> Mở khóa
          </button>
        `;
      } else {
        actionBtn = `
          <button type="button" class="btn btn-sm btn-danger-outline btn-toggle-ban" data-id="${escapeHtml(u.id)}" data-username="${escapeHtml(u.username)}" data-action="ban">
            <i class="fa-solid fa-ban"></i> Khóa
          </button>
        `;
      }

      return `
        <tr>
          <td>
            <div class="user-cell-info">
              <img src="${escapeHtml(avatar)}" alt="${escapeHtml(u.username)}" class="user-cell-avatar" onerror="this.src='${APP_CONFIG.DEFAULT_AVATAR}'" />
              <div class="user-cell-names">
                <strong>${escapeHtml(u.username)}</strong>
              </div>
            </div>
          </td>
          <td><span class="user-email-text">${escapeHtml(u.email || "—")}</span></td>
          <td><span class="user-role-badge ${roleBadgeClass}">${roleText}</span></td>
          <td>${statusBadge}</td>
          <td><span class="user-date-text">${formatDate(u.createdAt)}</span></td>
          <td class="text-right">${actionBtn}</td>
        </tr>
      `;
    }

    loadUsers();
  }

  /* ===== Tab Hệ thống — Lead (US-60, US-62) ===== */
  function initSystemTab(panel) {
    initSystemTabInner(panel);
  }

  /* ===== Tab Bộ nhớ — Lead (US-59) ===== */
  function initStorageTab(panel) {
    initStorageTabInner(panel);
  }

  // Hàm dùng chung cho placeholder — tab chưa ai làm thì hiện thông báo này.
  function renderTabPlaceholder(panel, message) {
    renderEmptyState(panel, {
      icon: "fa-solid fa-hammer",
      message,
    });
  }

  /* ================= Tab Hệ thống (Lead) ================= */

  let systemSettings = null;

  async function initSystemTabInner(panel) {
    renderSkeleton(panel.id ? panel.id : "admin-tab-panel", 1);
    panel.innerHTML = '<div class="admin-loading"><i class="fa-solid fa-spinner fa-spin"></i> Đang tải cấu hình...</div>';

    const res = await getSiteSettings();
    if (!res.success) {
      renderEmptyState(panel, {
        icon: "fa-solid fa-triangle-exclamation",
        message: res.error === "BACKEND_NOT_CONFIGURED" ? "Chưa cấu hình backend." : "Không tải được cấu hình.",
        onRetry: () => initSystemTabInner(panel),
      });
      return;
    }

    systemSettings = res.data?.data || {};
    panel.innerHTML = `
      <div class="admin-card">
        <h2 class="admin-card-title"><i class="fa-solid fa-thumbtack"></i> Phim nổi bật trang chủ</h2>
        <p class="admin-card-desc">Ghim một phim vào banner trang chủ. Bỏ ghim → tự chọn phim mới nhất (US-60).</p>
        <div class="admin-field-row">
          <input type="text" class="admin-input" id="admin-pinned-slug"
                 placeholder="VD: muc-than-ky (slug phim trên phimapi)"
                 value="${escapeHtml(systemSettings.pinnedHeroSlug || "")}" />
          <button type="button" class="btn btn-primary" id="admin-pin-save"><i class="fa-solid fa-thumbtack"></i> Ghim</button>
          <button type="button" class="btn btn-outline" id="admin-pin-clear" ${systemSettings.pinnedHeroSlug ? "" : "hidden"}>
            <i class="fa-solid fa-rotate-right"></i> Khôi phục tự động
          </button>
        </div>
      </div>

      <div class="admin-card">
        <h2 class="admin-card-title"><i class="fa-solid fa-screwdriver-wrench"></i> Chế độ bảo trì</h2>
        <p class="admin-card-desc">Bật → khách chỉ thấy màn hình bảo trì, không gửi được dữ liệu. Admin vẫn dùng bình thường (US-62).</p>
        <label class="admin-switch-row">
          <input type="checkbox" id="admin-maintenance-toggle" ${systemSettings.maintenanceMode ? "checked" : ""} />
          <span>Bật chế độ bảo trì</span>
        </label>
        <div class="admin-field-row">
          <input type="text" class="admin-input" id="admin-maintenance-message" maxlength="500"
                 placeholder="Lời nhắn cho người dùng khi bảo trì"
                 value="${escapeHtml(systemSettings.maintenanceMessage || "")}" />
        </div>
      </div>

      <div class="admin-card">
        <h2 class="admin-card-title"><i class="fa-solid fa-server"></i> Nguồn phim dự phòng</h2>
        <p class="admin-card-desc">phimapi.com gặp sự cố → chuyển sang máy chủ khác. Trống → dùng nguồn mặc định (US-62).</p>
        <div class="admin-field-row">
          <input type="text" class="admin-input" id="admin-movie-api" placeholder="https://..."
                 value="${escapeHtml(systemSettings.movieApiBaseUrl || "")}" />
          <button type="button" class="btn btn-primary" id="admin-movie-api-save">Lưu</button>
        </div>
      </div>
    `;

    panel.querySelector("#admin-pin-save").addEventListener("click", () => savePinnedHero(panel));
    panel.querySelector("#admin-pin-clear").addEventListener("click", () => saveSettings(panel, { pinnedHeroSlug: null }));
    panel.querySelector("#admin-maintenance-toggle").addEventListener("change", (e) =>
      saveSettings(panel, { maintenanceMode: e.target.checked }, { keepForm: true }),
    );
    panel.querySelector("#admin-maintenance-message").addEventListener("change", (e) =>
      saveSettings(panel, { maintenanceMessage: e.target.value }, { keepForm: true }),
    );
    panel.querySelector("#admin-movie-api-save").addEventListener("click", () => {
      const url = panel.querySelector("#admin-movie-api").value.trim();
      saveSettings(panel, { movieApiBaseUrl: url || null });
    });
  }

  async function savePinnedHero(panel) {
    const slug = panel.querySelector("#admin-pinned-slug").value.trim();
    if (!slug) {
      showToast("Nhập slug phim cần ghim, hoặc bấm \"Khôi phục tự động\".", "warning");
      return;
    }
    await saveSettings(panel, { pinnedHeroSlug: slug });
  }

  async function saveSettings(panel, patch, { keepForm = false } = {}) {
    const res = await updateAdminSettings(patch);
    if (!res.success) {
      const code = res.data?.error?.code;
      showToast(
        code === "MOVIE_NOT_FOUND"
          ? "Không tìm thấy phim với slug này trên nguồn phim"
          : res.error || "Không lưu được cấu hình",
        "error",
      );
      if (!keepForm) initSystemTabInner(panel); // nạp lại giá trị thật từ server
      return;
    }

    systemSettings = res.data?.data;
    if (systemSettings.movieApiBaseUrl) setMovieApiBaseUrl(systemSettings.movieApiBaseUrl);
    else if (patch.movieApiBaseUrl !== undefined) setMovieApiBaseUrl(null);
    showToast("Đã lưu cấu hình", "success");

    if (patch.maintenanceMode !== undefined) {
      applySiteSettings(); // vừa bật/tắt bảo trì → áp ngay lên trang này
    }
    if (!keepForm) initSystemTabInner(panel);
  }

  /* ================= Tab Bộ nhớ (Lead — US-59) ================= */

  // US-59: ĐO mọi key (gồm rophim_*) + sessionStorage; chỉ DỌN key không thuộc STORAGE_KEYS và toàn bộ sessionStorage (Sc3).
  async function initStorageTabInner(panel) {
    const { keys, bytes, sessionBytes } = measureStorage();
    const cleanable = keys.filter((k) => !k.protected);
    panel.innerHTML = `
      <div class="admin-card">
        <h2 class="admin-card-title"><i class="fa-solid fa-database"></i> Dữ liệu tạm trên trình duyệt</h2>
        <p class="admin-card-desc">Đo dung lượng localStorage và sessionStorage của trang này. Dọn dẹp chỉ xóa dữ liệu tạm —
        giữ nguyên phiên đăng nhập, cài đặt, yêu thích và lịch sử xem (US-59 Sc3).</p>
        <div class="admin-storage-stats">
          <div class="admin-storage-item"><strong>${formatNumber(keys.length)}</strong><span>key localStorage</span></div>
          <div class="admin-storage-item"><strong>${formatNumber(bytes)}</strong><span>byte localStorage</span></div>
          <div class="admin-storage-item"><strong>${formatNumber(sessionBytes)}</strong><span>byte sessionStorage</span></div>
        </div>
        ${keys.length === 0 ? '<p class="admin-card-desc">Không có dữ liệu nào trong localStorage.</p>' : `
        <ul class="admin-storage-keys">
          ${keys.map((k) => `<li><code>${escapeHtml(k.name)}</code>
            <span>${formatNumber(k.bytes)} byte${k.protected ? ' · <i class="fa-solid fa-lock"></i> giữ lại' : ""}</span></li>`).join("")}
        </ul>`}
        <button type="button" class="btn btn-danger" id="admin-storage-clean" ${cleanable.length === 0 && sessionBytes === 0 ? "disabled" : ""}>
          <i class="fa-solid fa-broom"></i> Dọn dẹp
        </button>
      </div>
    `;

    panel.querySelector("#admin-storage-clean").addEventListener("click", async () => {
      const ok = await showConfirmDialog({
        title: "Dọn dữ liệu tạm",
        message: "Xóa các key không thuộc cài đặt của RoPhim và toàn bộ sessionStorage? Phiên đăng nhập, cài đặt, yêu thích và lịch sử xem được giữ nguyên.",
        confirmText: "Dọn dẹp",
        cancelText: "Hủy",
        danger: true,
      });
      if (!ok) return;

      let cleaned = 0;
      cleanable.forEach((k) => {
        try {
          localStorage.removeItem(k.name);
          cleaned += 1;
        } catch {} // key có thể thuộc tiện ích trình duyệt — bỏ qua khi không xóa được
      });
      try {
        sessionStorage.clear();
      } catch {}
      showToast(`Đã dọn ${cleaned} key tạm`, "success");
      initStorageTabInner(panel);
    });
  }

  function measureStorage() {
    const protectedKeys = new Set(Object.values(STORAGE_KEYS));
    const keys = [];
    let bytes = 0;

    for (let i = 0; i < localStorage.length; i += 1) {
      const name = localStorage.key(i);
      if (!name) continue;
      const size = (localStorage.getItem(name) || "").length + name.length;
      keys.push({ name, bytes: size, protected: protectedKeys.has(name) });
      bytes += size;
    }
    keys.sort((a, b) => b.bytes - a.bytes);

    let sessionBytes = 0;
    try {
      for (let i = 0; i < sessionStorage.length; i += 1) {
        const name = sessionStorage.key(i);
        sessionBytes += (sessionStorage.getItem(name) || "").length + (name || "").length;
      }
    } catch {}

    return { keys, bytes, sessionBytes };
  }
})();
