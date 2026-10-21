(() => {
  const RECOMMENDATION_COUNT = 6;

  document.addEventListener("DOMContentLoaded", initDetailPage);

  function initDetailPage() {
    const slug = new URLSearchParams(window.location.search).get("slug");

    if (!slug) {
      showDetailError("Không tìm thấy phim. Đường dẫn thiếu mã phim.");
      return;
    }

    loadDetail(slug);
  }

  async function loadDetail(slug) {
    const res = await getMovieDetail(slug);
    const movie = res.data?.data?.item;

    if (!res.success || !movie) {
      const notFound = res.status === 404 || res.success;
      showDetailError(
        notFound
          ? "Không tìm thấy phim này. Có thể phim đã bị gỡ hoặc đường dẫn sai."
          : "Không kết nối được máy chủ phim. Kiểm tra mạng rồi thử lại.",
        notFound ? null : () => loadDetail(slug),
      );
      return;
    }

    document.getElementById("error").hidden = true;

    renderMovie(movie, movie.episodes || []);
    loadRecommendations(movie);

    document.getElementById("loading").hidden = true;
    document.getElementById("content").hidden = false;
  }

  // onRetry có → nút "Thử lại" (lỗi mạng); không có → nút "Về trang chủ" (phim không tồn tại).
  function showDetailError(message, onRetry = null) {
    const loadingEl = document.getElementById("loading");
    const errorEl = document.getElementById("error");
    if (loadingEl) loadingEl.hidden = true;
    if (!errorEl) return;

    errorEl.hidden = false;
    renderEmptyState(
      errorEl,
      onRetry
        ? {
            icon: "fa-solid fa-triangle-exclamation",
            message,
            onRetry: () => {
              errorEl.hidden = true;
              if (loadingEl) loadingEl.hidden = false;
              onRetry();
            },
          }
        : { icon: "fa-solid fa-film", message, actionText: "Về trang chủ", actionHref: "index.html" },
    );
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function joinPeople(value) {
    const list = Array.isArray(value) ? value : [value];
    const names = list.map((name) => String(name || "").trim()).filter(Boolean);
    return names.length > 0 ? names.join(", ") : "Đang cập nhật";
  }

  function buildWatchUrl(slug, episodeName, serverIdx = 0) {
    const params = new URLSearchParams({ slug, ep: episodeName });
    if (serverIdx > 0) params.set("server", serverIdx);
    return `watch.html?${params.toString()}`;
  }

  function renderMovie(movie, episodes) {
    const posterUrl = getImageUrl(movie.poster_url || movie.thumb_url || "");

    document.title = `${movie.name} | ${APP_CONFIG.APP_NAME}`;
    setText("title", movie.name || "");

    const posterEl = document.getElementById("poster");
    if (posterEl) {
      posterEl.alt = movie.name || "";
      posterEl.onerror = () => {
        posterEl.onerror = null;
        posterEl.src = APP_CONFIG.DEFAULT_POSTER;
      };
      posterEl.src = posterUrl;
    }

    showMovieBackdrop(document.getElementById("heroBanner"), movie);

    const chips = [
      formatYear(movie.year),
      formatDuration(movie.time),
      movie.quality || "HD",
      movie.lang || "Đang cập nhật",
    ];
    document.getElementById("meta").innerHTML = chips
      .map((chip) => `<span class="chip">${escapeHtml(chip)}</span>`)
      .join("");

    setText("desc", stripHtml(movie.content) || "Chưa có mô tả.");
    setText("categories", formatCategories(movie.category));
    setText("countries", formatCountries(movie.country));
    setText("actors", joinPeople(movie.actor));
    setText("directors", joinPeople(movie.director));

    renderEpisodes(movie.slug, episodes);

    const watchBtn = document.getElementById("watchBtn");
    if (watchBtn) {
      const firstEp = episodes[0]?.server_data?.[0];
      watchBtn.href = buildWatchUrl(movie.slug, firstEp ? firstEp.name : "1");
    }
  }

  function renderEpisodes(slug, episodes) {
    const container = document.getElementById("episodeList");
    if (!container) return;

    const servers = episodes.filter((server) => server.server_data?.length > 0);

    if (servers.length === 0) {
      container.innerHTML = `<a class="episode-btn" href="${buildWatchUrl(slug, "1")}">Xem phim</a>`;
      return;
    }

    container.innerHTML = servers
      .map((server, serverIdx) => {
        const buttons = server.server_data
          .map(
            (ep) =>
              `<a class="episode-btn" href="${buildWatchUrl(slug, ep.name, serverIdx)}">${
                servers.length === 1 && server.server_data.length === 1
                  ? "Xem phim"
                  : escapeHtml(formatEpisodeName(ep.name))
              }</a>`,
          )
          .join("");
        return `<div class="server-name">${escapeHtml(server.server_name)}</div>${buttons}`;
      })
      .join("");
  }

  async function loadRecommendations(movie) {
    const gridId = "recommendationGrid";
    if (!document.getElementById(gridId)) return;

    renderSkeleton(gridId, RECOMMENDATION_COUNT);

    const res = await getRecommendedMovies(movie.category, RECOMMENDATION_COUNT);
    const movies = extractMovieItems(res)
      .filter((item) => item.slug !== movie.slug)
      .slice(0, RECOMMENDATION_COUNT);

    if (movies.length === 0) {
      renderEmptyState(gridId, { message: "Không có đề xuất phù hợp." });
      return;
    }

    document.getElementById(gridId).innerHTML = movies
      .map(createMovieCard)
      .join("");
  }
})();
