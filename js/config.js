const API_CONFIG = {
  BASE_URL: "https://phimapi.com",
  IMAGE_HOST: "https://phimimg.com/",
  TMDB_IMAGE_HOST: "https://image.tmdb.org/t/p",

  BACKUP_URL: "https://phimapi.com",

  ENDPOINTS: {
    CATEGORIES_LIST: "/v1/api/the-loai",

    COUNTRIES_LIST: "/v1/api/quoc-gia",

    MOVIES_LIST: "/danh-sach/phim-moi-cap-nhat-v3",

    MOVIE_DETAIL: "/v1/api/phim/[slug]",

    SEARCH: "/v1/api/tim-kiem?keyword=[keyword]",

    CATEGORY: "/v1/api/the-loai/[slug]",

    COUNTRY: "/v1/api/quoc-gia/[slug]",

    SINGLE_MOVIES: "/v1/api/danh-sach/phim-le",

    SERIES_MOVIES: "/v1/api/danh-sach/phim-bo",

    MOVIE_IMAGES: "/v1/api/phim/[slug]/images",
    MOVIE_PEOPLES: "/v1/api/phim/[slug]/peoples",
    MOVIE_KEYWORDS: "/v1/api/phim/[slug]/keywords",
    MOVIE_LIST: "/v1/api/danh-sach/[slug]",
  },

  TIMEOUT_MS: 15000,
};

// Backend riêng của RoPhim (tài khoản, bình luận, đánh giá, admin) — xem docs/specs/backend_api_contract.md.
// BASE_URL rỗng = chưa có backend: fetchBackend() trả lỗi BACKEND_NOT_CONFIGURED thay vì gọi mạng.
// Ví dụ: "http://localhost:3000/api" (dev) hoặc "https://api.<ten-mien>/api" (production).
const BACKEND_CONFIG = {
  BASE_URL: "",

  ENDPOINTS: {
    REGISTER: "/auth/register",
    LOGIN: "/auth/login",
    GOOGLE_LOGIN: "/auth/google",
    LOGOUT: "/auth/logout",
    ME: "/auth/me",

    MY_FAVORITES: "/me/favorites",
    MY_FAVORITE: "/me/favorites/[slug]",
    MY_HISTORY: "/me/history",

    COMMENTS: "/movies/[slug]/comments",
    COMMENT: "/comments/[id]",
    RATINGS: "/movies/[slug]/ratings",
    VIEWS: "/movies/[slug]/views",

    SETTINGS: "/settings",

    ADMIN_STATS: "/admin/stats",
    ADMIN_SETTINGS: "/admin/settings",
    ADMIN_USERS: "/admin/users",
    ADMIN_USER: "/admin/users/[id]",
    ADMIN_COMMENTS: "/admin/comments",
    ADMIN_COMMENT: "/admin/comments/[id]",
  },

  // Client ID của Google là thông tin công khai (Google thiết kế để nằm trong trang web), không phải bí mật.
  // Rỗng = chưa cấu hình: login.html tự ẩn nút "Đăng nhập bằng Google". KHÔNG dán Client secret vào đây.
  GOOGLE_CLIENT_ID: "134760757112-4gag2pjk4uj15jo68qfqnmtq06n0182g.apps.googleusercontent.com",

  // Render gói free "ngủ" khi không có request — lần gọi đầu có thể mất 30–60 giây.
  TIMEOUT_MS: 60000,
};

const APP_CONFIG = {
  APP_NAME: "RoPhim",

  ITEMS_PER_PAGE: 24,

  LOCAL_ITEMS_PER_PAGE: 12,

  MAX_DESCRIPTION_LENGTH: 200,

  SEARCH_DEBOUNCE_TIME: 500,

  SEARCH_MIN_LENGTH: 2,

  MAX_HISTORY_ITEMS: 50,

  DEFAULT_POSTER: "./assets/images/defaults/no-poster.svg",

  DEFAULT_AVATAR: "./assets/images/defaults/default-avatar1.jpg",
};

const CATEGORIES = [
  { slug: "hanh-dong", name: "Hành Động" },
  { slug: "tinh-cam", name: "Tình Cảm" },
  { slug: "hai-huoc", name: "Hài Hước" },
  { slug: "co-trang", name: "Cổ Trang" },
  { slug: "tam-ly", name: "Tâm Lý" },
  { slug: "hinh-su", name: "Hình Sự" },
  { slug: "chien-tranh", name: "Chiến Tranh" },
  { slug: "the-thao", name: "Thể Thao" },
  { slug: "vo-thuat", name: "Võ Thuật" },
  { slug: "vien-tuong", name: "Viễn Tưởng" },
  { slug: "phieu-luu", name: "Phiêu Lưu" },
  { slug: "khoa-hoc", name: "Khoa Học" },
  { slug: "kinh-di", name: "Kinh Dị" },
  { slug: "am-nhac", name: "Âm Nhạc" },
  { slug: "than-thoai", name: "Thần Thoại" },
  { slug: "tai-lieu", name: "Tài Liệu" },
  { slug: "gia-dinh", name: "Gia Đình" },
  { slug: "chinh-kich", name: "Chính kịch" },
  { slug: "bi-an", name: "Bí ẩn" },
  { slug: "hoc-duong", name: "Học Đường" },
  { slug: "kinh-dien", name: "Kinh Điển" },
  { slug: "phim-18", name: "Phim 18+" },
  { slug: "short-drama", name: "Short Drama" },
];

const COUNTRIES = [
  { slug: "trung-quoc", name: "Trung Quốc" },
  { slug: "han-quoc", name: "Hàn Quốc" },
  { slug: "nhat-ban", name: "Nhật Bản" },
  { slug: "thai-lan", name: "Thái Lan" },
  { slug: "au-my", name: "Âu Mỹ" },
  { slug: "dai-loan", name: "Đài Loan" },
  { slug: "hong-kong", name: "Hồng Kông" },
  { slug: "an-do", name: "Ấn Độ" },
  { slug: "anh", name: "Anh" },
  { slug: "phap", name: "Pháp" },
  { slug: "canada", name: "Canada" },
  { slug: "duc", name: "Đức" },
  { slug: "tay-ban-nha", name: "Tây Ban Nha" },
  { slug: "tho-nhi-ky", name: "Thổ Nhĩ Kỳ" },
  { slug: "viet-nam", name: "Việt Nam" },
  { slug: "ha-lan", name: "Hà Lan" },
  { slug: "indonesia", name: "Indonesia" },
  { slug: "nga", name: "Nga" },
  { slug: "mexico", name: "Mexico" },
  { slug: "ba-lan", name: "Ba lan" },
  { slug: "uc", name: "Úc" },
  { slug: "thuy-dien", name: "Thụy Điển" },
  { slug: "malaysia", name: "Malaysia" },
  { slug: "brazil", name: "Brazil" },
  { slug: "philippines", name: "Philippines" },
  { slug: "bo-dao-nha", name: "Bồ Đào Nha" },
  { slug: "y", name: "Ý" },
  { slug: "dan-mach", name: "Đan Mạch" },
  { slug: "uae", name: "UAE" },
  { slug: "na-uy", name: "Na Uy" },
  { slug: "thuy-si", name: "Thụy Sĩ" },
  { slug: "chau-phi", name: "Châu Phi" },
  { slug: "nam-phi", name: "Nam Phi" },
  { slug: "ukraina", name: "Ukraina" },
  { slug: "a-rap-xe-ut", name: "Ả Rập Xê Út" },
  { slug: "bi", name: "Bỉ" },
  { slug: "ireland", name: "Ireland" },
  { slug: "colombia", name: "Colombia" },
  { slug: "phan-lan", name: "Phần Lan" },
  { slug: "chile", name: "Chile" },
  { slug: "hy-lap", name: "Hy Lạp" },
  { slug: "nigeria", name: "Nigeria" },
  { slug: "argentina", name: "Argentina" },
  { slug: "singapore", name: "Singapore" },
  { slug: "quoc-gia-khac", name: "Quốc Gia Khác" },
];

const STORAGE_KEYS = {
  FAVORITES: "rophim_favorites",
  WATCH_HISTORY: "rophim_watch_history",
  USER_PREFERENCES: "rophim_user_prefs",
  AUTH_SESSION: "rophim_auth_session",
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    API_CONFIG,
    BACKEND_CONFIG,
    APP_CONFIG,
    CATEGORIES,
    COUNTRIES,
    STORAGE_KEYS,
  };
}
