const getBaseUrl = () => (typeof API_CONFIG !== "undefined" && API_CONFIG.BASE_URL) || "https://phimapi.com";
const ITEMS_PER_PAGE = 24;

let currentPage = 1;
let totalPages = 1;

let seriesGrid, currentPageEl, totalPageEl;
let firstBtn, prevBtn, nextBtn, lastBtn;

document.addEventListener("DOMContentLoaded", () => {
  seriesGrid = document.getElementById("series-grid");
  currentPageEl = document.getElementById("currentPage");
  totalPageEl = document.getElementById("totalPage");

  firstBtn = document.getElementById("firstPage");
  prevBtn = document.getElementById("prevPage");
  nextBtn = document.getElementById("nextPage");
  lastBtn = document.getElementById("lastPage");

  if (firstBtn) firstBtn.onclick = () => loadSeries(1);
  if (lastBtn) lastBtn.onclick = () => loadSeries(totalPages);
  if (prevBtn) prevBtn.onclick = () => currentPage > 1 && loadSeries(currentPage - 1);
  if (nextBtn) nextBtn.onclick = () => currentPage < totalPages && loadSeries(currentPage + 1);

  loadSeries(1);
});

async function loadSeries(page = 1) {
  currentPage = page;
  if (seriesGrid) {
    if (typeof renderSkeleton === "function") {
      renderSkeleton("series-grid", 12);
    } else {
      seriesGrid.innerHTML = "📺 Đang tải phim bộ...";
    }
  }

  try {
    const res = await fetch(`${getBaseUrl()}/v1/api/danh-sach/phim-bo?page=${page}`);
    const data = await res.json();
    const items = data?.data?.items || data?.items;
    const pagination = data?.data?.params?.pagination;
    const totalItems = pagination?.totalItems;
    const totalPagesFromApi = pagination?.totalPages;

    if (!items?.length) {
      if (seriesGrid) seriesGrid.innerHTML = "❌ Không có dữ liệu phim bộ";
      totalPages = 1;
      return updatePagination();
    }

    totalPages = totalPagesFromApi || Math.ceil((totalItems || items.length) / ITEMS_PER_PAGE) || 1;
    if (seriesGrid) seriesGrid.innerHTML = items.map(createMovieCard).join("");

    updatePagination();
  } catch (err) {
    console.error(err);
    if (seriesGrid) seriesGrid.innerHTML = "❌ Không thể tải danh sách phim bộ";
  }
}

function updatePagination() {
  if (currentPageEl) currentPageEl.textContent = currentPage;
  if (totalPageEl) totalPageEl.textContent = totalPages;

  if (firstBtn && prevBtn) firstBtn.disabled = prevBtn.disabled = currentPage === 1;
  if (nextBtn && lastBtn) nextBtn.disabled = lastBtn.disabled = currentPage === totalPages;
}
