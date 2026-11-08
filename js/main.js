function initializeApp() {
  setupMobileMenu();
  setupSearch();
  setupScrollEffects();
  renderMenuDropdowns();
  setupGlobalFavoriteHandler();
  setupAuthHeader();
  applySiteSettings(); // US-60/US-62: bảo trì + nguồn phim — lỗi backend thì trang vẫn chạy như V1
}

/**
 * Đọc cấu hình công khai từ backend (US-62): bảo trì + nguồn phim dự phòng.
 * Bảo trì bật → khách (kể cả chưa đăng nhập) chỉ thấy màn hình bảo trì; admin vẫn dùng bình thường.
 * settings.movieApiBaseUrl có giá trị → các wrapper phimapi chuyển sang nguồn đó (US-62 Sc1).
 */
async function applySiteSettings() {
  const res = await getSiteSettings();
  if (!res.success) return; // BACKEND_NOT_CONFIGURED / lỗi mạng / Render đang ngủ → bỏ qua, dùng mặc định

  const settings = res.data?.data || {};

  if (settings.movieApiBaseUrl) {
    setMovieApiBaseUrl(settings.movieApiBaseUrl);
  }

  if (settings.maintenanceMode) {
    const session = getAuthSession();
    const isAdmin = session?.user?.role === "admin" || session?.user?.role === "super_admin";
    if (!isAdmin) showMaintenanceScreen(settings.maintenanceMessage || "");
  }
}

/** Màn hình bảo trì trọn trang (US-62 Sc2) — không xóa nội dung để admin quay lại được khi tắt bảo trì. */
function showMaintenanceScreen(message) {
  if (document.getElementById("maintenance-screen")) return;

  const screen = document.createElement("div");
  screen.id = "maintenance-screen";
  screen.className = "maintenance-screen";
  screen.innerHTML = `
    <div class="maintenance-box">
      <i class="fa-solid fa-screwdriver-wrench maintenance-icon"></i>
      <h1 class="maintenance-title">RoPhim đang bảo trì</h1>
      <p class="maintenance-message"></p>
    </div>
  `;
  screen.querySelector(".maintenance-message").textContent = message || "Chúng tôi đang nâng cấp hệ thống. Vui lòng quay lại sau ít phút.";

  document.body.appendChild(screen);
}

/**
 * Header theo trạng thái đăng nhập — US-18 Sc2, US-19 Sc1/Sc3, US-18 Sc4.
 * Chưa đăng nhập: giữ nút "Thành viên". Đã đăng nhập: avatar + tên + menu cá nhân
 * (link Admin nếu role admin, Đăng xuất). Xử lý `auth:expired` không dừng video.
 */
function setupAuthHeader() {
  renderAuthHeader();

  document.addEventListener("auth:expired", () => {
    renderAuthHeader();
    showToast("Phiên đăng nhập đã hết hạn", "warning");
  });
}

function renderAuthHeader() {
  const loginBtn = document.querySelector("#main_user .button-login");
  const userMenu = document.getElementById("user-menu");
  if (!loginBtn || !userMenu) return;

  const session = getAuthSession();
  if (!session?.user) {
    loginBtn.hidden = false;
    userMenu.hidden = true;
    userMenu.innerHTML = "";
    return;
  }

  loginBtn.hidden = true;
  userMenu.hidden = false;

  const username = escapeHtml(session.user.username);
  const avatar = escapeHtml(session.user.avatarUrl || APP_CONFIG.DEFAULT_AVATAR);
  const isAdmin = session.user.role === "admin" || session.user.role === "super_admin";

  userMenu.innerHTML = `
    <button type="button" class="button-user button-user-active" aria-haspopup="true" aria-expanded="false">
      <img class="user-avatar" src="${avatar}" alt="">
      <span>${username}</span>
      <i class="fa-solid fa-caret-down"></i>
    </button>
    <div class="dropdown-content dropdown-narrow user-menu-content">
      <div class="dropdown-grid dropdown-grid-single">
        ${isAdmin ? `<a href="admin.html" class="dropdown-item"><i class="fa-solid fa-sliders me-2"></i> Quản trị</a>` : ""}
        <button type="button" class="dropdown-item user-menu-logout"><i class="fa-solid fa-arrow-right-from-bracket me-2"></i> Đăng xuất</button>
      </div>
    </div>
  `;

  const trigger = userMenu.querySelector(".button-user-active");
  const content = userMenu.querySelector(".user-menu-content");
  trigger.addEventListener("click", (e) => {
    e.stopPropagation();
    const open = userMenu.classList.toggle("open");
    trigger.setAttribute("aria-expanded", String(open));
  });

  userMenu.querySelector(".user-menu-logout").addEventListener("click", logout);

  // Gắn 1 lần duy nhất: renderAuthHeader chạy lại mỗi khi phiên đổi (login/logout/401)
  if (!renderAuthHeader._outsideClickBound) {
    renderAuthHeader._outsideClickBound = true;
    document.addEventListener("click", (e) => {
      const menu = document.getElementById("user-menu");
      if (menu?.classList.contains("open") && !menu.contains(e.target)) {
        menu.classList.remove("open");
        menu.querySelector(".button-user-active")?.setAttribute("aria-expanded", "false");
      }
    });
  }
}

async function logout() {
  await logoutUser(); // lỗi cũng kệ — đăng xuất cục bộ vẫn phải chạy
  clearAuthSession(); // KHÔNG xóa USER_PREFERENCES (US-19 Sc2)
  renderAuthHeader();
  showToast("Đã đăng xuất", "success");
}

/**
 * Khách bấm ♥ khi backend đã có (US-18 Sc4): hộp thoại mời đăng nhập thay vì lưu localStorage.
 * Backend chưa cấu hình → giữ hành vi V1 (lưu localStorage).
 */
async function confirmLoginRequired() {
  if (BACKEND_CONFIG.BASE_URL && !isLoggedIn()) {
    const ok = await showConfirmDialog({
      title: "Yêu cầu đăng nhập",
      message:
        "Đăng nhập để lưu phim yêu thích và đồng bộ trên mọi thiết bị của bạn.",
      confirmText: "Đăng nhập",
      cancelText: "Để sau",
    });
    if (ok) {
      window.location.href = `login.html?next=${encodeURIComponent(location.pathname + location.search)}`;
    }
    return true; // đã xử lý (đăng nhập hoặc bỏ qua) — trang gọi không cần làm gì thêm
  }
  return false;
}

function setupGlobalFavoriteHandler() {
  document.addEventListener("click", async function (e) {
    const btn = e.target.closest(".btn-favorite[data-movie]");
    if (!btn) return;

    e.preventDefault();
    e.stopPropagation();

    if (await confirmLoginRequired()) return; // US-18 Sc4: khách + đã có backend → mời đăng nhập

    try {
      const movieData = JSON.parse(btn.getAttribute("data-movie"));
      const isFav = toggleFavorite(movieData);

      const allBtns = document.querySelectorAll(
        `.btn-favorite[data-slug="${CSS.escape(movieData.slug)}"]`,
      );

      allBtns.forEach((b) => {
        b.classList.toggle("active", isFav);
        b.querySelector("i").className = isFav
          ? "fa-solid fa-heart"
          : "fa-regular fa-heart";
        b.title = isFav ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích";
        b.setAttribute("aria-label", b.title);
      });
    } catch (err) {
      console.error("Lỗi xử lý yêu thích:", err);
    }
  });
}

function setupMobileMenu() {
  const menuToggle = document.querySelector(".menu-toggle");
  const mainMenu = document.getElementById("main_menu");
  if (!menuToggle || !mainMenu) return;

  const setMenuOpen = (open) => {
    mainMenu.classList.toggle("active", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    const icon = menuToggle.querySelector("i");
    if (icon) icon.className = open ? "fa-solid fa-xmark" : "fa-solid fa-bars";
  };

  menuToggle.addEventListener("click", function (e) {
    e.stopPropagation();
    setMenuOpen(!mainMenu.classList.contains("active"));
  });

  // Màn hình cảm ứng không có hover: chạm "Thể loại/Quốc gia/Thêm" để mở danh sách con.
  mainMenu
    .querySelectorAll(".menu-item-sub .dropdown > a")
    .forEach((trigger) => {
      trigger.addEventListener("click", (e) => {
        e.preventDefault();
        trigger.closest(".menu-item-sub").classList.toggle("open");
      });
    });

  document.addEventListener("click", function (e) {
    if (!mainMenu.contains(e.target) && !menuToggle.contains(e.target)) {
      setMenuOpen(false);
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") setMenuOpen(false);
  });
}

function setupSearch() {
  const searchToggle = document.querySelector(".search-toggle");
  const searchBox = document.getElementById("search");
  const searchInput = document.getElementById("main-search");

  if (searchToggle && searchBox) {
    searchToggle.addEventListener("click", function (e) {
      e.stopPropagation();
      searchBox.classList.toggle("active");
      if (searchBox.classList.contains("active")) {
        searchInput?.focus();
      }
    });
  }

  if (!searchInput) return;

  const debouncedSearch = debounce(
    handleSearch,
    APP_CONFIG.SEARCH_DEBOUNCE_TIME,
  );

  searchInput.addEventListener("input", function (e) {
    const keyword = e.target.value.trim();
    if (keyword.length >= APP_CONFIG.SEARCH_MIN_LENGTH) {
      debouncedSearch(keyword);
    } else {
      debouncedSearch.cancel();
      hideSearchResults();
    }
  });

  searchInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      const keyword = e.target.value.trim();
      if (keyword) {
        debouncedSearch.cancel();
        goToSearchPage(keyword);
      }
    } else if (e.key === "Escape") {
      hideSearchResults();
    }
  });

  document.addEventListener("click", function (e) {
    const box = document.getElementById("search");
    if (box && !box.contains(e.target)) {
      hideSearchResults();
    }
  });
}

async function handleSearch(keyword) {
  if (!keyword || keyword.trim().length < APP_CONFIG.SEARCH_MIN_LENGTH) {
    hideSearchResults();
    return;
  }

  const result = await searchMovies(keyword);

  // Bỏ kết quả của từ khóa cũ nếu người dùng đã gõ tiếp / xóa trong lúc chờ API.
  const currentKeyword = document.getElementById("main-search")?.value.trim();
  if (currentKeyword !== keyword) return;

  if (result.success) {
    showSearchResults(extractMovieItems(result), keyword);
  } else {
    showSearchMessage("Không tải được gợi ý. Kiểm tra kết nối mạng rồi thử lại.");
  }
}

function getSearchDropdown() {
  const searchBox = document.getElementById("search");
  if (!searchBox) return null;
  let resultsDropdown = document.getElementById("search-results-dropdown");

  if (!resultsDropdown) {
    resultsDropdown = document.createElement("div");
    resultsDropdown.id = "search-results-dropdown";
    resultsDropdown.className = "search-results-dropdown";
    searchBox.appendChild(resultsDropdown);
  }

  resultsDropdown.classList.add("active");
  return resultsDropdown;
}

function showSearchMessage(message) {
  const resultsDropdown = getSearchDropdown();
  if (!resultsDropdown) return;
  resultsDropdown.innerHTML = `<div class="search-no-results">${escapeHtml(message)}</div>`;
}

function showSearchResults(movies, keyword) {
  const resultsDropdown = getSearchDropdown();
  if (!resultsDropdown) return;
  const safeKeyword = escapeHtml(keyword);

  if (movies.length === 0) {
    resultsDropdown.innerHTML = `<div class="search-no-results">Không tìm thấy phim cho "${safeKeyword}"</div>`;
    return;
  }

  let html = movies
    .slice(0, 5)
    .map((movie) => {
      const thumb = getImageUrl(movie.thumb_url || movie.poster_url || "");
      const name = escapeHtml(movie.name);
      const meta = escapeHtml(
        `${movie.year || "Đang cập nhật"} • ${movie.episode_current || "Full"}`,
      );

      return `
      <a class="search-result-item" href="detail.html?slug=${encodeURIComponent(movie.slug)}">
        <div class="search-result-thumb">
          <img src="${escapeHtml(thumb)}" alt="${name}" loading="lazy"
               onerror="this.onerror=null;this.src='${APP_CONFIG.DEFAULT_POSTER}'">
        </div>
        <div class="search-result-info">
          <div class="search-result-title">${name}</div>
          <div class="search-result-meta">${meta}</div>
        </div>
      </a>
    `;
    })
    .join("");

  html += `
    <div class="search-view-all">
      <a href="search.html?q=${encodeURIComponent(keyword)}">Xem tất cả kết quả cho "${safeKeyword}"</a>
    </div>
  `;

  resultsDropdown.innerHTML = html;
}

function hideSearchResults() {
  const resultsDropdown = document.getElementById("search-results-dropdown");
  if (resultsDropdown) {
    resultsDropdown.classList.remove("active");
  }
}

function goToSearchPage(keyword) {
  window.location.href = `search.html?q=${encodeURIComponent(keyword)}`;
}

async function renderMenuDropdowns() {
  const dropdownConfigs = [
    {
      id: "nav-categories",
      type: "api",
      fetchFn: getCategoriesList,
      urlPrefix: "category.html?slug=",
      fallbackData: CATEGORIES,
    },
    {
      id: "nav-countries",
      type: "api",
      fetchFn: getCountriesList,
      urlPrefix: "country.html?slug=",
      fallbackData: COUNTRIES,
    },
    {
      id: "nav-more",
      type: "static",
      extraClass: "dropdown-narrow",
      items: [
        {
          url: "favorites.html",
          icon: "fa-solid fa-heart",
          text: "Phim yêu thích",
        },
        {
          url: "history.html",
          icon: "fa-solid fa-clock-rotate-left",
          text: "Lịch sử xem",
        },
      ],
    },
  ];

  for (const config of dropdownConfigs) {
    renderDropdown(config);
  }
}

async function renderDropdown(config) {
  const { id, type, extraClass = "" } = config;
  const container = document.getElementById(id);
  if (!container) return;

  const dropdownContent = document.createElement("div");
  dropdownContent.className = `dropdown-content ${extraClass}`.trim();

  let html = "";

  if (type === "api") {
    const { fetchFn, urlPrefix, fallbackData } = config;
    const result = await fetchFn();
    let items = result.success ? extractMovieItems(result) : [];
    if (items.length === 0 && Array.isArray(result.data)) items = result.data;
    if (items.length === 0) items = fallbackData;

    html = '<div class="dropdown-grid">';
    items.forEach((item) => {
      html += `<a href="${urlPrefix}${encodeURIComponent(item.slug)}" class="dropdown-item">${escapeHtml(item.name)}</a>`;
    });
    html += "</div>";
  } else if (type === "static") {
    const { items } = config;
    html = '<div class="dropdown-grid dropdown-grid-single">';
    items.forEach((item) => {
      html += `
        <a href="${item.url}" class="dropdown-item">
          <i class="${item.icon} me-2"></i> ${escapeHtml(item.text)}
        </a>`;
    });
    html += "</div>";
  }

  dropdownContent.innerHTML = html;
  container.appendChild(dropdownContent);
}

function setupScrollEffects() {
  const header = document.getElementById("header");
  const scrollToTopBtn = document.getElementById("scroll-to-top");

  const handleScroll = throttle(function () {
    const currentScroll = window.pageYOffset;

    header?.classList.toggle("sticky", currentScroll > 100);
    scrollToTopBtn?.classList.toggle("visible", currentScroll > 300);
  }, 100);

  if (scrollToTopBtn) {
    scrollToTopBtn.addEventListener("click", function () {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
  }

  window.addEventListener("scroll", handleScroll, { passive: true });
}

function showToast(message, type = "info") {
  let container = document.querySelector(".toast-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container";
    container.setAttribute("role", "status");
    container.setAttribute("aria-live", "polite");
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
        <div class="toast-icon">
            <i class="fa-solid ${getToastIcon(type)}"></i>
        </div>
        <div class="toast-message"></div>
    `;
  toast.querySelector(".toast-message").textContent = message;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("toast-removing");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/**
 * Ảnh nền banner của một phim, ưu tiên ảnh nét nhất:
 * ảnh nền TMDB → thumb_url (ngang, thường 780px) → poster_url (dọc, chỉ khi không còn gì khác).
 * @param {HTMLElement} container
 * @param {object} movie object phim từ API (cần slug, thumb_url, poster_url)
 */
async function showMovieBackdrop(container, movie) {
  if (!container || !movie) return;
  // Khung có thể đang bị ẩn (clientWidth = 0) lúc trang còn tải → lấy bề rộng cửa sổ.
  const cssWidth = container.clientWidth || window.innerWidth;
  const targetWidth = cssWidth * (window.devicePixelRatio || 1);
  const backdrop = await getMovieBackdrop(movie.slug, targetWidth);
  const fallback = movie.thumb_url || movie.poster_url;
  setBackdropImage(container, backdrop ? backdrop.url : getImageUrl(fallback));
}

/**
 * Hộp thoại xác nhận dùng chung (thay cho confirm() của trình duyệt).
 * @param {{title?: string, message: string, confirmText?: string, cancelText?: string, danger?: boolean}} options
 * @returns {Promise<boolean>} true nếu người dùng xác nhận
 */
function showConfirmDialog(options = {}) {
  const {
    title = "Xác nhận",
    message = "",
    confirmText = "Đồng ý",
    cancelText = "Hủy",
    danger = false,
  } = options;

  return new Promise((resolve) => {
    const previousFocus = document.activeElement;
    const overlay = document.createElement("div");
    overlay.className = "dialog-overlay";
    overlay.innerHTML = `
      <div class="dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
        <h2 class="dialog-title" id="dialog-title"></h2>
        <p class="dialog-message"></p>
        <div class="dialog-actions">
          <button type="button" class="btn btn-outline" data-action="cancel"></button>
          <button type="button" class="btn ${danger ? "btn-danger" : "btn-primary"}" data-action="confirm"></button>
        </div>
      </div>
    `;
    overlay.querySelector(".dialog-title").textContent = title;
    overlay.querySelector(".dialog-message").textContent = message;
    overlay.querySelector('[data-action="cancel"]').textContent = cancelText;
    overlay.querySelector('[data-action="confirm"]').textContent = confirmText;

    const close = (result) => {
      document.removeEventListener("keydown", onKeydown);
      overlay.remove();
      previousFocus?.focus?.();
      resolve(result);
    };
    const onKeydown = (e) => {
      if (e.key === "Escape") close(false);
    };

    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) close(false);
      const action = e.target.closest("[data-action]")?.dataset.action;
      if (action) close(action === "confirm");
    });
    document.addEventListener("keydown", onKeydown);

    document.body.appendChild(overlay);
    overlay.querySelector('[data-action="confirm"]').focus();
  });
}

function getToastIcon(type) {
  switch (type) {
    case "success":
      return "fa-circle-check";
    case "error":
      return "fa-circle-exclamation";
    case "warning":
      return "fa-triangle-exclamation";
    default:
      return "fa-circle-info";
  }
}

function toggleFavorite(movie) {
  if (isInFavorites(movie.slug)) {
    if (removeFromFavorites(movie.slug)) {
      showToast("Đã xóa khỏi danh sách yêu thích", "info");
      return false;
    }
  } else if (addToFavorites(movie)) {
    showToast("Đã thêm vào danh sách yêu thích", "success");
    return true;
  }

  showToast("Không lưu được. Bộ nhớ trình duyệt có thể đã đầy.", "error");
  return isInFavorites(movie.slug);
}

// Trang login.html đã có (US-18): nút "Thành viên" là link tĩnh — không cần handler.

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    initializeApp,
    setupAuthHeader,
    renderAuthHeader,
    logout,
    confirmLoginRequired,
    showToast,
    showConfirmDialog,
    showMovieBackdrop,
    toggleFavorite,
    applySiteSettings,
    showMaintenanceScreen,
  };
}
