// validate({ body, query, params }) — mỗi phần là một schema zod.
// Sai → 400 VALIDATION_ERROR kèm fields: { tenField: "thông báo" }. Đúng → thay req.body/... bằng dữ liệu đã chuẩn hóa (trim, default).
const { z } = require("zod");
const { AppError } = require("../errors");

// Thông báo mặc định của zod bằng tiếng Việt (hợp đồng §1: message hiển thị được cho người dùng).
// Field quan trọng vẫn nên tự viết message rõ hơn: z.string().min(1, "Nội dung không được để trống").
z.config(z.locales.vi());

module.exports = (schemas) => (req, res, next) => {
  for (const part of ["params", "query", "body"]) {
    if (!schemas[part]) continue;

    const result = schemas[part].safeParse(req[part] ?? {});
    if (!result.success) {
      const fields = {};
      for (const issue of result.error.issues) {
        const key = issue.path.join(".") || part;
        if (!fields[key]) fields[key] = issue.message;
      }
      return next(new AppError(400, "VALIDATION_ERROR", "Dữ liệu không hợp lệ", fields));
    }

    // Express 4: req.query là getter → gán lại bằng defineProperty để giữ dữ liệu đã chuẩn hóa.
    Object.defineProperty(req, part, { value: result.data, writable: true, configurable: true });
  }
  next();
};
