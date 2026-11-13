async function fetchAPI(url, options = {}) {
  const { timeout = API_CONFIG.TIMEOUT_MS, headers = {}, ...fetchOptions } =
    options;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers: {
        ...(fetchOptions.body ? { "Content-Type": "application/json" } : {}),
        ...headers,
      },
      signal: controller.signal,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        success: false,
        status: response.status,
        error: data?.error?.message || `HTTP error! status: ${response.status}`,
        data,
      };
    }

    return { success: true, status: response.status, data };
  } catch (error) {
    const message =
      error.name === "AbortError" ? "Hết thời gian chờ phản hồi" : error.message;
    console.error("API Error:", url, message);
    return { success: false, status: 0, error: message };
  } finally {
    clearTimeout(timer);
  }
}

// Nguồn phim hiện hành: admin có thể đổi sang máy chủ dự phòng qua settings (US-62 Sc1).
// getSiteSettings() xong sẽ ghi đè; mọi wrapper phimapi đọc biến này khi gọi.
let movieApiBaseUrl = API_CONFIG.BASE_URL;

function getMovieApiBaseUrl() {
  return movieApiBaseUrl;
}

function setMovieApiBaseUrl(url) {
  movieApiBaseUrl = url || API_CONFIG.BASE_URL;
}

/**
 * Gọi backend riêng của RoPhim (tài khoản, bình luận, admin). Tự gắn token đăng nhập.
 * Trả về cùng dạng với fetchAPI: { success, status, data | error }.
 * @param {string} path endpoint trong BACKEND_CONFIG.ENDPOINTS (đã thay [slug]...)
 * @param {{method?: string, body?: object}} options
 */
async function fetchBackend(path, options = {}) {
  if (!BACKEND_CONFIG.BASE_URL) {
    return {
      success: false,
      status: 0,
      error: "BACKEND_NOT_CONFIGURED",
    };
  }

  const { body, headers = {}, ...rest } = options;
  const session = getAuthSession();

  const res = await fetchAPI(`${BACKEND_CONFIG.BASE_URL}${path}`, {
    ...rest,
    timeout: BACKEND_CONFIG.TIMEOUT_MS,
    headers: {
      ...(session ? { Authorization: `Bearer ${session.token}` } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const isBanned = res.status === 403 && res.data?.error?.code === "ACCOUNT_BANNED";
  if ((res.status === 401 || isBanned) && session) {
    clearAuthSession();
    document.dispatchEvent(new CustomEvent("auth:expired"));
  }

  return res;
}

async function getNewMovies(page = 1) {
  const url = `${getMovieApiBaseUrl()}${API_CONFIG.ENDPOINTS.MOVIES_LIST}?page=${page}`;
  return await fetchAPI(url);
}

async function getCategoriesList() {
  const url = `${getMovieApiBaseUrl()}${API_CONFIG.ENDPOINTS.CATEGORIES_LIST}`;
  return await fetchAPI(url);
}

async function getCountriesList() {
  const url = `${getMovieApiBaseUrl()}${API_CONFIG.ENDPOINTS.COUNTRIES_LIST}`;
  return await fetchAPI(url);
}

async function getMovieDetail(slug) {
  const endpoint = API_CONFIG.ENDPOINTS.MOVIE_DETAIL.replace(
    "[slug]",
    encodeURIComponent(slug),
  );
  const url = `${getMovieApiBaseUrl()}${endpoint}`;
  return await fetchAPI(url);
}

async function searchMovies(keyword, page = 1) {
  const endpoint = API_CONFIG.ENDPOINTS.SEARCH.replace(
    "[keyword]",
    encodeURIComponent(keyword),
  );
  const url = `${getMovieApiBaseUrl()}${endpoint}&page=${page}`;
  return await fetchAPI(url);
}

async function getMoviesByCategory(categorySlug, page = 1) {
  const endpoint = API_CONFIG.ENDPOINTS.CATEGORY.replace(
    "[slug]",
    encodeURIComponent(categorySlug),
  );
  const url = `${getMovieApiBaseUrl()}${endpoint}?page=${page}`;
  return await fetchAPI(url);
}

async function getMoviesByCountry(countrySlug, page = 1) {
  const endpoint = API_CONFIG.ENDPOINTS.COUNTRY.replace(
    "[slug]",
    encodeURIComponent(countrySlug),
  );
  const url = `${getMovieApiBaseUrl()}${endpoint}?page=${page}`;
  return await fetchAPI(url);
}

async function getSingleMovies(page = 1) {
  const url = `${getMovieApiBaseUrl()}${API_CONFIG.ENDPOINTS.SINGLE_MOVIES}?page=${page}`;
  return await fetchAPI(url);
}

async function getSeriesMovies(page = 1) {
  const url = `${getMovieApiBaseUrl()}${API_CONFIG.ENDPOINTS.SERIES_MOVIES}?page=${page}`;
  return await fetchAPI(url);
}

async function getMovieStreamLink(slug, episode = 1) {
  const result = await getMovieDetail(slug);

  if (!result.success) {
    return result;
  }

  try {
    const movie = result.data?.data?.item || result.data?.movie || result.data?.item;
    if (!movie) {
      return { success: false, error: "Không tìm thấy dữ liệu phim" };
    }

    const episodes = movie.episodes || result.data?.data?.episodes || result.data?.episodes;
    if (!episodes || episodes.length === 0) {
      return { success: false, error: "Không tìm thấy tập phim" };
    }

    const serverData = episodes[0];

    const episodeData = serverData.server_data.find(
      (ep) => String(ep.name).toLowerCase() === String(episode).toLowerCase() ||
              String(ep.slug).toLowerCase() === String(episode).toLowerCase(),
    ) || serverData.server_data[0];

    if (!episodeData) {
      return { success: false, error: "Không tìm thấy tập này" };
    }

    return {
      success: true,
      data: {
        link: episodeData.link_embed || episodeData.link_m3u8,
        slug: episodeData.slug,
        name: episodeData.name,
      },
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function getRecommendedMovies(categories, limit = 12) {
  const firstCategory = categories?.[0];
  const catSlug =
    typeof firstCategory === "object" ? firstCategory?.slug : firstCategory;

  let res = catSlug ? await getMoviesByCategory(catSlug, 1) : null;
  if (!res || !res.success || extractMovieItems(res).length === 0) {
    res = await getNewMovies(1);
  }

  // Cắt danh sách tại chỗ (v1: data.data.items, v0: data.items) để giữ nguyên dạng response.
  const list = res.data?.data?.items ? res.data.data : res.data;
  if (Array.isArray(list?.items)) list.items = list.items.slice(0, limit);
  return res;
}

async function getMovieImages(slug) {
  const endpoint = API_CONFIG.ENDPOINTS.MOVIE_IMAGES.replace(
    "[slug]",
    encodeURIComponent(slug),
  );
  const url = `${getMovieApiBaseUrl()}${endpoint}`;
  return await fetchAPI(url);
}

/**
 * Ảnh nền ngang độ phân giải cao (TMDB) của phim, đủ nét cho banner rộng.
 * thumb_url của phimapi thường chỉ 780px nên bị vỡ khi phóng to.
 * @param {string} slug
 * @param {number} targetWidth số điểm ảnh thật cần (bề rộng khung × devicePixelRatio)
 * @returns {Promise<{url: string, width: number} | null>} null nếu phim không có ảnh nền
 */
async function getMovieBackdrop(slug, targetWidth = 1280) {
  const res = await getMovieImages(slug);
  const backdrops = (res.data?.data?.images || []).filter(
    (img) => img.type === "backdrop" && img.file_path,
  );
  if (backdrops.length === 0) return null;

  const best = backdrops.reduce((a, b) => ((b.width || 0) > (a.width || 0) ? b : a));
  const useOriginal = targetWidth > 1280 && (best.width || 0) > 1280;
  return {
    url: `${API_CONFIG.TMDB_IMAGE_HOST}/${useOriginal ? "original" : "w1280"}${best.file_path}`,
    width: useOriginal ? best.width : Math.min(best.width || 1280, 1280),
  };
}

async function getMoviePeoples(slug) {
  const endpoint = API_CONFIG.ENDPOINTS.MOVIE_PEOPLES.replace(
    "[slug]",
    encodeURIComponent(slug),
  );
  const url = `${getMovieApiBaseUrl()}${endpoint}`;
  return await fetchAPI(url);
}

async function getMovieKeywords(slug) {
  const endpoint = API_CONFIG.ENDPOINTS.MOVIE_KEYWORDS.replace(
    "[slug]",
    encodeURIComponent(slug),
  );
  const url = `${getMovieApiBaseUrl()}${endpoint}`;
  return await fetchAPI(url);
}

async function getMoviesByListSlug(listSlug, page = 1) {
  const endpoint = API_CONFIG.ENDPOINTS.MOVIE_LIST.replace(
    "[slug]",
    encodeURIComponent(listSlug),
  );
  const url = `${getMovieApiBaseUrl()}${endpoint}?page=${page}`;
  return await fetchAPI(url);
}

/**
 * Thay placeholder [slug] / [id] trong template endpoint của BACKEND_CONFIG.ENDPOINTS.
 * @param {string} template vd BACKEND_CONFIG.ENDPOINTS.COMMENTS = "/movies/[slug]/comments"
 * @param {Record<string, string>} params vd { slug: "ten-phim" }
 */
function buildBackendPath(template, params = {}) {
  return Object.entries(params).reduce(
    (path, [key, value]) => path.replace(`[${key}]`, encodeURIComponent(value)),
    template,
  );
}

/* ===== Wrapper backend — xem docs/guides/07_lo_trinh_va_backlog.md §3.4 ===== */

async function registerUser({ username, email, password }) {
  return await fetchBackend(BACKEND_CONFIG.ENDPOINTS.REGISTER, {
    method: "POST",
    body: { username, email, password },
  });
}

async function loginUser({ login, password }) {
  return await fetchBackend(BACKEND_CONFIG.ENDPOINTS.LOGIN, {
    method: "POST",
    body: { login, password },
  });
}

async function logoutUser() {
  return await fetchBackend(BACKEND_CONFIG.ENDPOINTS.LOGOUT, {
    method: "POST",
  });
}

async function getCurrentUser() {
  return await fetchBackend(BACKEND_CONFIG.ENDPOINTS.ME);
}

async function getMyFavorites(page = 1, limit = APP_CONFIG.ITEMS_PER_PAGE) {
  return await fetchBackend(
    `${BACKEND_CONFIG.ENDPOINTS.MY_FAVORITES}?page=${page}&limit=${limit}`,
  );
}

async function addMyFavorite(movie) {
  return await fetchBackend(BACKEND_CONFIG.ENDPOINTS.MY_FAVORITES, {
    method: "POST",
    body: {
      movieSlug: movie.slug,
      name: movie.name,
      poster: movie.poster || movie.poster_url || movie.thumb_url || "",
    },
  });
}

async function removeMyFavorite(slug) {
  return await fetchBackend(
    buildBackendPath(BACKEND_CONFIG.ENDPOINTS.MY_FAVORITE, { slug }),
    { method: "DELETE" },
  );
}

async function getMyHistory(page = 1, limit = APP_CONFIG.ITEMS_PER_PAGE) {
  return await fetchBackend(
    `${BACKEND_CONFIG.ENDPOINTS.MY_HISTORY}?page=${page}&limit=${limit}`,
  );
}

async function saveMyHistory(entry) {
  return await fetchBackend(BACKEND_CONFIG.ENDPOINTS.MY_HISTORY, {
    method: "PUT",
    body: {
      movieSlug: entry.slug,
      name: entry.name,
      poster: entry.poster || "",
      episode: entry.episode,
      progress: entry.progress,
    },
  });
}

async function getMovieComments(slug, page = 1) {
  return await fetchBackend(
    `${buildBackendPath(BACKEND_CONFIG.ENDPOINTS.COMMENTS, { slug })}?page=${page}`,
  );
}

async function postMovieComment(slug, { content, isSpoiler, episode }) {
  return await fetchBackend(
    buildBackendPath(BACKEND_CONFIG.ENDPOINTS.COMMENTS, { slug }),
    { method: "POST", body: { content, isSpoiler, episode } },
  );
}

async function deleteComment(id) {
  return await fetchBackend(
    buildBackendPath(BACKEND_CONFIG.ENDPOINTS.COMMENT, { id }),
    { method: "DELETE" },
  );
}

async function getMovieRatings(slug, page = 1) {
  return await fetchBackend(
    `${buildBackendPath(BACKEND_CONFIG.ENDPOINTS.RATINGS, { slug })}?page=${page}`,
  );
}

async function postMovieRating(slug, { score, content }) {
  return await fetchBackend(
    buildBackendPath(BACKEND_CONFIG.ENDPOINTS.RATINGS, { slug }),
    { method: "POST", body: { score, content } },
  );
}

async function recordMovieView(slug, episode) {
  return await fetchBackend(
    buildBackendPath(BACKEND_CONFIG.ENDPOINTS.VIEWS, { slug }),
    { method: "POST", body: { episode } },
  );
}

async function getSiteSettings() {
  return await fetchBackend(BACKEND_CONFIG.ENDPOINTS.SETTINGS);
}

async function getAdminStats(days = 7) {
  return await fetchBackend(`${BACKEND_CONFIG.ENDPOINTS.ADMIN_STATS}?days=${days}`);
}

async function updateAdminSettings(patch) {
  return await fetchBackend(BACKEND_CONFIG.ENDPOINTS.ADMIN_SETTINGS, {
    method: "PATCH",
    body: patch,
  });
}

async function getAdminUsers(query = {}) {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.status) params.set("status", query.status);
  if (query.page) params.set("page", query.page);
  if (query.limit) params.set("limit", query.limit);
  const qs = params.toString();
  return await fetchBackend(
    qs ? `${BACKEND_CONFIG.ENDPOINTS.ADMIN_USERS}?${qs}` : BACKEND_CONFIG.ENDPOINTS.ADMIN_USERS,
  );
}

async function setUserStatus(id, status) {
  return await fetchBackend(
    buildBackendPath(BACKEND_CONFIG.ENDPOINTS.ADMIN_USER, { id }),
    { method: "PATCH", body: { status } },
  );
}

async function getAdminComments(query = {}) {
  const params = new URLSearchParams();
  if (query.movieSlug) params.set("movieSlug", query.movieSlug);
  if (query.q) params.set("q", query.q);
  if (query.page) params.set("page", query.page);
  if (query.limit) params.set("limit", query.limit);
  const qs = params.toString();
  return await fetchBackend(
    qs ? `${BACKEND_CONFIG.ENDPOINTS.ADMIN_COMMENTS}?${qs}` : BACKEND_CONFIG.ENDPOINTS.ADMIN_COMMENTS,
  );
}

async function flagCommentSpoiler(id) {
  return await fetchBackend(
    buildBackendPath(BACKEND_CONFIG.ENDPOINTS.ADMIN_COMMENT, { id }),
    { method: "PATCH", body: { isSpoiler: true } },
  );
}

async function deleteAdminComment(id) {
  return await fetchBackend(
    buildBackendPath(BACKEND_CONFIG.ENDPOINTS.ADMIN_COMMENT, { id }),
    { method: "DELETE" },
  );
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    fetchAPI,
    fetchBackend,
    buildBackendPath,
    getNewMovies,
    getCategoriesList,
    getCountriesList,
    getMovieDetail,
    searchMovies,
    getMoviesByCategory,
    getMoviesByCountry,
    getSingleMovies,
    getSeriesMovies,
    getMovieStreamLink,
    getRecommendedMovies,
    getMovieImages,
    getMovieBackdrop,
    getMoviePeoples,
    getMovieKeywords,
    getMoviesByListSlug,
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser,
    getMyFavorites,
    addMyFavorite,
    removeMyFavorite,
    getMyHistory,
    saveMyHistory,
    getMovieComments,
    postMovieComment,
    deleteComment,
    getMovieRatings,
    postMovieRating,
    recordMovieView,
    getSiteSettings,
    getAdminStats,
    updateAdminSettings,
    getAdminUsers,
    setUserStatus,
    getAdminComments,
    flagCommentSpoiler,
    deleteAdminComment,
    getMovieApiBaseUrl,
    setMovieApiBaseUrl,
  };
}
