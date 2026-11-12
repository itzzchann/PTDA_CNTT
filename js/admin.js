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
  async function initDashboardTab(panel) {
    panel.innerHTML = '<div class="admin-loading"><i class="fa-solid fa-spinner fa-spin"></i> Đang tải dữ liệu thống kê...</div>';

    const res = await getAdminStats(7);
    if (!res.success) {
      renderEmptyState(panel, {
        icon: "fa-solid fa-triangle-exclamation",
        message: res.error === "BACKEND_NOT_CONFIGURED" ? "Chưa kết nối backend." : "Không tải được thống kê.",
        onRetry: () => initDashboardTab(panel),
      });
      return;
    }

    const stats = res.data?.data || res.data || {};
    const totals = stats.totals || { users: 0, comments: 0, ratings: 0, views: 0 };
    const topViewed = stats.topViewed || [];
    const recentActivity = stats.recentActivity || [];

    panel.innerHTML = `
      <!-- Thẻ số liệu thống kê (US-58 Sc1) -->
      <div class="admin-stats-grid">
        <div class="admin-stat-card">
          <div class="admin-stat-icon"><i class="fa-solid fa-users"></i></div>
          <div class="admin-stat-info">
            <span class="admin-stat-value">${formatNumber(totals.users || 0)}</span>
            <span class="admin-stat-label">Thành viên</span>
          </div>
        </div>

        <div class="admin-stat-card">
          <div class="admin-stat-icon"><i class="fa-solid fa-eye"></i></div>
          <div class="admin-stat-info">
            <span class="admin-stat-value">${formatNumber(totals.views || 0)}</span>
            <span class="admin-stat-label">Lượt xem (7 ngày)</span>
          </div>
        </div>

        <div class="admin-stat-card">
          <div class="admin-stat-icon"><i class="fa-solid fa-comments"></i></div>
          <div class="admin-stat-info">
            <span class="admin-stat-value">${formatNumber(totals.comments || 0)}</span>
            <span class="admin-stat-label">Bình luận</span>
          </div>
        </div>

        <div class="admin-stat-card">
          <div class="admin-stat-icon"><i class="fa-solid fa-star"></i></div>
          <div class="admin-stat-info">
            <span class="admin-stat-value">${formatNumber(totals.ratings || 0)}</span>
            <span class="admin-stat-label">Đánh giá</span>
          </div>
        </div>
      </div>

      <!-- Top 10 phim xem nhiều nhất (US-58 Sc2) -->
      <div class="admin-card">
        <h2 class="admin-card-title"><i class="fa-solid fa-chart-line"></i> Top 10 phim xem nhiều nhất</h2>
        <p class="admin-card-desc">Thống kê dựa trên lượt truy cập xem phim thực tế từ người dùng.</p>
        <div class="admin-table-wrapper" id="admin-top-movies-container">
          <div class="admin-loading"><i class="fa-solid fa-spinner fa-spin"></i> Đang tải thông tin phim...</div>
        </div>
      </div>

      <!-- Hoạt động gần đây -->
      <div class="admin-card">
        <h2 class="admin-card-title"><i class="fa-solid fa-clock-rotate-left"></i> Hoạt động gần đây</h2>
        <p class="admin-card-desc">Các tương tác mới nhất của thành viên trên hệ thống.</p>
        <div class="admin-activity-list" id="admin-activity-container">
          ${renderRecentActivity(recentActivity)}
        </div>
      </div>
    `;

    renderTopMoviesTable(panel.querySelector("#admin-top-movies-container"), topViewed);
  }

  async function renderTopMoviesTable(container, topViewed) {
    if (!container) return;

    if (!topViewed || topViewed.length === 0) {
      container.innerHTML = '<p class="admin-card-desc" style="margin: 10px 0;">Chưa có dữ liệu lượt xem phim nào.</p>';
      return;
    }

    // Lấy thông tin chi tiết tên/poster từ phimapi cho top 10 phim
    const movieDetails = await Promise.allSettled(
      topViewed.slice(0, 10).map((item) => getMovieDetail(item.movieSlug)),
    );

    const rowsHtml = topViewed.slice(0, 10).map((item, index) => {
      const res = movieDetails[index];
      const movie = res.status === "fulfilled" && res.value?.success ? res.value.data?.data?.item : null;
      const title = movie?.name || movie?.origin_name || item.movieSlug;
      const poster = movie?.poster_url || movie?.thumb_url || "assets/images/defaults/no-poster.svg";

      return `
        <tr>
          <td style="font-weight: 700; width: 40px; text-align: center;">#${index + 1}</td>
          <td>
            <div class="admin-movie-cell">
              <img src="${escapeHtml(poster)}" class="admin-movie-thumb" alt="${escapeHtml(title)}" onerror="this.src='assets/images/defaults/no-poster.svg'">
              <div>
                <div style="font-weight: 600; color: #fff;">${escapeHtml(title)}</div>
                <div style="font-size: 12px; color: var(--text-muted);">${escapeHtml(item.movieSlug)}</div>
              </div>
            </div>
          </td>
          <td style="font-weight: 700; color: var(--primary-color);">${formatNumber(item.views || 0)}</td>
          <td>
            <a href="watch.html?slug=${encodeURIComponent(item.movieSlug)}" target="_blank" class="btn btn-outline btn-sm">
              <i class="fa-solid fa-play"></i> Xem
            </a>
          </td>
        </tr>
      `;
    }).join("");

    container.innerHTML = `
      <table class="admin-table">
        <thead>
          <tr>
            <th style="width: 40px; text-align: center;">Hạng</th>
            <th>Phim</th>
            <th>Lượt xem</th>
            <th style="width: 90px;">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    `;
  }

  function renderRecentActivity(activities) {
    if (!activities || activities.length === 0) {
      return '<p class="admin-card-desc">Chưa có hoạt động nào gần đây.</p>';
    }

    return activities.map((act) => {
      let icon = "fa-solid fa-bell";
      let desc = "";

      if (act.type === "comment") {
        icon = "fa-solid fa-comment";
        desc = `<strong>${escapeHtml(act.username || "Thành viên")}</strong> đã bình luận ở phim <em>${escapeHtml(act.movieSlug || "")}</em>`;
      } else if (act.type === "rating") {
        icon = "fa-solid fa-star";
        desc = `<strong>${escapeHtml(act.username || "Thành viên")}</strong> đã đánh giá phim <em>${escapeHtml(act.movieSlug || "")}</em>`;
      } else if (act.type === "register") {
        icon = "fa-solid fa-user-plus";
        desc = `<strong>${escapeHtml(act.username || "Thành viên")}</strong> đã đăng ký tài khoản mới`;
      }

      const timeStr = act.createdAt ? formatDate(act.createdAt) : "";

      return `
        <div class="admin-activity-item">
          <div class="admin-activity-icon"><i class="${icon}"></i></div>
          <div class="admin-activity-desc">${desc}</div>
          <div class="admin-activity-time">${timeStr}</div>
        </div>
      `;
    }).join("");
  }

  /* ===== Tab Bình luận — DEV-1 (US-61) ===== */
  let currentCommentsQuery = { page: 1, limit: 20, q: "", movieSlug: "" };

  async function initCommentsTab(panel) {
    panel.innerHTML = `
      <div class="admin-card">
        <h2 class="admin-card-title"><i class="fa-solid fa-comments"></i> Quản lý & kiểm duyệt bình luận</h2>
        <p class="admin-card-desc">Kiểm duyệt nội dung, gắn cờ tiết lộ cốt truyện (spoiler) hoặc gỡ bỏ bình luận vi phạm (US-61).</p>
        
        <div class="admin-field-row" style="margin-bottom: 16px;">
          <input type="text" class="admin-input" id="admin-cmt-search" placeholder="Tìm theo nội dung hoặc tên người dùng..." value="${escapeHtml(currentCommentsQuery.q)}" />
          <input type="text" class="admin-input" id="admin-cmt-slug" placeholder="Lọc theo slug phim (VD: muc-than-ky)..." value="${escapeHtml(currentCommentsQuery.movieSlug)}" />
          <button type="button" class="btn btn-primary" id="admin-cmt-filter-btn"><i class="fa-solid fa-magnifying-glass"></i> Lọc</button>
          <button type="button" class="btn btn-outline" id="admin-cmt-reset-btn"><i class="fa-solid fa-rotate-left"></i> Đặt lại</button>
        </div>

        <div id="admin-comments-table-wrapper" class="admin-table-wrapper">
          <div class="admin-loading"><i class="fa-solid fa-spinner fa-spin"></i> Đang tải danh sách bình luận...</div>
        </div>
      </div>
    `;

    panel.querySelector("#admin-cmt-filter-btn").addEventListener("click", () => {
      currentCommentsQuery.q = panel.querySelector("#admin-cmt-search").value.trim();
      currentCommentsQuery.movieSlug = panel.querySelector("#admin-cmt-slug").value.trim();
      currentCommentsQuery.page = 1;
      loadAdminCommentsList(panel);
    });

    panel.querySelector("#admin-cmt-reset-btn").addEventListener("click", () => {
      panel.querySelector("#admin-cmt-search").value = "";
      panel.querySelector("#admin-cmt-slug").value = "";
      currentCommentsQuery.q = "";
      currentCommentsQuery.movieSlug = "";
      currentCommentsQuery.page = 1;
      loadAdminCommentsList(panel);
    });

    await loadAdminCommentsList(panel);
  }

  async function loadAdminCommentsList(panel) {
    const wrapper = panel.querySelector("#admin-comments-table-wrapper");
    if (!wrapper) return;

    wrapper.innerHTML = '<div class="admin-loading"><i class="fa-solid fa-spinner fa-spin"></i> Đang tải danh sách...</div>';

    const res = await getAdminComments(currentCommentsQuery);
    if (!res.success) {
      wrapper.innerHTML = `
        <div class="admin-loading" style="color: var(--error-color);">
          <i class="fa-solid fa-triangle-exclamation"></i>
          ${res.error === "BACKEND_NOT_CONFIGURED" ? "Chưa kết nối backend." : "Không tải được danh sách bình luận."}
        </div>`;
      return;
    }

    const dataObj = res.data?.data || res.data || {};
    const items = dataObj.items || [];
    const pagination = dataObj.pagination || { total: items.length };

    if (items.length === 0) {
      wrapper.innerHTML = '<p class="admin-card-desc" style="padding: 20px 0;">Không tìm thấy bình luận nào phù hợp.</p>';
      return;
    }

    wrapper.innerHTML = `
      <table class="admin-table">
        <thead>
          <tr>
            <th>Người gửi</th>
            <th>Phim / Tập</th>
            <th>Nội dung</th>
            <th>Trạng thái</th>
            <th>Thời gian</th>
            <th style="width: 170px;">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          ${items.map((c) => {
            const user = c.user || {};
            const isSpoiler = Boolean(c.isSpoiler);
            const epText = c.episode ? `(Tập ${escapeHtml(c.episode)})` : "";
            const timeText = c.createdAt ? formatDate(c.createdAt) : "";

            return `
              <tr id="admin-cmt-row-${escapeHtml(c.id)}">
                <td>
                  <div style="font-weight: 600; color: #fff;">${escapeHtml(user.username || "Khách")}</div>
                  <div style="font-size: 11px; color: var(--text-muted);">${escapeHtml(user.id || "")}</div>
                </td>
                <td>
                  <div style="font-weight: 500;">${escapeHtml(c.movieSlug || "")} ${epText}</div>
                </td>
                <td style="max-width: 320px; word-break: break-word;">
                  ${escapeHtml(c.content || "")}
                </td>
                <td>
                  ${isSpoiler ? '<span class="admin-badge-spoil"><i class="fa-solid fa-eye-slash"></i> Spoil</span>' : '<span class="admin-badge-clean"><i class="fa-solid fa-check"></i> Bình thường</span>'}
                </td>
                <td style="font-size: 12px; color: var(--text-muted); white-space: nowrap;">
                  ${timeText}
                </td>
                <td>
                  <div class="admin-actions-cell">
                    <button type="button" class="btn btn-outline btn-sm btn-flag-spoil" data-id="${escapeHtml(c.id)}" data-spoil="${isSpoiler}">
                      <i class="fa-solid fa-mask"></i> ${isSpoiler ? "Bỏ Spoil" : "Gắn Spoil"}
                    </button>
                    <button type="button" class="btn btn-danger btn-sm btn-del-cmt" data-id="${escapeHtml(c.id)}">
                      <i class="fa-solid fa-trash"></i> Xóa
                    </button>
                  </div>
                </td>
              </tr>
            `;
          }).join("")}
        </tbody>
      </table>
      <div style="margin-top: 14px; font-size: 13px; color: var(--text-muted);">
        Tổng số: <strong>${pagination.total || items.length}</strong> bình luận
      </div>
    `;

    // Gắn sự kiện gắn cờ spoil
    wrapper.querySelectorAll(".btn-flag-spoil").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.id;
        const currentSpoil = btn.dataset.spoil === "true";
        const newSpoil = !currentSpoil;

        const updateRes = await flagCommentSpoiler(id);
        if (updateRes.success) {
          showToast(newSpoil ? "Đã đánh dấu bình luận chứa nội dung Spoil" : "Đã cập nhật trạng thái bình luận", "success");
          loadAdminCommentsList(panel);
        } else {
          showToast(updateRes.error || "Không cập nhật được trạng thái spoil", "error");
        }
      });
    });

    // Gắn sự kiện xóa bình luận (có xác nhận US-61)
    wrapper.querySelectorAll(".btn-del-cmt").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.id;
        if (!id) return;

        const confirmed = typeof showConfirmDialog === "function"
          ? await showConfirmDialog({
              title: "Xóa bình luận vi phạm",
              message: "Bạn có chắc chắn muốn gỡ bỏ bình luận này không? Bình luận sẽ bị ẩn khỏi trang xem phim.",
              confirmText: "Gỡ bỏ",
              danger: true,
            })
          : confirm("Bạn có chắc chắn muốn gỡ bỏ bình luận này không?");

        if (!confirmed) return;

        const delRes = await deleteAdminComment(id);
        if (delRes.success) {
          showToast("Đã xóa bình luận thành công", "success");
          const row = document.getElementById(`admin-cmt-row-${id}`);
          if (row) row.remove();
        } else {
          showToast(delRes.error || "Không thể xóa bình luận", "error");
        }
      });
    });
  }

  /* ===== Tab Thành viên — DEV-2 (US-63) ===== */
  function initUsersTab(panel) {
    renderTabPlaceholder(panel, "Tab Thành viên — DEV-2 đang làm (US-63)");
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
