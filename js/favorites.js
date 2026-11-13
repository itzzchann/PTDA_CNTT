(() => {
  const GRID_ID = "favorites-grid";
  const ITEMS_PER_PAGE = APP_CONFIG.LOCAL_ITEMS_PER_PAGE;

  let currentPage = 1;
  let pagination = null;

  // Trạng thái server: null = chưa tải; [] = rỗng; [...] = đã có dữ liệu
  let serverFavorites = null;

  document.addEventListener("DOMContentLoaded", () => {
    pagination = setupPagination((page) => {
      currentPage = page;
      renderFavorites();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    document
      .getElementById("clearFavoritesBtn")
      ?.addEventListener("click", clearAllFavorites);

    if (isLoggedIn()) {
      loadServerFavorites();
    } else {
      renderFavorites();
    }
  });

  // ─── Lấy danh sách yêu thích từ server (US-50) ───────────────────────────────
  async function loadServerFavorites() {
    renderSkeleton(GRID_ID, ITEMS_PER_PAGE);

    // Lần đầu đăng nhập trên máy này: đẩy toàn bộ yêu thích từ localStorage lên máy chủ (US-50)
    await syncLocalFavoritesToServerOnce();

    const res = await fetchBackend(BACKEND_CONFIG.ENDPOINTS.MY_FAVORITES + "?limit=200");
    if (res.ok && res.data?.data?.items) {
      // Chuyển sang định dạng local (slug thay movieSlug) để dùng lại buildFavoriteCard
      serverFavorites = res.data.data.items.map((item) => ({
        slug: item.movieSlug,
        name: item.name,
        poster: item.poster,
        addedAt: item.addedAt,
      }));
    } else {
      serverFavorites = [];
    }
    renderFavorites();
  }

  // Đẩy dữ liệu localStorage lên server lần đầu sau khi đăng nhập (chạy 1 lần / máy)
  async function syncLocalFavoritesToServerOnce() {
    const prefs = getFromStorage(STORAGE_KEYS.USER_PREFERENCES, {});
    if (prefs.syncedFavoritesToServer) return;

    const localFavorites = getStoredList(STORAGE_KEYS.FAVORITES);
    if (localFavorites.length > 0) {
      for (const movie of localFavorites) {
        await addServerFavorite(movie).catch(() => {});
      }
    }
    saveToStorage(STORAGE_KEYS.USER_PREFERENCES, { ...prefs, syncedFavoritesToServer: true });
  }

  // ─── Thêm vào yêu thích server (US-50) ───────────────────────────────────────
  async function addServerFavorite(movie) {
    await fetchBackend(BACKEND_CONFIG.ENDPOINTS.MY_FAVORITES, {
      method: "POST",
      body: JSON.stringify({
        movieSlug: movie.slug,
        name: movie.name || "",
        poster: movie.poster_url || movie.thumb_url || movie.poster || "",
      }),
    });
  }

  // ─── Xóa khỏi yêu thích server (US-50) ───────────────────────────────────────
  async function removeServerFavorite(slug) {
    const endpoint = BACKEND_CONFIG.ENDPOINTS.MY_FAVORITE.replace("[slug]", encodeURIComponent(slug));
    await fetchBackend(endpoint, { method: "DELETE" });
  }

  // ─── Lấy danh sách hiển thị (ưu tiên server nếu đăng nhập) ──────────────────
  function getFavorites() {
    if (isLoggedIn() && serverFavorites !== null) {
      return [...serverFavorites].sort(
        (a, b) => new Date(b.addedAt || 0) - new Date(a.addedAt || 0),
      );
    }
    return getStoredList(STORAGE_KEYS.FAVORITES).sort(
      (a, b) => new Date(b.addedAt || 0) - new Date(a.addedAt || 0),
    );
  }

  function renderFavorites() {
    const grid = document.getElementById(GRID_ID);
    if (!grid) return;

    const favorites = getFavorites();
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
    removeBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopPropagation();

      // Xóa local luôn
      removeFromFavorites(movie.slug);

      // Xóa server nếu đăng nhập (fire-and-forget)
      if (isLoggedIn()) {
        removeServerFavorite(movie.slug).catch(() => {});
        if (serverFavorites) {
          serverFavorites = serverFavorites.filter((f) => f.slug !== movie.slug);
        }
      }

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
    const favorites = getFavorites();
    if (favorites.length === 0) {
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

    // Xóa local
    removeFromStorage(STORAGE_KEYS.FAVORITES);

    // Xóa từng phim trên server (fire-and-forget) nếu đăng nhập
    if (isLoggedIn() && serverFavorites) {
      const slugs = serverFavorites.map((f) => f.slug);
      serverFavorites = [];
      slugs.forEach((slug) => removeServerFavorite(slug).catch(() => {}));
    }

    showToast("Đã xóa toàn bộ danh sách yêu thích", "success");
    currentPage = 1;
    renderFavorites();
  }
})();
