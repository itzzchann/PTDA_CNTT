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

  if (res.status === 401 && session) {
    clearAuthSession();
    document.dispatchEvent(new CustomEvent("auth:expired"));
  }

  return res;
}

async function getNewMovies(page = 1) {
  const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MOVIES_LIST}?page=${page}`;
  return await fetchAPI(url);
}

async function getCategoriesList() {
  const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CATEGORIES_LIST}`;
  return await fetchAPI(url);
}

async function getCountriesList() {
  const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.COUNTRIES_LIST}`;
  return await fetchAPI(url);
}

async function getMovieDetail(slug) {
  const endpoint = API_CONFIG.ENDPOINTS.MOVIE_DETAIL.replace(
    "[slug]",
    encodeURIComponent(slug),
  );
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  return await fetchAPI(url);
}

async function searchMovies(keyword, page = 1) {
  const endpoint = API_CONFIG.ENDPOINTS.SEARCH.replace(
    "[keyword]",
    encodeURIComponent(keyword),
  );
  const url = `${API_CONFIG.BASE_URL}${endpoint}&page=${page}`;
  return await fetchAPI(url);
}

async function getMoviesByCategory(categorySlug, page = 1) {
  const endpoint = API_CONFIG.ENDPOINTS.CATEGORY.replace(
    "[slug]",
    encodeURIComponent(categorySlug),
  );
  const url = `${API_CONFIG.BASE_URL}${endpoint}?page=${page}`;
  return await fetchAPI(url);
}

async function getMoviesByCountry(countrySlug, page = 1) {
  const endpoint = API_CONFIG.ENDPOINTS.COUNTRY.replace(
    "[slug]",
    encodeURIComponent(countrySlug),
  );
  const url = `${API_CONFIG.BASE_URL}${endpoint}?page=${page}`;
  return await fetchAPI(url);
}

async function getSingleMovies(page = 1) {
  const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SINGLE_MOVIES}?page=${page}`;
  return await fetchAPI(url);
}

async function getSeriesMovies(page = 1) {
  const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SERIES_MOVIES}?page=${page}`;
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
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  return await fetchAPI(url);
}

async function getMoviePeoples(slug) {
  const endpoint = API_CONFIG.ENDPOINTS.MOVIE_PEOPLES.replace(
    "[slug]",
    encodeURIComponent(slug),
  );
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  return await fetchAPI(url);
}

async function getMovieKeywords(slug) {
  const endpoint = API_CONFIG.ENDPOINTS.MOVIE_KEYWORDS.replace(
    "[slug]",
    encodeURIComponent(slug),
  );
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  return await fetchAPI(url);
}

async function getMoviesByListSlug(listSlug, page = 1) {
  const endpoint = API_CONFIG.ENDPOINTS.MOVIE_LIST.replace(
    "[slug]",
    encodeURIComponent(listSlug),
  );
  const url = `${API_CONFIG.BASE_URL}${endpoint}?page=${page}`;
  return await fetchAPI(url);
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    fetchAPI,
    fetchBackend,
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
    getMoviePeoples,
    getMovieKeywords,
    getMoviesByListSlug,
  };
}
