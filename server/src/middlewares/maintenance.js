// Bảo trì (US-62): khi maintenance_mode bật — request GHI của non-admin → 503 MAINTENANCE.
// Đọc (GET) vẫn qua để trang không chết hoàn toàn; admin không bị chặn để còn tắt bảo trì.
const settingsService = require("../services/settings.service");
const { AppError } = require("../errors");
const { resolveUser } = require("./auth");

const WRITE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

// Bộ nhớ đệm 30 giây để không query settings ở từng request; PATCH /admin/settings xóa đệm.
let cachedUntil = 0;
let cachedMode = false;
settingsService.getSettings().then((s) => {
  cachedMode = s.maintenanceMode;
  cachedUntil = Date.now() + 30_000;
}).catch(() => {}); // DB chưa sẵn sàng khi boot → request đầu tiên sẽ thử lại

function invalidateMaintenanceCache() {
  cachedUntil = 0;
}

async function maintenance(req, res, next) {
  try {
    if (!WRITE_METHODS.has(req.method)) return next();
    // Chạy trước requireAuth (nên req.user chưa có) — tự resolve để biết admin đi ngang qua.
    // Token hỏng: coi như khách (401 sẽ do route requireAuth trả, không phải việc của middleware này).
    const user = await resolveUser(req).catch(() => null);
    if (user?.role === "admin" || user?.role === "super_admin") return next();
    if (Date.now() >= cachedUntil) {
      const settings = await settingsService.getSettings();
      cachedMode = settings.maintenanceMode;
      cachedUntil = Date.now() + 30_000;
    }
    if (cachedMode) {
      throw new AppError(503, "MAINTENANCE", "Hệ thống đang bảo trì, vui lòng quay lại sau");
    }
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { maintenance, invalidateMaintenanceCache };
