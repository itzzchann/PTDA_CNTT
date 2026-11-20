async function loadComponent(elementId, componentPath) {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      return;
    }

    const response = await fetch(componentPath);
    if (!response.ok) {
      throw new Error(`Failed to load ${componentPath}: ${response.status}`);
    }
    const html = await response.text();
    element.outerHTML = html;
  } catch (error) {
    console.error("Error loading component:", error);
  }
}

async function loadAllComponents() {
  await Promise.all([
    loadComponent("header-placeholder", "./components/header.html"),
    loadComponent("footer-placeholder", "./components/footer.html"),
  ]);

  if (typeof initializeApp === "function") {
    initializeApp();
  } else {
    console.error("initializeApp is not defined — thiếu js/main.js?");
  }

  // Trang cần thao tác với header/footer thì nghe sự kiện này thay vì setTimeout.
  document.dispatchEvent(new CustomEvent("components:loaded"));
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", loadAllComponents);
} else {
  loadAllComponents();
}
