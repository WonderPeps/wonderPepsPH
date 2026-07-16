const loginSection = document.querySelector("#loginSection");
const loginForm = document.querySelector("#loginForm");
const loginMessage = document.querySelector("#loginMessage");
const adminContent = document.querySelector("#adminContent");

const settingsForm = document.querySelector("#settingsForm");
const productForm = document.querySelector("#productForm");
const hasVariantsToggle = document.querySelector("#hasVariantsToggle");
const variantManager = document.querySelector("#variantManager");
const variantRows = document.querySelector("#variantRows");
const addVariantButton = document.querySelector("#addVariantButton");
const standardPricingFields = document.querySelector(
  "#standardPricingFields"
);
const PRODUCT_IMAGE_BUCKET = "product-images";

const productImageFileInput = document.getElementById("productImageFile");
const productImageUrlInput = document.getElementById("productImageUrl");
const productImagePreviewWrap = document.getElementById(
  "productImagePreviewWrap"
  );
  const productImagePreview = document.getElementById("productImagePreview");
  const removeProductImageButton = document.getElementById(
    "removeProductImageButton"
    );

    let selectedProductImageFile = null;
    let temporaryProductPreviewUrl = "";
    let selectedShopLogoFile = null;
let temporaryShopLogoPreviewUrl = "";

let selectedHeroImageFile = null;
let temporaryHeroImagePreviewUrl = "";

const heroImageFileInput = document.querySelector("#heroImageFile");
const heroImagePreview = document.querySelector("#heroImagePreview");
const replaceHeroImageButton =
  document.querySelector("#replaceHeroImageButton");
const deleteHeroImageButton =
  document.querySelector("#deleteHeroImageButton");
const shopLogoFileInput = document.querySelector("#shopLogoFile");
const shopLogoPreview = document.querySelector("#shopLogoPreview");
const replaceShopLogoButton =
  document.querySelector("#replaceShopLogoButton");
const deleteShopLogoButton =
  document.querySelector("#deleteShopLogoButton");
const adminProducts = document.querySelector("#adminProducts");
const ordersList = document.querySelector("#ordersList");
const ordersTabs = document.querySelector("#ordersTabs");
const ordersSearch = document.querySelector("#ordersSearch");
const dashboardStats = document.querySelector("#dashboardStats");
const dashboardRecentOrders = document.querySelector("#dashboardRecentOrders");
const dashboardBestSellers = document.querySelector("#dashboardBestSellers");
const productsSummary = document.querySelector("#productsSummary");
const productsTableContainer = document.querySelector("#productsTableContainer");
const productsPagination = document.querySelector("#productsPagination");
const productsCategoryFilter = document.querySelector("#productsCategoryFilter");
const productsLowStockFilter = document.querySelector("#productsLowStockFilter");
const productsSearch = document.querySelector("#productsSearch");
const categoriesList = document.querySelector("#categoriesList");
const customersList = document.querySelector("#customersList");
const orderDetailsModal = document.querySelector("#orderDetailsModal");
const orderDetailsContent = document.querySelector("#orderDetailsContent");
const formTitle = document.querySelector("#formTitle");
const cancelEdit = document.querySelector("#cancelEdit");
const resetButton = document.querySelector("#resetButton");
const menuForm = document.querySelector("#menuForm");
const menuFormTitle = document.querySelector("#menuFormTitle");
const adminMenuItems = document.querySelector("#adminMenuItems");
const cancelMenuEdit = document.querySelector("#cancelMenuEdit");
const paymentMethodsContainer = document.querySelector("#paymentMethodsContainer");
const addPaymentMethodBtn = document.querySelector("#addPaymentMethodBtn");
const paymentMethodModal = document.querySelector("#paymentMethodModal");
const paymentMethodForm = document.querySelector("#paymentMethodForm");
const paymentMethodModalTitle = document.querySelector("#paymentMethodModalTitle");
const closePaymentMethodModal = document.querySelector("#closePaymentMethodModal");
const cancelPaymentMethod = document.querySelector("#cancelPaymentMethod");
const paymentMethodQrInput = document.querySelector("#paymentQrFile");
const paymentMethodQrReplaceBtn = document.querySelector("#paymentQrReplaceBtn");
const paymentMethodQrRemoveBtn = document.querySelector("#paymentQrRemoveBtn");
const paymentMethodQrPreviewBox = document.querySelector("#paymentQrPreviewBox");
const paymentMethodQrPreviewImage = document.querySelector("#paymentQrPreviewImage");
const paymentMethodQrPreviewText = document.querySelector("#paymentQrPreviewText");
const categoryForm = document.querySelector("#categoryForm");
const cancelCategoryEdit = document.querySelector("#cancelCategoryEdit");
const sidebarLogoutButton = document.querySelector("#sidebarLogoutButton");

let menuItems = [];
let products = [];
let paymentMethods = [];
let orders = [];
let orderItemsByOrder = {};
let activeOrderFilter = "all";
let activeSettingsTab = "branding";
let categoryRegistry = [];
let categoryVisibilityState = {};
let categoryOrder = [];
let customerDetailsOrder = null;
let productPage = 1;
let productPageSize = 8;
let productFilters = { search: "", category: "all", lowStock: false };
let paymentMethodQrFile = null;
let paymentMethodQrPreviewUrl = null;
let paymentMethodCurrentQrUrl = null;
let paymentMethodRemoveQr = false;

/* -------------------------
   LOGIN AND ADMIN CHECK
------------------------- */

function setupAdminUI() {
  sidebarLogoutButton?.addEventListener("click", async () => {
    await supabaseClient.auth.signOut();
    await showLogin("You have been logged out.");
  });

  document.querySelectorAll("[data-settings-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      setActiveSettingsTab(button.dataset.settingsTab);
    });
  });

  ordersSearch?.addEventListener("input", () => {
    renderOrders(getFilteredOrders());
  });

  productsSearch?.addEventListener("input", () => {
    productFilters.search = String(productsSearch.value || "").trim().toLowerCase();
    productPage = 1;
    renderProducts();
  });

  productsCategoryFilter?.addEventListener("change", () => {
    productFilters.category = productsCategoryFilter.value || "all";
    productPage = 1;
    renderProducts();
  });

  productsLowStockFilter?.addEventListener("change", () => {
    productFilters.lowStock = Boolean(productsLowStockFilter.checked);
    productPage = 1;
    renderProducts();
  });

  orderDetailsModal?.addEventListener("click", (event) => {
    if (event.target === orderDetailsModal) {
      orderDetailsModal.close();
    }
  });
}

function setActiveSettingsTab(tab) {
  activeSettingsTab = tab;
  document.querySelectorAll("[data-settings-group]").forEach((field) => {
    field.hidden = field.dataset.settingsGroup !== tab;
  });
  document.querySelectorAll("[data-settings-tab]").forEach((button) => {
    button.classList.toggle("active", button.dataset.settingsTab === tab);
  });
}

async function showLogin(message = "") {
  loginSection.hidden = false;
  adminContent.hidden = true;
  loginMessage.textContent = message;
}

async function showAdmin() {
  loginSection.hidden = true;
  adminContent.hidden = false;

  setupAdminUI();
  setActiveSettingsTab(activeSettingsTab);

  await Promise.all([
    loadSettings(),
    loadProducts(),
    loadMenuItems(),
    loadPaymentMethods(),
    loadOrders()
  ]);
}

async function verifyAdmin() {
  const {
    data: { user },
    error: userError
  } = await supabaseClient.auth.getUser();

  if (userError || !user) {
    await showLogin();
    return;
  }

  const { data, error } = await supabaseClient.rpc("is_admin");

if (error || data !== true) {
    await supabaseClient.auth.signOut();
    await showLogin("This account does not have administrator access.");
    return;
  }

  await showAdmin();
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(loginForm);
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  loginMessage.textContent = "Logging in…";

  const { error } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    loginMessage.textContent = "Incorrect email or password.";
    return;
  }

  loginForm.reset();
  await verifyAdmin();
});

/* -------------------------
   SHOP SETTINGS
------------------------- */

function setupAdminUI() {
  document.querySelectorAll("[data-settings-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      setActiveSettingsTab(button.dataset.settingsTab);
    });
  });

  ordersSearch?.addEventListener("input", () => {
    renderOrders(getFilteredOrders());
  });

  productsSearch?.addEventListener("input", () => {
    productFilters.search = String(productsSearch.value || "").trim().toLowerCase();
    productPage = 1;
    renderProducts();
  });

  productsCategoryFilter?.addEventListener("change", () => {
    productFilters.category = productsCategoryFilter.value || "all";
    productPage = 1;
    renderProducts();
  });

  productsLowStockFilter?.addEventListener("change", () => {
    productFilters.lowStock = Boolean(productsLowStockFilter.checked);
    productPage = 1;
    renderProducts();
  });

  orderDetailsModal?.addEventListener("click", (event) => {
    if (event.target === orderDetailsModal) {
      orderDetailsModal.close();
    }
  });

  document.querySelector("#addProductBtn")?.addEventListener("click", () => {
    resetProductForm();
    productForm.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

function setActiveSettingsTab(tab) {
  activeSettingsTab = tab;
  document.querySelectorAll("[data-settings-group]").forEach((field) => {
    field.hidden = field.dataset.settingsGroup !== tab;
  });
  document.querySelectorAll("[data-settings-tab]").forEach((button) => {
    button.classList.toggle("active", button.dataset.settingsTab === tab);
  });
}

async function loadSettings() {
  const { data, error } = await supabaseClient
    .from("shop_settings")
    .select("*")
    .eq("id", 1)
    .single();

  if (error) {
    alert(`Could not load shop profile: ${error.message}`);
    return;
  }

  settingsForm.elements.shopName.value = data.shop_name || "";
  settingsForm.elements.logoUrl.value = data.logo_url || "";
  if (data.logo_url) {
  shopLogoPreview.innerHTML = `
    <img
      src="${data.logo_url}"
      alt="Shop logo"
    />
  `;

  deleteShopLogoButton.hidden = false;
} else {
  shopLogoPreview.innerHTML = `
    <span>No logo uploaded</span>
  `;

  deleteShopLogoButton.hidden = true;
}
settingsForm.elements.heroImageUrl.value =
  data.hero_image_url || "";

if (data.hero_image_url) {
  heroImagePreview.innerHTML = `
    <img
      src="${data.hero_image_url}"
      alt="Hero image"
    />
  `;

  deleteHeroImageButton.hidden = false;
} else {
  heroImagePreview.innerHTML = `
    <span>No hero image uploaded</span>
  `;

  deleteHeroImageButton.hidden = true;
}
  settingsForm.elements.heroTitle.value = data.hero_title || "";
  settingsForm.elements.heroSubtitle.value = data.hero_subtitle || "";
  settingsForm.elements.facebook.value = data.facebook_url || "";
  settingsForm.elements.tiktok.value = data.tiktok_url || "";
  settingsForm.elements.shipping90Label.value =
    data.shipping_90_label || "";
  settingsForm.elements.shipping120Label.value =
    data.shipping_120_label || "";
  settingsForm.elements.shipping150Label.value =
    data.shipping_150_label || "";
  if (settingsForm.elements.footerText) {
    settingsForm.elements.footerText.value = data.footer_text || "";
  }
}

settingsForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(settingsForm);

  const updates = {
    shop_name: String(formData.get("shopName") || "").trim(),
    logo_url: String(formData.get("logoUrl") || "").trim() || null,
    hero_image_url: String(formData.get("heroImageUrl") || "").trim() || null,
    hero_title: String(formData.get("heroTitle") || "").trim(),
    hero_subtitle: String(formData.get("heroSubtitle") || "").trim(),
    facebook_url:
      String(formData.get("facebook") || "").trim() || null,
    tiktok_url:
      String(formData.get("tiktok") || "").trim() || null,
    shipping_90_label:
      String(formData.get("shipping90Label") || "").trim(),
    shipping_120_label:
      String(formData.get("shipping120Label") || "").trim(),
    shipping_150_label:
      String(formData.get("shipping150Label") || "").trim(),
    footer_text:
      String(formData.get("footerText") || "").trim() || null,
    updated_at: new Date().toISOString()
  };
if (selectedShopLogoFile) {
  try {
    updates.logo_url = await uploadProductImage(selectedShopLogoFile);
    settingsForm.elements.logoUrl.value = updates.logo_url;
  } catch (uploadError) {
    alert(`Could not upload shop logo: ${uploadError.message}`);
    return;
  }
}
if (selectedHeroImageFile) {
  try {
    updates.hero_image_url = await uploadProductImage(selectedHeroImageFile);
    settingsForm.elements.heroImageUrl.value = updates.hero_image_url;
  } catch (uploadError) {
    alert(`Could not upload hero image: ${uploadError.message}`);
    return;
  }
}
const { error } = await supabaseClient
  .from("shop_settings")
  .update(updates)
  .eq("id", 1);

if (error) {
  alert(`Could not save shop profile: ${error.message}`);
  return;
}

selectedShopLogoFile = null;
selectedHeroImageFile = null;

alert("Shop profile saved online.");
});
  
/* ------------------------
   MENU ITEMS
------------------------ */

async function loadMenuItems() {
  const { data, error } = await supabaseClient
    .from("menu_items")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    adminMenuItems.innerHTML =
      `<p class="empty">Could not load menu items: ${escapeHtml(error.message)}</p>`;
    return;
  }

  menuItems = data || [];
  renderMenuItems();
}

function renderMenuItems() {
  if (!menuItems.length) {
    adminMenuItems.innerHTML =
      `<p class="empty">No menu items yet.</p>`;
    return;
  }

  adminMenuItems.innerHTML = menuItems
    .map(
      (item) => `
        <article class="admin-product">
          <div>
            <strong>${escapeHtml(item.label)}</strong>

            <div class="menu-url">
              ${escapeHtml(item.url)}
            </div>

            <small>
              ${escapeHtml(item.section || "SITE")}
              · ${item.is_visible ? "Visible" : "Hidden"}
              · ${item.open_new_tab ? "New tab" : "Same tab"}
            </small>
          </div>

          <div class="admin-actions">
            <button
              class="secondary-button"
              type="button"
              data-menu-edit="${item.id}"
            >
              Edit
            </button>

            <button
              class="secondary-button danger"
              type="button"
              data-menu-delete="${item.id}"
            >
              Delete
            </button>
          </div>
        </article>
      `
    )
    .join("");

  adminMenuItems
    .querySelectorAll("[data-menu-edit]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        editMenuItem(button.dataset.menuEdit);
      });
    });

  adminMenuItems
    .querySelectorAll("[data-menu-delete]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        deleteMenuItem(button.dataset.menuDelete);
      });
    });
}
menuForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(menuForm);

  const updates = {
    label: String(formData.get("label") || "").trim(),
    url: String(formData.get("url") || "").trim(),
    section: String(formData.get("section") || "SITE").trim(),
    is_visible: formData.get("isVisible") === "on",
open_new_tab: formData.get("openNewTab") === "on"
  };

  const id = formData.get("id");

  let error;

  if (id) {
    ({ error } = await supabaseClient
      .from("menu_items")
      .update(updates)
      .eq("id", id));
  } else {
    ({ error } = await supabaseClient
      .from("menu_items")
      .insert({
        ...updates,
        sort_order: menuItems.length
          ? Math.max(...menuItems.map(m => Number(m.sort_order || 0))) + 10
          : 10
      }));
  }

  if (error) {
    alert(error.message);
    return;
  }

  menuForm.reset();
  menuForm.elements.id.value = "";
  menuFormTitle.textContent = "Add menu item";
  cancelMenuEdit.hidden = true;

  await loadMenuItems();
});
function editMenuItem(id) {
  const item = menuItems.find((m) => m.id === id);
  if (!item) return;

  menuForm.elements.id.value = item.id;
  menuForm.elements.label.value = item.label || "";
  menuForm.elements.url.value = item.url || "";
  menuForm.elements.section.value = item.section || "SITE";
  menuForm.elements.isVisible.checked = item.is_visible;
  menuForm.elements.openNewTab.checked = item.open_new_tab;

  menuFormTitle.textContent = "Edit menu item";
  cancelMenuEdit.hidden = false;

  menuForm.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

cancelMenuEdit.addEventListener("click", () => {
  menuForm.reset();
  menuForm.elements.id.value = "";
  menuFormTitle.textContent = "Add menu item";
  cancelMenuEdit.hidden = true;
});

async function deleteMenuItem(id) {
  const item = menuItems.find((m) => m.id === id);

  if (!item) return;

  if (!confirm(`Delete "${item.label}"?`)) return;

  const { error } = await supabaseClient
    .from("menu_items")
    .delete()
    .eq("id", id);

  if (error) {
    alert(error.message);
    return;
  }

  await loadMenuItems();
}

/* -------------------------
   PAYMENT METHODS
------------------------- */

function revokePaymentMethodQrPreview() {
  if (paymentMethodQrPreviewUrl) {
    URL.revokeObjectURL(paymentMethodQrPreviewUrl);
    paymentMethodQrPreviewUrl = null;
  }
}

function resetPaymentMethodQrState() {
  revokePaymentMethodQrPreview();
  paymentMethodQrFile = null;
  paymentMethodCurrentQrUrl = null;
  paymentMethodRemoveQr = false;

  if (paymentMethodQrInput) {
    paymentMethodQrInput.value = "";
  }

  if (paymentMethodQrPreviewBox) {
    paymentMethodQrPreviewBox.hidden = true;
  }

  if (paymentMethodQrPreviewImage) {
    paymentMethodQrPreviewImage.removeAttribute("src");
  }

  if (paymentMethodQrPreviewText) {
    paymentMethodQrPreviewText.textContent = "";
  }
}

function renderPaymentMethodQrPreview({ currentUrl = null, removeQr = false, file = null }) {
  paymentMethodCurrentQrUrl = currentUrl || null;
  paymentMethodRemoveQr = removeQr;

  if (file) {
    paymentMethodQrFile = file;
  } else if (!removeQr) {
    paymentMethodQrFile = null;
  }

  revokePaymentMethodQrPreview();

  if (removeQr) {
    paymentMethodQrPreviewBox.hidden = false;
    paymentMethodQrPreviewImage.removeAttribute("src");
    paymentMethodQrPreviewText.textContent = "QR will be removed.";
    return;
  }

  if (file) {
    paymentMethodQrPreviewUrl = URL.createObjectURL(file);
    paymentMethodQrPreviewImage.src = paymentMethodQrPreviewUrl;
    paymentMethodQrPreviewBox.hidden = false;
    paymentMethodQrPreviewText.textContent = "Local QR preview";
    return;
  }

  if (currentUrl) {
    paymentMethodQrPreviewImage.src = currentUrl;
    paymentMethodQrPreviewBox.hidden = false;
    paymentMethodQrPreviewText.textContent = "Current QR";
    return;
  }

  paymentMethodQrPreviewBox.hidden = true;
  paymentMethodQrPreviewImage.removeAttribute("src");
  paymentMethodQrPreviewText.textContent = "";
}

function validatePaymentMethodQrFile(file) {
  if (!file) return null;

  const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
  const maxSizeBytes = 5 * 1024 * 1024;

  if (!allowedTypes.includes(file.type)) {
    return "Please choose a PNG, JPG/JPEG, or WebP image.";
  }

  if (file.size > maxSizeBytes) {
    return "Please choose an image smaller than 5 MB.";
  }

  return null;
}

function getPaymentMethodStoragePath(publicUrl) {
  if (!publicUrl) return null;

  try {
    const url = new URL(publicUrl);
    const prefix = "/storage/v1/object/public/payment-qr/";
    const path = decodeURIComponent(url.pathname.replace(prefix, "").replace(/^\/+/, ""));
    return path || null;
  } catch (error) {
    return null;
  }
}

async function uploadPaymentMethodQr(file, methodId) {
  const safeName = (file.name || "qr")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .slice(0, 80);
  const storagePath = `payment-methods/${methodId ? `${methodId}/` : ""}${Date.now()}-${Math.random().toString(36).slice(2, 10)}-${safeName}`;

  const { error } = await supabaseClient.storage
    .from("payment-qr")
    .upload(storagePath, file, {
      cacheControl: "3600",
      upsert: false
    });

  if (error) {
    throw error;
  }

  const { data: publicData } = supabaseClient.storage
    .from("payment-qr")
    .getPublicUrl(storagePath);

  return publicData?.publicUrl || null;
}

async function deletePaymentMethodQr(publicUrl) {
  const storagePath = getPaymentMethodStoragePath(publicUrl);
  if (!storagePath) return;

  const { error } = await supabaseClient.storage
    .from("payment-qr")
    .remove([storagePath]);

  if (error) {
    console.warn("Could not delete old QR image:", error.message);
  }
}

async function loadPaymentMethods() {
  const { data, error } = await supabaseClient
    .from("payment_methods")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    paymentMethodsContainer.innerHTML =
      `<p class="empty">Could not load payment methods: ${escapeHtml(error.message)}</p>`;
    return;
  }

  paymentMethods = data || [];
  renderPaymentMethods();
}

function renderPaymentMethods() {
  if (!paymentMethods.length) {
    paymentMethodsContainer.innerHTML = `
      <div class="payment-method-empty">
        <p>No payment methods loaded yet.</p>
        <p class="tiny-note">
          Payment methods will automatically load from Supabase.
        </p>
      </div>
    `;
    return;
  }

  paymentMethodsContainer.innerHTML = paymentMethods
    .map((method) => {
      const depositText = method.deposit_required
        ? `${method.deposit_percentage ?? 0}% deposit`
        : "Deposit not required";

      return `
        <article class="payment-method-card">
          <div>
            <strong>${escapeHtml(method.payment_name)}</strong>
            <p>${escapeHtml(method.short_description || "")}</p>
          </div>

          ${method.qr_url
            ? `<img class="payment-qr-preview" src="${escapeHtml(method.qr_url)}" alt="${escapeHtml(method.payment_name)} QR" />`
            : `<div class="payment-qr-placeholder">No QR uploaded</div>`}

          <div class="payment-meta">
            <div>${escapeHtml(depositText)}</div>
            <div>${method.receipt_required ? "Receipt required" : "No receipt"}</div>
            <div>${method.reference_required ? "Reference required" : "No reference"}</div>
            <div>${method.is_visible ? "Visible" : "Hidden"}</div>
          </div>

          <div class="payment-tags">
            <span class="payment-tag">Sort order: ${Number(method.sort_order ?? 0)}</span>
          </div>

          <div class="admin-actions">
            <button
              class="secondary-button"
              type="button"
              data-payment-up="${method.id}"
            >
              ↑
            </button>
            <button
              class="secondary-button"
              type="button"
              data-payment-down="${method.id}"
            >
              ↓
            </button>
            <button
              class="secondary-button"
              type="button"
              data-payment-toggle-visible="${method.id}"
            >
              ${method.is_visible ? "Hide" : "Show"}
            </button>
            <button
              class="secondary-button"
              type="button"
              data-payment-edit="${method.id}"
            >
              Edit
            </button>
            <button
              class="secondary-button danger"
              type="button"
              data-payment-delete="${method.id}"
            >
              Delete
            </button>
          </div>
        </article>
      `;
    })
    .join("");

  paymentMethodsContainer
    .querySelectorAll("[data-payment-toggle-visible]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        togglePaymentMethodVisibility(button.dataset.paymentToggleVisible);
      });
    });

  paymentMethodsContainer
    .querySelectorAll("[data-payment-edit]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        editPaymentMethod(button.dataset.paymentEdit);
      });
    });

  paymentMethodsContainer
    .querySelectorAll("[data-payment-down]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        changePaymentMethodOrder(button.dataset.paymentDown, 1);
      });
    });

  paymentMethodsContainer
    .querySelectorAll("[data-payment-up]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        changePaymentMethodOrder(button.dataset.paymentUp, -1);
      });
    });

  paymentMethodsContainer
    .querySelectorAll("[data-payment-delete]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        deletePaymentMethod(button.dataset.paymentDelete);
      });
    });
}

function openPaymentMethodModal(isEdit = false) {
  paymentMethodModalTitle.textContent = isEdit
    ? "Edit payment method"
    : "Add payment method";

  paymentMethodModal.showModal();
}

function closePaymentMethodDialog() {
  paymentMethodModal.close();
  paymentMethodForm.reset();
  paymentMethodForm.elements.id.value = "";
  resetPaymentMethodQrState();
}

function populatePaymentMethodForm(method) {
  paymentMethodForm.elements.id.value = method.id;
  paymentMethodForm.elements.payment_name.value = method.payment_name || "";
  paymentMethodForm.elements.short_description.value = method.short_description || "";
  paymentMethodForm.elements.instructions.value = method.instructions || "";
  paymentMethodForm.elements.receipt_required.checked = method.receipt_required;
  paymentMethodForm.elements.reference_required.checked = method.reference_required;
  paymentMethodForm.elements.deposit_required.checked = method.deposit_required;
  paymentMethodForm.elements.deposit_percentage.value = method.deposit_percentage ?? "";
  paymentMethodForm.elements.is_visible.checked = method.is_visible;
  paymentMethodForm.elements.sort_order.value = method.sort_order ?? 0;
  renderPaymentMethodQrPreview({ currentUrl: method.qr_url || null, removeQr: false, file: null });
}

addPaymentMethodBtn.addEventListener("click", () => {
  paymentMethodForm.reset();
  paymentMethodForm.elements.id.value = "";
  paymentMethodModalTitle.textContent = "Add payment method";
  resetPaymentMethodQrState();
  openPaymentMethodModal(false);
});

closePaymentMethodModal.addEventListener("click", () => {
  closePaymentMethodDialog();
});

cancelPaymentMethod.addEventListener("click", () => {
  closePaymentMethodDialog();
});

paymentMethodQrReplaceBtn.addEventListener("click", () => {
  paymentMethodQrInput?.click();
});

paymentMethodQrRemoveBtn.addEventListener("click", () => {
  if (paymentMethodQrInput) {
    paymentMethodQrInput.value = "";
  }
  renderPaymentMethodQrPreview({
    currentUrl: paymentMethodCurrentQrUrl,
    removeQr: true,
    file: null
  });
});

paymentMethodQrInput?.addEventListener("change", (event) => {
  const file = event.target.files?.[0] || null;

  if (!file) {
    renderPaymentMethodQrPreview({
      currentUrl: paymentMethodCurrentQrUrl,
      removeQr: false,
      file: null
    });
    return;
  }

  const validationMessage = validatePaymentMethodQrFile(file);
  if (validationMessage) {
    alert(validationMessage);
    event.target.value = "";
    renderPaymentMethodQrPreview({
      currentUrl: paymentMethodCurrentQrUrl,
      removeQr: false,
      file: null
    });
    return;
  }

  renderPaymentMethodQrPreview({
    currentUrl: paymentMethodCurrentQrUrl,
    removeQr: false,
    file
  });
});

paymentMethodForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(paymentMethodForm);
  const id = String(formData.get("id") || "").trim();

  const requestedSortOrder = formData.get("sort_order");
  const payload = {
    payment_name: String(formData.get("payment_name") || "").trim(),
    short_description: String(formData.get("short_description") || "").trim() || null,
    instructions: String(formData.get("instructions") || "").trim() || null,
    receipt_required: formData.get("receipt_required") === "on",
    reference_required: formData.get("reference_required") === "on",
    deposit_required: formData.get("deposit_required") === "on",
    deposit_percentage: formData.get("deposit_percentage") !== ""
      ? Number(formData.get("deposit_percentage"))
      : null,
    is_visible: formData.get("is_visible") === "on",
    sort_order:
      requestedSortOrder !== ""
        ? Number(requestedSortOrder)
        : paymentMethods.length
        ? Math.max(...paymentMethods.map((item) => Number(item.sort_order ?? 0))) + 10
        : 10,
    updated_at: new Date().toISOString()
  };

  let qrUrl = null;
  const existingMethod = id
    ? paymentMethods.find((item) => item.id === id)
    : null;

  if (paymentMethodQrFile) {
    const validationMessage = validatePaymentMethodQrFile(paymentMethodQrFile);
    if (validationMessage) {
      alert(validationMessage);
      return;
    }

    try {
      qrUrl = await uploadPaymentMethodQr(paymentMethodQrFile, id || null);
      if (id && existingMethod?.qr_url) {
        await deletePaymentMethodQr(existingMethod.qr_url);
      }
    } catch (uploadError) {
      alert(`Could not upload QR image: ${uploadError.message}`);
      return;
    }
  } else if (paymentMethodRemoveQr) {
    qrUrl = null;
    if (id && existingMethod?.qr_url) {
      await deletePaymentMethodQr(existingMethod.qr_url);
    }
  } else if (id && existingMethod) {
    qrUrl = existingMethod.qr_url || null;
  }

  payload.qr_url = qrUrl;

  let error;

  if (id) {
    ({ error } = await supabaseClient
      .from("payment_methods")
      .update(payload)
      .eq("id", id));
  } else {
    ({ error } = await supabaseClient
      .from("payment_methods")
      .insert(payload));
  }

  if (error) {
    alert(`Could not save payment method: ${error.message}`);
    return;
  }

  closePaymentMethodDialog();
  await loadPaymentMethods();
});

function editPaymentMethod(id) {
  const method = paymentMethods.find((item) => item.id === id);
  if (!method) return;

  populatePaymentMethodForm(method);
  openPaymentMethodModal(true);
}

async function deletePaymentMethod(id) {
  const method = paymentMethods.find((item) => item.id === id);
  if (!method) return;

  if (!confirm(`Delete "${method.payment_name}" payment method?`)) return;

  const { error } = await supabaseClient
    .from("payment_methods")
    .delete()
    .eq("id", id);

  if (error) {
    alert(`Could not delete payment method: ${error.message}`);
    return;
  }

  await loadPaymentMethods();
}

async function togglePaymentMethodVisibility(id) {
  const method = paymentMethods.find((item) => item.id === id);
  if (!method) return;

  const { error } = await supabaseClient
    .from("payment_methods")
    .update({
      is_visible: !method.is_visible,
      updated_at: new Date().toISOString()
    })
    .eq("id", id);

  if (error) {
    alert(`Could not update visibility: ${error.message}`);
    return;
  }

  await loadPaymentMethods();
}

async function changePaymentMethodOrder(id, direction) {
  const index = paymentMethods.findIndex((item) => item.id === id);
  if (index === -1) return;

  const targetIndex = index + direction;
  if (targetIndex < 0 || targetIndex >= paymentMethods.length) return;

  const current = paymentMethods[index];
  const adjacent = paymentMethods[targetIndex];

  const currentOrder = Number(current.sort_order ?? 0);
  const adjacentOrder = Number(adjacent.sort_order ?? 0);

  const [firstUpdate, secondUpdate] = await Promise.all([
    supabaseClient
      .from("payment_methods")
      .update({ sort_order: adjacentOrder, updated_at: new Date().toISOString() })
      .eq("id", current.id),
    supabaseClient
      .from("payment_methods")
      .update({ sort_order: currentOrder, updated_at: new Date().toISOString() })
      .eq("id", adjacent.id)
  ]);

  if (firstUpdate.error || secondUpdate.error) {
    alert(
      `Could not reorder payment methods: ${firstUpdate.error?.message || secondUpdate.error?.message}`
    );
    return;
  }

  await loadPaymentMethods();
}

/* -------------------------
   PRODUCTS
------------------------- */

async function loadProducts() {
  const { data, error } = await supabaseClient
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    productsTableContainer.innerHTML =
      `<p>Could not load products: ${escapeHtml(error.message)}</p>`;
    return;
  }

  products = data || [];
  categoryRegistry = Array.from(new Set([
    ...categoryRegistry,
    ...products.map((product) => String(product.category || "").trim()).filter(Boolean)
  ]));
  updateCategoryFilterOptions();
  renderProducts();
  renderDashboard();
  renderCategories();
}

function getProductSalesCount(productId) {
  return (orderItemsByOrder ? Object.values(orderItemsByOrder).flat() : [])
    .filter((item) => String(item.product_id) === String(productId))
    .reduce((sum, item) => sum + Number(item.quantity || 0), 0);
}

function getFilteredProducts() {
  const search = productFilters.search;
  const category = productFilters.category;
  const lowStock = productFilters.lowStock;

  return products.filter((product) => {
    const matchesSearch = !search || [product.name, product.category, product.description]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(search);

    const matchesCategory = category === "all" || String(product.category || "") === category;
    const matchesLowStock = !lowStock || Number(product.stock || 0) <= 5;

    return matchesSearch && matchesCategory && matchesLowStock;
  });
}

function renderProducts() {
  const filteredProducts = getFilteredProducts();
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / productPageSize));
  productPage = Math.min(productPage, totalPages);
  const startIndex = (productPage - 1) * productPageSize;
  const pageProducts = filteredProducts.slice(startIndex, startIndex + productPageSize);

  if (!products.length) {
    productsTableContainer.innerHTML = `<p class="empty">No products yet.</p>`;
    productsSummary.innerHTML = "";
    productsPagination.innerHTML = "";
    return;
  }

  productsSummary.innerHTML = `
    <div class="stat-card">
      <small>Total products</small>
      <strong>${products.length}</strong>
    </div>
    <div class="stat-card">
      <small>Low stock</small>
      <strong>${products.filter((product) => Number(product.stock || 0) <= 5).length}</strong>
    </div>
    <div class="stat-card">
      <small>Out of stock</small>
      <strong>${products.filter((product) => Number(product.stock || 0) < 1).length}</strong>
    </div>
    <div class="stat-card">
      <small>Inventory value</small>
      <strong>${formatCurrency(products.reduce((sum, product) => sum + Number(product.price || 0) * Number(product.stock || 0), 0))}</strong>
    </div>
  `;

  productsTableContainer.innerHTML = `
    <div class="table-shell">
      <table class="data-table">
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Description</th>
            <th>Category</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Visibility</th>
            <th>Sales</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${pageProducts.map((product) => `
            <tr>
              <td>${product.image_url ? `<img class="table-image" src="${escapeHtml(product.image_url)}" alt="${escapeHtml(product.name)}" />` : "—"}</td>
              <td>${escapeHtml(product.name)}</td>
              <td>${escapeHtml(product.description || "—")}</td>
              <td>${escapeHtml(product.category || "Uncategorized")}</td>
              <td>${formatCurrency(product.price)}</td>
              <td>${Number(product.stock || 0)}</td>
              <td>${product.is_visible ? "Visible" : "Hidden"}</td>
              <td>${getProductSalesCount(product.id)}</td>
              <td>
                <div class="admin-actions compact-actions">
                  <button class="secondary-button" type="button" data-edit="${product.id}">Edit</button>
                  <button class="secondary-button" type="button" data-duplicate="${product.id}">Duplicate</button>
                  <button class="secondary-button" type="button" data-toggle-visible="${product.id}">${product.is_visible ? "Hide" : "Show"}</button>
                  <button class="secondary-button danger" type="button" data-delete="${product.id}">Delete</button>
                </div>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;

  productsPagination.innerHTML = `
    <button class="secondary-button" type="button" ${productPage <= 1 ? "disabled" : ""} data-product-page="prev">Previous</button>
    <span class="tiny-note">Page ${productPage} of ${totalPages}</span>
    <button class="secondary-button" type="button" ${productPage >= totalPages ? "disabled" : ""} data-product-page="next">Next</button>
  `;

  productsTableContainer.querySelectorAll("[data-edit]").forEach((button) => {
    button.addEventListener("click", () => {
      editProduct(button.dataset.edit);
    });
  });

  productsTableContainer.querySelectorAll("[data-duplicate]").forEach((button) => {
    button.addEventListener("click", async () => {
      await duplicateProduct(button.dataset.duplicate);
    });
  });

  productsTableContainer.querySelectorAll("[data-toggle-visible]").forEach((button) => {
    button.addEventListener("click", async () => {
      await toggleProductVisibility(button.dataset.toggleVisible);
    });
  });

  productsTableContainer.querySelectorAll("[data-delete]").forEach((button) => {
    button.addEventListener("click", () => {
      deleteProduct(button.dataset.delete);
    });
  });

  productsPagination.querySelectorAll("[data-product-page]").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.productPage === "prev" && productPage > 1) {
        productPage -= 1;
      }
      if (button.dataset.productPage === "next" && productPage < totalPages) {
        productPage += 1;
      }
      renderProducts();
    });
  });
}

function updateCategoryFilterOptions() {
  const categories = Array.from(new Set([
    ...categoryRegistry,
    ...products.map((product) => String(product.category || "").trim()).filter(Boolean)
  ]));
  const currentValue = productsCategoryFilter?.value || "all";
  if (productsCategoryFilter) {
    productsCategoryFilter.innerHTML = `<option value="all">All categories</option>${categories.map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`).join("")}`;
    productsCategoryFilter.value = currentValue && categories.includes(currentValue) ? currentValue : "all";
  }
}

async function toggleProductVisibility(id) {
  const product = products.find((item) => item.id === id);
  if (!product) return;

  const { error } = await supabaseClient
    .from("products")
    .update({
      is_visible: !product.is_visible,
      updated_at: new Date().toISOString()
    })
    .eq("id", id);

  if (error) {
    alert(`Could not update visibility: ${error.message}`);
    return;
  }

  await loadProducts();
}

async function duplicateProduct(id) {
  const product = products.find((item) => item.id === id);
  if (!product) return;

  const { error } = await supabaseClient
    .from("products")
    .insert({
      ...product,
      name: `${product.name} Copy`,
      stock: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

  if (error) {
    alert(`Could not duplicate product: ${error.message}`);
    return;
  }

  await loadProducts();
}
function showProductImagePreview(url) {
    if (!url) {
        productImagePreview.removeAttribute("src");
            productImagePreviewWrap.hidden = true;
                return;
                  }

                    productImagePreview.src = url;
                      productImagePreviewWrap.hidden = false;
                      }

                      function clearTemporaryProductPreview() {
                        if (temporaryProductPreviewUrl) {
                            URL.revokeObjectURL(temporaryProductPreviewUrl);
                                temporaryProductPreviewUrl = "";
                                  }
                                  }

                                  function sanitizeProductImageName(fileName) {
                                    return fileName
                                        .toLowerCase()
                                            .replace(/[^a-z0-9._-]+/g, "-")
                                                .replace(/-+/g, "-");
                                                }

                                                async function uploadProductImage(file) {
                                                  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
                                                    const maximumSize = 5 * 1024 * 1024;

                                                      if (!allowedTypes.includes(file.type)) {
                                                          throw new Error("Please choose a JPG, PNG, or WebP image.");
                                                            }

                                                              if (file.size > maximumSize) {
                                                                  throw new Error("The image must be 5 MB or smaller.");
                                                                    }

                                                                      const safeName = sanitizeProductImageName(file.name);
                                                                        const uniqueName =
                                                                            typeof crypto.randomUUID === "function"
                                                                                  ? crypto.randomUUID()
                                                                                        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

                                                                                          const filePath = `products/${uniqueName}-${safeName}`;

                                                                                            const { error: uploadError } = await supabaseClient.storage
                                                                                                .from(PRODUCT_IMAGE_BUCKET)
                                                                                                    .upload(filePath, file, {
                                                                                                          cacheControl: "3600",
                                                                                                                upsert: false,
                                                                                                                      contentType: file.type
                                                                                                                          });

                                                                                                                            if (uploadError) {
                                                                                                                                throw uploadError;
                                                                                                                                  }

                                                                                                                                    const { data } = supabaseClient.storage
                                                                                                                                        .from(PRODUCT_IMAGE_BUCKET)
                                                                                                                                            .getPublicUrl(filePath);

                                                                                                                                              if (!data?.publicUrl) {
                                                                                                                                                  throw new Error("The image uploaded, but no public URL was returned.");
                                                                                                                                                    }

                                                                                                                                                      return data.publicUrl;
                                                                                                                                                      }

                                                                                                                                                      productImageFileInput?.addEventListener("change", () => {
                                                                                                                                                        clearTemporaryProductPreview();

                                                                                                                                                          const file = productImageFileInput.files?.[0] || null;
                                                                                                                                                            selectedProductImageFile = file;

                                                                                                                                                              if (!file) return;

                                                                                                                                                                temporaryProductPreviewUrl = URL.createObjectURL(file);
                                                                                                                                                                  showProductImagePreview(temporaryProductPreviewUrl);
                                                                                                                                                                  });

                                                                                                                                                                  removeProductImageButton?.addEventListener("click", () => {
                                                                                                                                                                    clearTemporaryProductPreview();
                                                                                                                                                                      selectedProductImageFile = null;
                                                                                                                                                                        productImageFileInput.value = "";
                                                                                                                                                                          productImageUrlInput.value = "";
                                                                                                                                                                            showProductImagePreview("");
                                                                                                                                                                            });
shopLogoFileInput?.addEventListener("change", () => {
  const file = shopLogoFileInput.files?.[0] || null;

  selectedShopLogoFile = file;

  if (!file) return;

  if (temporaryShopLogoPreviewUrl) {
    URL.revokeObjectURL(temporaryShopLogoPreviewUrl);
  }

  temporaryShopLogoPreviewUrl = URL.createObjectURL(file);

  shopLogoPreview.innerHTML = `
    <img
      src="${temporaryShopLogoPreviewUrl}"
      alt="Shop logo preview"
    />
  `;

  deleteShopLogoButton.hidden = false;
});

replaceShopLogoButton?.addEventListener("click", () => {
  shopLogoFileInput?.click();
});

deleteShopLogoButton?.addEventListener("click", () => {
  selectedShopLogoFile = null;

  if (temporaryShopLogoPreviewUrl) {
    URL.revokeObjectURL(temporaryShopLogoPreviewUrl);
    temporaryShopLogoPreviewUrl = "";
  }

  shopLogoFileInput.value = "";
  settingsForm.elements.logoUrl.value = "";

  shopLogoPreview.innerHTML = `
    <span>No logo uploaded</span>
  `;

  deleteShopLogoButton.hidden = true;
});
heroImageFileInput?.addEventListener("change", () => {
  const file = heroImageFileInput.files?.[0] || null;

  selectedHeroImageFile = file;

  if (!file) return;

  if (temporaryHeroImagePreviewUrl) {
    URL.revokeObjectURL(temporaryHeroImagePreviewUrl);
  }

  temporaryHeroImagePreviewUrl = URL.createObjectURL(file);

  heroImagePreview.innerHTML = `
    <img
      src="${temporaryHeroImagePreviewUrl}"
      alt="Hero image preview"
    />
  `;

  deleteHeroImageButton.hidden = false;
});

replaceHeroImageButton?.addEventListener("click", () => {
  heroImageFileInput?.click();
});

deleteHeroImageButton?.addEventListener("click", () => {
  selectedHeroImageFile = null;

  if (temporaryHeroImagePreviewUrl) {
    URL.revokeObjectURL(temporaryHeroImagePreviewUrl);
    temporaryHeroImagePreviewUrl = "";
  }

  heroImageFileInput.value = "";
  settingsForm.elements.heroImageUrl.value = "";

  heroImagePreview.innerHTML = `
    <span>No hero image uploaded</span>
  `;

  deleteHeroImageButton.hidden = true;
});
/* =========================================================
   PRODUCT VARIANTS
========================================================= */

function setVariantsEnabled(enabled) {
  if (!variantManager || !standardPricingFields) return;

  variantManager.hidden = !enabled;

  standardPricingFields.classList.toggle(
    "is-disabled",
    enabled
  );

  const priceInput = productForm.elements.price;
  const stockInput = productForm.elements.stock;

  if (enabled) {
    if (!variantRows.querySelector(".variant-card")) {
  createVariantCard({
    is_default: true,
    is_active: true
  });
}
    priceInput.required = false;
    stockInput.required = false;
  } else {
    priceInput.required = true;
    stockInput.required = true;
  }
}

hasVariantsToggle?.addEventListener("change", () => {
  setVariantsEnabled(hasVariantsToggle.checked);
});
let variantCardCounter = 0;

function renumberVariantCards() {
  const cards = variantRows.querySelectorAll(".variant-card");

  cards.forEach((card, index) => {
    const title = card.querySelector("[data-variant-title]");

    if (title) {
      title.textContent = `Variant ${index + 1}`;
    }

    const sortOrderInput = card.querySelector(
      '[data-variant-field="sort_order"]'
    );

    if (sortOrderInput) {
      sortOrderInput.value = index;
    }
  });
}

function ensureDefaultVariant() {
  const defaultInputs = Array.from(
    variantRows.querySelectorAll(
      '[data-variant-field="is_default"]'
    )
  );

  if (!defaultInputs.length) return;

  const hasDefault = defaultInputs.some((input) => input.checked);

  if (!hasDefault) {
    defaultInputs[0].checked = true;
  }
}

function createVariantFieldLabel(labelText, input) {
  const label = document.createElement("label");
  const text = document.createElement("span");

  text.textContent = labelText;

  label.append(text, input);

  return label;
}

function createVariantCard(variant = {}) {
  variantCardCounter += 1;

  const card = document.createElement("article");
  card.className = "variant-card";
  card.dataset.variantId = variant.id || "";
  card.dataset.variantKey =
    variant.id || `new-${variantCardCounter}`;

  const header = document.createElement("div");
  header.className = "variant-card-header";

  const title = document.createElement("strong");
  title.dataset.variantTitle = "";
  title.textContent = "Variant";

  const removeButton = document.createElement("button");
  removeButton.type = "button";
  removeButton.className =
    "secondary-button variant-remove-button";
  removeButton.textContent = "Remove";

  header.append(title, removeButton);

  const fields = document.createElement("div");
  fields.className = "variant-fields";

  const nameInput = document.createElement("input");
  nameInput.type = "text";
  nameInput.placeholder = "Example: 30mg";
  nameInput.value = variant.name || "";
  nameInput.required = true;
  nameInput.dataset.variantField = "name";

  const priceInput = document.createElement("input");
  priceInput.type = "number";
  priceInput.min = "0";
  priceInput.step = "0.01";
  priceInput.placeholder = "0.00";
  priceInput.value = variant.price ?? "";
  priceInput.required = true;
  priceInput.dataset.variantField = "price";

  const stockInput = document.createElement("input");
  stockInput.type = "number";
  stockInput.min = "0";
  stockInput.step = "1";
  stockInput.placeholder = "0";
  stockInput.value = variant.stock ?? 0;
  stockInput.required = true;
  stockInput.dataset.variantField = "stock";

  const badgeInput = document.createElement("input");
  badgeInput.type = "text";
  badgeInput.placeholder = "Example: Best Seller";
  badgeInput.value = variant.badge || "";
  badgeInput.dataset.variantField = "badge";

  const imageInput = document.createElement("input");
  imageInput.type = "file";
  imageInput.accept = "image/jpeg,image/png,image/webp";
  imageInput.dataset.variantField = "image_file";

  fields.append(
    createVariantFieldLabel("Variant name", nameInput),
    createVariantFieldLabel("Price (₱)", priceInput),
    createVariantFieldLabel("Stock", stockInput),
    createVariantFieldLabel("Badge", badgeInput),
    createVariantFieldLabel("Variant image", imageInput)
  );

  const advanced = document.createElement("details");
  advanced.className = "variant-advanced";

  const advancedSummary = document.createElement("summary");
  advancedSummary.textContent = "Advanced";

  const advancedFields = document.createElement("div");
  advancedFields.className = "variant-advanced-fields";

  const skuInput = document.createElement("input");
  skuInput.type = "text";
  skuInput.placeholder = "Example: TIRZ-30";
  skuInput.value = variant.sku || "";
  skuInput.dataset.variantField = "sku";

  const defaultInput = document.createElement("input");
  defaultInput.type = "radio";
  defaultInput.name = "defaultVariant";
  defaultInput.checked = Boolean(variant.is_default);
  defaultInput.dataset.variantField = "is_default";

  const defaultLabel = document.createElement("label");
  defaultLabel.className = "variant-check-option";
  defaultLabel.append(
    defaultInput,
    document.createTextNode("Default variant")
  );

  const activeInput = document.createElement("input");
  activeInput.type = "checkbox";
  activeInput.checked = variant.is_active !== false;
  activeInput.dataset.variantField = "is_active";

  const activeLabel = document.createElement("label");
  activeLabel.className = "variant-check-option";
  activeLabel.append(
    activeInput,
    document.createTextNode("Active")
  );

  const imageUrlInput = document.createElement("input");
  imageUrlInput.type = "hidden";
  imageUrlInput.value = variant.image_url || "";
  imageUrlInput.dataset.variantField = "image_url";

  const sortOrderInput = document.createElement("input");
  sortOrderInput.type = "hidden";
  sortOrderInput.value = variant.sort_order ?? 0;
  sortOrderInput.dataset.variantField = "sort_order";

  advancedFields.append(
    createVariantFieldLabel("SKU", skuInput),
    defaultLabel,
    activeLabel,
    imageUrlInput,
    sortOrderInput
  );

  advanced.append(advancedSummary, advancedFields);

  removeButton.addEventListener("click", () => {
    card.remove();

    if (
      hasVariantsToggle.checked &&
      !variantRows.querySelector(".variant-card")
    ) {
      createVariantCard({
        is_default: true,
        is_active: true
      });
    }

    renumberVariantCards();
    ensureDefaultVariant();
  });

  defaultInput.addEventListener("change", () => {
    ensureDefaultVariant();
  });

  card.append(header, fields, advanced);
  variantRows.appendChild(card);

  renumberVariantCards();
  ensureDefaultVariant();

  return card;
}

addVariantButton?.addEventListener("click", () => {
  createVariantCard({
    is_active: true
  });
});
productForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(productForm);
  const id = String(formData.get("id") || "").trim();
let productImageUrl = String(formData.get("image") || "").trim();

if (selectedProductImageFile) {
  try {
      productImageUrl = await uploadProductImage(selectedProductImageFile);
          productImageUrlInput.value = productImageUrl;
            } catch (uploadError) {
                alert(`Could not upload product image: ${uploadError.message}`);
                    return;
                      }
                      }
  const product = {
    name: String(formData.get("name") || "").trim(),
    price: Number(formData.get("price")),
    stock: Number(formData.get("stock")),
    category:
      String(formData.get("category") || "").trim() || null,
    image_url: productImageUrl || null,
    description:
      String(formData.get("description") || "").trim() || null,
    is_visible: true,
    updated_at: new Date().toISOString()
  };

  let error;

  if (id) {
    ({ error } = await supabaseClient
      .from("products")
      .update(product)
      .eq("id", id));
  } else {
    ({ error } = await supabaseClient
      .from("products")
      .insert(product));
  }

  if (error) {
    alert(`Could not save product: ${error.message}`);
    return;
  }

  resetProductForm();
  await loadProducts();
  alert(id ? "Product updated online." : "Product added online.");
});

function editProduct(id) {
  const product = products.find((item) => item.id === id);
  if (!product) return;

  productForm.elements.id.value = product.id;
  productForm.elements.name.value = product.name || "";
  productForm.elements.price.value = product.price ?? 0;
  productForm.elements.stock.value = product.stock ?? 0;
  productForm.elements.category.value = product.category || "";
  productForm.elements.image.value = product.image_url || "";
  selectedProductImageFile = null;
  productImageFileInput.value = "";
  clearTemporaryProductPreview();
  showProductImagePreview(product.image_url || "");
  productForm.elements.description.value =
    product.description || "";

  formTitle.textContent = "Edit product";
  cancelEdit.hidden = false;

  productForm.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

async function deleteProduct(id) {
  const product = products.find((item) => item.id === id);

  const confirmed = confirm(
    `Delete ${product?.name || "this product"}?`
  );

  if (!confirmed) return;

  const { error } = await supabaseClient
    .from("products")
    .delete()
    .eq("id", id);

  if (error) {
    alert(`Could not delete product: ${error.message}`);
    return;
  }

  await loadProducts();
}

function resetProductForm() {
  productForm.reset();
  clearTemporaryProductPreview();
  selectedProductImageFile = null;
  productImageFileInput.value = "";
  productImageUrlInput.value = "";
  showProductImagePreview("");
  productForm.elements.id.value = "";
  formTitle.textContent = "Add product";
  cancelEdit.hidden = true;
}

cancelEdit.addEventListener("click", resetProductForm);

/* -------------------------
   ORDERS
------------------------- */

async function loadOrders() {
  const [{ data: ordersData, error: ordersError }, { data: itemsData, error: itemsError }] = await Promise.all([
    supabaseClient
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false }),
    supabaseClient
      .from("order_items")
      .select("*")
      .order("product_name", { ascending: true })
  ]);

  if (ordersError) {
    ordersList.innerHTML =
      `<p>Could not load orders: ${escapeHtml(ordersError.message)}</p>`;
    return;
  }

  if (itemsError) {
    ordersList.innerHTML =
      `<p>Could not load order items: ${escapeHtml(itemsError.message)}</p>`;
    return;
  }

  orders = ordersData || [];
  orderItemsByOrder = (itemsData || []).reduce((accumulator, item) => {
    const orderId = String(item.order_id);

    if (!accumulator[orderId]) {
      accumulator[orderId] = [];
    }

    accumulator[orderId].push(item);
    return accumulator;
  }, {});

  renderOrderTabs();
  renderOrders(getFilteredOrders());
}

function getOrderReferenceLabel(order) {
  return order?.order_ref || order?.order_reference || "—";
}

function getFilteredOrders(list = orders) {
  const search = String(ordersSearch?.value || "").trim().toLowerCase();

  return list.filter((order) => {
    const archived = Boolean(order?.archived);
    const paymentStatus = String(order?.payment_status || "Pending").toLowerCase();
    const searchable = [
      getOrderReferenceLabel(order),
      order?.customer_name,
      order?.phone,
      order?.reference_number
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    if (search && !searchable.includes(search)) {
      return false;
    }

    if (activeOrderFilter === "archived") {
      return archived;
    }

    if (archived) {
      return false;
    }

    switch (activeOrderFilter) {
      case "pending":
        return paymentStatus === "pending";
      case "approved":
        return paymentStatus === "approved";
      case "rejected":
        return paymentStatus === "rejected";
      default:
        return true;
    }
  });
}

function getOrderTabCount(filter) {
  return getFilteredOrders(orders.filter((order) => {
    const archived = Boolean(order?.archived);

    if (filter === "archived") {
      return archived;
    }

    if (archived) {
      return false;
    }

    switch (filter) {
      case "pending":
        return String(order?.payment_status || "Pending").toLowerCase() === "pending";
      case "approved":
        return String(order?.payment_status || "").toLowerCase() === "approved";
      case "rejected":
        return String(order?.payment_status || "").toLowerCase() === "rejected";
      default:
        return true;
    }
  })).length;
}

function renderOrderTabs() {
  if (!ordersTabs) {
    return;
  }

  const tabs = [
    { id: "all", label: "All" },
    { id: "pending", label: "Pending" },
    { id: "approved", label: "Approved" },
    { id: "rejected", label: "Rejected" },
    { id: "archived", label: "Archived" }
  ];

  ordersTabs.innerHTML = tabs
    .map((tab) => {
      const isActive = activeOrderFilter === tab.id;
      const count = getOrderTabCount(tab.id);

      return `
        <button
          class="order-tab${isActive ? " active" : ""}"
          type="button"
          data-order-filter="${tab.id}"
        >
          <span>${escapeHtml(tab.label)}</span>
          <span class="order-tab-count">${count}</span>
        </button>
      `;
    })
    .join("");

  ordersTabs
    .querySelectorAll("[data-order-filter]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        activeOrderFilter = button.dataset.orderFilter || "all";
        renderOrderTabs();
        renderOrders(getFilteredOrders());
      });
    });
}

function setOrderFilter(filter) {
  activeOrderFilter = filter;
  renderOrderTabs();
  renderOrders(getFilteredOrders());
}

async function verifyAdminAccess() {
  const {
    data: { user },
    error: userError
  } = await supabaseClient.auth.getUser();

  if (userError || !user) {
    return false;
  }

  const { data, error } = await supabaseClient.rpc("is_admin");

  return !error && data === true;
}

async function viewOrderReceipt(order) {
  const isAdmin = await verifyAdminAccess();

  if (!isAdmin) {
    alert("Admin access is required to view receipts.");
    return;
  }

  if (!order?.receipt_image) {
    alert("No receipt uploaded for this order.");
    return;
  }

  const { data, error } = await supabaseClient.storage
    .from("payment-receipts")
    .createSignedUrl(order.receipt_image, 60);

  if (error) {
    alert(`Could not open receipt: ${error.message}`);
    return;
  }

  window.open(data.signedUrl, "_blank", "noopener,noreferrer");
}

async function updateOrderPaymentStatus(id, paymentStatus) {
  const { error } = await supabaseClient
    .from("orders")
    .update({
      payment_status: paymentStatus,
      updated_at: new Date().toISOString()
    })
    .eq("id", id);

  if (error) {
    alert(`Could not update payment status: ${error.message}`);
    return;
  }

  await loadOrders();
  alert(`Payment marked as ${paymentStatus}.`);
}

async function archiveOrder(id) {
  const confirmed = confirm("Archive this order?");

  if (!confirmed) {
    return;
  }

  const { error } = await supabaseClient
    .from("orders")
    .update({
      archived: true,
      updated_at: new Date().toISOString()
    })
    .eq("id", id);

  if (error) {
    alert(`Could not archive order: ${error.message}`);
    return;
  }

  await loadOrders();
  alert("Order archived.");
}

async function restoreOrder(id) {
  const { error } = await supabaseClient
    .from("orders")
    .update({
      archived: false,
      updated_at: new Date().toISOString()
    })
    .eq("id", id);

  if (error) {
    alert(`Could not restore order: ${error.message}`);
    return;
  }

  await loadOrders();
  alert("Order restored.");
}

async function deleteOrderPermanently(id, order) {
  const confirmed = confirm("Delete this order permanently? This cannot be undone.");

  if (!confirmed) {
    return;
  }

  try {
    const { error: itemsError } = await supabaseClient
      .from("order_items")
      .delete()
      .eq("order_id", id);

    if (itemsError) {
      throw new Error(`Could not delete order items: ${itemsError.message}`);
    }

    if (order?.receipt_image) {
      const { error: storageError } = await supabaseClient.storage
        .from("payment-receipts")
        .remove([order.receipt_image]);

      if (storageError) {
        throw new Error(`Could not delete receipt image: ${storageError.message}`);
      }
    }

    const { error: orderError } = await supabaseClient
      .from("orders")
      .delete()
      .eq("id", id);

    if (orderError) {
      throw new Error(`Could not delete order: ${orderError.message}`);
    }

    await loadOrders();
    alert("Order deleted permanently.");
  } catch (error) {
    alert(error.message || "Could not delete order permanently.");
  }
}

function renderOrders(ordersToRender) {
  if (!ordersToRender.length) {
    ordersList.innerHTML =
      `<p class="empty">No orders in this view yet.</p>`;
    return;
  }

  ordersList.innerHTML = ordersToRender
    .map(
      (order) => {
        const orderItems = orderItemsByOrder[String(order.id)] || [];
        const productsLabel = `Products (${orderItems.length})`;
        const productRows = orderItems.length
          ? orderItems
              .map((item) => `
                <div class="order-product-row">
                  <div>
                    <strong>${escapeHtml(item.product_name || "Product")}</strong>
                    <div class="tiny-note">Qty: ${Number(item.quantity || 0)}</div>
                  </div>
                  <div class="order-product-prices">
                    <span>${formatCurrency(item.unit_price || 0)}</span>
                    <span>${formatCurrency(item.line_total || 0)}</span>
                  </div>
                </div>
              `)
              .join("")
          : `<div class="tiny-note">No products found</div>`;

        return `
          <article class="order-card">
            <strong>${escapeHtml(getOrderReferenceLabel(order))}</strong>

            <p>
              ${escapeHtml(order.customer_name)}
              · ${escapeHtml(order.phone)}
            </p>

            <p>${escapeHtml(order.address)}</p>

            <p>
              ${formatCurrency(order.total)}
              · ${escapeHtml(order.payment_method || "—")}
            </p>

            <p>
              Payment status: <strong>${escapeHtml(order.payment_status || "Pending")}</strong>
            </p>

            <p>
              Amount paid: ${formatCurrency(order.amount_paid || 0)}
            </p>

            ${order.reference_number ? `<p>Reference: ${escapeHtml(order.reference_number)}</p>` : ""}

            <details class="order-products-details">
              <summary>${escapeHtml(productsLabel)} <span class="order-details-arrow">▾</span></summary>
              <div class="order-products-body">
                ${productRows}
              </div>
            </details>

            <label>
              Status
              <select data-order-status="${order.id}">
                ${orderStatusOptions(order.status)}
              </select>
            </label>

            <div class="order-actions">
              <button class="secondary-button" type="button" data-order-view-details="${order.id}">View Details</button>
              ${order.receipt_image ? `
                <button class="secondary-button" type="button" data-order-view-receipt="${order.id}">
                  View Receipt
                </button>
              ` : ""}
              <button class="secondary-button" type="button" data-order-approve="${order.id}">
                Approve Payment
              </button>
              <button class="secondary-button danger" type="button" data-order-reject="${order.id}">
                Reject Payment
              </button>
              ${Boolean(order.archived) ? `
                <button class="secondary-button" type="button" data-order-restore="${order.id}">
                  Restore Order
                </button>
                <button class="secondary-button danger" type="button" data-order-delete-permanent="${order.id}">
                  Delete Permanently
                </button>
              ` : `
                <button class="secondary-button" type="button" data-order-archive="${order.id}">
                  Archive Order
                </button>
              `}
            </div>

            <small>
              ${new Date(order.created_at).toLocaleString()}
            </small>
          </article>
        `;
      }
    )
    .join("");

  ordersList
    .querySelectorAll("[data-order-status]")
    .forEach((select) => {
      select.addEventListener("change", async () => {
        await updateOrderStatus(
          select.dataset.orderStatus,
          select.value
        );
      });
    });

  ordersList
    .querySelectorAll("[data-order-view-details]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        const order = orders.find((item) => String(item.id) === String(button.dataset.orderViewDetails));
        if (order) {
          openOrderDetails(order);
        }
      });
    });

  ordersList
    .querySelectorAll("[data-order-view-receipt]")
    .forEach((button) => {
      button.addEventListener("click", async () => {
        const order = orders.find((item) => String(item.id) === String(button.dataset.orderViewReceipt));
        if (order) {
          await viewOrderReceipt(order);
        }
      });
    });

  ordersList
    .querySelectorAll("[data-order-approve]")
    .forEach((button) => {
      button.addEventListener("click", async () => {
        await updateOrderPaymentStatus(button.dataset.orderApprove, "Approved");
      });
    });

  ordersList
    .querySelectorAll("[data-order-reject]")
    .forEach((button) => {
      button.addEventListener("click", async () => {
        await updateOrderPaymentStatus(button.dataset.orderReject, "Rejected");
      });
    });

  ordersList
    .querySelectorAll("[data-order-archive]")
    .forEach((button) => {
      button.addEventListener("click", async () => {
        await archiveOrder(button.dataset.orderArchive);
      });
    });

  ordersList
    .querySelectorAll("[data-order-restore]")
    .forEach((button) => {
      button.addEventListener("click", async () => {
        await restoreOrder(button.dataset.orderRestore);
      });
    });

  ordersList
    .querySelectorAll("[data-order-delete-permanent]")
    .forEach((button) => {
      button.addEventListener("click", async () => {
        const order = orders.find((item) => String(item.id) === String(button.dataset.orderDeletePermanent));
        if (order) {
          await deleteOrderPermanently(order.id, order);
        }
      });
    });
}

async function updateOrderStatus(id, status) {
  const { error } = await supabaseClient
    .from("orders")
    .update({
      status,
      updated_at: new Date().toISOString()
    })
    .eq("id", id);

  if (error) {
    alert(`Could not update order: ${error.message}`);
    await loadOrders();
    return;
  }

  await loadOrders();
  alert("Order status updated.");
}

function openOrderDetails(order) {
  const items = orderItemsByOrder[String(order.id)] || [];
  const totalItems = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const orderTotals = items.reduce((sum, item) => sum + Number(item.line_total || 0), 0);
  const currency = formatCurrency;

  orderDetailsContent.innerHTML = `
    <div class="order-detail-shell">
      <div class="order-detail-card">
        <div class="admin-section-header">
          <div>
            <h3>${escapeHtml(getOrderReferenceLabel(order))}</h3>
            <p class="tiny-note">Order details</p>
          </div>
          <button class="secondary-button" type="button" data-dismiss-order-details>Close</button>
        </div>
        <div class="detail-grid">
          <div>
            <h4>Customer</h4>
            <p>${escapeHtml(order.customer_name || "—")}</p>
            <p>${escapeHtml(order.phone || "—")}</p>
            <p>${escapeHtml(order.address || "—")}</p>
          </div>
          <div>
            <h4>Payment</h4>
            <p>Method: ${escapeHtml(order.payment_method || "—")}</p>
            <p>Status: ${escapeHtml(order.payment_status || "Pending")}</p>
            <p>Amount paid: ${currency(order.amount_paid || 0)}</p>
            <p>Reference: ${escapeHtml(order.reference_number || "—")}</p>
          </div>
        </div>
        <div class="detail-grid">
          <div>
            <h4>Products</h4>
            ${items.length ? items.map((item) => `
              <div class="order-product-row">
                <div>
                  <strong>${escapeHtml(item.product_name || "Product")}</strong>
                  <div class="tiny-note">Qty ${Number(item.quantity || 0)}</div>
                </div>
                <div class="order-product-prices">
                  <span>${currency(item.unit_price || 0)}</span>
                  <span>${currency(item.line_total || 0)}</span>
                </div>
              </div>
            `).join("") : `<div class="tiny-note">No products found</div>`}
          </div>
          <div>
            <h4>Summary</h4>
            <p>Items: ${totalItems}</p>
            <p>Product total: ${currency(orderTotals)}</p>
            <p>Shipping fee: ${currency(order.shipping_fee || 0)}</p>
            <p>Order total: ${currency(order.total || 0)}</p>
            <p>Shipping status: ${escapeHtml(order.status || "Pending")}</p>
            <p>Note: ${escapeHtml(order.notes || "No note provided")}</p>
          </div>
        </div>
        <div class="order-actions detail-actions">
          ${order.receipt_image ? `<button class="secondary-button" type="button" data-order-view-receipt-modal="${order.id}">View Receipt</button>` : ""}
          <button class="secondary-button" type="button" data-order-approve-modal="${order.id}">Approve Payment</button>
          <button class="secondary-button danger" type="button" data-order-reject-modal="${order.id}">Reject Payment</button>
          ${Boolean(order.archived) ? `<button class="secondary-button" type="button" data-order-restore-modal="${order.id}">Restore Order</button>` : `<button class="secondary-button" type="button" data-order-archive-modal="${order.id}">Archive Order</button>`}
        </div>
      </div>
    </div>
  `;

  orderDetailsModal?.showModal();

  orderDetailsContent.querySelector("[data-dismiss-order-details]")?.addEventListener("click", () => {
    orderDetailsModal?.close();
  });

  orderDetailsContent.querySelector("[data-order-view-receipt-modal]")?.addEventListener("click", async () => {
    await viewOrderReceipt(order);
  });

  orderDetailsContent.querySelector("[data-order-approve-modal]")?.addEventListener("click", async () => {
    await updateOrderPaymentStatus(order.id, "Approved");
    openOrderDetails({ ...order, payment_status: "Approved" });
  });

  orderDetailsContent.querySelector("[data-order-reject-modal]")?.addEventListener("click", async () => {
    await updateOrderPaymentStatus(order.id, "Rejected");
    openOrderDetails({ ...order, payment_status: "Rejected" });
  });

  orderDetailsContent.querySelector("[data-order-archive-modal]")?.addEventListener("click", async () => {
    await archiveOrder(order.id);
  });

  orderDetailsContent.querySelector("[data-order-restore-modal]")?.addEventListener("click", async () => {
    await restoreOrder(order.id);
  });
}

function renderDashboard() {
  const revenue = orders.reduce((sum, order) => sum + Number(order.total || order.amount_paid || 0), 0);
  const pendingPayments = orders.filter((order) => String(order.payment_status || "Pending").toLowerCase() === "pending").length;
  const shippedOrders = orders.filter((order) => ["paid", "confirmed", "shipped", "delivered"].includes(String(order.status || "").toLowerCase())).length;
  const recentOrders = [...orders]
    .sort((first, second) => new Date(second.created_at || 0) - new Date(first.created_at || 0))
    .slice(0, 5);
  const salesByProduct = Object.values((orderItemsByOrder || {}))
    .flat()
    .reduce((accumulator, item) => {
      const key = String(item.product_id || item.product_name || "Unknown");
      if (!accumulator[key]) {
        accumulator[key] = { id: item.product_id, name: item.product_name || "Unknown", quantity: 0 };
      }
      accumulator[key].quantity += Number(item.quantity || 0);
      return accumulator;
    }, {});
  const bestSellers = Object.values(salesByProduct)
    .sort((first, second) => second.quantity - first.quantity)
    .slice(0, 4);

  if (dashboardStats) {
    dashboardStats.innerHTML = `
      <div class="stat-card">
        <small>Total revenue</small>
        <strong>${formatCurrency(revenue)}</strong>
      </div>
      <div class="stat-card">
        <small>Pending payments</small>
        <strong>${pendingPayments}</strong>
      </div>
      <div class="stat-card">
        <small>Orders in progress</small>
        <strong>${shippedOrders}</strong>
      </div>
      <div class="stat-card">
        <small>Products live</small>
        <strong>${products.length}</strong>
      </div>
    `;
  }

  if (dashboardRecentOrders) {
    dashboardRecentOrders.innerHTML = recentOrders.length
      ? recentOrders.map((order) => `
          <div class="dashboard-list-item">
            <div>
              <strong>${escapeHtml(getOrderReferenceLabel(order))}</strong>
              <div class="tiny-note">${escapeHtml(order.customer_name || "Guest")}</div>
            </div>
            <div class="dashboard-list-meta">
              <span>${formatCurrency(order.total || 0)}</span>
              <span>${escapeHtml(order.payment_status || "Pending")}</span>
            </div>
          </div>
        `).join("")
      : `<p class="empty">No orders yet.</p>`;
  }

  if (dashboardBestSellers) {
    dashboardBestSellers.innerHTML = bestSellers.length
      ? bestSellers.map((product) => `
          <div class="dashboard-list-item">
            <div>
              <strong>${escapeHtml(product.name)}</strong>
              <div class="tiny-note">Best seller this week</div>
            </div>
            <span>${product.quantity} sold</span>
          </div>
        `).join("")
      : `<p class="empty">No sales yet.</p>`;
  }
}

function renderCustomers() {
  const customerMap = orders.reduce((accumulator, order) => {
    const key = String(order.customer_name || "Guest").trim() || "Guest";
    if (!accumulator[key]) {
      accumulator[key] = {
        name: key,
        orders: 0,
        revenue: 0,
        lastOrder: order.created_at || null
      };
    }
    accumulator[key].orders += 1;
    accumulator[key].revenue += Number(order.total || order.amount_paid || 0);
    accumulator[key].lastOrder = order.created_at && (!accumulator[key].lastOrder || new Date(order.created_at) > new Date(accumulator[key].lastOrder))
      ? order.created_at
      : accumulator[key].lastOrder;
    return accumulator;
  }, {});

  const customers = Object.values(customerMap).sort((first, second) => second.revenue - first.revenue);

  if (customersList) {
    customersList.innerHTML = customers.length
      ? customers.map((customer) => `
          <div class="customer-card">
            <div>
              <strong>${escapeHtml(customer.name)}</strong>
              <div class="tiny-note">${customer.orders} orders</div>
            </div>
            <div class="dashboard-list-meta">
              <span>${formatCurrency(customer.revenue)}</span>
              <span>${customer.lastOrder ? new Date(customer.lastOrder).toLocaleDateString() : "—"}</span>
            </div>
          </div>
        `).join("")
      : `<p class="empty">Orders will appear here once customers place purchases.</p>`;
  }
}

function renderCategories() {
  const categories = Array.from(new Set([
    ...categoryRegistry,
    ...products.map((product) => String(product.category || "").trim()).filter(Boolean)
  ])).sort();

  if (categoriesList) {
    categoriesList.innerHTML = categories.length
      ? categories.map((category) => {
          const categoryProducts = products.filter((product) => String(product.category || "").trim() === category);
          return `
            <div class="customer-card ">
              <div>
                <strong>${escapeHtml(category)}</strong>
                <div class="tiny-note">${categoryProducts.length} products</div>
              </div>
              <div class="admin-actions">
                <button class="secondary-button" type="button" data-edit-category="${escapeHtml(category)}">Edit</button>
                <button class="secondary-button danger" type="button" data-delete-category="${escapeHtml(category)}">Delete</button>
              </div>
            </div>
          `;
        }).join("")
      : `<p class="empty">Add a category to start organizing products.</p>`;
  }

  categoriesList?.querySelectorAll("[data-edit-category]").forEach((button) => {
    button.addEventListener("click", () => {
      editCategory(button.dataset.editCategory);
    });
  });

  categoriesList?.querySelectorAll("[data-delete-category]").forEach((button) => {
    button.addEventListener("click", async () => {
      await deleteCategory(button.dataset.deleteCategory);
    });
  });
}

async function editCategory(categoryName) {
  categoryForm.elements.id.value = categoryName;
  categoryForm.elements.categoryName.value = categoryName;
  cancelCategoryEdit.hidden = false;
  categoryForm.scrollIntoView({ behavior: "smooth", block: "start" });
}

function resetCategoryForm() {
  categoryForm.reset();
  categoryForm.elements.id.value = "";
  cancelCategoryEdit.hidden = true;
}

categoryForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(categoryForm);
  const existingCategory = String(formData.get("id") || "").trim();
  const categoryName = String(formData.get("categoryName") || "").trim();

  if (!categoryName) {
    alert("Please enter a category name.");
    return;
  }

  if (existingCategory) {
    const { error } = await supabaseClient
      .from("products")
      .update({ category: categoryName, updated_at: new Date().toISOString() })
      .eq("category", existingCategory);

    if (error) {
      alert(`Could not rename category: ${error.message}`);
      return;
    }

    categoryRegistry = categoryRegistry.filter((item) => item !== existingCategory);
    if (!categoryRegistry.includes(categoryName)) {
      categoryRegistry.push(categoryName);
    }
  } else {
    if (!categoryRegistry.includes(categoryName)) {
      categoryRegistry.push(categoryName);
    }
  }

  resetCategoryForm();
  await loadProducts();
  alert(existingCategory ? "Category renamed." : "Category added.");
});

cancelCategoryEdit?.addEventListener("click", resetCategoryForm);

async function deleteCategory(categoryName) {
  const confirmed = confirm(`Remove category "${categoryName}" from the catalog?`);
  if (!confirmed) return;

  const { error } = await supabaseClient
    .from("products")
    .update({ category: null, updated_at: new Date().toISOString() })
    .eq("category", categoryName);

  if (error) {
    alert(`Could not remove category: ${error.message}`);
    return;
  }

  categoryRegistry = categoryRegistry.filter((item) => item !== categoryName);
  await loadProducts();
}

function orderStatusOptions(selectedStatus) {
  const statuses = [
    "Pending",
    "Confirmed",
    "Paid",
    "Shipped",
    "Delivered",
    "Cancelled"
  ];

  return statuses
    .map(
      (status) => `
        <option
          value="${status}"
          ${status === selectedStatus ? "selected" : ""}>
          ${status}
        </option>
      `
    )
    .join("");
}

/* -------------------------
   HELPERS
------------------------- */

function formatCurrency(value) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0
  }).format(Number(value || 0));
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* Start the admin page */
verifyAdmin();
