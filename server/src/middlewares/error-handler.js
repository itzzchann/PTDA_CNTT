// Mọi lỗi → { error: { code, message } }. Không trả stack trace hay câu SQL ra ngoài.
const { AppError } = require("../errors");

// eslint-disable-next-line no-unused-vars -- Express nhận diện error handler qua đủ 4 tham số
module.exports = (err, req, res, next) => {
  if (err instanceof AppError) {
    const body = { code: err.code, message: err.message };
    if (err.fields) body.fields = err.fields;
    return res.status(err.status).json({ error: body });
  }

  // Body không phải JSON hợp lệ (express.json() ném lỗi này).
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Dữ liệu gửi lên không đúng định dạng JSON" } });
  }

  console.error(err);
  res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Lỗi máy chủ, vui lòng thử lại sau" } });
};
