const currency = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  maximumFractionDigits: 0
});

const brandName = document.querySelector("#brandName");
const brandLogo = document.querySelector("#brandLogo");
const brandFallback = document.querySelector("#brandFallback");
const heroTitle = document.querySelector("#heroTitle");
const heroSubtitle = document.querySelector("#heroSubtitle");
const heroImage = document.querySelector("#heroImage");
const heroFallback = document.querySelector("#heroFallback");
const footerBrand = document.querySelector("#footerBrand");
const facebookLink = document.querySelector("#facebookLink");
const tiktokLink = document.querySelector("#tiktokLink");

const productGrid = document.querySelector("#productGrid");
const searchInput = document.querySelector("#searchInput");

const cartButton = document.querySelector("#cartButton");
const cartCount = document.querySelector("#cartCount");
const cartDrawer = document.querySelector("#cartDrawer");
const closeCart = document.querySelector("#closeCart");
const cartItems = document.querySelector("#cartItems");
const cartSubtotal = document.querySelector("#cartSubtotal");
const checkoutButton = document.querySelector("#checkoutButton");

const checkoutDialog = document.querySelector("#checkoutDialog");
const checkoutForm = document.querySelector("#checkoutForm");
const checkoutTotal = document.querySelector("#checkoutTotal");
const paymentMethodsList = document.querySelector("#paymentMethodsList");
const selectedPaymentInput = document.querySelector("#selectedPaymentInput");
const proceedPaymentButton = document.querySelector("#proceedPaymentButton");
const checkoutFormError = document.querySelector("#checkoutFormError");
const paymentStepDialog = document.querySelector("#paymentStepDialog");
const paymentStepContent = document.querySelector("#paymentStepContent");
const paymentStepBackButton = document.querySelector("#paymentStepBackButton");
const paymentStepContinueButton = document.querySelector("#paymentStepContinueButton");
const paymentStepCloseButton = document.querySelector("#paymentStepCloseButton");

const successDialog = document.querySelector("#successDialog");

const orderReference = document.querySelector("#orderReference");
const closeSuccess = document.querySelector("#closeSuccess");
const CART_STORAGE_KEY = "wonderPepsCart";

function loadSavedCart() {
  try {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);

    if (!savedCart) {
      return [];
    }

    const parsedCart = JSON.parse(savedCart);

    return Array.isArray(parsedCart) ? parsedCart : [];
  } catch (error) {
    console.error("Unable to load saved cart:", error);
    return [];
  }
}

function saveCart() {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (error) {
    console.error("Unable to save cart:", error);
  }
}

function clearSavedCart() {
  cart = [];
  localStorage.removeItem(CART_STORAGE_KEY);
}
let products = [];
let cart = loadSavedCart();
let paymentMethods = [];
let selectedPaymentMethod = null;
let paymentStepReceiptFile = null;
let paymentStepReceiptPreviewUrl = null;

/* -------------------------
   HELPERS
------------------------- */

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatCurrency(value) {
  return currency.format(Number(value || 0));
}

function roundToTwo(value) {
  return Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;
}

function clearCheckoutFormError() {
  if (checkoutFormError) {
    checkoutFormError.textContent = "";
  }
}

function showCheckoutError(message) {
  if (checkoutFormError) {
    checkoutFormError.textContent = message;
  } else {
    alert(message);
  }
}

/* -------------------------
   SHOP SETTINGS
------------------------- */

async function loadShopSettings() {
  const { data, error } = await supabaseClient
    .from("shop_settings")
    .select("*")
    .eq("id", 1)
    .single();

  if (error) {
    console.error("Could not load shop settings:", error.message);
    return;
  }

  applyShopSettings(data);
}

function applyShopSettings(settings) {
  const shopName = settings.shop_name || "Wonder Peps PH";

  document.title = shopName;

  if (brandName) {
    brandName.innerHTML = escapeHtml(shopName).replace(
      /\sPH$/i,
      " <small>PH</small>"
    );
  }

  if (heroTitle) {
    heroTitle.textContent =
      settings.hero_title || "Soft pink shopping made easy.";
  }

  if (heroSubtitle) {
    heroSubtitle.textContent =
      settings.hero_subtitle ||
      "Browse products, add them to your bag, and send your order details in just a few taps.";
  }

  if (footerBrand) {
    footerBrand.textContent = `© ${shopName}`;
  }

  if (brandLogo && brandFallback) {
    if (settings.logo_url) {
      brandLogo.src = settings.logo_url;
      brandLogo.hidden = false;
      brandFallback.hidden = true;
    } else {
      brandLogo.hidden = true;
      brandFallback.hidden = false;
    }
  }
if (heroImage && heroFallback) {
  if (settings.hero_image_url) {
    heroImage.src = settings.hero_image_url;
    heroImage.hidden = false;
    heroFallback.hidden = true;
  } else {
    heroImage.hidden = true;
    heroFallback.hidden = false;
  }
}
  if (facebookLink) {
    if (settings.facebook_url) {
      facebookLink.href = settings.facebook_url;
      facebookLink.hidden = false;
    } else {
      facebookLink.hidden = true;
    }
  }

  if (tiktokLink) {
    if (settings.tiktok_url) {
      tiktokLink.href = settings.tiktok_url;
      tiktokLink.hidden = false;
    } else {
      tiktokLink.hidden = true;
    }
  }

  const shippingField = document.querySelector(
    'select[name="shipping"]'
  );

  if (shippingField) {
    if (shippingField.options[1]) {
      shippingField.options[1].textContent =
        `₱90 – ${settings.shipping_90_label || "Nearby area"}`;
    }

    if (shippingField.options[2]) {
      shippingField.options[2].textContent =
        `₱120 – ${
          settings.shipping_120_label || "Standard shipping"
        }`;
    }

    if (shippingField.options[3]) {
      shippingField.options[3].textContent =
        `₱150 – ${settings.shipping_150_label || "Farther area"}`;
    }
  }
}

/* -------------------------
   PRODUCTS
------------------------- */

async function loadProducts() {
  productGrid.innerHTML =
    `<p class="empty">Loading products…</p>`;

  const { data, error } = await supabaseClient
    .from("products")
    .select("*")
    .eq("is_visible", true)
    .order("created_at", { ascending: false });

  if (error) {
    productGrid.innerHTML = `
      <p class="empty">
        Could not load products: ${escapeHtml(error.message)}
      </p>
    `;
    return;
  }

  products = data || [];
  renderProducts(products);
}

function renderProducts(list) {
  if (!list.length) {
    productGrid.innerHTML =
      `<p class="empty">No products are available yet.</p>`;
    return;
  }

  productGrid.innerHTML = list
    .map((product) => {
      const image = product.image_url
        ? `
          <img
            class="product-image"
            src="${escapeHtml(product.image_url)}"
            alt="${escapeHtml(product.name)}"
          />
        `
        : `
          <div class="product-image" aria-hidden="true">
            ♡
          </div>
        `;

      return `
        <article class="product-card">
          ${image}

          <div class="product-body">
            <h3>${escapeHtml(product.name)}</h3>

            <p>
              ${escapeHtml(
                product.description || "Product listing"
              )}
            </p>

            <div class="price-row">
              <strong>${formatCurrency(product.price)}</strong>

              <span class="stock">
                Stock: ${Number(product.stock || 0)}
              </span>
            </div>

            <button
              class="add-button"
              type="button"
              data-add-product="${product.id}"
              ${Number(product.stock || 0) < 1 ? "disabled" : ""}
            >
              ${
                Number(product.stock || 0) < 1
                  ? "Out of stock"
                  : "Add to bag"
              }
            </button>
          </div>
        </article>
      `;
    })
    .join("");

  productGrid
    .querySelectorAll("[data-add-product]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        addToCart(button.dataset.addProduct, button);
      });
    });
}

searchInput.addEventListener("input", (event) => {
  const query = event.target.value.trim().toLowerCase();

  const filteredProducts = products.filter((product) => {
    return (
      product.name.toLowerCase().includes(query) ||
      String(product.category || "")
        .toLowerCase()
        .includes(query) ||
      String(product.description || "")
        .toLowerCase()
        .includes(query)
    );
  });

  renderProducts(filteredProducts);
});
/* -------------------------
   SHOPPING BAG
------------------------- */

function getProductById(id) {
  return products.find((product) => String(product.id) === String(id));
}

function addToCart(productId, sourceButton = null) {
  const product = getProductById(productId);

  if (!product || Number(product.stock || 0) < 1) {
    alert("This product is currently unavailable.");
    return;
  }

  const existingItem = cart.find(
    (item) => String(item.productId) === String(productId)
  );

  const currentQuantity = existingItem ? existingItem.quantity : 0;

  if (currentQuantity >= Number(product.stock)) {
    alert("You cannot add more than the available stock.");
    return;
  }

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      productId: product.id,
      quantity: 1
    });
  }
saveCart();
  renderCart();
  showAddedToBag(product.name);
  animateBag();
  if (sourceButton) {
    flyHeartToBag(sourceButton);
  }
}

function removeFromCart(productId) {
  cart = cart.filter(
    (item) => String(item.productId) !== String(productId)
  );
saveCart();
  renderCart();
}

function changeQuantity(productId, amount) {
  const item = cart.find(
    (cartItem) =>
      String(cartItem.productId) === String(productId)
  );

  const product = getProductById(productId);

  if (!item || !product) return;

  const newQuantity = item.quantity + amount;

  if (newQuantity <= 0) {
    removeFromCart(productId);
    return;
  }

  if (newQuantity > Number(product.stock || 0)) {
    alert("You cannot add more than the available stock.");
    return;
  }

  item.quantity = newQuantity;
  saveCart();
  renderCart();
}

function calculateSubtotal() {
  return cart.reduce((total, item) => {
    const product = getProductById(item.productId);

    if (!product) return total;

    return total + Number(product.price || 0) * item.quantity;
  }, 0);
}

function getSelectedShippingFee() {
  const shippingField = checkoutForm?.querySelector(
    'select[name="shipping"]'
  );

  return shippingField
    ? Number(shippingField.value || 0)
    : 0;
}

function updateCheckoutTotal() {
  const total = calculateSubtotal() + getSelectedShippingFee();

  if (checkoutTotal) {
    checkoutTotal.textContent = formatCurrency(total);
  }
}

function renderCart() {
  const validItems = cart.filter((item) =>
    getProductById(item.productId)
  );

  cart = validItems;
saveCart();
  const totalQuantity = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  cartCount.textContent = totalQuantity;

  if (!cart.length) {
    cartItems.innerHTML =
      `<p class="empty">Your bag is empty.</p>`;

    cartSubtotal.textContent = formatCurrency(0);
    checkoutButton.disabled = true;
    updateCheckoutTotal();
    return;
  }

  cartItems.innerHTML = cart
    .map((item) => {
      const product = getProductById(item.productId);

      return `
        <article class="cart-item">
          <div class="cart-thumb">
            ${
              product.image_url
                ? `
                  <img
                    src="${escapeHtml(product.image_url)}"
                    alt="${escapeHtml(product.name)}"
                  />
                `
                : "♡"
            }
          </div>

          <div>
            <strong>${escapeHtml(product.name)}</strong>

            <p>${formatCurrency(product.price)}</p>

            <div class="qty">
              <button
                type="button"
                data-decrease="${product.id}"
                aria-label="Decrease quantity">
                −
              </button>

              <span>${item.quantity}</span>

              <button
                type="button"
                data-increase="${product.id}"
                aria-label="Increase quantity">
                +
              </button>
            </div>
          </div>

          <button
            class="icon-button"
            type="button"
            data-remove="${product.id}"
            aria-label="Remove product">
            ×
          </button>
        </article>
      `;
    })
    .join("");

  cartSubtotal.textContent =
    formatCurrency(calculateSubtotal());

  checkoutButton.disabled = false;
  updateCheckoutTotal();

  cartItems
    .querySelectorAll("[data-decrease]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        changeQuantity(button.dataset.decrease, -1);
      });
    });

  cartItems
    .querySelectorAll("[data-increase]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        changeQuantity(button.dataset.increase, 1);
      });
    });

  cartItems
    .querySelectorAll("[data-remove]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        removeFromCart(button.dataset.remove);
      });
    });
}

function openCart() {
  cartDrawer.classList.add("open");
  cartDrawer.setAttribute("aria-hidden", "false");
}

function closeCartDrawer() {
  cartDrawer.classList.remove("open");
  cartDrawer.setAttribute("aria-hidden", "true");
}

cartButton.addEventListener("click", openCart);

closeCart.addEventListener("click", closeCartDrawer);

cartDrawer.addEventListener("click", (event) => {
  if (event.target === cartDrawer) {
    closeCartDrawer();
  }
});

checkoutButton.addEventListener("click", () => {
  if (!cart.length) {
    alert("Your bag is empty.");
    return;
  }

  clearCheckoutFormError();
  closeCartDrawer();
  updateCheckoutTotal();
  checkoutDialog.showModal();
});

checkoutForm
  .querySelector('select[name="shipping"]')
  ?.addEventListener("change", updateCheckoutTotal);
/* -------------------------
   CHECKOUT AND ORDERS
------------------------- */

function createOrderReference() {
  const datePart = new Date()
    .toISOString()
    .slice(2, 10)
    .replaceAll("-", "");

  const randomPart = Math.random()
    .toString(36)
    .slice(2, 7)
    .toUpperCase();

  return `WPPH-${datePart}-${randomPart}`;
}

async function loadPaymentMethods() {
  if (!paymentMethodsList) {
    return;
  }

  paymentMethodsList.innerHTML = `<p class="empty">Loading payment methods…</p>`;

  const { data, error } = await supabaseClient
    .from("payment_methods")
    .select("*")
    .eq("is_visible", true)
    .order("sort_order", { ascending: true });

  if (error) {
    paymentMethods = [];
    selectedPaymentMethod = null;
    if (selectedPaymentInput) {
      selectedPaymentInput.value = "";
    }
    paymentMethodsList.innerHTML = `
      <div class="payment-step-summary">
        <strong>Payment methods unavailable</strong>
        <p class="tiny-note">We could not load payment options right now. Please try again shortly.</p>
      </div>
    `;
    if (proceedPaymentButton) {
      proceedPaymentButton.disabled = true;
    }
    return;
  }

  paymentMethods = data || [];
  selectedPaymentMethod = null;
  if (selectedPaymentInput) {
    selectedPaymentInput.value = "";
  }
  renderPaymentMethods();
}

function renderPaymentMethods() {
  if (!paymentMethodsList) {
    return;
  }

  if (!paymentMethods.length) {
    paymentMethodsList.innerHTML = `
      <div class="payment-step-summary">
        <strong>No payment methods available</strong>
        <p class="tiny-note">Payment options will appear here once they are enabled in the admin dashboard.</p>
      </div>
    `;
    if (proceedPaymentButton) {
      proceedPaymentButton.disabled = true;
    }
    return;
  }

  paymentMethodsList.innerHTML = paymentMethods
    .map((method) => {
      const isSelected = selectedPaymentMethod && String(selectedPaymentMethod.id) === String(method.id);
      const depositText = method.deposit_required
        ? `${Number(method.deposit_percentage || 0)}% deposit`
        : "Full payment";

      return `
        <button
          class="payment-option-card${isSelected ? " selected" : ""}"
          type="button"
          data-payment-select="${method.id}"
        >
          <div class="payment-option-header">
            <strong>${escapeHtml(method.payment_name || "Payment method")}</strong>
            <span class="payment-option-pill">${escapeHtml(depositText)}</span>
          </div>
          <p>${escapeHtml(method.short_description || "Please follow the payment instructions provided.")}</p>
        </button>
      `;
    })
    .join("");

  if (proceedPaymentButton) {
    proceedPaymentButton.disabled = false;
  }

  paymentMethodsList
    .querySelectorAll("[data-payment-select]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        selectPaymentMethod(button.dataset.paymentSelect);
      });
    });
}

function selectPaymentMethod(methodId) {
  const method = paymentMethods.find(
    (item) => String(item.id) === String(methodId)
  );

  if (!method) {
    return;
  }

  selectedPaymentMethod = method;
  if (selectedPaymentInput) {
    selectedPaymentInput.value = method.payment_name || "";
  }
  renderPaymentMethods();
}

function revokePaymentStepReceiptPreview() {
  if (paymentStepReceiptPreviewUrl) {
    URL.revokeObjectURL(paymentStepReceiptPreviewUrl);
    paymentStepReceiptPreviewUrl = null;
  }
}

function clearPaymentStepReceiptState() {
  revokePaymentStepReceiptPreview();
  paymentStepReceiptFile = null;
}

function showPaymentStepFeedback(message) {
  const feedback = paymentStepContent?.querySelector("#paymentStepFeedback");

  if (feedback) {
    feedback.textContent = message;
  }
}

function validateReceiptFile(file) {
  if (!file) {
    return { valid: false, message: "Please upload a receipt image to continue." };
  }

  const maximumSize = 10 * 1024 * 1024;
  const allowedTypes = new Set(["image/png", "image/jpeg", "image/webp"]);
  const allowedExtensions = /\.(png|jpe?g|webp)$/i;

  if (!allowedTypes.has(file.type) && !allowedExtensions.test(file.name)) {
    return {
      valid: false,
      message: "Please upload a PNG, JPG, JPEG, or WebP receipt image."
    };
  }

  if (file.size > maximumSize) {
    return {
      valid: false,
      message: "Receipt images must be 10 MB or smaller."
    };
  }

  return { valid: true, message: "" };
}

function renderPaymentStepReceiptPreview(file) {
  const previewBox = paymentStepContent?.querySelector("#receiptPreviewBox");
  const previewImage = paymentStepContent?.querySelector("#paymentReceiptPreview");

  if (!previewBox || !previewImage) {
    return;
  }

  revokePaymentStepReceiptPreview();

  if (!file) {
    previewBox.hidden = true;
    previewImage.removeAttribute("src");
    return;
  }

  paymentStepReceiptPreviewUrl = URL.createObjectURL(file);
  previewImage.src = paymentStepReceiptPreviewUrl;
  previewImage.alt = "Receipt preview";
  previewBox.hidden = false;
}

function createReceiptStoragePath(file) {
  const safeName = String(file.name || "receipt")
    .trim()
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-.]+|[-.]+$/g, "") || "receipt";

  return `receipts/${Date.now()}-${Math.random().toString(36).slice(2, 10)}-${safeName}`;
}

async function uploadCustomerReceipt(file) {
  const storagePath = createReceiptStoragePath(file);
  const { error } = await supabaseClient.storage
    .from("payment-receipts")
    .upload(storagePath, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || "application/octet-stream"
    });

  if (error) {
    throw error;
  }

  return storagePath;
}

async function deleteUploadedReceipt(storagePath) {
  if (!storagePath) {
    return;
  }

  await supabaseClient.storage
    .from("payment-receipts")
    .remove([storagePath]);
}

function openPaymentStep() {
  if (!selectedPaymentMethod) {
    showCheckoutError("Please choose a payment method to continue.");
    return;
  }

  const subtotal = calculateSubtotal();
  const shippingFee = getSelectedShippingFee();
  const total = roundToTwo(subtotal + shippingFee);
  const depositPercentage = Number(selectedPaymentMethod.deposit_percentage || 0);
  const amountDueNow = selectedPaymentMethod.deposit_required
    ? roundToTwo(total * (depositPercentage / 100))
    : total;
  const remainingBalance = roundToTwo(total - amountDueNow);
  const instructions = selectedPaymentMethod.short_description || "Please follow the payment instructions provided.";
  const qrUrl = selectedPaymentMethod.qr_url && String(selectedPaymentMethod.qr_url).trim();
  const requiresReceipt = Boolean(selectedPaymentMethod.receipt_required);
  const requiresReference = Boolean(selectedPaymentMethod.reference_required);

  clearPaymentStepReceiptState();
  showPaymentStepFeedback("");

  paymentStepContent.innerHTML = `
    <div class="payment-step-summary">
      <strong>${escapeHtml(selectedPaymentMethod.payment_name || "Payment method")}</strong>
      <p class="tiny-note">${escapeHtml(instructions)}</p>
    </div>
    <div class="payment-step-qr">
      ${qrUrl
        ? `<img src="${escapeHtml(qrUrl)}" alt="${escapeHtml(selectedPaymentMethod.payment_name || "Payment QR")}" loading="lazy" />`
        : `<div class="payment-step-qr-placeholder">No QR code available</div>`}
    </div>
    <div class="payment-step-summary">
      <div class="cart-summary"><div><span>Order total</span><strong>${formatCurrency(total)}</strong></div></div>
      <div class="cart-summary"><div><span>Amount due now</span><strong>${formatCurrency(amountDueNow)}</strong></div></div>
      ${selectedPaymentMethod.deposit_required
        ? `<div class="cart-summary"><div><span>Remaining balance</span><strong>${formatCurrency(remainingBalance)}</strong></div></div>`
        : ""}
    </div>
    ${requiresReceipt ? `
      <label class="payment-step-field">
        Upload receipt image
        <input id="paymentReceiptFile" name="receipt_file" type="file" accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp" />
      </label>
      <div id="receiptPreviewBox" class="payment-step-preview-box" hidden>
        <div class="tiny-note">Local receipt preview</div>
        <img id="paymentReceiptPreview" class="payment-step-preview-image" alt="Receipt preview" />
      </div>
    ` : ""}
    ${requiresReference ? `
      <label class="payment-step-field">
        Reference number
        <input id="paymentReferenceInput" name="reference_number" type="text" maxlength="80" required />
      </label>
    ` : ""}
    <p id="paymentStepFeedback" class="checkout-error" role="alert"></p>
  `;

  const receiptInput = paymentStepContent.querySelector("#paymentReceiptFile");

  receiptInput?.addEventListener("change", (event) => {
    const file = event.target.files?.[0] || null;
    const validation = validateReceiptFile(file);

    if (!validation.valid) {
      showPaymentStepFeedback(validation.message);
      clearPaymentStepReceiptState();
      renderPaymentStepReceiptPreview(null);
      event.target.value = "";
      return;
    }

    showPaymentStepFeedback("");
    paymentStepReceiptFile = file;
    renderPaymentStepReceiptPreview(file);
  });

  clearCheckoutFormError();
  checkoutDialog.close();
  paymentStepDialog.showModal();
}

function resetCheckoutState() {
  checkoutForm.reset();
  selectedPaymentMethod = null;
  clearPaymentStepReceiptState();
  showPaymentStepFeedback("");
  if (selectedPaymentInput) {
    selectedPaymentInput.value = "";
  }
  renderPaymentMethods();
  clearCheckoutFormError();
}

async function submitOrder() {
  if (!cart.length) {
    alert("Your bag is empty.");
    return;
  }

  const submitButton = paymentStepContinueButton;

  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = "Uploading…";
  }

  let uploadedReceiptPath = null;

  try {
    const formData = new FormData(checkoutForm);

    const reference = createOrderReference();
    const shippingFee = getSelectedShippingFee();
    const subtotal = calculateSubtotal();
    const total = roundToTwo(subtotal + shippingFee);
    const paymentMethodName = String(
      selectedPaymentMethod?.payment_name || formData.get("payment") || ""
    ).trim();
    const amountDueNow = selectedPaymentMethod?.deposit_required
      ? roundToTwo(total * (Number(selectedPaymentMethod.deposit_percentage || 0) / 100))
      : total;
    const requiresReceipt = Boolean(selectedPaymentMethod?.receipt_required);
    const requiresReference = Boolean(selectedPaymentMethod?.reference_required);
    const referenceInput = paymentStepContent?.querySelector("#paymentReferenceInput");
    const referenceNumber = requiresReference
      ? String(referenceInput?.value || "").trim()
      : "";

    if (requiresReceipt) {
      const validation = validateReceiptFile(paymentStepReceiptFile);
      if (!validation.valid) {
        showPaymentStepFeedback(validation.message);
        return;
      }
    }

    if (requiresReference && !referenceNumber) {
      showPaymentStepFeedback("Please enter the reference number before continuing.");
      return;
    }

    if (requiresReceipt && paymentStepReceiptFile) {
      uploadedReceiptPath = await uploadCustomerReceipt(paymentStepReceiptFile);
    }

    const orderData = {
      order_ref: reference,
      customer_name: String(formData.get("name") || "").trim(),
      phone: String(formData.get("phone") || "").trim(),
      address: String(formData.get("address") || "").trim(),
      payment_method: paymentMethodName,
      notes: String(formData.get("notes") || "").trim() || null,
      shipping_fee: shippingFee,
      subtotal,
      total,
      amount_paid: amountDueNow,
      payment_status: "Pending",
      receipt_image: uploadedReceiptPath,
      reference_number: referenceNumber || null,
      paid_at: uploadedReceiptPath ? new Date().toISOString() : null,
      status: "Pending"
    };

    const { data: order, error: orderError } = await supabaseClient
      .from("orders")
      .insert(orderData)
      .select("id, order_ref")
      .single();

    if (orderError) {
      if (uploadedReceiptPath) {
        await deleteUploadedReceipt(uploadedReceiptPath);
      }
      throw orderError;
    }

    const orderItems = cart.map((item) => {
      const product = getProductById(item.productId);

      return {
        order_id: order.id,
        product_id: product.id,
        product_name: product.name,
        unit_price: Number(product.price),
        quantity: item.quantity,
        line_total: Number(product.price) * Number(item.quantity)
      };
    });

    const { error: itemsError } = await supabaseClient
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      if (uploadedReceiptPath) {
        await deleteUploadedReceipt(uploadedReceiptPath);
      }
      throw itemsError;
    }

   clearSavedCart();
renderCart();
paymentStepDialog.close();
resetCheckoutState();

    orderReference.textContent = order.order_ref;
    successDialog.showModal();
  } catch (error) {
    console.error("Checkout error:", error);
    if (uploadedReceiptPath) {
      await deleteUploadedReceipt(uploadedReceiptPath);
    }
    const errorMessage = `We could not place your order right now. ${error?.message || "Please try again."}`;
    showPaymentStepFeedback(errorMessage);
    showCheckoutError(errorMessage);
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = "Continue Payment";
    }
  }
}

checkoutForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!cart.length) {
    alert("Your bag is empty.");
    return;
  }

  if (!checkoutForm.checkValidity()) {
    checkoutForm.reportValidity();
    return;
  }

  clearCheckoutFormError();
  openPaymentStep();
});

paymentStepBackButton?.addEventListener("click", () => {
  paymentStepDialog.close();
  checkoutDialog.showModal();
});

paymentStepContinueButton?.addEventListener("click", () => {
  submitOrder();
});

proceedPaymentButton?.addEventListener("click", () => {
  checkoutForm.requestSubmit();
});

closeSuccess.addEventListener("click", () => {
  successDialog.close();
});

successDialog.addEventListener("click", (event) => {
  if (event.target === successDialog) {
    successDialog.close();
  }
});

checkoutDialog.addEventListener("click", (event) => {
  if (event.target === checkoutDialog) {
    checkoutDialog.close();
  }
});

paymentStepDialog.addEventListener("click", (event) => {
  if (event.target === paymentStepDialog) {
    paymentStepDialog.close();
  }
});

paymentStepCloseButton?.addEventListener("click", () => {
  paymentStepDialog.close();
});
/* ------------------------
   STOREFRONT MENU
------------------------ */

async function loadStoreMenuItems() {
  const { data, error } = await supabaseClient
    .from("menu_items")
    .select("*")
    .eq("is_visible", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Could not load menu items:", error.message);
    storeMenuItems.innerHTML =
      `<p class="empty">Menu could not be loaded.</p>`;
    return;
  }

  const items = data || [];

  if (!items.length) {
    storeMenuItems.innerHTML =
      `<p class="empty">No menu items available.</p>`;
    return;
  }

  storeMenuItems.innerHTML = items
    .map((item) => {
      const target = item.open_new_tab ? `target="_blank" rel="noopener"` : "";

      return `
        <a href="${escapeHtml(item.url)}" ${target}>
          ${escapeHtml(item.label)}
        </a>
      `;
    })
    .join("");
}

function openMenuDrawer() {
  menuDrawer.classList.add("open");
  menuDrawer.setAttribute("aria-hidden", "false");
}

function closeMenuDrawer() {
  menuDrawer.classList.remove("open");
  menuDrawer.setAttribute("aria-hidden", "true");
}

menuButton.addEventListener("click", openMenuDrawer);
closeMenu.addEventListener("click", closeMenuDrawer);

menuDrawer.addEventListener("click", (event) => {
  if (event.target === menuDrawer) {
    closeMenuDrawer();
  }
});

storeMenuItems.addEventListener("click", () => {
  closeMenuDrawer();
});
/* -------------------------
   START STOREFRONT
------------------------- */

async function initializeStorefront() {
    try {
        await Promise.all([
            loadShopSettings(),
            loadProducts(),
            loadStoreMenuItems(),
            loadPaymentMethods()
        ]);
    } finally {
        document.body.classList.remove("settings-loading");
    }

    renderCart();

}
function showAddedToBag(productName) {
    let toast = document.getElementById("cartToast");

    if (!toast) {
        toast = document.createElement("div");
        toast.id = "cartToast";
        document.body.appendChild(toast);
    }

    toast.textContent = `🩷 ${productName} added to your bag!`;

    toast.classList.add("show");

    clearTimeout(toast.timeout);

    toast.timeout = setTimeout(() => {
        toast.classList.remove("show");
    }, 2200);
}

function animateBag() {
    const bagButton = document.querySelector(".cart-button");

    if (!bagButton) return;

    bagButton.classList.remove("bag-bounce");

    void bagButton.offsetWidth;

    bagButton.classList.add("bag-bounce");
}
function flyHeartToBag(sourceButton) {
  if (!sourceButton || !cartButton) return;

  const startRect = sourceButton.getBoundingClientRect();
  const endRect = cartButton.getBoundingClientRect();

  const startX = startRect.left + startRect.width / 2;
  const startY = startRect.top + startRect.height / 2;
  const endX = endRect.left + endRect.width / 2;
  const endY = endRect.top + endRect.height / 2;

  // 3 flying hearts
  for (let i = 0; i < 3; i++) {
    const heart = document.createElement("span");
    heart.className = "flying-heart";
    heart.textContent = "♥";

    heart.style.left = `${startX + (Math.random() * 24 - 12)}px`;
    heart.style.top = `${startY + (Math.random() * 24 - 12)}px`;

    document.body.appendChild(heart);

    requestAnimationFrame(() => {
      heart.style.setProperty("--fly-x", `${endX - startX}px`);
      heart.style.setProperty("--fly-y", `${endY - startY}px`);
      heart.style.animationDelay = `${i * 0.08}s`;
      heart.classList.add("fly");
    });

    setTimeout(() => {
      heart.remove();
    }, 1100);
  }

  createBagSparkles(endX, endY);
}

function createBagSparkles(x, y) {
  for (let i = 0; i < 10; i++) {
    const sparkle = document.createElement("span");

    sparkle.textContent = "✨";
    sparkle.style.position = "fixed";
    sparkle.style.left = `${x}px`;
    sparkle.style.top = `${y}px`;
    sparkle.style.fontSize = `${14 + Math.random() * 12}px`;
    sparkle.style.pointerEvents = "none";
    sparkle.style.zIndex = "10002";

    document.body.appendChild(sparkle);

    const angle = Math.random() * Math.PI * 2;
    const distance = 25 + Math.random() * 35;

    sparkle.animate(
      [
        {
          transform: "translate(-50%,-50%) scale(0)",
          opacity: 1
        },
        {
          transform: `translate(${Math.cos(angle) * distance}px, ${
            Math.sin(angle) * distance
          }px) scale(1.4)`,
          opacity: 0
        }
      ],
      {
        duration: 600,
        easing: "ease-out"
      }
    );

    setTimeout(() => sparkle.remove(), 600);
  }
}
initializeStorefront();
