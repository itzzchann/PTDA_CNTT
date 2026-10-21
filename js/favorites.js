(() => {
  const GRID_ID = "favorites-grid";
  const ITEMS_PER_PAGE = APP_CONFIG.LOCAL_ITEMS_PER_PAGE;

  let currentPage = 1;
  let pagination = null;

  document.addEventListener("DOMContentLoaded", () => {
    pagination = setupPagination((page) => {
      currentPage = page;
      renderFavorites();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    document
      .getElementById("clearFavoritesBtn")
      ?.addEventListener("click", clearAllFavorites);
    renderFavorites();
  });

  function getSortedFavorites() {
    return getStoredList(STORAGE_KEYS.FAVORITES).sort(
      (a, b) => new Date(b.addedAt || 0) - new Date(a.addedAt || 0),
    );
  }

  function renderFavorites() {
    const grid = document.getElementById(GRID_ID);
    if (!grid) return;

    const favorites = getSortedFavorites();
    const totalPages = Math.max(1, Math.ceil(favorites.length / ITEMS_PER_PAGE));
    currentPage = Math.min(currentPage, totalPages);

    if (favorites.length === 0) {
      pagination.setVisible(false);
      renderEmptyState(GRID_ID, {
        icon: "fa-solid fa-heart-crack",
        message: "Bạn chưa có phim yêu thích nào.",
        actionText: "Khám phá phim ngay",
        actionHref: "movies.html",
      });
      return;
    }

    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    grid.innerHTML = "";
    favorites.slice(start, start + ITEMS_PER_PAGE).forEach((movie) => {
      const card = buildFavoriteCard(movie);
      if (card) grid.appendChild(card);
    });

    pagination.setVisible(true);
    pagination.update(currentPage, totalPages);
  }

  function buildFavoriteCard(movie) {
    const temp = document.createElement("div");
    temp.innerHTML = createMovieCard(movie).trim();
    const card = temp.firstElementChild;
    if (!card) return null;

    card.querySelector(".btn-favorite")?.remove();

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "btn-remove-card";
    removeBtn.title = "Xóa khỏi yêu thích";
    removeBtn.setAttribute("aria-label", "Xóa khỏi yêu thích");
    removeBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
    removeBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      removeFromFavorites(movie.slug);
      showToast("Đã xóa khỏi danh sách yêu thích", "info");
      renderFavorites();
    });
    card.appendChild(removeBtn);

    if (movie.addedAt) {
      const added = document.createElement("div");
      added.className = "movie-added-at";
      added.textContent = `Đã thêm: ${formatDate(movie.addedAt)}`;
      card.querySelector(".movie-info")?.appendChild(added);
    }

    return card;
  }

  async function clearAllFavorites() {
    if (getStoredList(STORAGE_KEYS.FAVORITES).length === 0) {
      showToast("Danh sách yêu thích đang trống", "info");
      return;
    }

    const confirmed = await showConfirmDialog({
      title: "Xóa toàn bộ yêu thích?",
      message: "Tất cả phim trong danh sách yêu thích sẽ bị xóa. Không thể hoàn tác.",
      confirmText: "Xóa tất cả",
      danger: true,
    });
    if (!confirmed) return;

    removeFromStorage(STORAGE_KEYS.FAVORITES);
    showToast("Đã xóa toàn bộ danh sách yêu thích", "success");
    currentPage = 1;
    renderFavorites();
  }
})();
