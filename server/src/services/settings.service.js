// Settings công khai (US-60 ghim hero, US-62 bảo trì + nguồn phim). Chủ sở hữu: Lead.
// Bảng settings là key → value JSONB. Map sang object camelCase theo hợp đồng §2.
const db = require("../db");
const { AppError } = require("../errors");
const phimapiService = require("./phimapi.service");

const SETTINGS_KEYS = ["maintenance_mode", "maintenance_message", "pinned_hero_slug", "movie_api_base_url"];

const MAX_MESSAGE_LENGTH = 500;
const MAX_SLUG_LENGTH = 255;
const MOVIE_API_PATTERN = /^https:\/\/[a-z0-9.-]+(:\d+)?$/i;

// settings (key/value rows) → { maintenanceMode, maintenanceMessage, pinnedHeroSlug, movieApiBaseUrl }
function toSettings(rows) {
  const byKey = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return {
    maintenanceMode: byKey.maintenance_mode === true,
    maintenanceMessage: String(byKey.maintenance_message ?? ""),
    pinnedHeroSlug: byKey.pinned_hero_slug ?? null,
    movieApiBaseUrl: byKey.movie_api_base_url ?? null,
  };
}

async function getSettingsRows() {
  const { rows } = await db.query(`SELECT key, value FROM settings WHERE key = ANY($1)`, [SETTINGS_KEYS]);
  return rows;
}

async function getSettings() {
  return toSettings(await getSettingsRows());
}

// patch: một phần Settings (camelCase) → map về key/value và lưu.
// pinnedHeroSlug khác null → kiểm tra với phimapi trước khi lưu (US-60 Sc2: slug sai → 404 MOVIE_NOT_FOUND).
async function updateSettings(patch) {
  const updates = {};

  if (patch.maintenanceMode !== undefined) updates.maintenance_mode = patch.maintenanceMode === true;
  if (patch.maintenanceMessage !== undefined) updates.maintenance_message = String(patch.maintenanceMessage);

  if (patch.pinnedHeroSlug !== undefined) {
    const slug = patch.pinnedHeroSlug === null ? null : String(patch.pinnedHeroSlug).trim() || null;
    if (slug) await phimapiService.fetchMovieDetail(slug); // slug sai → ném 404 trước khi lưu
    updates.pinned_hero_slug = slug;
  }

  if (patch.movieApiBaseUrl !== undefined) {
    const url = patch.movieApiBaseUrl === null ? null : String(patch.movieApiBaseUrl).trim() || null;
    if (url && !MOVIE_API_PATTERN.test(url)) {
      throw new AppError(400, "VALIDATION_ERROR", "Nguồn phim dự phòng phải là URL https", {
        movieApiBaseUrl: "URL phải bắt đầu bằng https:// và không có đường dẫn",
      });
    }
    updates.movie_api_base_url = url;
  }

  for (const [key, value] of Object.entries(updates)) {
    await db.query(
      `INSERT INTO settings (key, value) VALUES ($1, $2::jsonb)
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
      [key, JSON.stringify(value)],
    );
  }

  return getSettings();
}

module.exports = { getSettings, updateSettings };
