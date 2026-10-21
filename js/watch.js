// Trang xem phim: thông tin phim · trình phát · tập/phần/máy chủ · sidebar · thanh công cụ · bình luận.
(() => {
  const DESCRIPTION_LENGTH = 250;
  const SKIP_SECONDS = 10;
  const CONTROLS_HIDE_DELAY = 3000;
  const COMMENT_MAX_LENGTH = 1000;
  const TMDB_IMAGE_HOST = "https://image.tmdb.org/t/p";
  const NON_LATIN_PATTERN = /[぀-ヿ㐀-䶿一-鿿豈-﫿ｦ-ﾟ]/;
  const CAST_COLORS = ["#e74c3c", "#3498db", "#2ecc71", "#f39c12", "#9b59b6", "#1abc9c", "#e67e22", "#34495e"];

  const state = {
    movie: null,
    episode: "1",
    server: 0,
    selectedServer: 0,
    hls: null,
    player: null,
    commentTab: "comments",
  };

  document.addEventListener("DOMContentLoaded", initWatchPage);

  function initWatchPage() {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get("slug");
    state.episode = params.get("ep") || "1";
    state.server = Math.max(0, parseInt(params.get("server") || "0", 10) || 0);
    state.selectedServer = state.server;

    setupToolbar();
    setupEpisodeControls();
    setupPlayerShortcuts();
    setupCommentSection();

    if (!slug) {
      showWatchError("Không tìm thấy phim! Đường dẫn thiếu mã phim.");
      return;
    }

    loadMovie(slug);
  }

  async function loadMovie(slug) {
    const res = await getMovieDetail(slug);
    const movie = res.data?.data?.item;

    if (!res.success || !movie) {
      showWatchError(
        res.success ? "Không tìm thấy phim này." : `Lỗi tải phim: ${res.error}`,
      );
      return;
    }

    movie.episodes = movie.episodes || [];
    if (!movie.episodes[state.server]) {
      state.server = 0;
      state.selectedServer = 0;
    }
    state.movie = movie;

    renderMovieInfo();
    updateFavoriteButton();
    renderVideo();
    renderServerTabs();
    renderSeasons();
    renderEpisodes();
    renderCast();
    loadGallery();
    loadRecommendations();
    renderComments();

    saveWatchHistory(movie, state.episode, 0);
  }

  function showWatchError(message) {
    const container = document.querySelector(".watch-page");
    if (!container) return;
    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message watch-error";
    errorDiv.textContent = message;
    container.prepend(errorDiv);
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function isSameEpisode(ep, value) {
    const target = String(value).toLowerCase();
    return (
      String(ep.name).toLowerCase() === target ||
      String(ep.slug).toLowerCase() === target
    );
  }

  function getSeasonNumber(name) {
    const match = String(name).match(/Phần (\d+)/i);
    return match ? parseInt(match[1], 10) : 1;
  }

  // ===== Thông tin phim =====

  function renderMovieInfo() {
    const movie = state.movie;
    const totalEp = movie.episode_total || "??";
    const currentEpCount = movie.episode_current || "??";

    setText("movie-title", movie.name);
    setText("header-movie-title", movie.name);
    setText("movie-subtitle", movie.origin_name || movie.tmdb?.original_title || "");
    setText("imdb-score", movie.imdb?.vote_average || movie.tmdb?.vote_average || "N/A");
    setText("year", formatYear(movie.year));
    setText("episode-info", `Tập ${totalEp}`);
    setText("season-info", `Phần ${getSeasonNumber(movie.name)}`);
    setText(
      "sidebar-rating",
      movie.tmdb?.vote_average ? Number(movie.tmdb.vote_average).toFixed(1) : "N/A",
    );

    const statusText = document.getElementById("status-text");
    if (statusText) {
      const isCompleted = currentEpCount === totalEp || movie.status === "completed";
      const status = statusText.closest(".completion-status");
      status?.classList.toggle("is-completed", isCompleted);
      status?.classList.toggle("is-ongoing", !isCompleted);
      const icon = status?.querySelector("i");
      if (icon) icon.className = isCompleted ? "fas fa-check-circle" : "fas fa-clock";
      statusText.textContent = `${isCompleted ? "Đã hoàn thành" : "Đang cập nhật"}: ${currentEpCount} / ${totalEp} tập`;
    }

    const descEl = document.getElementById("movie-description");
    if (descEl) {
      const text = stripHtml(movie.content);
      const detailUrl = `./detail.html?slug=${encodeURIComponent(movie.slug)}`;
      if (!text) {
        descEl.textContent = "Đang cập nhật mô tả...";
      } else if (text.length > DESCRIPTION_LENGTH) {
        descEl.innerHTML = `${escapeHtml(text.substring(0, DESCRIPTION_LENGTH))}<a class="description-more-link" href="${detailUrl}" title="Xem thông tin chi tiết">...</a>`;
      } else {
        descEl.innerHTML = `${escapeHtml(text)} <a class="description-more-link-small" href="${detailUrl}" title="Xem thông tin chi tiết">[Chi tiết]</a>`;
      }
    }

    const poster = document.getElementById("movie-poster");
    if (poster) {
      poster.onerror = () => {
        poster.onerror = null;
        poster.src = APP_CONFIG.DEFAULT_POSTER;
      };
      poster.src = getImageUrl(movie.poster_url || movie.thumb_url);
      poster.alt = movie.name || "";
    }

    const genres = document.getElementById("movie-genres");
    if (genres && movie.category) {
      genres.innerHTML = movie.category
        .map((c) => `<span class="genre-tag">${escapeHtml(c.name)}</span>`)
        .join("");
    }

    document.title = `Xem ${movie.name} | ${APP_CONFIG.APP_NAME}`;
  }

  // ===== Trình phát =====

  function renderVideo() {
    const server = state.movie.episodes[state.server] || state.movie.episodes[0];
    const ep = server?.server_data?.find((e) => isSameEpisode(e, state.episode)) || server?.server_data?.[0];
    if (!ep) return;
    state.episode = ep.name;

    if (state.hls) {
      state.hls.destroy();
      state.hls = null;
    }

    const iframe = document.getElementById("video-iframe");
    const video = document.getElementById("hls-player");
    const qualitySelector = document.getElementById("quality-selector");
    if (qualitySelector) qualitySelector.hidden = true;

    const canUseHls = ep.link_m3u8 && ep.link_m3u8.includes(".m3u8") && video;

    if (canUseHls && window.Hls && Hls.isSupported()) {
      showVideoElement(video, iframe);
      playWithHlsJs(video, ep);
    } else if (canUseHls && video.canPlayType("application/vnd.apple.mpegurl")) {
      showVideoElement(video, iframe);
      video.src = ep.link_m3u8;
      video.addEventListener("loadedmetadata", () => video.play().catch(() => {}), { once: true });
      initCustomControls(video);
    } else {
      showEmbedPlayer(ep.link_embed);
    }

    const params = new URLSearchParams({ slug: state.movie.slug, ep: ep.name, server: state.server });
    window.history.replaceState({}, "", `${window.location.pathname}?${params}`);
  }

  function showVideoElement(video, iframe) {
    if (iframe) {
      iframe.hidden = true;
      iframe.src = "";
    }
    video.hidden = false;
  }

  function showEmbedPlayer(embedUrl) {
    const iframe = document.getElementById("video-iframe");
    const video = document.getElementById("hls-player");
    const controls = document.getElementById("custom-controls");

    state.player = null;
    if (video) {
      video.pause();
      video.removeAttribute("src");
      video.hidden = true;
    }
    if (controls) controls.hidden = true;
    if (iframe) {
      iframe.hidden = false;
      iframe.src = embedUrl || "";
    }
  }

  function playWithHlsJs(video, ep) {
    const hls = new Hls({ capLevelToPlayerSize: false, startLevel: -1 });
    state.hls = hls;
    hls.loadSource(ep.link_m3u8);
    hls.attachMedia(video);

    hls.on(Hls.Events.ERROR, (event, data) => {
      if (!data.fatal) return;
      console.warn("HLS fatal error, chuyển sang iframe:", data.type);
      hls.destroy();
      if (state.hls === hls) state.hls = null;
      showEmbedPlayer(ep.link_embed);
    });

    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      video.play().catch(() => {});
      setupQualitySelector(hls);
      initCustomControls(video);
    });

    hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
      const label = document.getElementById("current-quality-label");
      if (label && hls.autoLevelEnabled && hls.levels[data.level]) {
        label.textContent = `Auto (${hls.levels[data.level].height}p)`;
      }
    });
  }

  function setupQualitySelector(hls) {
    const selector = document.getElementById("quality-selector");
    const currentBtn = document.getElementById("quality-current-btn");
    const menu = document.getElementById("quality-menu");
    const label = document.getElementById("current-quality-label");
    if (!selector || !currentBtn || !menu) return;

    const levels = hls.levels;
    selector.hidden = levels.length <= 1;
    if (levels.length <= 1) return;

    const sortedLevels = levels
      .map((level, index) => ({ height: level.height, index }))
      .sort((a, b) => b.height - a.height);

    menu.innerHTML =
      `<div class="quality-item ${hls.autoLevelEnabled ? "active" : ""}" data-level="-1">Tự động (Auto)</div>` +
      sortedLevels
        .map(
          (level) => `<div class="quality-item" data-level="${level.index}">
            ${level.height}p${level.height >= 1080 ? ' <small class="quality-tag">FHD</small>' : ""}
          </div>`,
        )
        .join("");
    if (label) label.textContent = "Auto";

    currentBtn.onclick = (e) => {
      e.stopPropagation();
      menu.classList.toggle("active");
    };

    menu.onclick = (e) => {
      const item = e.target.closest(".quality-item");
      if (!item) return;
      const level = parseInt(item.dataset.level, 10);
      hls.currentLevel = level;
      menu.querySelectorAll(".quality-item").forEach((i) => i.classList.toggle("active", i === item));
      if (label) label.textContent = level === -1 ? "Auto" : `${levels[level].height}p`;
      menu.classList.remove("active");
    };
  }

  // Gắn lại mỗi khi đổi nguồn video; dùng thuộc tính on* nên không bị nhân đôi.
  function initCustomControls(video) {
    const container = document.getElementById("player-container");
    const controls = document.getElementById("custom-controls");
    const playPauseBtn = document.getElementById("play-pause-btn");
    const volumeBtn = document.getElementById("volume-btn");
    const volumeSlider = document.getElementById("volume-slider");
    const seekbar = document.getElementById("seekbar");
    const seekbarProgress = document.getElementById("seekbar-progress");
    const currentTimeEl = document.getElementById("current-time");
    const durationTimeEl = document.getElementById("duration-time");
    const fullscreenBtn = document.getElementById("fullscreen-btn");
    const autoNextToggle = document.getElementById("auto-next-toggle");
    if (!video || !controls) return;

    controls.hidden = false;

    const setPlayIcon = (icon) => {
      playPauseBtn.innerHTML = `<i class="fas fa-${icon}"></i>`;
    };
    const togglePlay = () => {
      if (video.paused) video.play().catch(() => {});
      else video.pause();
    };
    const updateVolumeIcon = () => {
      const icon = volumeBtn.querySelector("i");
      if (video.volume === 0) icon.className = "fas fa-volume-mute";
      else if (video.volume < 0.5) icon.className = "fas fa-volume-down";
      else icon.className = "fas fa-volume-up";
    };
    const setVolume = (value) => {
      video.volume = Math.min(1, Math.max(0, value));
      volumeSlider.value = video.volume;
      updateVolumeIcon();
    };

    video.onplay = () => setPlayIcon("pause");
    video.onpause = () => setPlayIcon("play");
    playPauseBtn.onclick = togglePlay;
    video.onclick = togglePlay;
    document.getElementById("rewind-btn").onclick = () => (video.currentTime -= SKIP_SECONDS);
    document.getElementById("forward-btn").onclick = () => (video.currentTime += SKIP_SECONDS);

    volumeSlider.oninput = (e) => setVolume(parseFloat(e.target.value));
    volumeBtn.onclick = () => {
      if (video.volume > 0) {
        video.dataset.lastVolume = video.volume;
        setVolume(0);
      } else {
        setVolume(parseFloat(video.dataset.lastVolume) || 1);
      }
    };

    video.ontimeupdate = () => {
      if (!video.duration) return;
      const percent = (video.currentTime / video.duration) * 100;
      seekbar.value = percent;
      seekbarProgress.style.width = `${percent}%`;
      currentTimeEl.textContent = formatTime(video.currentTime);
    };
    video.onloadedmetadata = () => {
      durationTimeEl.textContent = formatTime(video.duration);
    };
    seekbar.oninput = (e) => {
      if (video.duration) video.currentTime = (e.target.value / 100) * video.duration;
    };

    fullscreenBtn.onclick = () => {
      if (document.fullscreenElement) {
        document.exitFullscreen();
        return;
      }
      container.requestFullscreen().catch((err) => {
        console.error("Fullscreen error:", err);
        showToast("Trình duyệt không cho phép toàn màn hình", "error");
      });
    };
    document.onfullscreenchange = () => {
      fullscreenBtn.innerHTML = document.fullscreenElement
        ? '<i class="fas fa-compress"></i>'
        : '<i class="fas fa-expand"></i>';
    };

    video.onended = () => {
      if (autoNextToggle.checked) playNextEpisode();
      else setPlayIcon("redo");
    };

    let hideTimer;
    container.onmousemove = () => {
      controls.classList.add("active");
      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => {
        if (!video.paused) controls.classList.remove("active");
      }, CONTROLS_HIDE_DELAY);
    };

    state.player = { video, togglePlay, setVolume };
  }

  function setupPlayerShortcuts() {
    document.addEventListener("keydown", (e) => {
      const player = state.player;
      if (!player) return;
      const target = e.target;
      if (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
      // Space trên nút đang focus đã tự "click" nút đó.
      if (e.code === "Space" && target.tagName === "BUTTON") return;

      const { video, togglePlay, setVolume } = player;
      switch (e.code) {
        case "Space":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowRight":
          video.currentTime += SKIP_SECONDS;
          break;
        case "ArrowLeft":
          video.currentTime -= SKIP_SECONDS;
          break;
        case "ArrowUp":
          e.preventDefault();
          setVolume(video.volume + 0.1);
          break;
        case "ArrowDown":
          e.preventDefault();
          setVolume(video.volume - 0.1);
          break;
      }
    });
  }

  function formatTime(seconds) {
    if (!Number.isFinite(seconds)) return "00:00";
    const h = Math.floor(seconds / 3600);
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const s = String(Math.floor(seconds % 60)).padStart(2, "0");
    return h > 0 ? `${h}:${m}:${s}` : `${m}:${s}`;
  }

  // ===== Tập / phần / máy chủ =====

  function setupEpisodeControls() {
    const seasonSelector = document.querySelector(".season-selector");
    const seasonContent = document.getElementById("season-dropdown-content");

    document.getElementById("season-toggle-btn")?.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = seasonContent.classList.toggle("show");
      seasonSelector.classList.toggle("active", isOpen);
    });

    document.addEventListener("click", (e) => {
      if (seasonSelector && !seasonSelector.contains(e.target)) {
        seasonContent?.classList.remove("show");
        seasonSelector.classList.remove("active");
      }
      document.getElementById("quality-menu")?.classList.remove("active");
    });

    document.getElementById("server-tabs")?.addEventListener("click", (e) => {
      const btn = e.target.closest(".server-btn");
      if (!btn) return;
      state.selectedServer = parseInt(btn.dataset.serverIndex, 10);
      renderServerTabs();
      renderEpisodes();
    });

    document.getElementById("episodes-grid")?.addEventListener("click", (e) => {
      const card = e.target.closest(".episode-card");
      if (card) playEpisode(card.dataset.episode, state.selectedServer);
    });
  }

  function renderServerTabs() {
    const serverTabs = document.getElementById("server-tabs");
    if (!serverTabs) return;
    serverTabs.innerHTML = state.movie.episodes
      .map(
        (server, idx) => `
        <button type="button" class="server-btn ${idx === state.selectedServer ? "active" : ""}" data-server-index="${idx}">
          ${escapeHtml(server.server_name)}
        </button>`,
      )
      .join("");
  }

  function renderEpisodes() {
    const grid = document.getElementById("episodes-grid");
    if (!grid) return;

    const serverData = state.movie.episodes[state.selectedServer]?.server_data || [];
    if (serverData.length === 0) {
      grid.innerHTML = '<p class="no-data">Chưa có tập phim</p>';
      return;
    }

    grid.innerHTML = serverData
      .map((ep) => {
        const isPlaying = isSameEpisode(ep, state.episode) && state.selectedServer === state.server;
        return `<div class="episode-card ${isPlaying ? "active" : ""}" data-episode="${escapeHtml(ep.name)}">
            <span class="ep-number">${escapeHtml(ep.name)}</span>
          </div>`;
      })
      .join("");
  }

  function playEpisode(episodeName, serverIdx) {
    state.episode = episodeName;
    state.server = serverIdx;
    state.selectedServer = serverIdx;
    renderVideo();
    renderServerTabs();
    renderEpisodes();
    saveWatchHistory(state.movie, state.episode, 0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function playNextEpisode() {
    const serverData = state.movie?.episodes[state.server]?.server_data || [];
    const currentIndex = serverData.findIndex((e) => isSameEpisode(e, state.episode));
    if (currentIndex !== -1 && currentIndex < serverData.length - 1) {
      playEpisode(serverData[currentIndex + 1].name, state.server);
    }
  }

  // Danh sách "Phần" được suy ra bằng cách tìm các phim cùng tên gốc — phimapi không có quan hệ mùa phim.
  async function renderSeasons() {
    const seasonList = document.getElementById("season-list");
    const currentSeasonText = document.getElementById("current-season-text");
    if (!seasonList) return;

    const movieName = state.movie.name;
    const currentSeasonNum = getSeasonNumber(movieName);
    if (currentSeasonText) currentSeasonText.textContent = `Phần ${currentSeasonNum}`;
    seasonList.innerHTML = `<a href="#" class="season-item active">Phần ${currentSeasonNum}</a>`;

    const baseName = movieName.replace(/[([-]?\s*Phần \d+\s*[)\]]?/gi, "").trim();
    const res = await searchMovies(baseName);
    if (!res.success) return;

    const seasons = new Map();
    extractMovieItems(res)
      .filter((m) => m.name.toLowerCase().includes(baseName.toLowerCase()))
      .forEach((m) => {
        const hasSeason = /Phần \d+/i.test(m.name);
        if (!hasSeason && m.name.length >= baseName.length + 5) return;
        const num = getSeasonNumber(m.name);
        if (!seasons.has(num)) seasons.set(num, m.slug);
      });
    if (seasons.size === 0) return;

    seasonList.innerHTML = [...seasons.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([num, slug]) => {
        const isActive = num === currentSeasonNum;
        const href = isActive ? "#" : `watch.html?slug=${encodeURIComponent(slug)}`;
        return `<a href="${href}" class="season-item ${isActive ? "active" : ""}">Phần ${num}</a>`;
      })
      .join("");
  }

  // ===== Sidebar: diễn viên, hình ảnh, đề xuất =====

  function isLatinName(name) {
    return Boolean(name) && /[a-zA-Z]/.test(name) && !NON_LATIN_PATTERN.test(name);
  }

  async function renderCast() {
    const grid = document.getElementById("cast-grid");
    if (!grid) return;

    const res = await getMoviePeoples(state.movie.slug);
    const peoples = res.data?.data?.peoples || [];

    if (res.success && peoples.length > 0) {
      grid.innerHTML = peoples
        .slice(0, 10)
        .map((person) => {
          const imgPath = person.profile_path
            ? `${TMDB_IMAGE_HOST}/w185${person.profile_path}`
            : APP_CONFIG.DEFAULT_AVATAR;
          const candidates = [person.name, person.original_name, ...(person.also_known_as || [])];
          const displayName = candidates.find(isLatinName) || person.original_name || person.name;
          return `
            <div class="cast-item">
              <img src="${escapeHtml(imgPath)}" alt="${escapeHtml(displayName)}" class="cast-avatar" loading="lazy"
                   onerror="this.onerror=null;this.src='${APP_CONFIG.DEFAULT_AVATAR}'">
              <span class="cast-name">${escapeHtml(displayName)}<br><small class="cast-character">${escapeHtml(truncateText(person.character || "", 20))}</small></span>
            </div>`;
        })
        .join("");
      return;
    }

    const actors = (state.movie.actor || []).filter(isLatinName);
    if (actors.length === 0) {
      grid.innerHTML = '<p class="no-data">Đang cập nhật diễn viên</p>';
      return;
    }

    grid.innerHTML = actors
      .slice(0, 8)
      .map(
        (actor, idx) => `
        <div class="cast-item">
          <div class="cast-avatar cast-avatar-initial" style="background: ${CAST_COLORS[idx % CAST_COLORS.length]}">
            ${escapeHtml(actor.charAt(0).toUpperCase())}
          </div>
          <span class="cast-name">${escapeHtml(actor)}</span>
        </div>`,
      )
      .join("");
  }

  async function loadGallery() {
    const grid = document.getElementById("gallery-grid");
    if (!grid) return;

    const res = await getMovieImages(state.movie.slug);
    const images = res.data?.data?.images || [];
    const gallery = [
      ...images.filter((i) => i.type === "backdrop").slice(0, 6),
      ...images.filter((i) => i.type === "poster").slice(0, 4),
    ];

    if (!res.success) {
      grid.innerHTML = '<p class="no-data">Lỗi tải hình ảnh</p>';
      return;
    }
    if (gallery.length === 0) {
      grid.innerHTML = '<p class="no-data">Không có hình ảnh</p>';
      return;
    }

    grid.innerHTML = gallery
      .map((img) => {
        const size = img.type === "backdrop" ? "w780" : "w342";
        return `
          <div class="gallery-item ${escapeHtml(img.type)}">
            <img src="${escapeHtml(`${TMDB_IMAGE_HOST}/${size}${img.file_path}`)}" alt="Hình ảnh phim ${escapeHtml(state.movie.name)}" loading="lazy">
          </div>`;
      })
      .join("");
  }

  async function loadRecommendations() {
    const listId = "recommendations-list";
    const list = document.getElementById(listId);
    if (!list) return;

    renderSkeleton(listId, 6);

    const res = await getRecommendedMovies(state.movie.category || [], 6);
    const movies = extractMovieItems(res)
      .filter((m) => m.slug !== state.movie.slug)
      .slice(0, 6);

    list.innerHTML =
      movies.length > 0
        ? movies.map(createMovieCard).join("")
        : `<p class="no-data">${res.success ? "Không có đề xuất" : "Lỗi tải đề xuất"}</p>`;
  }

  // ===== Thanh công cụ =====

  function setupToolbar() {
    const lightsBtn = document.getElementById("lights-btn");
    lightsBtn?.addEventListener("click", () => {
      const isOff = document.body.classList.toggle("lights-off");
      const label = lightsBtn.querySelector("span");
      if (label) label.textContent = isOff ? "Bật đèn" : "Tắt đèn";
    });

    document.getElementById("favorite-btn")?.addEventListener("click", () => {
      if (!state.movie) return;
      toggleFavorite(state.movie);
      updateFavoriteButton();
    });

    document.getElementById("share-btn")?.addEventListener("click", async () => {
      if (navigator.share) {
        try {
          await navigator.share({ title: state.movie?.name || "Xem phim", url: window.location.href });
        } catch (e) {
          // Người dùng đóng bảng chia sẻ — không phải lỗi.
        }
        return;
      }
      const success = await copyToClipboard(window.location.href);
      showToast(success ? "Đã sao chép liên kết" : "Không sao chép được liên kết", success ? "success" : "error");
    });
  }

  function updateFavoriteButton() {
    const icon = document.querySelector("#favorite-btn i");
    if (icon && state.movie) {
      icon.className = isInFavorites(state.movie.slug) ? "fas fa-heart" : "far fa-heart";
    }
  }

  // ===== Bình luận & đánh giá =====
  // DỮ LIỆU DEMO: thay bằng GET /movies/:slug/comments và /ratings khi có backend (US-54, 55, 56).

  const DEMO_COMMENTS = [
    { user: "ngiahan0407", avatar: "assets/images/defaults/default-avatar1.jpg", badges: [{ icon: "fas fa-infinity", tone: "gold" }], sentiment: "Tuyệt vời", time: "42 phút trước", content: "mêeeeee" },
    { user: "Thanh Thảo", avatar: "assets/images/defaults/default-avatar2.jpg", badges: [{ icon: "fas fa-venus", tone: "pink" }], sentiment: "Tuyệt vời", time: "một ngày trước", content: "kết happy ending, ai cũng dễ thương, chờ tỏ tình mòn mỏi" },
    { user: "Thu Lee Anh", avatar: "assets/images/defaults/default-avatar3.jpg", badges: [{ icon: "fas fa-venus", tone: "pink" }], sentiment: "Tuyệt vời", time: "một ngày trước", content: "Lâu lắm rồi mới tìm được phim hợp gu" },
  ];

  const DEMO_RATINGS = [
    { user: "Minh Khôi", avatar: "assets/images/defaults/default-avatar4.jpg", badges: [], rating: 10, time: "2 giờ trước", content: "Phim quá đỉnh, 10/10 không bàn cãi!" },
    { user: "Hải Yến", avatar: "assets/images/defaults/default-avatar5.jpg", badges: [{ icon: "fas fa-venus", tone: "pink" }], rating: 9, time: "5 giờ trước", content: "Cốt truyện hay, nhạc phim xuất sắc." },
  ];

  function setupCommentSection() {
    const pills = document.querySelectorAll(".toggle-pill .pill-btn");
    pills.forEach((btn) => {
      btn.addEventListener("click", () => {
        pills.forEach((b) => b.classList.toggle("active", b === btn));
        state.commentTab = btn.dataset.tab;
        renderComments();
      });
    });

    const scrollToComments = () =>
      document.getElementById("comments-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
    document.getElementById("btn-rate-action")?.addEventListener("click", scrollToComments);
    document.getElementById("btn-comment-scroll")?.addEventListener("click", scrollToComments);

    const input = document.getElementById("comment-input");
    const counter = document.getElementById("comment-char-count");
    input?.addEventListener("input", () => {
      if (!counter) return;
      counter.textContent = `${input.value.length} / ${COMMENT_MAX_LENGTH}`;
      counter.classList.toggle("is-full", input.value.length >= COMMENT_MAX_LENGTH);
    });

    document.querySelector(".send-btn")?.addEventListener("click", () => {
      if (!input || input.value.trim() === "") {
        showToast("Vui lòng nhập nội dung bình luận", "warning");
        return;
      }
      showToast("Vui lòng đăng nhập để bình luận", "info");
    });
  }

  function renderComments() {
    const list = document.getElementById("rich-comment-list");
    const tabTitle = document.querySelector(".cmt-tab-btn");
    if (!list) return;

    const isCommentTab = state.commentTab === "comments";
    const data = isCommentTab ? DEMO_COMMENTS : DEMO_RATINGS;

    if (tabTitle) {
      tabTitle.innerHTML = `<i class="fas fa-comment-alt"></i> ${isCommentTab ? "Bình luận" : "Đánh giá"} ( <span id="comment-count-display">${data.length}</span> )`;
    }

    list.innerHTML = data
      .map((c) => {
        const badges = c.badges
          .map((b) => `<i class="${escapeHtml(b.icon)} comment-badge comment-badge-${escapeHtml(b.tone)}"></i>`)
          .join("");
        const sentiment = c.rating
          ? `<span class="sentiment-badge sentiment-good"><i class="fas fa-star"></i> ${escapeHtml(c.rating)}/10</span>`
          : `<span class="sentiment-badge sentiment-awesome"><i class="fas fa-fire-alt"></i> ${escapeHtml(c.sentiment)}</span>`;

        return `
        <div class="comment-item-rich">
          <img src="${escapeHtml(c.avatar)}" class="user-avatar" alt="${escapeHtml(c.user)}">
          <div class="comment-content-wrapper">
            <div class="comment-header">
              ${sentiment}
              <span class="user-name">${escapeHtml(c.user)}</span>
              ${badges}
              <span class="time-text">${escapeHtml(c.time)}</span>
            </div>
            <div class="comment-body">${escapeHtml(c.content)}</div>
            <div class="comment-actions">
              <div class="action-link"><i class="fas fa-arrow-up circle-icon"></i></div>
              <div class="action-link"><i class="fas fa-arrow-down circle-icon"></i></div>
              <div class="action-link"><i class="fas fa-reply"></i> Trả lời</div>
              <div class="action-link"><i class="fas fa-ellipsis-h"></i> Thêm</div>
            </div>
          </div>
        </div>`;
      })
      .join("");
  }
})();
