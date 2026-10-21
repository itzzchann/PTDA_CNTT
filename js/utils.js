function escapeHtml(text) {
  if (text === null || text === undefined) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function stripHtml(html) {
  if (!html) return "";
  if (typeof DOMParser !== "undefined") {
    const doc = new DOMParser().parseFromString(String(html), "text/html");
    return (doc.body.textContent || "").trim();
  }
  return String(html).replace(/<[^>]*>?/gm, "").trim();
}

function truncateText(text, maxLength = APP_CONFIG.MAX_DESCRIPTION_LENGTH) {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + "...";
}

function formatYear(year) {
  if (!year) return "Đang cập nhật";
  return year.toString();
}

function formatDuration(time) {
  if (!time) return "Đang cập nhật";
  return time;
}

// Tên tập từ API đã có chữ "Tập" ("Tập 01") hoặc là "Full"; chỉ thêm chữ "Tập" khi tên là số trần ("1").
function formatEpisodeName(name) {
  const text = String(name ?? "").trim();
  if (!text) return "Đang cập nhật";
  return /^\d+$/.test(text) ? `Tập ${text}` : text;
}

function formatDate(dateString) {
  if (!dateString) return "Không rõ";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "Không rõ";
  return date.toLocaleDateString("vi-VN");
}

function formatQuality(quality) {
  if (!quality) return "";

  const qualityClass = quality.toLowerCase().includes("hd")
    ? "quality-hd"
    : "quality-cam";
  return `<span class="badge ${qualityClass}">${escapeHtml(quality)}</span>`;
}

function formatStatus(status) {
  if (!status) return "";
  return `<span class="badge badge-status">${escapeHtml(status)}</span>`;
}

function formatCategories(categories) {
  if (!categories || categories.length === 0) return "Đang cập nhật";
  return categories.map((cat) => cat.name).join(", ");
}

function formatCountries(countries) {
  if (!countries || countries.length === 0) return "Đang cập nhật";
  return countries.map((country) => country.name).join(", ");
}

function createSlug(title) {
  if (!title) return "";
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function debounce(func, wait = APP_CONFIG.SEARCH_DEBOUNCE_TIME) {
  let timeout;
  function executedFunction(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }
  executedFunction.cancel = () => clearTimeout(timeout);
  return executedFunction;
}

function throttle(func, limit = 1000) {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error("Error saving to localStorage:", error);
    return false;
  }
}

function getFromStorage(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error("Error reading from localStorage:", error);
    return defaultValue;
  }
}

function removeFromStorage(key) {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error("Error removing from localStorage:", error);
  }
}

function getStoredList(key) {
  const value = getFromStorage(key, []);
  return Array.isArray(value) ? value : [];
}

function addToFavorites(movie) {
  const favorites = getStoredList(STORAGE_KEYS.FAVORITES);

  const exists = favorites.some((fav) => fav.slug === movie.slug);
  if (exists) return false;

  favorites.unshift({
    slug: movie.slug,
    name: movie.name,
    poster: movie.poster_url || movie.thumb_url || movie.poster || "",
    addedAt: new Date().toISOString(),
  });

  return saveToStorage(STORAGE_KEYS.FAVORITES, favorites);
}

function removeFromFavorites(slug) {
  const favorites = getStoredList(STORAGE_KEYS.FAVORITES);
  const filtered = favorites.filter((fav) => fav.slug !== slug);
  return saveToStorage(STORAGE_KEYS.FAVORITES, filtered);
}

function isInFavorites(slug) {
  const favorites = getStoredList(STORAGE_KEYS.FAVORITES);
  return favorites.some((fav) => fav.slug === slug);
}

function saveWatchHistory(movie, episode = 1, progress = 0) {
  const history = getStoredList(STORAGE_KEYS.WATCH_HISTORY);

  const filtered = history.filter((item) => item.slug !== movie.slug);

  filtered.unshift({
    slug: movie.slug,
    name: movie.name,
    poster: movie.poster_url || movie.thumb_url || movie.poster || "",
    episode: episode,
    progress: progress,
    watchedAt: new Date().toISOString(),
  });

  const limited = filtered.slice(0, APP_CONFIG.MAX_HISTORY_ITEMS);

  return saveToStorage(STORAGE_KEYS.WATCH_HISTORY, limited);
}

function removeFromWatchHistory(slug) {
  const history = getStoredList(STORAGE_KEYS.WATCH_HISTORY);
  const filtered = history.filter((item) => item.slug !== slug);
  return saveToStorage(STORAGE_KEYS.WATCH_HISTORY, filtered);
}

function getAuthSession() {
  const session = getFromStorage(STORAGE_KEYS.AUTH_SESSION, null);
  return session && session.token ? session : null;
}

function saveAuthSession(session) {
  return saveToStorage(STORAGE_KEYS.AUTH_SESSION, session);
}

function clearAuthSession() {
  removeFromStorage(STORAGE_KEYS.AUTH_SESSION);
}

function isLoggedIn() {
  return getAuthSession() !== null;
}

function extractMovieItems(res) {
  const items = res?.data?.data?.items || res?.data?.items;
  return Array.isArray(items) ? items : [];
}

function extractPagination(res) {
  const pagination =
    res?.data?.data?.params?.pagination || res?.data?.pagination || {};
  return {
    currentPage: Number(pagination.currentPage) || 1,
    totalPages: Math.max(1, Number(pagination.totalPages) || 1),
    totalItems: Number(pagination.totalItems) || 0,
  };
}

function resolveElement(target) {
  return typeof target === "string" ? document.getElementById(target) : target;
}

function showLoading(element) {
  if (!element) return;
  element.innerHTML =
    '<div class="loading-container"><div class="loading-spinner" role="status" aria-label="Đang tải"></div></div>';
}

function showError(element, message = "Có lỗi xảy ra. Vui lòng thử lại sau.") {
  if (!element) return;
  element.innerHTML = `<div class="error-message"><i class="fa-solid fa-triangle-exclamation"></i> ${escapeHtml(message)}</div>`;
}

/**
 * Hiển thị khối trạng thái rỗng / lỗi (chiếm trọn hàng nếu nằm trong .movie-grid).
 * @param {string|HTMLElement} target id hoặc phần tử
 * @param {{icon?: string, message: string, actionText?: string, actionHref?: string, onRetry?: Function}} options
 */
function renderEmptyState(target, options = {}) {
  const container = resolveElement(target);
  if (!container) return;

  const {
    icon = "fa-solid fa-film",
    message = "Không có dữ liệu.",
    actionText = "",
    actionHref = "",
    onRetry = null,
  } = options;

  let action = "";
  if (onRetry) {
    action = `<button type="button" class="btn btn-outline empty-state-action">
        <i class="fa-solid fa-rotate-right"></i> ${escapeHtml(actionText || "Thử lại")}
      </button>`;
  } else if (actionText && actionHref) {
    action = `<a class="btn btn-primary empty-state-action" href="${escapeHtml(actionHref)}">${escapeHtml(actionText)}</a>`;
  }

  container.innerHTML = `
    <div class="empty-state">
      <i class="${escapeHtml(icon)} empty-state-icon"></i>
      <p class="empty-state-message">${escapeHtml(message)}</p>
      ${action}
    </div>
  `;

  if (onRetry) {
    container
      .querySelector(".empty-state-action")
      .addEventListener("click", onRetry);
  }
}

/**
 * Gắn 4 nút phân trang chuẩn (#firstPage, #prevPage, #nextPage, #lastPage, #currentPage, #totalPage).
 * @param {(page: number) => void} onPageChange gọi khi người dùng chọn trang khác
 * @returns {{update: (currentPage: number, totalPages: number) => void, setVisible: (visible: boolean) => void}}
 */
function setupPagination(onPageChange) {
  const firstBtn = document.getElementById("firstPage");
  const prevBtn = document.getElementById("prevPage");
  const nextBtn = document.getElementById("nextPage");
  const lastBtn = document.getElementById("lastPage");
  const currentPageEl = document.getElementById("currentPage");
  const totalPageEl = document.getElementById("totalPage");
  const container = firstBtn ? firstBtn.closest(".pagination") : null;

  let current = 1;
  let total = 1;

  const goTo = (page) => {
    if (page < 1 || page > total || page === current) return;
    onPageChange(page);
  };

  firstBtn?.addEventListener("click", () => goTo(1));
  prevBtn?.addEventListener("click", () => goTo(current - 1));
  nextBtn?.addEventListener("click", () => goTo(current + 1));
  lastBtn?.addEventListener("click", () => goTo(total));

  return {
    update(currentPage, totalPages) {
      current = currentPage;
      total = Math.max(1, totalPages);
      if (currentPageEl) currentPageEl.textContent = current;
      if (totalPageEl) totalPageEl.textContent = total;
      if (firstBtn) firstBtn.disabled = current <= 1;
      if (prevBtn) prevBtn.disabled = current <= 1;
      if (nextBtn) nextBtn.disabled = current >= total;
      if (lastBtn) lastBtn.disabled = current >= total;
    },
    setVisible(visible) {
      if (container) container.hidden = !visible;
    },
  };
}

function smoothScrollTo(element, offset = 0) {
  if (!element) return;
  const top = element.getBoundingClientRect().top + window.pageYOffset - offset;
  window.scrollTo({ top, behavior: "smooth" });
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error("Failed to copy:", error);
    return false;
  }
}

function formatNumber(num) {
  if (!num) return "0";
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function getImageUrl(path) {
  if (!path) return APP_CONFIG.DEFAULT_POSTER;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  const host = API_CONFIG.IMAGE_HOST.replace(/\/+$/, "");
  return `${host}/${cleanPath}`;
}

function createMovieCard(movie) {
  const thumb = movie.poster_url || movie.thumb_url || movie.poster || "";
  const finalImg = getImageUrl(thumb);

  const slug = movie.slug || "";
  const safeSlug = encodeURIComponent(slug);
  const badge = escapeHtml(movie.episode_current || movie.quality || "HD");
  const name = escapeHtml(movie.name || "");
  const originName = escapeHtml(movie.origin_name || "");
  const year = escapeHtml(movie.year || "");
  const movieData = escapeHtml(
    JSON.stringify({ slug, name: movie.name || "", poster_url: thumb }),
  );

  const isFav = isInFavorites(slug);

  return `
    <div class="movie-card" data-slug="${escapeHtml(slug)}">
      <div class="movie-poster" onclick="location.href='./detail.html?slug=${safeSlug}'">
        <img src="${escapeHtml(finalImg)}" alt="${name}" loading="lazy"
             onerror="this.onerror=null;this.src='${APP_CONFIG.DEFAULT_POSTER}'">
        <div class="poster-overlay">
          <div class="play-icon"><i class="fa-solid fa-play"></i></div>
        </div>
      </div>
      <div class="movie-badges">
        <span class="badge badge-quality">${badge}</span>
      </div>
      <button type="button" class="btn-favorite ${isFav ? "active" : ""}"
              data-slug="${escapeHtml(slug)}"
              data-movie="${movieData}"
              title="${isFav ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}"
              aria-label="${isFav ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}">
        <i class="${isFav ? "fa-solid" : "fa-regular"} fa-heart"></i>
      </button>
      <div class="movie-info" onclick="location.href='./detail.html?slug=${safeSlug}'">
        <h3 class="movie-title" title="${name}">${name}</h3>
        <p class="movie-origin-name">${originName}</p>
        <div class="movie-meta">
          <span>${year}</span>
        </div>
      </div>
    </div>
  `;
}

function renderSkeleton(gridId, count = 6) {
  const grid = document.getElementById(gridId);
  if (!grid) return;

  let html = "";
  for (let i = 0; i < count; i++) {
    html += `
            <div class="skeleton-card">
                <div class="skeleton-poster skeleton-loading"></div>
                <div class="skeleton-title skeleton-loading"></div>
                <div class="skeleton-meta skeleton-loading"></div>
            </div>
        `;
  }
  grid.innerHTML = html;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    escapeHtml,
    stripHtml,
    getImageUrl,
    truncateText,
    formatYear,
    formatDuration,
    formatEpisodeName,
    formatDate,
    formatQuality,
    formatStatus,
    formatCategories,
    formatCountries,
    createSlug,
    debounce,
    throttle,
    saveToStorage,
    getFromStorage,
    removeFromStorage,
    getStoredList,
    addToFavorites,
    removeFromFavorites,
    isInFavorites,
    saveWatchHistory,
    removeFromWatchHistory,
    getAuthSession,
    saveAuthSession,
    clearAuthSession,
    isLoggedIn,
    extractMovieItems,
    extractPagination,
    showLoading,
    showError,
    renderEmptyState,
    setupPagination,
    smoothScrollTo,
    copyToClipboard,
    formatNumber,
    createMovieCard,
    renderSkeleton,
  };
}
