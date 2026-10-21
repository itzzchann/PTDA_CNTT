// Trang danh sách phim dùng chung: movies.html, series.html, category.html, country.html.
// Mỗi HTML khai báo nguồn bằng <main data-catalog="single|series|category|country">.
(() => {
  const CATALOG_SOURCES = {
    single: {
      title: "Phim lẻ",
      icon: "fa-solid fa-film",
      fetchPage: (slug, page) => getSingleMovies(page),
    },
    series: {
      title: "Phim bộ",
      icon: "fa-solid fa-tv",
      fetchPage: (slug, page) => getSeriesMovies(page),
    },
    category: {
      title: "Thể loại",
      icon: "fa-solid fa-layer-group",
      requiresSlug: true,
      knownItems: CATEGORIES,
      fetchPage: (slug, page) => getMoviesByCategory(slug, page),
    },
    country: {
      title: "Quốc gia",
      icon: "fa-solid fa-earth-asia",
      requiresSlug: true,
      knownItems: COUNTRIES,
      fetchPage: (slug, page) => getMoviesByCountry(slug, page),
    },
  };

  const GRID_ID = "catalog-grid";
  let source = null;
  let slug = "";
  let pagination = null;

  document.addEventListener("DOMContentLoaded", initCatalogPage);
  window.addEventListener("popstate", () => {
    if (pagination) loadCatalogPage(readPageFromUrl(), false);
  });

  function initCatalogPage() {
    const main = document.querySelector("[data-catalog]");
    source = main ? CATALOG_SOURCES[main.dataset.catalog] : null;
    if (!source) {
      console.error("catalog.js: thiếu hoặc sai data-catalog trên <main>");
      return;
    }

    slug = new URLSearchParams(window.location.search).get("slug") || "";
    setCatalogTitle(getKnownName() || source.title);
    pagination = setupPagination((page) => loadCatalogPage(page, true));

    if (source.requiresSlug && !slug) {
      pagination.setVisible(false);
      renderEmptyState(GRID_ID, {
        icon: source.icon,
        message: `Chưa chọn ${source.title.toLowerCase()}. Hãy chọn từ menu phía trên.`,
        actionText: "Về trang chủ",
        actionHref: "index.html",
      });
      return;
    }

    loadCatalogPage(readPageFromUrl(), false);
  }

  async function loadCatalogPage(page, updateUrl) {
    renderSkeleton(GRID_ID, 12);

    const res = await source.fetchPage(slug, page);
    const items = extractMovieItems(res);

    if (!res.success) {
      pagination.setVisible(false);
      renderEmptyState(GRID_ID, {
        icon: "fa-solid fa-triangle-exclamation",
        message: "Không tải được danh sách phim. Kiểm tra kết nối mạng rồi thử lại.",
        onRetry: () => loadCatalogPage(page, false),
      });
      return;
    }

    if (items.length === 0) {
      pagination.setVisible(false);
      renderEmptyState(GRID_ID, {
        icon: "fa-solid fa-film",
        message: "Không tìm thấy phim nào trong danh mục này.",
        actionText: "Khám phá phim mới",
        actionHref: "index.html",
      });
      return;
    }

    const { totalPages } = extractPagination(res);
    const titlePage = res.data?.data?.titlePage;
    if (titlePage && source.requiresSlug) setCatalogTitle(titlePage);

    document.getElementById(GRID_ID).innerHTML = items
      .map(createMovieCard)
      .join("");
    pagination.setVisible(true);
    pagination.update(page, totalPages);

    if (updateUrl) {
      writePageToUrl(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function getKnownName() {
    if (!source.knownItems || !slug) return "";
    return source.knownItems.find((item) => item.slug === slug)?.name || "";
  }

  function setCatalogTitle(text) {
    const titleEl = document.getElementById("catalog-title");
    const iconEl = document.getElementById("catalog-icon");
    if (titleEl) titleEl.textContent = text;
    if (iconEl) iconEl.className = source.icon;
    document.title = `${text} | ${APP_CONFIG.APP_NAME}`;
  }

  function readPageFromUrl() {
    const page = parseInt(new URLSearchParams(window.location.search).get("page"), 10);
    return Number.isInteger(page) && page > 0 ? page : 1;
  }

  function writePageToUrl(page) {
    const params = new URLSearchParams(window.location.search);
    if (page > 1) params.set("page", page);
    else params.delete("page");
    const query = params.toString();
    history.pushState({}, "", `${window.location.pathname}${query ? `?${query}` : ""}`);
  }
})();
