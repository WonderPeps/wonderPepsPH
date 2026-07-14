const loginSection = document.querySelector("#loginSection");
const loginForm = document.querySelector("#loginForm");
const loginMessage = document.querySelector("#loginMessage");
const adminContent = document.querySelector("#adminContent");

const settingsForm = document.querySelector("#settingsForm");
const productForm = document.querySelector("#productForm");
const adminProducts = document.querySelector("#adminProducts");
const ordersList = document.querySelector("#ordersList");
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

let menuItems = [];
let products = [];
let paymentMethods = [];

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
}

addPaymentMethodBtn.addEventListener("click", () => {
  paymentMethodForm.reset();
  paymentMethodForm.elements.id.value = "";
  paymentMethodModalTitle.textContent = "Add payment method";
  openPaymentMethodModal(false);
});

closePaymentMethodModal.addEventListener("click", () => {
  closePaymentMethodDialog();
});

cancelPaymentMethod.addEventListener("click", () => {
  closePaymentMethodDialog();
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
  const { data, error } = await supabaseClient
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    ordersList.innerHTML =
      `<p>Could not load orders: ${escapeHtml(error.message)}</p>`;
    return;
  }

  renderOrders(data || []);
}

function renderOrders(orders) {
  if (!orders.length) {
    ordersList.innerHTML =
      `<p class="empty">No online orders yet.</p>`;
    return;
  }

  ordersList.innerHTML = orders
    .map(
      (order) => `
        <article class="order-card">
          <strong>${escapeHtml(order.order_reference)}</strong>

          <p>
            ${escapeHtml(order.customer_name)}
            · ${escapeHtml(order.phone)}
          </p>

          <p>${escapeHtml(order.address)}</p>

          <p>
            ${formatCurrency(order.total)}
            · ${escapeHtml(order.payment_method)}
          </p>

          <label>
            Status
            <select data-order-status="${order.id}">
              ${orderStatusOptions(order.status)}
            </select>
          </label>

          <small>
            ${new Date(order.created_at).toLocaleString()}
          </small>
        </article>
      `
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
