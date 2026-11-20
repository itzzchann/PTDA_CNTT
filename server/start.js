// Script dùng làm start command trên Render: chạy migration rồi mới khởi động server.
// Đảm bảo bảng comment_likes (và mọi migration mới) luôn được áp dụng khi deploy.
// node-pg-migrate tự bỏ qua migration đã chạy (tracking bằng bảng pgmigrations).

const { execSync } = require("child_process");

console.log("[start] Chạy migration CSDL...");
try {
  execSync("node-pg-migrate -m migrations up", {
    stdio: "inherit",
    cwd: __dirname,
    env: { ...process.env },
  });
  console.log("[start] Migration xong.");
} catch (err) {
  console.error("[start] Migration thất bại:", err.message);
  process.exit(1);
}

console.log("[start] Khởi động server...");
require("./src/server");
