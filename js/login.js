(() => {
  document.addEventListener("DOMContentLoaded", initLoginPage);

  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const USERNAME_PATTERN = /^[a-zA-Z0-9_]+$/;
  const NOT_CONFIGURED_MESSAGE = "Hệ thống tài khoản đang được hoàn thiện, vui lòng quay lại sau";

  function initLoginPage() {
    if (isLoggedIn()) {
      window.location.href = buildNextUrl();
      return;
    }

    setupTabs();
    setupPasswordToggles();
    setupLoginForm();
    setupRegisterForm();
    setupGoogleLogin();
  }

  function buildNextUrl() {
    const next = new URLSearchParams(window.location.search).get("next");
    return next && next.startsWith("/") && !next.startsWith("//") ? next : "index.html";
  }

  function $(id) {
    return document.getElementById(id);
  }

  function showAlert(message) {
    const alert = $("authAlert");
    if (!alert) return;
    alert.textContent = message;
    alert.hidden = false;
  }

  function hideAlert() {
    const alert = $("authAlert");
    if (alert) alert.hidden = true;
  }

  function setFieldError(inputId, errorId, message) {
    const input = $(inputId);
    const error = $(errorId);
    if (error) error.textContent = message;
    if (input) input.setAttribute("aria-invalid", message ? "true" : "false");
  }

  function setupTabs() {
    const loginTab = $("tabLogin");
    const registerTab = $("tabRegister");
    const loginForm = $("loginForm");
    const registerForm = $("registerForm");

    loginTab?.addEventListener("click", () => switchTab("login"));
    registerTab?.addEventListener("click", () => switchTab("register"));

    function switchTab(which) {
      const isLogin = which === "login";
      loginTab?.classList.toggle("active", isLogin);
      registerTab?.classList.toggle("active", !isLogin);
      loginTab?.setAttribute("aria-selected", String(isLogin));
      registerTab?.setAttribute("aria-selected", String(!isLogin));
      if (loginForm) loginForm.hidden = !isLogin;
      if (registerForm) registerForm.hidden = isLogin;
      hideAlert();
    }
  }

  function setupPasswordToggles() {
    document.querySelectorAll(".btn-toggle-password").forEach((btn) => {
      btn.addEventListener("click", () => {
        const input = $(btn.dataset.target);
        if (!input) return;
        const show = input.type === "password";
        input.type = show ? "text" : "password";
        const icon = btn.querySelector("i");
        if (icon) icon.className = show ? "fa-regular fa-eye-slash" : "fa-regular fa-eye";
        btn.setAttribute("aria-label", show ? "Ẩn mật khẩu" : "Hiện mật khẩu");
      });
    });
  }

  // Khóa nút submit khi đang gửi để tránh gửi trùng (rate limit ở backend).
  function setSubmitBusy(button, busy, busyText) {
    if (!button) return;
    button.disabled = busy;
    button.setAttribute("aria-busy", String(busy));
    const label = button.querySelector("span");
    if (label) {
      if (busy) {
        label.dataset.original = label.textContent;
        label.textContent = busyText;
      } else if (label.dataset.original) {
        label.textContent = label.dataset.original;
      }
    }
  }

  function setupLoginForm() {
    const form = $("loginForm");
    const button = $("loginSubmitBtn");
    form?.addEventListener("submit", async (event) => {
      event.preventDefault();
      hideAlert();

      const login = $("loginIdentifier")?.value.trim() || "";
      const password = $("loginPassword")?.value || "";

      let valid = true;
      if (!login) {
        setFieldError("loginIdentifier", "loginIdentifierError", "Nhập tên đăng nhập hoặc email");
        valid = false;
      } else {
        setFieldError("loginIdentifier", "loginIdentifierError", "");
      }
      if (!password) {
        setFieldError("loginPassword", "loginPasswordError", "Nhập mật khẩu");
        valid = false;
      } else {
        setFieldError("loginPassword", "loginPasswordError", "");
      }
      if (!valid) return;

      setSubmitBusy(button, true, "Đang đăng nhập...");
      await submitAuth(BACKEND_CONFIG.ENDPOINTS.LOGIN, { login, password });
      setSubmitBusy(button, false);
    });
  }

  function setupRegisterForm() {
    const form = $("registerForm");
    const button = $("registerSubmitBtn");
    form?.addEventListener("submit", async (event) => {
      event.preventDefault();
      hideAlert();

      const username = $("registerUsername")?.value.trim() || "";
      const email = $("registerEmail")?.value.trim() || "";
      const password = $("registerPassword")?.value || "";
      const confirmPassword = $("registerConfirmPassword")?.value || "";

      let valid = true;
      if (username.length < 3 || username.length > 30) {
        setFieldError("registerUsername", "registerUsernameError", "Tên đăng nhập cần 3–30 ký tự");
        valid = false;
      } else if (!USERNAME_PATTERN.test(username)) {
        setFieldError("registerUsername", "registerUsernameError", "Tên đăng nhập chỉ gồm chữ không dấu, số và dấu _");
        valid = false;
      } else {
        setFieldError("registerUsername", "registerUsernameError", "");
      }

      if (!EMAIL_PATTERN.test(email)) {
        setFieldError("registerEmail", "registerEmailError", "Email không hợp lệ");
        valid = false;
      } else {
        setFieldError("registerEmail", "registerEmailError", "");
      }

      if (password.length < 8) {
        setFieldError("registerPassword", "registerPasswordError", "Mật khẩu cần ít nhất 8 ký tự");
        valid = false;
      } else if (password.length > 72) {
        setFieldError("registerPassword", "registerPasswordError", "Mật khẩu tối đa 72 ký tự");
        valid = false;
      } else {
        setFieldError("registerPassword", "registerPasswordError", "");
      }

      if (confirmPassword && password !== confirmPassword) {
        setFieldError("registerConfirmPassword", "registerConfirmPasswordError", "Nhập lại chưa khớp mật khẩu");
        valid = false;
      } else {
        setFieldError("registerConfirmPassword", "registerConfirmPasswordError", "");
      }

      if (!valid) return;

      setSubmitBusy(button, true, "Đang tạo tài khoản...");
      await submitAuth(BACKEND_CONFIG.ENDPOINTS.REGISTER, { username, email, password });
      setSubmitBusy(button, false);
    });
  }

  function setupGoogleLogin() {
    // Script accounts.google.com tải async/defer → chờ window "load" mới chắc có window.google.
    window.addEventListener("load", () => {
      const box = $("googleButton");
      if (!box) return;
      if (!BACKEND_CONFIG.GOOGLE_CLIENT_ID || !window.google?.accounts?.id) {
        box.hidden = true;
        return;
      }
      google.accounts.id.initialize({
        client_id: BACKEND_CONFIG.GOOGLE_CLIENT_ID,
        callback: (response) =>
          submitAuth(BACKEND_CONFIG.ENDPOINTS.GOOGLE_LOGIN, { credential: response.credential }),
      });
      google.accounts.id.renderButton(box, {
        theme: "filled_black",
        size: "large",
        text: "continue_with",
        locale: "vi",
      });
    });
  }

  // Một hàm dùng chung cho đăng nhập / đăng ký / Google — xử lý đủ các trường hợp ở hợp đồng §1
  // và bảng ở doc 08 (D4).
  async function submitAuth(endpoint, body) {
    const res = await fetchBackend(endpoint, { method: "POST", body });

    if (res.error === "BACKEND_NOT_CONFIGURED") {
      showAlert(NOT_CONFIGURED_MESSAGE);
      return;
    }

    if (!res.success) {
      const code = res.data?.error?.code;
      if (res.status === 400 && res.data?.error?.fields) {
        handleFieldErrors(res.data.error.fields);
        return;
      }
      if (code === "INVALID_CREDENTIALS" || res.status === 401) {
        showAlert("Tên đăng nhập hoặc mật khẩu không chính xác");
        return;
      }
      if (res.status === 409) {
        showAlert("Tên đăng nhập hoặc email đã được dùng");
        return;
      }
      if (res.status === 429) {
        showAlert("Bạn gửi quá nhiều lần, vui lòng thử lại sau");
        return;
      }
      // 403 ACCOUNT_BANNED, 401 GOOGLE_*, 503 GOOGLE_LOGIN_DISABLED...: message tiếng Việt từ backend.
      showAlert(res.error || "Có lỗi xảy ra, vui lòng thử lại");
      return;
    }

    const session = res.data?.data;
    if (!session?.token || !session?.user) {
      showAlert("Có lỗi xảy ra, vui lòng thử lại");
      return;
    }

    saveAuthSession(session);
    showToast(`Xin chào ${session.user.username}`, "success");
    window.location.href = buildNextUrl();
  }

  // Backend xác thực lại (validate.js) — hiện lỗi vào đúng ô nhập thay vì chỉ hiện alert.
  function handleFieldErrors(fields) {
    const mapping = {
      username: ["registerUsername", "registerUsernameError"],
      email: ["registerEmail", "registerEmailError"],
      password: ["registerPassword", "registerPasswordError", "loginPassword", "loginPasswordError"],
      login: ["loginIdentifier", "loginIdentifierError"],
    };
    let mapped = false;
    for (const [field, message] of Object.entries(fields)) {
      const targets = mapping[field === "username" ? "username" : field] || mapping[field];
      if (targets) {
        setFieldError(targets[0], targets[1], message);
        mapped = true;
      }
    }
    if (!mapped) {
      showAlert(Object.values(fields)[0] || "Dữ liệu không hợp lệ");
    }
  }
})();
