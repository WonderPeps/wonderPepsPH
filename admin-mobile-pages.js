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
    "menuSection", "infoMediaSection", "shopSettingsSection", "securitySection", "discountManagementSection",
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
    { title: "Discount Management", description: "Create and manage product discounts", icon: "%", target: "discountManagementSection" },
    { title: "COA & Protocol media", description: "Upload and manage page images or videos", icon: "▧", target: "infoMediaSection" },
    { title: "Change Password", description: "Admin account security", icon: "♡", target: "securitySection" },
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

  // Product Edit buttons are rendered by admin.js and keep their original
  // click handlers. After that handler fills the editor, reveal its mobile page.
  const mobileProductsContainer = document.getElementById("productsTableContainer");
  mobileProductsContainer?.addEventListener("click", (event) => {
    const editButton = event.target.closest("[data-edit]");
    if (!mobileQuery.matches || !editButton || !mobileProductsContainer.contains(editButton)) return;
    showSection("addProductSection", "products");
  });

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
    "infoMediaSection", "securitySection", "addMenuSection", "discountManagementSection"].forEach((id) => {
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


/* Mobile-only order accordion and product card renderer.
   Moves existing action buttons so their original admin.js listeners remain attached. */
(() => {
  "use strict";
  const mobile = window.matchMedia("(max-width: 760px)");
  const ordersList = document.getElementById("ordersList");
  const productsContainer = document.getElementById("productsTableContainer");

  function enhanceOrderCards() {
    if (!mobile.matches || !ordersList) return;
    ordersList.querySelectorAll(".order-card").forEach((card) => {
      const header = card.querySelector(".order-card-header");
      if (!header) return;
      header.setAttribute("role", "button");
      header.setAttribute("tabindex", "0");
      header.setAttribute("aria-label", "Expand order details");
      header.setAttribute("aria-expanded", card.classList.contains("mobile-order-expanded") ? "true" : "false");
      if (!header.querySelector(".mobile-order-peek")) {
        const customer = card.querySelector(".order-customer-row strong")?.textContent?.trim() || "Customer details";
        const status = card.querySelector(".order-status-badge")?.textContent?.trim() || "Order";
        const peek = document.createElement("div");
        peek.className = "mobile-order-peek";
        const name = document.createElement("strong");
        name.textContent = customer;
        const state = document.createElement("span");
        state.textContent = status;
        peek.append(name, state);
        header.appendChild(peek);
      }
    });
  }

  if (ordersList) {
    ordersList.addEventListener("click", (event) => {
      const header = event.target.closest(".order-card-header");
      if (!mobile.matches || !header || !ordersList.contains(header)) return;
      const card = header.closest(".order-card");
      if (!card) return;
      card.classList.toggle("mobile-order-expanded");
      header.setAttribute("aria-expanded", card.classList.contains("mobile-order-expanded") ? "true" : "false");
    });
    ordersList.addEventListener("keydown", (event) => {
      const header = event.target.closest(".order-card-header");
      if (!mobile.matches || !header || !["Enter", " "].includes(event.key)) return;
      event.preventDefault();
      header.click();
    });
    new MutationObserver(enhanceOrderCards).observe(ordersList, { childList: true, subtree: true });
    enhanceOrderCards();
  }

  function buildMobileProductCards() {
    if (!mobile.matches || !productsContainer) return;
    const table = productsContainer.querySelector("table.data-table");
    if (!table || table.dataset.mobileCardsBuilt === "true") return;
    const rows = Array.from(table.querySelectorAll("tbody tr"));
    if (!rows.length) return;

    productsContainer.querySelector(".mobile-product-list")?.remove();
    const list = document.createElement("div");
    list.className = "mobile-product-list";
    list.setAttribute("aria-label", "Products");

    rows.forEach((row) => {
      const cells = Array.from(row.cells);
      if (cells.length < 11) return;
      const card = document.createElement("article");
      card.className = "mobile-product-card";

      const imageWrap = document.createElement("div");
      imageWrap.className = "mobile-product-image";
      const image = cells[0].querySelector("img");
      if (image) {
        imageWrap.appendChild(image);
      } else {
        imageWrap.textContent = "No image";
      }

      const info = document.createElement("div");
      info.className = "mobile-product-info";
      const name = document.createElement("strong");
      name.className = "mobile-product-name";
      name.textContent = cells[1].textContent.trim() || "Untitled product";
      const description = document.createElement("span");
      description.className = "mobile-product-description";
      description.textContent = cells[2].textContent.trim();
      info.append(name);
      if (description.textContent && description.textContent !== "—") info.append(description);

      const meta = document.createElement("div");
      meta.className = "mobile-product-meta";
      [
        ["Category", cells[3].textContent],
        ["Price", cells[5].textContent],
        ["Stock", cells[7].textContent],
        ["Status", cells[8].textContent],
        ["Sales", cells[9].textContent]
      ].forEach(([label, value]) => {
        const span = document.createElement("span");
        const bold = document.createElement("b");
        bold.textContent = `${label}: `;
        span.append(bold, document.createTextNode(value.trim() || "—"));
        meta.appendChild(span);
      });
      info.appendChild(meta);

      const actions = document.createElement("div");
      actions.className = "mobile-product-actions";
      const actionContainer = cells[10].querySelector(".admin-actions");
      if (actionContainer) {
        Array.from(actionContainer.querySelectorAll("button")).forEach((button) => actions.appendChild(button));
      }

      card.append(imageWrap, info);
      if (actions.childElementCount) card.appendChild(actions);
      list.appendChild(card);
    });

    if (list.childElementCount) {
      productsContainer.insertBefore(list, productsContainer.firstChild);
      table.dataset.mobileCardsBuilt = "true";
    }
  }

  if (productsContainer) {
    new MutationObserver(buildMobileProductCards).observe(productsContainer, { childList: true, subtree: true });
    buildMobileProductCards();
  }

  function refreshMobileViews() {
    if (mobile.matches) {
      enhanceOrderCards();
      buildMobileProductCards();
    } else {
      ordersList?.querySelectorAll(".order-card").forEach((card) => {
        card.classList.remove("mobile-order-expanded");
        card.querySelector(".order-card-header")?.removeAttribute("aria-expanded");
      });
      productsContainer?.querySelector(".mobile-product-list")?.remove();
      productsContainer?.querySelector("table.data-table")?.removeAttribute("data-mobile-cards-built");
    }
  }
  if (mobile.addEventListener) mobile.addEventListener("change", refreshMobileViews);
  else mobile.addListener(refreshMobileViews);
})();



/* Mobile media picker preview for COA & Protocol uploads.
   This is a local preview only; the existing upload form still owns saving. */
(() => {
  "use strict";
  const mediaForm = document.getElementById("infoMediaUploadForm");
  const fileInput = mediaForm?.querySelector('input[type="file"][name="media_file"]');
  if (!mediaForm || !fileInput || mediaForm.querySelector(".mobile-media-file-preview")) return;

  const preview = document.createElement("div");
  preview.className = "mobile-media-file-preview";
  preview.setAttribute("aria-live", "polite");
  preview.hidden = true;
  fileInput.insertAdjacentElement("afterend", preview);

  let activeUrl = "";
  fileInput.addEventListener("change", () => {
    if (activeUrl) URL.revokeObjectURL(activeUrl);
    activeUrl = "";
    preview.replaceChildren();
    const file = fileInput.files?.[0];
    if (!file) {
      preview.hidden = true;
      return;
    }
    const name = document.createElement("strong");
    name.textContent = file.name;
    const size = document.createElement("span");
    size.textContent = `${(file.size / (1024 * 1024)).toFixed(2)} MB`;
    preview.append(name, size);
    if (file.type.startsWith("image/")) {
      activeUrl = URL.createObjectURL(file);
      const image = document.createElement("img");
      image.src = activeUrl;
      image.alt = "Selected media preview";
      preview.prepend(image);
    } else if (file.type.startsWith("video/")) {
      activeUrl = URL.createObjectURL(file);
      const video = document.createElement("video");
      video.src = activeUrl;
      video.controls = true;
      video.muted = true;
      preview.prepend(video);
    }
    preview.hidden = false;
  });
  window.addEventListener("pagehide", () => {
    if (activeUrl) URL.revokeObjectURL(activeUrl);
  }, { once: true });
})();
