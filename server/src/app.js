// Tạo Express app: bảo mật, CORS, JSON, routes, xử lý lỗi. server.js chỉ việc listen.
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const config = require("./config");
const { AppError } = require("./errors");
const errorHandler = require("./middlewares/error-handler");

const app = express();

app.disable("x-powered-by");
app.use(helmet());
app.use(
  cors({
    // Chỉ origin của RoPhim (CORS_ORIGINS). Không có Origin (curl, server khác, cùng origin qua proxy) → cho qua.
    origin: (origin, callback) => callback(null, !origin || config.CORS_ORIGINS.includes(origin)),
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Authorization", "Content-Type"],
  }),
);
app.use(express.json({ limit: "100kb" }));

// Host (Render) gọi để kiểm tra sống/chết — hợp đồng §4: không bọc trong { data }.
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Mỗi file route do MỘT người sở hữu (docs/guides/07_lo_trinh_va_backlog.md §3.1).
// Đã đăng ký sẵn hết → không ai cần sửa app.js khi thêm endpoint.
app.use("/api", require("./routes/auth.routes")); //       Lead  — /auth/*
app.use("/api", require("./routes/settings.routes")); //   Lead  — /settings
app.use("/api", require("./routes/me.routes")); //         DEV-2 — /me/*
app.use("/api", require("./routes/movies.routes")); //     DEV-1 — /movies/:slug/comments|ratings|views
app.use("/api", require("./routes/comments.routes")); //   DEV-1 — /comments/:id
app.use("/api", require("./routes/admin.routes")); //      chia khối Lead / DEV-1 / DEV-2

app.use("/api", (req, res, next) => {
  next(new AppError(404, "NOT_FOUND", "Không tìm thấy đường dẫn API này"));
});

app.use(errorHandler);

module.exports = app;
