/* WonderPepsPH mobile admin page navigation.
   Presentation-only: reuses the existing admin sections and their handlers. */
(() => {
  "use strict";

  const mobileQuery = window.matchMedia("(max-width: 760px)");
  const adminContent = document.getElementById("adminContent");
  const mainContent = document.querySelector(".admin-main-content");
  const header = document.querySelector(".admin-site-header");
  if (!adminContent || !mainContent || !header) return;

  const sectionIds = [
    "dashboardSection", "ordersSection", "productsSection", "categoriesSection",
    "menuSection", "infoMediaSection", "shopSettingsSection", "securitySection",
    "shippingFeesSection", "paymentMethodsSection", "addProductSection", "addMenuSection"
  ];
  const sections = sectionIds
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  let activeTab = "dashboard";

  const menuItems = [
    { title: "Storefront Menu", description: "Add or remove navigation links", icon: "☰", target: "menuSection" },
    { title: "Payment Methods", description: "Manage payment names and QR images", icon: "₱", target: "paymentMethodsSection" },
    { title: "Courier Settings", description: "Couriers and shipping fees", icon: "♢", target: "shippingFeesSection" },
    { title: "Shop Settings", description: "Store information and appearance", icon: "⚙", target: "shopSettingsSection" },
    { title: "COA & Protocol media", description: "Upload and manage page images or videos", icon: "▧", target: "infoMediaSection" },
    { title: "Change Password", description: "Admin account security", icon: "♡", target: "securitySection" },
    { title: "Add product", description: "Add a new item to your catalog", icon: "＋", target: "addProductSection" },
    { title: "Add menu item", description: "Create a new storefront link", icon: "＋", target: "addMenuSection" },
    { title: "Sales tracker", description: "View sales and business performance", icon: "₱", href: "sales.html" }
  ];

  const menuPage = document.createElement("section");
  menuPage.className = "mobile-admin-menu-page";
  menuPage.id = "mobileAdminMenuPage";
  menuPage.setAttribute("aria-label", "Admin menu");
  menuPage.innerHTML = `
    <div class="mobile-admin-menu-heading">
      <h1>Menu ♡</h1>
      <p>Everything for your little shop, in one place</p>
    </div>
    <div class="mobile-admin-menu-list">
      ${menuItems.map((item) => `
        <button class="mobile-admin-menu-card" type="button" data-mobile-menu-target="${item.target || ""}" ${item.href ? `data-mobile-menu-href="${item.href}"` : ""}>
          <span class="mobile-admin-menu-icon" aria-hidden="true">${item.icon}</span>
          <span class="mobile-admin-menu-copy">
            <strong>${item.title}</strong>
            <small>${item.description}</small>
          </span>
          <span class="mobile-admin-menu-arrow" aria-hidden="true">›</span>
        </button>
      `).join("")}
    </div>`;
  const adminTop = mainContent.querySelector(".admin-top");
  mainContent.insertBefore(menuPage, adminTop || mainContent.firstChild);

  const menuTrigger = document.createElement("button");
  menuTrigger.type = "button";
  menuTrigger.className = "mobile-admin-menu-trigger";
  menuTrigger.setAttribute("aria-label", "Open admin menu");
  menuTrigger.setAttribute("aria-controls", "mobileAdminMenuPage");
  menuTrigger.textContent = "☰";
  const viewShop = header.querySelector(".view-shop-button");
  header.insertBefore(menuTrigger, viewShop || null);

  const bottomNav = document.createElement("nav");
  bottomNav.className = "mobile-admin-bottom-nav";
  bottomNav.setAttribute("aria-label", "Admin navigation");
  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: "⌂" },
    { id: "orders", label: "Orders", icon: "▣" },
    { id: "products", label: "Products", icon: "◇" },
    { id: "categories", label: "Categories", icon: "♧" },
    { id: "menu", label: "Menu", icon: "☰" }
  ];
  bottomNav.innerHTML = tabs.map((tab) => `
    <button class="mobile-admin-tab" type="button" data-mobile-tab="${tab.id}">
      <span class="mobile-admin-tab-icon" aria-hidden="true">${tab.icon}</span>
      <span class="mobile-admin-tab-label">${tab.label}</span>
    </button>
  `).join("");
  adminContent.appendChild(bottomNav);

  function setTabState(tab) {
    activeTab = tab;
    bottomNav.querySelectorAll("[data-mobile-tab]").forEach((button) => {
      if (button.dataset.mobileTab === tab) {
        button.setAttribute("aria-current", "page");
      } else {
        button.removeAttribute("aria-current");
      }
    });
  }

  function hideAllMobilePages() {
    sections.forEach((section) => section.classList.remove("mobile-admin-page-active"));
    menuPage.classList.remove("mobile-admin-page-active");
  }

  function showMenu() {
    if (!mobileQuery.matches) return;
    hideAllMobilePages();
    menuPage.classList.add("mobile-admin-page-active");
    setTabState("menu");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function showSection(id, tab) {
    if (!mobileQuery.matches) return;
    const section = document.getElementById(id);
    if (!section) return;
    hideAllMobilePages();
    section.classList.add("mobile-admin-page-active");
    if (tab) setTabState(tab);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function showTab(tab) {
    if (!mobileQuery.matches) return;
    if (tab === "menu") return showMenu();
    const map = {
      dashboard: ["dashboardSection"],
      orders: ["ordersSection"],
      products: ["productsSection"],
      categories: ["categoriesSection"]
    };
    const ids = map[tab];
    if (!ids) return;
    hideAllMobilePages();
    ids.forEach((id) => document.getElementById(id)?.classList.add("mobile-admin-page-active"));
    setTabState(tab);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function addBackButton(section, backTab = "menu") {
    if (section.querySelector(".mobile-admin-back")) return;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "mobile-admin-back";
    button.innerHTML = `<span aria-hidden="true">←</span> Back to ${backTab === "products" ? "Products" : "Menu"}`;
    button.addEventListener("click", () => backTab === "products" ? showTab("products") : showMenu());
    section.insertBefore(button, section.firstChild);
  }

  ["menuSection", "paymentMethodsSection", "shippingFeesSection", "shopSettingsSection",
    "infoMediaSection", "securitySection", "addMenuSection"].forEach((id) => {
    const section = document.getElementById(id);
    if (section) addBackButton(section, "menu");
  });
  const addProductSection = document.getElementById("addProductSection");
  if (addProductSection) addBackButton(addProductSection, "products");

  const productsSection = document.getElementById("productsSection");
  const productsHeader = productsSection?.querySelector(".admin-section-header");
  if (productsHeader && !productsSection.querySelector("[data-mobile-add-product]")) {
    const addButton = document.createElement("button");
    addButton.type = "button";
    addButton.className = "mobile-admin-page-action";
    addButton.dataset.mobileAddProduct = "true";
    addButton.textContent = "＋ Add product";
    productsHeader.insertAdjacentElement("afterend", addButton);
    addButton.addEventListener("click", () => showSection("addProductSection", "products"));
  }

  menuTrigger.addEventListener("click", showMenu);
  bottomNav.addEventListener("click", (event) => {
    const button = event.target.closest("[data-mobile-tab]");
    if (button) showTab(button.dataset.mobileTab);
  });

  menuPage.addEventListener("click", (event) => {
    const button = event.target.closest("[data-mobile-menu-target]");
    if (!button) return;
    const href = button.dataset.mobileMenuHref;
    if (href) {
      window.location.href = href;
      return;
    }
    const target = button.dataset.mobileMenuTarget;
    showSection(target, target === "addProductSection" ? "products" : "menu");
  });

  // Keep existing sidebar anchor navigation useful if the sidebar is shown
  // by a future mobile layout or an accessibility tool.
  document.querySelectorAll(".admin-sidebar-nav a[href^='#']").forEach((link) => {
    link.addEventListener("click", () => {
      if (!mobileQuery.matches) return;
      const id = link.getAttribute("href").slice(1);
      const tab = id === "dashboardSection" ? "dashboard"
        : id === "ordersSection" ? "orders"
        : id === "productsSection" || id === "addProductSection" ? "products"
        : id === "categoriesSection" ? "categories" : "menu";
      showSection(id, tab);
    });
  });

  function applyResponsiveMode() {
    if (mobileQuery.matches) {
      showTab(activeTab);
    } else {
      hideAllMobilePages();
      sections.forEach((section) => section.classList.remove("mobile-admin-page-active"));
      menuPage.classList.remove("mobile-admin-page-active");
      sections.forEach((section) => section.classList.remove("mobile-admin-hidden"));
    }
  }

  if (typeof mobileQuery.addEventListener === "function") {
    mobileQuery.addEventListener("change", applyResponsiveMode);
  } else {
    mobileQuery.addListener(applyResponsiveMode);
  }

  // Start on Dashboard once the admin UI is available.
  applyResponsiveMode();
})();
