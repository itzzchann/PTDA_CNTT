async function fetchAPI(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error("API Error:", error);
    return { success: false, error: error.message };
  }
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
  if (!categories || categories.length === 0) {
    return await getNewMovies(1);
  }

  const firstCategory = categories[0];
  const catSlug = typeof firstCategory === "object" ? firstCategory.slug : firstCategory;
  if (!catSlug) {
    return await getNewMovies(1);
  }

  const res = await getMoviesByCategory(catSlug, 1);
  if (res.success && res.data?.data?.items?.length > 0) {
    return res;
  }
  return await getNewMovies(1);
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
window.getNewMovies = getNewMovies;
window.getSingleMovies = getSingleMovies;
window.getSeriesMovies = getSeriesMovies;
window.getMoviesByCategory = getMoviesByCategory;
