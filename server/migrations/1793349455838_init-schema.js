// 7 bảng của V2 — docs/specs/backend_api_contract.md §5.
// Đã chạy trên CSDL chung thì KHÔNG sửa file này nữa: thay đổi bảng = tạo migration mới (npm run migrate create <ten>).

exports.up = (pgm) => {
  pgm.createTable("users", {
    id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
    username: { type: "varchar(30)", notNull: true },
    email: { type: "varchar(255)", notNull: true },
    password_hash: { type: "text" }, // NULL = tài khoản chỉ đăng nhập bằng Google
    google_id: { type: "text", unique: true },
    avatar_url: { type: "text" },
    role: { type: "varchar(20)", notNull: true, default: "member", check: "role IN ('member', 'admin', 'super_admin')" },
    status: { type: "varchar(20)", notNull: true, default: "active", check: "status IN ('active', 'banned')" },
    created_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
  });
  pgm.addConstraint("users", "users_has_login_method", "CHECK (password_hash IS NOT NULL OR google_id IS NOT NULL)");
  // Trùng không phân biệt hoa thường: "Admin" và "admin" là một người.
  pgm.createIndex("users", "lower(username)", { name: "users_username_lower_key", unique: true });
  pgm.createIndex("users", "lower(email)", { name: "users_email_lower_key", unique: true });

  pgm.createTable("comments", {
    id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
    user_id: { type: "uuid", notNull: true, references: "users", onDelete: "CASCADE" },
    movie_slug: { type: "varchar(255)", notNull: true },
    episode: { type: "varchar(50)" },
    content: { type: "text", notNull: true, check: "char_length(content) BETWEEN 1 AND 1000" },
    is_spoiler: { type: "boolean", notNull: true, default: false },
    deleted_at: { type: "timestamptz" }, // admin xóa = đánh dấu, không xóa hẳn (US-61)
    created_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
  });
  pgm.createIndex("comments", ["movie_slug", { name: "created_at", sort: "DESC" }]);

  pgm.createTable("ratings", {
    id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
    user_id: { type: "uuid", notNull: true, references: "users", onDelete: "CASCADE" },
    movie_slug: { type: "varchar(255)", notNull: true },
    score: { type: "smallint", notNull: true, check: "score BETWEEN 1 AND 10" },
    content: { type: "text", check: "content IS NULL OR char_length(content) <= 1000" },
    created_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
    updated_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") }, // gửi lại = sửa (US-56)
  });
  pgm.addConstraint("ratings", "ratings_user_movie_key", { unique: ["user_id", "movie_slug"] });
  pgm.createIndex("ratings", "movie_slug");

  pgm.createTable("favorites", {
    user_id: { type: "uuid", notNull: true, references: "users", onDelete: "CASCADE" },
    movie_slug: { type: "varchar(255)", notNull: true },
    name: { type: "text", notNull: true },
    poster: { type: "text", notNull: true, default: "" },
    added_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
  });
  pgm.addConstraint("favorites", "favorites_pkey", { primaryKey: ["user_id", "movie_slug"] });
  pgm.createIndex("favorites", ["user_id", { name: "added_at", sort: "DESC" }]);

  pgm.createTable("watch_history", {
    user_id: { type: "uuid", notNull: true, references: "users", onDelete: "CASCADE" },
    movie_slug: { type: "varchar(255)", notNull: true },
    name: { type: "text", notNull: true },
    poster: { type: "text", notNull: true, default: "" },
    episode: { type: "varchar(50)", notNull: true },
    progress: { type: "integer", notNull: true, default: 0, check: "progress >= 0" }, // giây đang xem (US-52)
    watched_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
  });
  pgm.addConstraint("watch_history", "watch_history_pkey", { primaryKey: ["user_id", "movie_slug"] });
  pgm.createIndex("watch_history", ["user_id", { name: "watched_at", sort: "DESC" }]);

  pgm.createTable("view_events", {
    id: { type: "bigserial", primaryKey: true },
    movie_slug: { type: "varchar(255)", notNull: true },
    episode: { type: "varchar(50)" },
    user_id: { type: "uuid", references: "users", onDelete: "SET NULL" }, // NULL = khách
    created_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
  });
  pgm.createIndex("view_events", "created_at");
  pgm.createIndex("view_events", "movie_slug");

  pgm.createTable("settings", {
    key: { type: "varchar(50)", primaryKey: true },
    value: { type: "jsonb", notNull: true },
  });
  // Giá trị mặc định của Settings (hợp đồng §2): không bảo trì, hero tự động, dùng nguồn phim mặc định.
  pgm.sql(`
    INSERT INTO settings (key, value) VALUES
      ('maintenance_mode', 'false'),
      ('maintenance_message', '""'),
      ('pinned_hero_slug', 'null'),
      ('movie_api_base_url', 'null')
  `);
};

exports.down = (pgm) => {
  pgm.dropTable("settings");
  pgm.dropTable("view_events");
  pgm.dropTable("watch_history");
  pgm.dropTable("favorites");
  pgm.dropTable("ratings");
  pgm.dropTable("comments");
  pgm.dropTable("users");
};
