// Lỗi có chủ đích: error-handler trả về { error: { code, message } } với đúng status.
// code / message theo bảng lỗi trong docs/specs/backend_api_contract.md §1; message tiếng Việt, hiển thị được cho người dùng.
class AppError extends Error {
  constructor(status, code, message, fields) {
    super(message);
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

module.exports = { AppError };
