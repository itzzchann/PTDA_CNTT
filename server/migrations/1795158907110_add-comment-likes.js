// Migration: thêm bảng comment_likes để thả tim bình luận (US-55 mở rộng).
// Mỗi user chỉ like 1 lần; like lại = bỏ like (toggle).
"use strict";

exports.up = (pgm) => {
  pgm.createTable("comment_likes", {
    comment_id: {
      type: "uuid",
      notNull: true,
      references: "comments",
      onDelete: "CASCADE",
    },
    user_id: {
      type: "uuid",
      notNull: true,
      references: "users",
      onDelete: "CASCADE",
    },
    created_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("now()"),
    },
  });

  pgm.addConstraint("comment_likes", "comment_likes_pkey", "PRIMARY KEY (comment_id, user_id)");
  pgm.createIndex("comment_likes", ["comment_id"]);
};

exports.down = (pgm) => {
  pgm.dropTable("comment_likes");
};
