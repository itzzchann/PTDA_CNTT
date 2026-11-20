// Đọc thông tin phim từ phimapi để backend kiểm tra dữ liệu admin nhập (US-60: ghim hero).
const config = require("../config");
const { AppError } = require("../errors");

const MOVIE_NOT_FOUND = () =>
  new AppError(404, "MOVIE_NOT_FOUND", "Không tìm thấy phim với slug này trên nguồn phim");

async function fetchMovieDetail(slug) {
  let response;
  try {
    response = await fetch(`${config.PHIMAPI_BASE_URL}/v1/api/phim/${encodeURIComponent(slug)}`);
  } catch {
    throw new AppError(502, "PHIMAPI_UNREACHABLE", "Nguồn phim đang không phản hồi, thử lại sau");
  }
  if (!response.ok) throw MOVIE_NOT_FOUND();

  const json = await response.json().catch(() => null);
  const movie = json?.data?.item;
  if (!movie) throw MOVIE_NOT_FOUND();
  return movie;
}

module.exports = { fetchMovieDetail };
