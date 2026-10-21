(() => {
  const HOME_SECTIONS = [
    { gridId: "movieGrid", fetchList: () => getNewMovies(1), isHeroSource: true },
    { gridId: "phimLeGrid", fetchList: () => getSingleMovies(1) },
    { gridId: "phimBoGrid", fetchList: () => getSeriesMovies(1) },
  ];
  const ITEMS_PER_SECTION = 6;
  const HERO_DESCRIPTION_LENGTH = 250;

  document.addEventListener("DOMContentLoaded", initHomePage);

  function initHomePage() {
    HOME_SECTIONS.forEach((section) => loadHomeSection(section));
  }

  async function loadHomeSection(section) {
    renderSkeleton(section.gridId, ITEMS_PER_SECTION);

    const res = await section.fetchList();
    const items = extractMovieItems(res);

    if (section.isHeroSource) {
      if (items.length > 0) loadHero(items[0].slug);
      else showHeroFallback();
    }

    if (!res.success) {
      renderEmptyState(section.gridId, {
        icon: "fa-solid fa-triangle-exclamation",
        message: "Không tải được danh sách phim.",
        onRetry: () => loadHomeSection(section),
      });
      return;
    }

    if (items.length === 0) {
      renderEmptyState(section.gridId, { message: "Đang cập nhật phim..." });
      return;
    }

    document.getElementById(section.gridId).innerHTML = items
      .slice(0, ITEMS_PER_SECTION)
      .map(createMovieCard)
      .join("");
  }

  async function loadHero(slug) {
    const res = await getMovieDetail(slug);
    const movie = res.data?.data?.item;
    if (movie) updateHero(movie);
    else showHeroFallback();
  }

  function updateHero(movie) {
    const title = document.getElementById("heroTitle");
    const desc = document.getElementById("heroDesc");
    const banner = document.getElementById("heroBanner");
    const playBtn = document.getElementById("heroPlayBtn");

    if (title) title.textContent = (movie.name || "").toUpperCase();

    if (desc) {
      const content = stripHtml(movie.content) || "Nội dung phim đang được cập nhật...";
      desc.textContent = truncateText(content, HERO_DESCRIPTION_LENGTH);
    }

    if (playBtn && movie.slug) {
      playBtn.href = `watch.html?slug=${encodeURIComponent(movie.slug)}`;
    }

    showMovieBackdrop(banner, movie);
  }

  function showHeroFallback() {
    const title = document.getElementById("heroTitle");
    const desc = document.getElementById("heroDesc");
    const playBtn = document.getElementById("heroPlayBtn");
    if (title) title.textContent = APP_CONFIG.APP_NAME.toUpperCase();
    if (desc) desc.textContent = "Phim hay cả rổ — khám phá kho phim mới cập nhật mỗi ngày.";
    if (playBtn) {
      playBtn.href = "movies.html";
      playBtn.textContent = "Khám phá ngay";
    }
  }
})();
