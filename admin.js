const loginSection = document.querySelector("#loginSection");
const loginForm = document.querySelector("#loginForm");
const loginMessage = document.querySelector("#loginMessage");
const adminContent = document.querySelector("#adminContent");

const settingsForm = document.querySelector("#settingsForm");
const productForm = document.querySelector("#productForm");
const productCategorySelect = document.querySelector("#productCategorySelect");
const newProductCategoryField = document.querySelector("#newProductCategoryField");
const hasVariantsToggle = document.querySelector("#hasVariantsToggle");
const variantManager = document.querySelector("#variantManager");
const variantRows = document.querySelector("#variantRows");
const addVariantButton = document.querySelector("#addVariantButton");
const standardPricingFields = document.querySelector(
  "#standardPricingFields"
);
VariantManager.init({
  productForm,
  hasVariantsToggle,
  variantManager,
  variantRows,
  addVariantButton,
  standardPricingFields,
  supabaseClient,
  uploadProductImage
});
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
const invoiceDialog = document.querySelector("#invoiceDialog");
const invoiceContent = document.querySelector("#invoiceContent");
const formTitle = document.querySelector("#formTitle");
const cancelEdit = document.querySelector("#cancelEdit");
const resetButton = document.querySelector("#resetButton");
const menuForm = document.querySelector("#menuForm");
const menuFormTitle = document.querySelector("#menuFormTitle");
const adminMenuItems = document.querySelector("#adminMenuItems");
const menuOrderStatus = document.querySelector("#menuOrderStatus");
const cancelMenuEdit = document.querySelector("#cancelMenuEdit");
const menuSectionChoice = document.querySelector("#menuSectionChoice");
const newMenuSectionField = document.querySelector("#newMenuSectionField");
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
const categoryProductsEditor = document.querySelector("#categoryProductsEditor");
const categoryProductsList = document.querySelector("#categoryProductsList");
const sidebarLogoutButton = document.querySelector("#sidebarLogoutButton");
const shippingFeeForm = document.querySelector("#shippingFeeForm");
const shippingFeesList = document.querySelector("#shippingFeesList");
const shippingFeesStatus = document.querySelector("#shippingFeesStatus");
const cancelShippingFeeEdit = document.querySelector("#cancelShippingFeeEdit");
const changePasswordForm = document.querySelector("#changePasswordForm");
const signOutAllButton = document.querySelector("#signOutAllButton");
const inviteAdminForm = document.querySelector("#inviteAdminForm");
const adminAccountsList = document.querySelector("#adminAccountsList");
const securityStatus = document.querySelector("#securityStatus");
const inviteRoleField = document.querySelector("#inviteRoleField");
const paymentMethodsNav = document.querySelector("#paymentMethodsNav");
const paymentMethodsSection = document.querySelector("#paymentMethodsSection");
const securityAccountsTab = document.querySelector("#securityAccountsTab");
let currentAdminRole = "admin";
let activeSecurityTab = "accounts";

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
let shippingFees = [];

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

  document.querySelectorAll("[data-security-tab]").forEach((button) => {
    if (button.dataset.bound) return;
    button.dataset.bound = "true";
    button.addEventListener("click", () => setActiveSecurityTab(button.dataset.securityTab));
  });

  document.querySelectorAll("[data-security-tab]").forEach((button) => {
    button.addEventListener("click", () => setActiveSecurityTab(button.dataset.securityTab));
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
  setActiveSecurityTab(activeSecurityTab);

  await ensureSecurityAdminProfile();
  await Promise.all([
    loadSettings(),
    loadProducts(),
    loadMenuItems(),
    loadPaymentMethods(),
    loadShippingFees(),
    loadOrders()
  ]);
  await loadAdminAccounts();
}

function setSecurityStatus(message, isError = false) {
  if (!securityStatus) return;
  securityStatus.textContent = message;
  securityStatus.classList.toggle("security-status-error", isError);
}

function setActiveSecurityTab(tab) {
  activeSecurityTab = tab;
  document.querySelectorAll("[data-security-group]").forEach((element) => {
    element.hidden = element.dataset.securityGroup !== tab;
  });
  document.querySelectorAll("[data-security-tab]").forEach((button) => {
    button.classList.toggle("active", button.dataset.securityTab === tab);
  });
}

async function ensureSecurityAdminProfile() {
  const { error } = await supabaseClient.rpc("bootstrap_current_admin_account");
  if (error) console.warn("Admin security setup is not ready:", error.message);
}

async function callAdminSecurity(action, payload = {}) {
  const { data, error } = await supabaseClient.functions.invoke("admin-security", {
    body: { action, ...payload }
  });
  if (error) throw new Error(error.message || "Security request failed.");
  if (!data?.ok) throw new Error(data?.error || "Security request failed.");
  return data;
}

async function loadAdminAccounts() {
  if (!adminAccountsList) return;
  try {
    const data = await callAdminSecurity("list");
    currentAdminRole = data.current_role || "admin";
    if (inviteRoleField) inviteRoleField.hidden = currentAdminRole !== "owner";
    if (securityAccountsTab) securityAccountsTab.hidden = !["owner", "co_owner"].includes(currentAdminRole);
    if (!["owner", "co_owner"].includes(currentAdminRole)) setActiveSecurityTab("sessions");
    const canManagePayments = ["owner", "co_owner"].includes(currentAdminRole);
    if (paymentMethodsNav) paymentMethodsNav.hidden = !canManagePayments;
    if (paymentMethodsSection) paymentMethodsSection.hidden = !canManagePayments;
    adminAccountsList.innerHTML = data.accounts.map((account) => `
      <article class="admin-account-row">
        <div><strong>${escapeHtml(account.nickname || account.email)}</strong><small>${escapeHtml(account.email)} · ${escapeHtml(account.role === "co_owner" ? "Co-owner" : account.role === "owner" ? "Owner" : "Admin")}${account.suspended_at ? " · Suspended" : account.is_current ? " · This is you" : account.invited_at ? " · Invitation sent" : ""}</small></div>
        <div class="admin-actions">${canManageAccount(account) ? `<button class="secondary-button account-action-button" type="button" data-account-action="nickname" data-admin-account-id="${escapeHtml(account.id)}" data-admin-nickname="${escapeHtml(account.nickname || "")}">Nickname</button>` : ""}${canRemoveAdmin(account) ? `<button class="secondary-button ${account.suspended_at ? "" : "danger"} account-action-button" type="button" data-account-action="${account.suspended_at ? "restore" : "suspend"}" data-admin-account-id="${escapeHtml(account.id)}" data-admin-email="${escapeHtml(account.email)}">${account.suspended_at ? "Unban" : "Suspend"}</button><button class="secondary-button danger remove-admin-button" type="button" data-admin-account-id="${escapeHtml(account.id)}" data-admin-email="${escapeHtml(account.email)}">Remove</button>` : ""}</div>
      </article>`).join("") || `<p class="tiny-note">No additional admin accounts yet.</p>`;
  } catch (error) {
    adminAccountsList.innerHTML = `<p class="tiny-note">Security setup is not ready yet. Run the included SQL and deploy the included function.</p>`;
  }
}

function canRemoveAdmin(account) {
  if (account.is_current || account.role === "owner") return false;
  if (currentAdminRole === "owner") return true;
  return currentAdminRole === "co_owner" && account.role === "admin";
}

function canManageAccount(account) {
  if (!["owner", "co_owner"].includes(currentAdminRole)) return false;
  if (account.is_current) return true;
  return canRemoveAdmin(account);
}

changePasswordForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(changePasswordForm);
  const currentPassword = String(formData.get("currentPassword") || "");
  const newPassword = String(formData.get("newPassword") || "");
  const confirmPassword = String(formData.get("confirmPassword") || "");
  if (newPassword.length < 8) return setSecurityStatus("Use at least 8 characters for the new password.", true);
  if (newPassword !== confirmPassword) return setSecurityStatus("Your new passwords do not match.", true);
  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user?.email) return setSecurityStatus("Please sign in again before changing your password.", true);
  setSecurityStatus("Checking your current password…");
  const { error: signInError } = await supabaseClient.auth.signInWithPassword({ email: user.email, password: currentPassword });
  if (signInError) return setSecurityStatus("Your current password is not correct.", true);
  const { error } = await supabaseClient.auth.updateUser({ password: newPassword });
  if (error) return setSecurityStatus(error.message, true);
  changePasswordForm.reset();
  setSecurityStatus("Password changed. For safety, log out all devices next.");
});

signOutAllButton?.addEventListener("click", async () => {
  if (!window.confirm("Log out this admin account on every device? You will be signed out too.")) return;
  try {
    setSecurityStatus("Ending all sessions…");
    await callAdminSecurity("signout-all");
    await supabaseClient.auth.signOut();
    await showLogin("All devices have been logged out. Please sign in again.");
  } catch (error) { setSecurityStatus(error.message, true); }
});

inviteAdminForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    const formData = new FormData(inviteAdminForm);
    const email = String(formData.get("email") || "").trim();
    const role = currentAdminRole === "owner" ? String(formData.get("role") || "admin") : "admin";
    setSecurityStatus("Sending invitation…");
    const result = await callAdminSecurity("invite", { email, role, redirectTo: `${window.location.origin}/admin.html` });
    inviteAdminForm.reset();
    setSecurityStatus(result.restored_existing_account ? "Existing account restored successfully." : "Invitation sent successfully.");
    await loadAdminAccounts();
  } catch (error) { setSecurityStatus(error.message, true); }
});

adminAccountsList?.addEventListener("click", async (event) => {
  const actionButton = event.target.closest(".account-action-button");
  if (actionButton?.dataset.accountAction === "nickname") {
    const nickname = window.prompt("Nickname for this account (optional):", actionButton.dataset.adminNickname || "");
    if (nickname === null) return;
    try { await callAdminSecurity("update-account", { id: actionButton.dataset.adminAccountId, nickname }); await loadAdminAccounts(); }
    catch (error) { setSecurityStatus(error.message, true); }
    return;
  }
  if (actionButton && ["suspend", "restore"].includes(actionButton.dataset.accountAction)) {
    const isSuspending = actionButton.dataset.accountAction === "suspend";
    if (!window.confirm(`${isSuspending ? "Suspend" : "restore"} ${actionButton.dataset.adminEmail || "this account"}?`)) return;
    try { await callAdminSecurity("set-suspension", { id: actionButton.dataset.adminAccountId, suspended: isSuspending }); await loadAdminAccounts(); }
    catch (error) { setSecurityStatus(error.message, true); }
    return;
  }
  const button = event.target.closest(".remove-admin-button");
  if (!button || !window.confirm(`Remove ${button.dataset.adminEmail} as an admin? They will no longer have access.`)) return;
  try {
    setSecurityStatus("Removing admin access…");
    await callAdminSecurity("remove", { id: button.dataset.adminAccountId });
    setSecurityStatus("Admin access removed.");
    await loadAdminAccounts();
  } catch (error) { setSecurityStatus(error.message, true); }
});

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
  if (sidebarLogoutButton && !sidebarLogoutButton.dataset.bound) {
    sidebarLogoutButton.dataset.bound = "true";
    sidebarLogoutButton.addEventListener("click", async () => {
      await supabaseClient.auth.signOut();
      await showLogin("You have been logged out.");
    });
  }

  document.querySelectorAll("[data-settings-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      setActiveSettingsTab(button.dataset.settingsTab);
    });
  });

  document.querySelectorAll("[data-security-tab]").forEach((button) => {
    if (button.dataset.bound) return;
    button.dataset.bound = "true";
    button.addEventListener("click", () => setActiveSecurityTab(button.dataset.securityTab));
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

  // Load saved category order
  if (data?.category_order && Array.isArray(data.category_order)) {
    categoryOrder = data.category_order;
  } else {
    categoryOrder = [];
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
  settingsForm.elements.heroEyebrow.value = data.hero_eyebrow || "";
  settingsForm.elements.heroTitle.value = data.hero_title || "";
  settingsForm.elements.heroSubtitle.value = data.hero_subtitle || "";
  settingsForm.elements.catalogEyebrow.value =
    data.catalog_eyebrow || "OUR COLLECTION";
  settingsForm.elements.catalogTitle.value =
    data.catalog_title || "Find your new favorite";
  settingsForm.elements.catalogSubtitle.value =
    data.catalog_subtitle || "Sweet little picks, chosen just for you.";
  if (settingsForm.elements.menuTagline) {
    settingsForm.elements.menuTagline.value =
      data.menu_tagline || "Everything lovely, in one place";
  }
  settingsForm.elements.facebook.value = data.facebook_url || "";
  settingsForm.elements.tiktok.value = data.tiktok_url || "";
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
    hero_eyebrow: settingsForm.elements.heroEyebrow.value,
    hero_title: String(formData.get("heroTitle") || "").trim(),
    hero_subtitle: String(formData.get("heroSubtitle") || "").trim(),
    catalog_eyebrow:
      String(formData.get("catalogEyebrow") || "").trim() ||
      "OUR COLLECTION",
    catalog_title:
      String(formData.get("catalogTitle") || "").trim() ||
      "Find your new favorite",
    catalog_subtitle:
      String(formData.get("catalogSubtitle") || "").trim() ||
      "Sweet little picks, chosen just for you.",
    menu_tagline:
      String(formData.get("menuTagline") || "").trim() ||
      "Everything lovely, in one place",
    facebook_url:
      String(formData.get("facebook") || "").trim() || null,
    tiktok_url:
      String(formData.get("tiktok") || "").trim() || null,
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
   SHIPPING FEES
------------------------ */

function setShippingFeesStatus(message = "", state = "") {
  if (!shippingFeesStatus) return;
  shippingFeesStatus.textContent = message;
  shippingFeesStatus.dataset.state = state;
}

function resetShippingFeeForm() {
  if (!shippingFeeForm) return;
  shippingFeeForm.reset();
  shippingFeeForm.elements.id.value = "";
  shippingFeeForm.elements.isActive.checked = true;
  cancelShippingFeeEdit.hidden = true;
}

async function loadShippingFees() {
  if (!shippingFeesList) return;

  shippingFeesList.innerHTML = `<p class="empty">Loading shipping fees…</p>`;

  const { data, error } = await supabaseClient
    .from("shipping_fees")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("id", { ascending: true });

  if (error) {
    shippingFees = [];
    shippingFeesList.innerHTML = `
      <div class="shipping-fees-setup-note">
        <strong>Shipping fees are not connected yet.</strong>
        <p>Run <code>buyer-checkout-settings.sql</code> once in Supabase, then refresh this page.</p>
      </div>
    `;
    setShippingFeesStatus(error.message, "error");
    return;
  }

  shippingFees = data || [];
  setShippingFeesStatus("");
  renderShippingFees();
}

function renderShippingFees() {
  if (!shippingFeesList) return;

  if (!shippingFees.length) {
    shippingFeesList.innerHTML = `
      <p class="empty">No shipping fees yet. Add your first delivery choice above.</p>
    `;
    return;
  }

  shippingFeesList.innerHTML = shippingFees
    .map((fee, index) => `
      <article class="shipping-fee-admin-card${fee.is_active ? "" : " is-hidden"}" data-shipping-fee-id="${fee.id}">
        <div class="shipping-fee-admin-order" aria-label="Shipping fee position">${index + 1}</div>
        <div class="shipping-fee-admin-copy">
          <strong>${escapeHtml(fee.label || "Delivery area")}</strong>
          <span>${formatCurrency(fee.amount || 0)}</span>
          <small>${fee.is_active ? "Visible at checkout" : "Hidden from checkout"}</small>
        </div>
        <div class="admin-actions shipping-fee-actions">
          <button class="secondary-button" type="button" data-shipping-move="up" data-shipping-id="${fee.id}" ${index === 0 ? "disabled" : ""} aria-label="Move ${escapeHtml(fee.label)} up">↑</button>
          <button class="secondary-button" type="button" data-shipping-move="down" data-shipping-id="${fee.id}" ${index === shippingFees.length - 1 ? "disabled" : ""} aria-label="Move ${escapeHtml(fee.label)} down">↓</button>
          <button class="secondary-button" type="button" data-shipping-edit="${fee.id}">Edit</button>
          <button class="secondary-button" type="button" data-shipping-toggle="${fee.id}">${fee.is_active ? "Hide" : "Show"}</button>
          <button class="secondary-button danger" type="button" data-shipping-delete="${fee.id}">Delete</button>
        </div>
      </article>
    `)
    .join("");
}

function editShippingFee(feeId) {
  const fee = shippingFees.find((item) => String(item.id) === String(feeId));
  if (!fee || !shippingFeeForm) return;

  shippingFeeForm.elements.id.value = fee.id;
  shippingFeeForm.elements.label.value = fee.label || "";
  shippingFeeForm.elements.amount.value = Number(fee.amount || 0);
  shippingFeeForm.elements.isActive.checked = Boolean(fee.is_active);
  cancelShippingFeeEdit.hidden = false;
  shippingFeeForm.scrollIntoView({ behavior: "smooth", block: "center" });
  shippingFeeForm.elements.label.focus({ preventScroll: true });
}

async function toggleShippingFee(feeId) {
  const fee = shippingFees.find((item) => String(item.id) === String(feeId));
  if (!fee) return;

  setShippingFeesStatus("Saving shipping fee…", "saving");
  const { error } = await supabaseClient
    .from("shipping_fees")
    .update({
      is_active: !fee.is_active,
      updated_at: new Date().toISOString()
    })
    .eq("id", fee.id);

  if (error) {
    setShippingFeesStatus(`Could not update shipping fee: ${error.message}`, "error");
    return;
  }

  await loadShippingFees();
  setShippingFeesStatus("Shipping fee updated ✓", "saved");
}

async function deleteShippingFee(feeId) {
  const fee = shippingFees.find((item) => String(item.id) === String(feeId));
  if (!fee) return;
  if (!confirm(`Delete the shipping fee “${fee.label}”?`)) return;

  setShippingFeesStatus("Deleting shipping fee…", "saving");
  const { error } = await supabaseClient
    .from("shipping_fees")
    .delete()
    .eq("id", fee.id);

  if (error) {
    setShippingFeesStatus(`Could not delete shipping fee: ${error.message}`, "error");
    return;
  }

  resetShippingFeeForm();
  await loadShippingFees();
  setShippingFeesStatus("Shipping fee deleted ✓", "saved");
}

async function moveShippingFee(feeId, direction) {
  const currentIndex = shippingFees.findIndex(
    (item) => String(item.id) === String(feeId)
  );
  const targetIndex = currentIndex + (direction === "up" ? -1 : 1);

  if (currentIndex < 0 || targetIndex < 0 || targetIndex >= shippingFees.length) {
    return;
  }

  const reordered = [...shippingFees];
  const [movedFee] = reordered.splice(currentIndex, 1);
  reordered.splice(targetIndex, 0, movedFee);
  setShippingFeesStatus("Saving shipping fee order…", "saving");

  for (let index = 0; index < reordered.length; index += 1) {
    const { error } = await supabaseClient
      .from("shipping_fees")
      .update({
        sort_order: (index + 1) * 10,
        updated_at: new Date().toISOString()
      })
      .eq("id", reordered[index].id);

    if (error) {
      setShippingFeesStatus(`Could not reorder shipping fees: ${error.message}`, "error");
      await loadShippingFees();
      return;
    }
  }

  await loadShippingFees();
  setShippingFeesStatus("Shipping fee order saved ✓", "saved");
}

shippingFeeForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(shippingFeeForm);
  const id = String(formData.get("id") || "").trim();
  const label = String(formData.get("label") || "").trim();
  const amount = Number(formData.get("amount"));

  if (!label || !Number.isFinite(amount) || amount < 0) {
    setShippingFeesStatus("Enter a delivery label and a valid fee amount.", "error");
    return;
  }

  const values = {
    label,
    amount,
    is_active: formData.get("isActive") === "on",
    updated_at: new Date().toISOString()
  };

  setShippingFeesStatus("Saving shipping fee…", "saving");

  let error;
  if (id) {
    ({ error } = await supabaseClient
      .from("shipping_fees")
      .update(values)
      .eq("id", id));
  } else {
    values.sort_order = shippingFees.length
      ? Math.max(...shippingFees.map((fee) => Number(fee.sort_order || 0))) + 10
      : 10;
    ({ error } = await supabaseClient
      .from("shipping_fees")
      .insert(values));
  }

  if (error) {
    setShippingFeesStatus(`Could not save shipping fee: ${error.message}`, "error");
    return;
  }

  resetShippingFeeForm();
  await loadShippingFees();
  setShippingFeesStatus("Shipping fee saved ✓", "saved");
});

cancelShippingFeeEdit?.addEventListener("click", () => {
  resetShippingFeeForm();
  setShippingFeesStatus("");
});

shippingFeesList?.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  if (button.dataset.shippingEdit) {
    editShippingFee(button.dataset.shippingEdit);
  } else if (button.dataset.shippingToggle) {
    toggleShippingFee(button.dataset.shippingToggle);
  } else if (button.dataset.shippingDelete) {
    deleteShippingFee(button.dataset.shippingDelete);
  } else if (button.dataset.shippingMove) {
    moveShippingFee(button.dataset.shippingId, button.dataset.shippingMove);
  }
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
  updateMenuSectionChoices();
  renderMenuItems();
}

function getMenuGroups(items = menuItems) {
  const groups = [];
  const bySection = new Map();

  items.forEach((item) => {
    const section = String(item.section || "Menu").trim() || "Menu";
    if (!bySection.has(section)) {
      const group = { section, items: [] };
      bySection.set(section, group);
      groups.push(group);
    }
    bySection.get(section).items.push(item);
  });

  return groups;
}

function updateMenuSectionChoices(selectedValue = "") {
  if (!menuSectionChoice) return;

  const sections = getMenuGroups().map((group) => group.section);
  const selected = String(selectedValue || "").trim();

  if (selected && selected !== "__new__" && !sections.includes(selected)) {
    sections.push(selected);
  }

  menuSectionChoice.innerHTML = `
    <option value="">Choose an active menu header</option>
    ${sections.map((section) => `
      <option value="${escapeHtml(section)}">${escapeHtml(section)}</option>
    `).join("")}
    <option value="__new__">＋ Create new menu header…</option>
  `;
  menuSectionChoice.value = selected || "";
  toggleNewMenuSectionField();
}

function toggleNewMenuSectionField() {
  if (!newMenuSectionField || !menuSectionChoice) return;
  const creatingNew = menuSectionChoice.value === "__new__";
  newMenuSectionField.hidden = !creatingNew;
  const input = menuForm?.elements.newSection;
  if (input) {
    input.required = creatingNew;
    if (!creatingNew) input.value = "";
  }
}

menuSectionChoice?.addEventListener("change", toggleNewMenuSectionField);

function renderMenuItems() {
  if (!menuItems.length) {
    adminMenuItems.innerHTML =
      `<p class="empty">No menu items yet.</p>`;
    updateMenuSectionChoices();
    return;
  }

  adminMenuItems.innerHTML = getMenuGroups()
    .map((group) => `
      <section class="menu-admin-group" data-menu-section="${escapeHtml(group.section)}">
        <header class="menu-admin-group-header">
          <button
            class="menu-group-drag-handle"
            type="button"
            draggable="true"
            aria-label="Drag ${escapeHtml(group.section)} header to reorder"
            title="Drag this whole menu header to reorder it"
          ><span aria-hidden="true">⋮⋮</span></button>
          <div class="menu-admin-group-title">
            <strong>${escapeHtml(group.section)}</strong>
            <small>${group.items.length} ${group.items.length === 1 ? "link" : "links"}</small>
          </div>
          <button
            class="secondary-button"
            type="button"
            data-menu-section-edit="${escapeHtml(group.section)}"
          >Rename header</button>
        </header>
        <div class="menu-admin-group-items">
          ${group.items.map((item) => `
            <article
              class="admin-product menu-admin-item"
              data-menu-id="${item.id}"
              data-menu-section="${escapeHtml(group.section)}"
            >
              <button
                class="menu-drag-handle"
                type="button"
                draggable="true"
                aria-label="Drag ${escapeHtml(item.label)} to reorder inside ${escapeHtml(group.section)}"
                title="Drag to reorder inside this header"
              ><span aria-hidden="true">⋮⋮</span></button>
              <div class="menu-admin-info">
                <strong>${escapeHtml(item.label)}</strong>
                <div class="menu-url">${escapeHtml(item.url)}</div>
                <small>
                  ${item.is_visible ? "Visible" : "Hidden"}
                  · ${item.open_new_tab ? "New tab" : "Same tab"}
                </small>
              </div>
              <div class="admin-actions">
                <button class="secondary-button" type="button" data-menu-edit="${item.id}">Edit</button>
                <button class="secondary-button danger" type="button" data-menu-delete="${item.id}">Delete</button>
              </div>
            </article>
          `).join("")}
        </div>
      </section>
    `)
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

  adminMenuItems
    .querySelectorAll("[data-menu-section-edit]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        renameMenuSection(button.dataset.menuSectionEdit);
      });
    });

  initMenuItemDragDrop();
  initMenuGroupDragDrop();
}

let draggedMenuItemId = null;
let draggedMenuSection = null;

function setMenuOrderStatus(message, state = "") {
  if (!menuOrderStatus) return;

  menuOrderStatus.textContent = message;
  menuOrderStatus.dataset.state = state;
}

async function saveMenuItemOrder(orderedItems) {
  menuItems = orderedItems;
  setMenuOrderStatus("Saving menu order…", "saving");

  for (let index = 0; index < orderedItems.length; index += 1) {
    const item = orderedItems[index];
    const sortOrder = (index + 1) * 10;

    const { error } = await supabaseClient
      .from("menu_items")
      .update({ sort_order: sortOrder })
      .eq("id", item.id);

    if (error) {
      console.error("Could not save menu order:", error);
      setMenuOrderStatus("Could not save the new order. Please try again.", "error");
      await loadMenuItems();
      return;
    }

    item.sort_order = sortOrder;
  }

  setMenuOrderStatus("Menu order saved ✓", "saved");
  renderMenuItems();
}

async function moveMenuItemByKeyboard(itemId, direction) {
  const item = menuItems.find((entry) => String(entry.id) === String(itemId));
  if (!item) return;

  const groups = getMenuGroups();
  const group = groups.find(
    (entry) => entry.section === String(item.section || "Menu").trim()
  );
  if (!group) return;

  const currentIndex = group.items.findIndex(
    (entry) => String(entry.id) === String(itemId)
  );
  const targetIndex = currentIndex + direction;

  if (
    currentIndex < 0 ||
    targetIndex < 0 ||
    targetIndex >= group.items.length
  ) {
    return;
  }

  const [movedItem] = group.items.splice(currentIndex, 1);
  group.items.splice(targetIndex, 0, movedItem);
  await saveMenuItemOrder(groups.flatMap((entry) => entry.items));

  Array.from(adminMenuItems?.querySelectorAll(".menu-admin-item") || [])
    .find((card) => String(card.dataset.menuId) === String(itemId))
    ?.querySelector(".menu-drag-handle")
    ?.focus();
}

function initMenuItemDragDrop() {
  const cards = Array.from(adminMenuItems?.querySelectorAll(".menu-admin-item") || []);

  cards.forEach((card) => {
    const handle = card.querySelector(".menu-drag-handle");

    handle?.addEventListener("dragstart", (event) => {
      draggedMenuItemId = card.dataset.menuId;
      card.classList.add("menu-dragging");
      handle.setAttribute("aria-grabbed", "true");
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", draggedMenuItemId);
    });

    handle?.addEventListener("dragend", () => {
      draggedMenuItemId = null;
      handle.removeAttribute("aria-grabbed");
      cards.forEach((itemCard) => {
        itemCard.classList.remove("menu-dragging", "menu-drag-over");
      });
    });

    handle?.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;

      event.preventDefault();
      moveMenuItemByKeyboard(
        card.dataset.menuId,
        event.key === "ArrowUp" ? -1 : 1
      );
    });

    card.addEventListener("dragover", (event) => {
      const draggedCard = cards.find(
        (entry) => String(entry.dataset.menuId) === String(draggedMenuItemId)
      );
      if (
        !draggedMenuItemId ||
        draggedMenuItemId === card.dataset.menuId ||
        draggedCard?.dataset.menuSection !== card.dataset.menuSection
      ) {
        return;
      }

      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
      cards.forEach((itemCard) => itemCard.classList.remove("menu-drag-over"));
      card.classList.add("menu-drag-over");
    });

    card.addEventListener("dragleave", () => {
      card.classList.remove("menu-drag-over");
    });

    card.addEventListener("drop", async (event) => {
      event.preventDefault();
      card.classList.remove("menu-drag-over");

      if (!draggedMenuItemId || draggedMenuItemId === card.dataset.menuId) {
        return;
      }

      const groups = getMenuGroups();
      const group = groups.find((entry) => entry.section === card.dataset.menuSection);
      if (!group) return;

      const fromIndex = group.items.findIndex(
        (item) => String(item.id) === String(draggedMenuItemId)
      );
      let targetIndex = group.items.findIndex(
        (item) => String(item.id) === String(card.dataset.menuId)
      );

      if (fromIndex < 0 || targetIndex < 0) return;

      const [movedItem] = group.items.splice(fromIndex, 1);
      targetIndex = group.items.findIndex(
        (item) => String(item.id) === String(card.dataset.menuId)
      );

      const cardRect = card.getBoundingClientRect();
      const placeAfter = event.clientY > cardRect.top + cardRect.height / 2;
      group.items.splice(targetIndex + (placeAfter ? 1 : 0), 0, movedItem);

      draggedMenuItemId = null;
      await saveMenuItemOrder(groups.flatMap((entry) => entry.items));
    });
  });
}

async function moveMenuGroupByKeyboard(section, direction) {
  const groups = getMenuGroups();
  const currentIndex = groups.findIndex((group) => group.section === section);
  const targetIndex = currentIndex + direction;
  if (currentIndex < 0 || targetIndex < 0 || targetIndex >= groups.length) return;

  const [movedGroup] = groups.splice(currentIndex, 1);
  groups.splice(targetIndex, 0, movedGroup);
  await saveMenuItemOrder(groups.flatMap((group) => group.items));

  Array.from(adminMenuItems?.querySelectorAll(".menu-admin-group") || [])
    .find((group) => group.dataset.menuSection === section)
    ?.querySelector(".menu-group-drag-handle")
    ?.focus();
}

function initMenuGroupDragDrop() {
  const groups = Array.from(adminMenuItems?.querySelectorAll(".menu-admin-group") || []);

  groups.forEach((group) => {
    const handle = group.querySelector(".menu-group-drag-handle");

    handle?.addEventListener("dragstart", (event) => {
      draggedMenuSection = group.dataset.menuSection;
      group.classList.add("menu-group-dragging");
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", draggedMenuSection);
    });

    handle?.addEventListener("dragend", () => {
      draggedMenuSection = null;
      groups.forEach((entry) => entry.classList.remove("menu-group-dragging", "menu-group-drag-over"));
    });

    handle?.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
      event.preventDefault();
      moveMenuGroupByKeyboard(
        group.dataset.menuSection,
        event.key === "ArrowUp" ? -1 : 1
      );
    });

    group.addEventListener("dragover", (event) => {
      if (!draggedMenuSection || draggedMenuSection === group.dataset.menuSection) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
      groups.forEach((entry) => entry.classList.remove("menu-group-drag-over"));
      group.classList.add("menu-group-drag-over");
    });

    group.addEventListener("dragleave", (event) => {
      if (!group.contains(event.relatedTarget)) group.classList.remove("menu-group-drag-over");
    });

    group.addEventListener("drop", async (event) => {
      if (!draggedMenuSection || draggedMenuSection === group.dataset.menuSection) return;
      event.preventDefault();
      const orderedGroups = getMenuGroups();
      const fromIndex = orderedGroups.findIndex((entry) => entry.section === draggedMenuSection);
      let targetIndex = orderedGroups.findIndex((entry) => entry.section === group.dataset.menuSection);
      if (fromIndex < 0 || targetIndex < 0) return;

      const [movedGroup] = orderedGroups.splice(fromIndex, 1);
      targetIndex = orderedGroups.findIndex((entry) => entry.section === group.dataset.menuSection);
      const bounds = group.getBoundingClientRect();
      const placeAfter = event.clientY > bounds.top + bounds.height / 2;
      orderedGroups.splice(targetIndex + (placeAfter ? 1 : 0), 0, movedGroup);
      draggedMenuSection = null;
      await saveMenuItemOrder(orderedGroups.flatMap((entry) => entry.items));
    });
  });
}

async function renameMenuSection(section) {
  const newName = prompt(`Rename menu header "${section}" to:`, section);
  if (newName === null) return;
  const cleanName = newName.trim();
  if (!cleanName || cleanName === section) return;

  const { error } = await supabaseClient
    .from("menu_items")
    .update({ section: cleanName })
    .eq("section", section);

  if (error) {
    alert(`Could not rename menu header: ${error.message}`);
    return;
  }

  await loadMenuItems();
  alert("Menu header renamed.");
}
menuForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(menuForm);
  const sectionChoice = String(formData.get("sectionChoice") || "").trim();
  const section = sectionChoice === "__new__"
    ? String(formData.get("newSection") || "").trim()
    : sectionChoice;

  if (!section) {
    alert("Please choose an active menu header or create a new one.");
    return;
  }

  const updates = {
    label: String(formData.get("label") || "").trim(),
    url: String(formData.get("url") || "").trim(),
    section,
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
  updateMenuSectionChoices();
});
function editMenuItem(id) {
  const item = menuItems.find((m) => String(m.id) === String(id));
  if (!item) return;

  menuForm.elements.id.value = item.id;
  menuForm.elements.label.value = item.label || "";
  menuForm.elements.url.value = item.url || "";
  updateMenuSectionChoices(item.section || "Menu");
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
  updateMenuSectionChoices();
  menuFormTitle.textContent = "Add menu item";
  cancelMenuEdit.hidden = true;
});

async function deleteMenuItem(id) {
  const item = menuItems.find((m) => String(m.id) === String(id));

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
    deposit_percentage:
  formData.get("deposit_percentage") !== ""
    ? Number(formData.get("deposit_percentage"))
    : 0,
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
   console.log("data received:", data);
   console.log("length:", data?.length);
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
  const categories = getActiveCategories();
  const currentValue = productsCategoryFilter?.value || "all";
  if (productsCategoryFilter) {
    productsCategoryFilter.innerHTML = `<option value="all">All categories</option>${categories.map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`).join("")}`;
    productsCategoryFilter.value = currentValue && categories.includes(currentValue) ? currentValue : "all";
  }

  updateProductCategoryChoices(productCategorySelect?.value || "");
}

function getActiveCategories() {
  const categories = Array.from(new Set([
    ...categoryRegistry,
    ...products.map((product) => String(product.category || "").trim()).filter(Boolean)
  ]));

  const savedOrder = Array.isArray(categoryOrder)
    ? categoryOrder.filter((category) => categories.includes(category))
    : [];

  return [
    ...savedOrder,
    ...categories.filter((category) => !savedOrder.includes(category)).sort()
  ];
}

function updateProductCategoryChoices(selectedValue = "") {
  if (!productCategorySelect) return;

  const categories = getActiveCategories();
  const selected = String(selectedValue || "").trim();
  const options = [...categories];

  if (selected && selected !== "__new__" && !options.includes(selected)) {
    options.push(selected);
  }

  productCategorySelect.innerHTML = `
    <option value="">Choose an active category</option>
    ${options.map((category) => `
      <option value="${escapeHtml(category)}">${escapeHtml(category)}</option>
    `).join("")}
    <option value="__new__">＋ Create new category…</option>
  `;

  productCategorySelect.value = selected || "";
  toggleNewProductCategoryField();
}

function toggleNewProductCategoryField() {
  if (!newProductCategoryField || !productCategorySelect) return;
  const creatingNew = productCategorySelect.value === "__new__";
  newProductCategoryField.hidden = !creatingNew;
  const input = productForm?.elements.newCategory;
  if (input) {
    input.required = creatingNew;
    if (!creatingNew) input.value = "";
  }
}

productCategorySelect?.addEventListener("change", toggleNewProductCategoryField);

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
                      let basePrice = Number(formData.get("price"));
let baseStock = Number(formData.get("stock"));

if (VariantManager.isEnabled()) {
  try {
    const variants = VariantManager.collect();

    const defaultVariant =
      variants.find((variant) => variant.isDefault) ||
      variants[0];

    basePrice = defaultVariant.price;

    baseStock = variants.reduce(
      (total, variant) =>
        total + (variant.isActive ? variant.stock : 0),
      0
    );
  } catch (variantError) {
    alert(variantError.message);
    return;
  }
}
const categoryChoice = String(formData.get("category") || "").trim();
const categoryValue = categoryChoice === "__new__"
  ? String(formData.get("newCategory") || "").trim()
  : categoryChoice;

if (!categoryValue) {
  alert("Please choose an active category or create a new one.");
  return;
}
  const product = {
    name: String(formData.get("name") || "").trim(),
   price: basePrice,
   stock: baseStock,
   category: categoryValue,
    image_url: productImageUrl || null,
    description:
      String(formData.get("description") || "").trim() || null,
    is_visible: true,
    updated_at: new Date().toISOString()
  };

  let savedProductId = id;

if (id) {
  const { error } = await supabaseClient
    .from("products")
    .update(product)
    .eq("id", id);

  if (error) {
    alert(`Could not save product: ${error.message}`);
    return;
  }
} else {
  const { data, error } = await supabaseClient
    .from("products")
    .insert(product)
    .select("id")
    .single();

  if (error) {
    alert(`Could not save product: ${error.message}`);
    return;
  }

  savedProductId = data.id;
}

try {
  await VariantManager.save(savedProductId);
} catch (variantError) {
  alert(
    `The product was saved, but its variants could not be saved: ${
      variantError.message || "Unknown error"
    }`
  );
  return;
}

resetProductForm();
await loadProducts();

alert(
  id
    ? "Product and variants updated online."
    : "Product and variants added online."
);
});
async function editProduct(id) {
  const product = products.find((item) => String(item.id) === String(id));

  if (!product) return;

try {
  await VariantManager.load(product.id);
} catch (variantError) {
  alert(
    `Could not load product variants: ${
      variantError.message || "Unknown error"
    }`
  );
}
  productForm.elements.id.value = product.id;
  productForm.elements.name.value = product.name || "";
  productForm.elements.price.value = product.price ?? 0;
  productForm.elements.stock.value = product.stock ?? 0;
  updateProductCategoryChoices(product.category || "");
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
  const product = products.find((item) => String(item.id) === String(id));

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
  updateProductCategoryChoices("");
  VariantManager.reset();
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
  renderDashboard();
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
  try {
    const approvingPayment = paymentStatus === "Approved";
    const rejectingPayment = paymentStatus === "Rejected";
    const { data: order, error: orderError } = await supabaseClient
      .from("orders")
      .select("id, payment_status, stock_deducted")
      .eq("id", id)
      .single();

    if (orderError) {
      throw orderError;
    }
const reversingApprovedPayment =
  rejectingPayment &&
  order.payment_status === "Approved" &&
  order.stock_deducted;

if (reversingApprovedPayment) {
  const confirmed = confirm(
    "Reject this approved payment? The deducted inventory will be restored."
  );

  if (!confirmed) {
    return;
  }
}
    /*
     * Deduct inventory only when payment is approved
     * and only if this order has not deducted stock before.
     */
    if (approvingPayment && !order.stock_deducted) {
      const { data: orderItems, error: itemsError } =
        await supabaseClient
          .from("order_items")
          .select(
            "product_id, variant_id, quantity"
          )
          .eq("order_id", id);

      if (itemsError) {
        throw itemsError;
      }

      for (const item of orderItems || []) {
        const orderedQuantity = Number(item.quantity || 0);
const variantId =
  item.variant_id && String(item.variant_id) !== "null"
    ? item.variant_id
    : null;

const productId =
  item.product_id && String(item.product_id) !== "null"
    ? item.product_id
    : null;
        if (orderedQuantity < 1) continue;

        if (variantId) {
          const { data: variant, error: variantError } =
            await supabaseClient
              .from("product_variants")
              .select("id, stock")
              .eq("id", variantId)
              .single();

          if (variantError) {
            throw variantError;
          }

          const currentStock = Number(variant.stock || 0);

          if (orderedQuantity > currentStock) {
            throw new Error(
              `Not enough variant stock. Available: ${currentStock}, ordered: ${orderedQuantity}.`
            );
          }

          const { error: variantUpdateError } =
            await supabaseClient
              .from("product_variants")
              .update({
                stock: currentStock - orderedQuantity,
                updated_at: new Date().toISOString()
              })
              .eq("id", variantId);

          if (variantUpdateError) {
            throw variantUpdateError;
          }
        } else if (productId) {
          const { data: product, error: productError } =
            await supabaseClient
              .from("products")
              .select("id, stock")
              .eq("id", productId)
              .single();

          if (productError) {
            throw productError;
          }

          const currentStock = Number(product.stock || 0);

          if (orderedQuantity > currentStock) {
            throw new Error(
              `Not enough product stock. Available: ${currentStock}, ordered: ${orderedQuantity}.`
            );
          }

          const { error: productUpdateError } =
            await supabaseClient
              .from("products")
              .update({
                stock: currentStock - orderedQuantity,
                updated_at: new Date().toISOString()
              })
              .eq("id", productId);

          if (productUpdateError) {
            throw productUpdateError;
          }
        }
      }
    }
/*
 * Restore inventory when an approved payment is changed to rejected.
 */
if (reversingApprovedPayment) {
  const { data: orderItems, error: itemsError } =
    await supabaseClient
      .from("order_items")
      .select("product_id, variant_id, quantity")
      .eq("order_id", id);

  if (itemsError) {
    throw itemsError;
  }

  for (const item of orderItems || []) {
    const orderedQuantity = Number(item.quantity || 0);

    const variantId =
   item.variant_id && String(item.variant_id) !== "null"
    ? item.variant_id
    : null;

   const productId =
   item.product_id && String(item.product_id) !== "null"
    ? item.product_id
    : null;

    if (orderedQuantity < 1) continue;

    if (variantId) {
       const { data: variant, error: variantError } =
  await supabaseClient
    .from("product_variants")
    .select("id, stock")
    .eq("id", variantId)
    .single();

      if (variantError) {
        throw variantError;
      }

      const currentStock = Number(variant.stock || 0);

      const { error: variantUpdateError } =
        await supabaseClient
          .from("product_variants")
          .update({
            stock: currentStock + orderedQuantity,
            updated_at: new Date().toISOString()
          })
          .eq("id", variantId);

      if (variantUpdateError) {
        throw variantUpdateError;
      }
    } else if (productId) {
      const { data: product, error: productError } =
        await supabaseClient
          .from("products")
          .select("id, stock")
          .eq("id", productId)
          .single();

      if (productError) {
        throw productError;
      }

      const currentStock = Number(product.stock || 0);

      const { error: productUpdateError } =
        await supabaseClient
          .from("products")
          .update({
            stock: currentStock + orderedQuantity,
            updated_at: new Date().toISOString()
          })
          .eq("id", productId);

      if (productUpdateError) {
        throw productUpdateError;
      }
    }
  }
}
    const updatePayload = {
      payment_status: paymentStatus,
      updated_at: new Date().toISOString()
    };

    if (approvingPayment && !order.stock_deducted) {
      updatePayload.stock_deducted = true;
    }
     if (reversingApprovedPayment) {
  updatePayload.stock_deducted = false;
}
    const { error: updateError } = await supabaseClient
      .from("orders")
      .update(updatePayload)
      .eq("id", id);

    if (updateError) {
      throw updateError;
    }

    await loadOrders();

    alert(
      approvingPayment
        ? "Payment approved and stock updated."
        : `Payment marked as ${paymentStatus}.`
    );
  } catch (error) {
    alert(
      `Could not update payment status: ${
        error.message || "Unknown error"
      }`
    );
  }
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
        const orderedAt = order.created_at
  ? new Date(order.created_at).toLocaleString("en-PH", {
      timeZone: "Asia/Manila",
      month: "numeric",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true
    })
  : "—";
        const orderItems = orderItemsByOrder[String(order.id)] || [];
        const orderTotals = orderItems.reduce(
  (sum, item) => sum + Number(item.line_total || 0),
  0
);
        const productsLabel = `Products (${orderItems.length})`;
        const productRows = orderItems.length
          ? orderItems
              .map((item) => `
                <div class="order-product-row">
                  <div>
  <strong>${escapeHtml(item.product_name || "Product")}</strong>

  ${
    item.variant_name
      ? `
        <div class="tiny-note">
          Variant: ${escapeHtml(item.variant_name)}
        </div>
      `
      : ""
  }

  ${
    item.variant_sku
      ? `
        <div class="tiny-note">
          SKU: ${escapeHtml(item.variant_sku)}
        </div>
      `
      : ""
  }

  <div class="tiny-note">
    Qty: ${Number(item.quantity || 0)}
  </div>
</div>
<div class="order-product-prices">
  <span>${formatCurrency(item.line_total || 0)}</span>
</div>
                </div>
              `)
              .join("")
          : `<div class="tiny-note">No products found</div>`;

    const shippingLines = [
        [order.house_unit, order.street].filter(Boolean).join(", "),
        order.barangay ? `Brgy. ${order.barangay}` : "",
        [order.city, order.province].filter(Boolean).join(", "),
        order.zipcode || ""
    ].filter(Boolean);

    const shippingAddress = shippingLines.length
        ? shippingLines.map((line) => escapeHtml(line)).join("<br>")
        : escapeHtml(order.address || "—");
    const paymentStatus = String(order.payment_status || "Pending");
    const paymentStatusClass = paymentStatus
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-");

    return `
        <article class="order-card">
            <header class="order-card-header">
              <div>
                <span class="order-card-label">Order</span>
                <strong class="order-reference">${escapeHtml(getOrderReferenceLabel(order))}</strong>
              </div>
              <time class="order-date">${escapeHtml(orderedAt)}</time>
            </header>

            <div class="order-card-body">

            <section class="order-customer-panel" aria-label="Customer information">
              <div class="order-customer-row">
                <span>Customer name</span>
                <strong>${escapeHtml(order.customer_name || "Guest customer")}</strong>
              </div>

              <div class="order-customer-row">
                <span>Username</span>
                <strong>${escapeHtml(order.customer_username || "Not provided")}</strong>
              </div>

              <div class="order-customer-row">
                <span>Contact number</span>
                <strong>${escapeHtml(order.phone || "Not provided")}</strong>
              </div>

              <div class="order-customer-row">
                <span>Email address</span>
                <strong>${escapeHtml(order.email || "Not provided")}</strong>
              </div>

              <div class="order-customer-row order-address-row">
                <span>Full address</span>
                <address>${shippingAddress}</address>
              </div>

              <div class="order-customer-row">
                <span>Payment method</span>
                <strong>${escapeHtml(order.payment_method || "—")}</strong>
              </div>
            </section>


<details class="order-products-details">
  <summary>
    ${escapeHtml(productsLabel)}
  </summary>

<div class="order-products-body">
  ${productRows}

  <div class="order-total-summary">
    <div class="order-total-line">
      <span>Subtotal</span>
      <span>${formatCurrency(orderTotals)}</span>
    </div>

    <div class="order-total-line">
      <span>Shipping</span>
      <span>${formatCurrency(order.shipping_fee || 0)}</span>
    </div>

    <div class="order-grand-total">
      <span>TOTAL</span>
      <strong>${formatCurrency(order.total || 0)}</strong>
    </div>
  </div>
</div>
</details>

            </div>

<footer class="order-card-footer">
  <div class="order-status-summary">
    <span>Payment status</span>
    <strong class="order-status-badge status-${escapeHtml(paymentStatusClass)}">
      ${escapeHtml(paymentStatus)}
    </strong>
  </div>

<div class="order-card-actions">
  <button type="button" class="secondary-button" data-order-invoice="${escapeHtml(String(order.id))}">Invoice</button>
  ${
    order.receipt_image
      ? `
        <button
          type="button"
          class="secondary-button"
          data-order-view-receipt="${escapeHtml(String(order.id))}"
        >
          View Receipt
        </button>
      `
      : `
        <span class="tiny-note">No receipt uploaded</span>
      `
  }
 ${
  order.receipt_image &&
  order.payment_status !== "Approved" &&
  !Boolean(order.archived)
    ? `
      <button
        type="button"
        class="primary-button"
        data-order-approve="${escapeHtml(String(order.id))}"
      >
        Approve Payment
      </button>
    `
    : ""
}

${
  order.receipt_image &&
  order.payment_status !== "Rejected" &&
  !Boolean(order.archived)
    ? `
      <button
        type="button"
        class="secondary-button"
        data-order-reject="${escapeHtml(String(order.id))}"
      >
        Reject Payment
      </button>
    `
    : ""
}
${Boolean(order.archived) ? `
    <button
      type="button"
      class="secondary-button"
      data-order-restore="${escapeHtml(String(order.id))}"
    >
      Restore Order
    </button>

    <button
      type="button"
      class="secondary-button order-delete-btn"
      data-order-delete-permanent="${escapeHtml(String(order.id))}"
    >
      Delete Permanently
    </button>
  `
  : `
    <button
      type="button"
      class="secondary-button"
      data-order-archive="${escapeHtml(String(order.id))}"
    >
      Archive Order
    </button>
  `
}
</div>

</footer>

</article>
    `;
  })
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
    .querySelectorAll("[data-order-invoice]")
    .forEach((button) => button.addEventListener("click", () => {
      const order = orders.find((item) => String(item.id) === String(button.dataset.orderInvoice));
      if (order) openInvoice(order);
    }));

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
const shippingLines = [
    [order.house_unit, order.street].filter(Boolean).join(", "),
    order.barangay ? `Brgy. ${order.barangay}` : "",
    [order.city, order.province].filter(Boolean).join(", "),
    order.zipcode || ""
].filter(Boolean);

const shippingAddress = shippingLines.length
   ? shippingLines.map(line => escapeHtml(line)).join("<br>")
    : escapeHtml(order.address || "—");
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
            <p>
  <strong>📍 Shipping</strong><br>
  ${shippingAddress}
</p>
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

            <div class="order-total-summary">
              <span>Total</span>
              <strong>${currency(order.total || 0)}</strong>
            </div>

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

function openInvoice(order) {
  const items = orderItemsByOrder[String(order.id)] || [];
  const subtotal = items.reduce((sum, item) => sum + Number(item.line_total || 0), 0);
  const address = [[order.house_unit, order.street].filter(Boolean).join(", "), order.barangay ? `Brgy. ${order.barangay}` : "", [order.city, order.province].filter(Boolean).join(", "), order.zipcode || ""].filter(Boolean).map(escapeHtml).join("<br>") || "—";
  invoiceContent.innerHTML = `<article class="invoice-sheet"><header class="invoice-head"><div><h2>WonderPeps PH</h2><p>Admin order invoice</p></div><div><strong>INVOICE</strong><p>${escapeHtml(getOrderReferenceLabel(order))}</p></div></header><div class="invoice-grid"><section class="invoice-box invoice-customer"><h4>BILL TO</h4><strong>${escapeHtml(order.customer_name || "Guest customer")}</strong><p>${escapeHtml(order.email || "Not provided")}<br>${escapeHtml(order.phone || "Not provided")}</p></section><section class="invoice-box invoice-customer"><h4>SHIP TO</h4><strong>${escapeHtml(order.customer_name || "Guest customer")}</strong><p>${address}</p></section></div><table class="invoice-table"><thead><tr><th>Item</th><th>Variant</th><th>Qty</th><th>Total</th></tr></thead><tbody>${items.map((item) => `<tr><td>${escapeHtml(item.product_name || "Product")}</td><td>${escapeHtml(item.variant_name || "—")}</td><td>${Number(item.quantity || 0)}</td><td>${formatCurrency(item.line_total || 0)}</td></tr>`).join("")}</tbody></table><div class="invoice-grid"><section class="invoice-box invoice-payment"><h4>PAYMENT INFORMATION</h4><p><span>Method</span><strong>${escapeHtml(order.payment_method || "—")}</strong></p><p><span>Status</span><strong>${escapeHtml(order.payment_status || "Pending")}</strong></p></section><section class="invoice-box invoice-summary"><h4>ORDER SUMMARY ♡</h4><p><span>Subtotal</span><strong>${formatCurrency(subtotal)}</strong></p><p><span>Shipping</span><strong>${formatCurrency(order.shipping_fee || 0)}</strong></p></section></div><div class="invoice-total"><span>TOTAL</span><span>${formatCurrency(order.total || 0)}</span></div><footer class="invoice-actions"><button class="secondary-button" type="button" data-close-invoice>Close</button><button class="primary-button" type="button" data-download-invoice>Download invoice image</button></footer></article>`;
  const [billingBox, shippingBox] = invoiceContent.querySelectorAll(".invoice-customer");
  if (billingBox) {
    billingBox.innerHTML = `<h4>BILL TO</h4><div class="invoice-detail-rows"><p><span>Name</span><strong>${escapeHtml(order.customer_name || "Guest customer")}</strong></p><p><span>Email</span><strong>${escapeHtml(order.email || "Not provided")}</strong></p><p><span>Number</span><strong>${escapeHtml(order.phone || "Not provided")}</strong></p></div>`;
  }
  if (shippingBox) {
    shippingBox.innerHTML = `<h4>SHIP TO</h4><div class="invoice-detail-rows"><p><span>Name</span><strong>${escapeHtml(order.customer_name || "Guest customer")}</strong></p><p class="invoice-address-row"><span>Full address</span><strong>${address}</strong></p></div>`;
  }
  invoiceDialog.showModal();
  invoiceDialog.scrollTop = 0;
  invoiceContent.scrollTop = 0;
  invoiceContent.querySelector("[data-close-invoice]")?.addEventListener("click", () => invoiceDialog.close());
  invoiceContent.querySelector("[data-download-invoice]")?.addEventListener("click", async () => {
    const sheet = invoiceContent.querySelector(".invoice-sheet");
    if (!sheet || !window.html2canvas) return alert("Invoice image tool is still loading. Please try again.");
    const canvas = await window.html2canvas(sheet, {
      scale: 2,
      backgroundColor: "#ffffff",
      ignoreElements: (element) => element.classList?.contains("invoice-actions"),
    });
    const link = document.createElement("a");
    link.download = `${getOrderReferenceLabel(order)}-invoice.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  });
}

function renderDashboard() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const dashboardOrders = orders.filter((order) => {
    const createdAt = new Date(order.created_at);
    return !Number.isNaN(createdAt.getTime()) && createdAt >= thirtyDaysAgo;
  });

  const revenue = dashboardOrders.reduce((sum, order) => sum + Number(order.total || order.amount_paid || 0), 0);
  const pendingPayments = dashboardOrders.filter((order) => String(order.payment_status || "Pending").toLowerCase() === "pending").length;
  const shippedOrders = dashboardOrders.filter((order) => ["paid", "confirmed", "shipped", "delivered"].includes(String(order.status || "").toLowerCase())).length;
  const recentOrders = [...dashboardOrders]
    .sort((first, second) => new Date(second.created_at || 0) - new Date(first.created_at || 0))
    .slice(0, 5);
  const dashboardOrderIds = new Set(
    dashboardOrders.map((order) => String(order.id))
  );

  const salesByProduct = Object.values((orderItemsByOrder || {}))
    .flat()
    .filter((item) => dashboardOrderIds.has(String(item.order_id)))
    .reduce((accumulator, item) => {
      const key = String(item.product_id || item.product_name || "Unknown");

      if (!accumulator[key]) {
        accumulator[key] = {
          id: item.product_id,
          name: item.product_name || "Unknown",
          quantity: 0
        };
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
              <div class="tiny-note">Best seller in the last 30 days</div>
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
  const allCategories = Array.from(new Set([
    ...categoryRegistry,
    ...products
      .map((product) => String(product.category || "").trim())
      .filter(Boolean)
  ]));

  // Only use saved categories that still actually exist.
  const savedOrder = Array.isArray(categoryOrder)
    ? categoryOrder.filter((category) => allCategories.includes(category))
    : [];

  // Add any categories that are new or not yet saved.
  const newCategories = allCategories
    .filter((category) => !savedOrder.includes(category))
    .sort();

  const displayCategories = [
    ...savedOrder,
    ...newCategories
  ];

  if (categoriesList) {
    categoriesList.innerHTML = displayCategories.length
      ? displayCategories.map((category) => {
          const categoryProducts = products.filter(
            (product) =>
              String(product.category || "").trim() === category
          );

          return `
            <div
              class="category-card"
              draggable="true"
              data-category-name="${escapeHtml(category)}"
            >
              <div
                class="category-drag-handle"
                aria-label="Drag to reorder"
              >⋮⋮</div>

              <div class="category-info">
                <strong>${escapeHtml(category)}</strong>
                <div class="tiny-note">
                  ${categoryProducts.length} products
                </div>
              </div>

              <div class="admin-actions">
                <button
                  class="secondary-button"
                  type="button"
                  data-edit-category="${escapeHtml(category)}"
                >Edit</button>

                <button
                  class="secondary-button danger"
                  type="button"
                  data-delete-category="${escapeHtml(category)}"
                >Delete</button>
              </div>
            </div>
          `;
        }).join("")
      : `<p class="empty">Add a category to start organizing products.</p>`;
  }

  categoriesList?.removeEventListener(
    "click",
    handleCategoryButtonClick
  );

  categoriesList?.addEventListener(
    "click",
    handleCategoryButtonClick
  );

  initCategoryDragDrop();
}

async function saveCategoryOrder(newOrder) {
  categoryOrder = newOrder;

  const { error } = await supabaseClient
    .from("shop_settings")
    .update({ category_order: newOrder, updated_at: new Date().toISOString() })
    .eq("id", 1);

  if (error) {
    console.error("Could not save category order:", error);
    alert("Could not save category order. Please try again.");
  }
}

let draggedCategory = null;

function initCategoryDragDrop() {
  const categoryCards =
    categoriesList?.querySelectorAll(".category-card") || [];

  categoryCards.forEach((card) => {
    card.addEventListener("dragstart", (event) => {
      draggedCategory = card.dataset.categoryName;

      card.classList.add("category-dragging");

      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", draggedCategory);
      event.stopPropagation();
    });

    card.addEventListener("dragover", (event) => {
      event.preventDefault();
      event.stopPropagation();

      if (
        draggedCategory &&
        card.dataset.categoryName !== draggedCategory
      ) {
        card.classList.add("category-drag-over");
        event.dataTransfer.dropEffect = "move";
      }
    });

    card.addEventListener("dragleave", () => {
      card.classList.remove("category-drag-over");
    });

    card.addEventListener("drop", async (event) => {
      event.preventDefault();
      event.stopPropagation();

      const targetCategory = card.dataset.categoryName;

      if (!draggedCategory || targetCategory === draggedCategory) {
        return;
      }

      const currentOrder = Array.isArray(categoryOrder)
        ? [...categoryOrder]
        : [];

      // Make sure every currently displayed category is represented.
      const displayedCategories = Array.from(categoryCards).map(
        (categoryCard) => categoryCard.dataset.categoryName
      );

      const completeOrder = [
        ...currentOrder.filter((category) =>
          displayedCategories.includes(category)
        ),
        ...displayedCategories.filter(
          (category) => !currentOrder.includes(category)
        )
      ];

      const draggedPosition =
        completeOrder.indexOf(draggedCategory);

      const targetPosition =
        completeOrder.indexOf(targetCategory);

      if (draggedPosition === -1 || targetPosition === -1) {
        return;
      }

      const newOrder = [...completeOrder];

      const [movedCategory] = newOrder.splice(draggedPosition, 1);

      const newTargetPosition =
        newOrder.indexOf(targetCategory);

      newOrder.splice(newTargetPosition, 0, movedCategory);

      await saveCategoryOrder(newOrder);
      renderCategories();
    });

    card.addEventListener("dragend", (event) => {
      card.classList.remove("category-dragging");

      categoryCards.forEach((categoryCard) => {
        categoryCard.classList.remove("category-drag-over");
      });

      draggedCategory = null;
      event.stopPropagation();
    });
  });
}

async function editCategory(categoryName) {
  categoryForm.elements.id.value = categoryName;
  categoryForm.elements.categoryName.value = categoryName;
  const categoryProducts = products.filter(
    (product) => String(product.category || "").trim() === categoryName
  );
  const activeCategories = getActiveCategories();

  if (categoryProductsList) {
    categoryProductsList.innerHTML = categoryProducts.length
      ? categoryProducts.map((product) => `
          <article class="category-product-row" data-category-product-row="${product.id}">
            <div class="category-product-summary">
              <strong>${escapeHtml(product.name || "Untitled product")}</strong>
              <small>${formatCurrency(product.price || 0)} · Stock: ${Number(product.stock || 0)}</small>
            </div>
            <label>
              Place in
              <select data-category-product="${product.id}">
                <option value="__none__">No category</option>
                ${activeCategories.map((category) => `
                  <option
                    value="${escapeHtml(category)}"
                    ${category === categoryName ? "selected" : ""}
                  >${escapeHtml(category)}</option>
                `).join("")}
              </select>
            </label>
            <button
              class="secondary-button"
              type="button"
              data-edit-category-product="${product.id}"
            >Edit full product</button>
          </article>
        `).join("")
      : `<p class="empty">No products are currently assigned to this category.</p>`;

    categoryProductsList
      .querySelectorAll("[data-edit-category-product]")
      .forEach((button) => {
        button.addEventListener("click", () => editProduct(button.dataset.editCategoryProduct));
      });
  }

  if (categoryProductsEditor) categoryProductsEditor.hidden = false;
  cancelCategoryEdit.hidden = false;
  categoryForm.scrollIntoView({ behavior: "smooth", block: "start" });
}

function resetCategoryForm() {
  categoryForm.reset();
  categoryForm.elements.id.value = "";
  if (categoryProductsEditor) categoryProductsEditor.hidden = true;
  if (categoryProductsList) categoryProductsList.innerHTML = "";
  cancelCategoryEdit.hidden = true;
}

// Event delegation handler for category buttons - prevents drag interference
function handleCategoryButtonClick(event) {
  const editButton = event.target.closest("[data-edit-category]");
  if (editButton) {
    event.preventDefault();
    event.stopPropagation();
    editCategory(editButton.dataset.editCategory);
    return;
  }

  const deleteButton = event.target.closest("[data-delete-category]");
  if (deleteButton) {
    event.preventDefault();
    event.stopPropagation();
    deleteCategory(deleteButton.dataset.deleteCategory);
    return;
  }
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
    const productAssignments = Array.from(
      categoryProductsList?.querySelectorAll("[data-category-product]") || []
    );

    for (const select of productAssignments) {
      const productId = select.dataset.categoryProduct;
      const chosenCategory = select.value === "__none__"
        ? null
        : select.value === existingCategory
          ? categoryName
          : select.value;

      const { error } = await supabaseClient
        .from("products")
        .update({
          category: chosenCategory,
          updated_at: new Date().toISOString()
        })
        .eq("id", productId);

      if (error) {
        alert(`Could not update a product in this category: ${error.message}`);
        return;
      }
    }

    if (!productAssignments.length && existingCategory !== categoryName) {
      const { error } = await supabaseClient
        .from("products")
        .update({ category: categoryName, updated_at: new Date().toISOString() })
        .eq("category", existingCategory);

      if (error) {
        alert(`Could not rename category: ${error.message}`);
        return;
      }
    }

    categoryRegistry = categoryRegistry.filter((item) => item !== existingCategory);
    if (!categoryRegistry.includes(categoryName)) {
      categoryRegistry.push(categoryName);
    }

    if (existingCategory !== categoryName && Array.isArray(categoryOrder)) {
      const renamedOrder = Array.from(new Set(
        categoryOrder.map((category) =>
          category === existingCategory ? categoryName : category
        )
      ));
      await saveCategoryOrder(renamedOrder);
    }
  } else {
    if (!categoryRegistry.includes(categoryName)) {
      categoryRegistry.push(categoryName);
    }
  }

  resetCategoryForm();
  await loadProducts();
  alert(existingCategory ? "Category and product assignments updated." : "Category added.");
});

cancelCategoryEdit?.addEventListener("click", resetCategoryForm);

async function deleteCategory(categoryName) {
  const confirmed = confirm(
    `Remove category "${categoryName}"? Its products will be moved to another category.`
  );

  if (!confirmed) return;

  const availableCategories = Array.from(
    new Set(
      [
        ...categoryRegistry,
        ...products
          .map((product) => String(product.category || "").trim())
          .filter(Boolean)
      ].filter((category) => category && category !== categoryName)
    )
  );

  if (availableCategories.length === 0) {
    alert(
      "This category cannot be deleted yet because its products need another category."
    );
    return;
  }

  const targetCategory = prompt(
    `Move the products from "${categoryName}" to which category?\n\n` +
    availableCategories.join("\n")
  );

  if (!targetCategory) return;

  const selectedCategory = targetCategory.trim();

  if (!availableCategories.includes(selectedCategory)) {
    alert("Please enter the name of one of the existing categories.");
    return;
  }

  const { error } = await supabaseClient
    .from("products")
    .update({
      category: selectedCategory,
      updated_at: new Date().toISOString()
    })
    .eq("category", categoryName);

  if (error) {
    alert(`Could not move products: ${error.message}`);
    return;
  }

  const newOrder = Array.isArray(categoryOrder)
    ? categoryOrder.filter((category) => category !== categoryName)
    : [];

  await saveCategoryOrder(newOrder);

  categoryRegistry = categoryRegistry.filter(
    (item) => item !== categoryName
  );

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
