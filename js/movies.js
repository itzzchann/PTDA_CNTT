const getBaseUrl = () => (typeof API_CONFIG !== "undefined" && API_CONFIG.BASE_URL) || "https://phimapi.com";
const ITEMS_PER_PAGE = 24;

let currentPage = 1;
let totalPages = 1;

let moviesGrid, currentPageEl, totalPageEl;
let firstBtn, prevBtn, nextBtn, lastBtn;

document.addEventListener("DOMContentLoaded", () => {
  moviesGrid = document.getElementById("movies-grid");
  currentPageEl = document.getElementById("currentPage");
  totalPageEl = document.getElementById("totalPage");

  firstBtn = document.getElementById("firstPage");
  prevBtn = document.getElementById("prevPage");
  nextBtn = document.getElementById("nextPage");
  lastBtn = document.getElementById("lastPage");

  if (firstBtn) firstBtn.onclick = () => loadMovies(1);
  if (lastBtn) lastBtn.onclick = () => loadMovies(totalPages);
  if (prevBtn) prevBtn.onclick = () => currentPage > 1 && loadMovies(currentPage - 1);
  if (nextBtn) nextBtn.onclick = () => currentPage < totalPages && loadMovies(currentPage + 1);

  loadMovies(1);
});

async function loadMovies(page = 1) {
  currentPage = page;
  if (moviesGrid) {
    if (typeof renderSkeleton === "function") {
      renderSkeleton("movies-grid", 12);
    } else {
      moviesGrid.innerHTML = "📺 Đang tải phim...";
    }
  }

  try {
    const res = await fetch(`${getBaseUrl()}/v1/api/danh-sach/phim-le?page=${page}`);
    const data = await res.json();
    const items = data?.data?.items || data?.items;
    const pagination = data?.data?.params?.pagination;
    const totalItems = pagination?.totalItems;
    const totalPagesFromApi = pagination?.totalPages;

    if (!items?.length) {
      if (moviesGrid) moviesGrid.innerHTML = "❌ Không có dữ liệu phim";
      totalPages = 1;
      return updatePagination();
    }

    totalPages = totalPagesFromApi || Math.ceil((totalItems || items.length) / ITEMS_PER_PAGE) || 1;
    if (moviesGrid) moviesGrid.innerHTML = items.map(createMovieCard).join("");
    updatePagination();
  } catch (err) {
    console.error(err);
    if (moviesGrid) moviesGrid.innerHTML = "❌ Không thể tải danh sách phim";
  }
}

function updatePagination() {
  if (currentPageEl) currentPageEl.textContent = currentPage;
  if (totalPageEl) totalPageEl.textContent = totalPages;

  if (firstBtn && prevBtn) firstBtn.disabled = prevBtn.disabled = currentPage === 1;
  if (nextBtn && lastBtn) nextBtn.disabled = lastBtn.disabled = currentPage === totalPages;
}
