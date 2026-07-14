const loginSection = document.querySelector("#loginSection");
const loginForm = document.querySelector("#loginForm");
const loginMessage = document.querySelector("#loginMessage");
const adminContent = document.querySelector("#adminContent");

const settingsForm = document.querySelector("#settingsForm");
const productForm = document.querySelector("#productForm");
const adminProducts = document.querySelector("#adminProducts");
const ordersList = document.querySelector("#ordersList");
const ordersTabs = document.querySelector("#ordersTabs");
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

let menuItems = [];
let products = [];
let paymentMethods = [];
let orders = [];
let orderItemsByOrder = {};
let activeOrderFilter = "all";
let paymentMethodQrFile = null;
let paymentMethodQrPreviewUrl = null;
let paymentMethodCurrentQrUrl = null;
let paymentMethodRemoveQr = false;

/* -------------------------
   LOGIN AND ADMIN CHECK
------------------------- */

async function showLogin(message = "") {
  loginSection.hidden = false;
  adminContent.hidden = true;
  loginMessage.textContent = message;
}

async function showAdmin() {
  loginSection.hidden = true;
  adminContent.hidden = false;

  resetButton.textContent = "Log out";

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

resetButton.addEventListener("click", async () => {
  await supabaseClient.auth.signOut();
  await showLogin("You have been logged out.");
});

/* -------------------------
   SHOP SETTINGS
------------------------- */

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
}

settingsForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(settingsForm);

  const updates = {
    shop_name: String(formData.get("shopName") || "").trim(),
    logo_url: String(formData.get("logoUrl") || "").trim() || null,
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
    updated_at: new Date().toISOString()
  };

  const { error } = await supabaseClient
    .from("shop_settings")
    .update(updates)
    .eq("id", 1);

  if (error) {
    alert(`Could not save shop profile: ${error.message}`);
    return;
  }

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

            <div>
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
    adminProducts.innerHTML =
      `<p>Could not load products: ${escapeHtml(error.message)}</p>`;
    return;
  }

  products = data || [];
  renderProducts();
}

function renderProducts() {
  if (!products.length) {
    adminProducts.innerHTML = `<p class="empty">No products yet.</p>`;
    return;
  }

  adminProducts.innerHTML = products
    .map(
      (product) => `
        <article class="admin-product">
          <div>
            <strong>${escapeHtml(product.name)}</strong>
            <div>
              ${formatCurrency(product.price)}
              · Stock ${Number(product.stock)}
            </div>
            <small>
              ${product.is_visible ? "Visible" : "Hidden"}
            </small>
          </div>

          <div class="admin-actions">
            <button
              class="secondary-button"
              type="button"
              data-edit="${product.id}">
              Edit
            </button>

            <button
              class="secondary-button danger"
              type="button"
              data-delete="${product.id}">
              Delete
            </button>
          </div>
        </article>
      `
    )
    .join("");

  adminProducts
    .querySelectorAll("[data-edit]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        editProduct(button.dataset.edit);
      });
    });

  adminProducts
    .querySelectorAll("[data-delete]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        deleteProduct(button.dataset.delete);
      });
    });
}

productForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(productForm);
  const id = String(formData.get("id") || "").trim();

  const product = {
    name: String(formData.get("name") || "").trim(),
    price: Number(formData.get("price")),
    stock: Number(formData.get("stock")),
    category:
      String(formData.get("category") || "").trim() || null,
    image_url:
      String(formData.get("image") || "").trim() || null,
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
  return list.filter((order) => {
    const archived = Boolean(order?.archived);

    if (activeOrderFilter === "archived") {
      return archived;
    }

    if (archived) {
      return false;
    }

    switch (activeOrderFilter) {
      case "pending":
        return String(order?.payment_status || "Pending").toLowerCase() === "pending";
      case "approved":
        return String(order?.payment_status || "").toLowerCase() === "approved";
      case "rejected":
        return String(order?.payment_status || "").toLowerCase() === "rejected";
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
