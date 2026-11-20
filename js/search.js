(() => {
  const GRID_ID = "searchResultGrid";

  document.addEventListener("DOMContentLoaded", initSearchPage);

  function initSearchPage() {
    const keyword = (new URLSearchParams(window.location.search).get("q") || "").trim();
    const titleElement = document.getElementById("searchTitle");

    if (!keyword) {
      if (titleElement) titleElement.textContent = "Vui lòng nhập từ khóa";
      renderEmptyState(GRID_ID, {
        icon: "fa-solid fa-magnifying-glass",
        message: "Nhập tên phim hoặc diễn viên vào ô tìm kiếm phía trên.",
      });
      return;
    }

    if (titleElement) titleElement.textContent = `Kết quả tìm kiếm cho: "${keyword}"`;
    document.title = `Tìm "${keyword}" | ${APP_CONFIG.APP_NAME}`;

    // Điền lại từ khóa vào ô tìm kiếm header khi header nạp xong.
    document.addEventListener("components:loaded", () => {
      const input = document.getElementById("main-search");
      if (input) input.value = keyword;
    });

    renderSearchResults(keyword);
  }

  async function renderSearchResults(keyword) {
    const grid = document.getElementById(GRID_ID);
    if (!grid) return;

    renderSkeleton(GRID_ID, 12);

    const res = await searchMovies(keyword);
    const movies = extractMovieItems(res);

    if (!res.success) {
      renderEmptyState(GRID_ID, {
        icon: "fa-solid fa-triangle-exclamation",
        message: "Đã có lỗi xảy ra khi tải kết quả tìm kiếm.",
        onRetry: () => renderSearchResults(keyword),
      });
      return;
    }

    if (movies.length === 0) {
      renderEmptyState(GRID_ID, {
        icon: "fa-solid fa-magnifying-glass",
        message: `Không tìm thấy phim nào với từ khóa "${keyword}".`,
        actionText: "Quay lại trang chủ",
        actionHref: "index.html",
      });
      return;
    }

    grid.innerHTML = movies.map(createMovieCard).join("");
  }
})();
