(() => {
  const GRID_ID = "history-grid";
  const ITEMS_PER_PAGE = APP_CONFIG.LOCAL_ITEMS_PER_PAGE;

  let currentPage = 1;
  let pagination = null;

  // Trạng thái server: null = chưa tải; [] = rỗng; [...] = đã có dữ liệu
  let serverHistory = null;

  document.addEventListener("DOMContentLoaded", () => {
    pagination = setupPagination((page) => {
      currentPage = page;
      renderHistory();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    if (isLoggedIn()) {
      loadServerHistory();
    } else {
      renderHistory();
    }
  });

  // ─── Lấy lịch sử xem từ server (US-51) ───────────────────────────────────────
  async function loadServerHistory() {
    renderSkeleton(GRID_ID, ITEMS_PER_PAGE);

    // Lần đầu đăng nhập trên máy này: đẩy toàn bộ lịch sử từ localStorage lên máy chủ (US-51)
    await syncLocalHistoryToServerOnce();

    const res = await fetchBackend(BACKEND_CONFIG.ENDPOINTS.MY_HISTORY + "?limit=50");
    if (res.ok && res.data?.data?.items) {
      // Chuyển sang định dạng local (slug thay movieSlug) để dùng lại buildHistoryCard
      serverHistory = res.data.data.items.map((item) => ({
        slug: item.movieSlug,
        name: item.name,
        poster: item.poster,
        episode: item.episode,
        progress: item.progress,
        watchedAt: item.watchedAt,
      }));
    } else {
      serverHistory = [];
    }
    renderHistory();
  }

  // Đẩy dữ liệu lịch sử localStorage lên server lần đầu sau khi đăng nhập (chạy 1 lần / máy)
  async function syncLocalHistoryToServerOnce() {
    const prefs = getFromStorage(STORAGE_KEYS.USER_PREFERENCES, {});
    if (prefs.syncedHistoryToServer) return;

    const localHistory = getStoredList(STORAGE_KEYS.WATCH_HISTORY);
    if (localHistory.length > 0) {
      for (const item of localHistory) {
        await fetchBackend(BACKEND_CONFIG.ENDPOINTS.MY_HISTORY, {
          method: "PUT",
          body: {
            movieSlug: item.slug,
            name: item.name || "",
            poster: item.poster || item.poster_url || item.thumb_url || "",
            episode: String(item.episode || "1"),
            progress: Number(item.progress) || 0,
          },
        }).catch(() => {});
      }
    }
    saveToStorage(STORAGE_KEYS.USER_PREFERENCES, { ...prefs, syncedHistoryToServer: true });
  }

  // ─── Lấy danh sách hiển thị (ưu tiên server nếu đăng nhập) ──────────────────
  function getHistory() {
    if (isLoggedIn() && serverHistory !== null) {
      return [...serverHistory].sort(
        (a, b) => new Date(b.watchedAt || 0) - new Date(a.watchedAt || 0),
      );
    }
    return getStoredList(STORAGE_KEYS.WATCH_HISTORY).sort(
      (a, b) => new Date(b.watchedAt || 0) - new Date(a.watchedAt || 0),
    );
  }

  function renderHistory() {
    const grid = document.getElementById(GRID_ID);
    if (!grid) return;

    const history = getHistory();
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
      // Xóa khỏi cache server (không gọi API riêng vì hợp đồng không có DELETE /me/history/:slug)
      if (isLoggedIn() && serverHistory) {
        serverHistory = serverHistory.filter((h) => h.slug !== movie.slug);
      }
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
    const progressText = movie.progress > 0 ? ` · ${formatProgressTime(movie.progress)}` : "";
    watchedInfo.textContent = `Đang xem: ${formatEpisodeName(episode)}${progressText} · ${formatDate(movie.watchedAt)}`;
    card.querySelector(".movie-info")?.appendChild(watchedInfo);

    return card;
  }

  // Định dạng giây thành mm:ss hoặc hh:mm:ss cho trang lịch sử (US-53)
  function formatProgressTime(seconds) {
    const total = Math.floor(Number(seconds) || 0);
    if (total <= 0) return "";
    const h = Math.floor(total / 3600);
    const m = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
    const s = String(total % 60).padStart(2, "0");
    return h > 0 ? `${h}:${m}:${s}` : `${m}:${s}`;
  }
})();
