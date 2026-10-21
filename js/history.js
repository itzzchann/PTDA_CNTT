(() => {
  const GRID_ID = "history-grid";
  const ITEMS_PER_PAGE = APP_CONFIG.LOCAL_ITEMS_PER_PAGE;

  let currentPage = 1;
  let pagination = null;

  document.addEventListener("DOMContentLoaded", () => {
    pagination = setupPagination((page) => {
      currentPage = page;
      renderHistory();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    renderHistory();
  });

  function getSortedHistory() {
    return getStoredList(STORAGE_KEYS.WATCH_HISTORY).sort(
      (a, b) => new Date(b.watchedAt || 0) - new Date(a.watchedAt || 0),
    );
  }

  function renderHistory() {
    const grid = document.getElementById(GRID_ID);
    if (!grid) return;

    const history = getSortedHistory();
    const totalPages = Math.max(1, Math.ceil(history.length / ITEMS_PER_PAGE));
    currentPage = Math.min(currentPage, totalPages);

    if (history.length === 0) {
      pagination.setVisible(false);
      renderEmptyState(GRID_ID, {
        icon: "fa-solid fa-film",
        message: "Bạn chưa xem phim nào.",
        actionText: "Xem phim ngay",
        actionHref: "movies.html",
      });
      return;
    }

    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    grid.innerHTML = "";
    history.slice(start, start + ITEMS_PER_PAGE).forEach((movie) => {
      const card = buildHistoryCard(movie);
      if (card) grid.appendChild(card);
    });

    pagination.setVisible(true);
    pagination.update(currentPage, totalPages);
  }

  function buildHistoryCard(movie) {
    const temp = document.createElement("div");
    temp.innerHTML = createMovieCard(movie).trim();
    const card = temp.firstElementChild;
    if (!card) return null;

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "btn-remove-card";
    removeBtn.title = "Xóa khỏi lịch sử";
    removeBtn.setAttribute("aria-label", "Xóa khỏi lịch sử");
    removeBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
    removeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      removeFromWatchHistory(movie.slug);
      renderHistory();
    });
    card.appendChild(removeBtn);

    const episode = movie.episode || "1";
    const watchUrl = `watch.html?slug=${encodeURIComponent(movie.slug)}&ep=${encodeURIComponent(episode)}`;
    const poster = card.querySelector(".movie-poster");
    if (poster) {
      poster.removeAttribute("onclick");
      poster.addEventListener("click", () => {
        window.location.href = watchUrl;
      });
    }

    const watchedInfo = document.createElement("div");
    watchedInfo.className = "movie-added-at";
    const episodeLabel = /^\d+$/.test(String(episode)) ? `Tập ${episode}` : episode;
    watchedInfo.textContent = `Đang xem: ${episodeLabel} · ${formatDate(movie.watchedAt)}`;
    card.querySelector(".movie-info")?.appendChild(watchedInfo);

    return card;
  }
})();
