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

const successDialog = document.querySelector("#successDialog");
const orderReference = document.querySelector("#orderReference");
const closeSuccess = document.querySelector("#closeSuccess");

let products = [];
let cart = [];

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
        addToCart(button.dataset.addProduct);
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

function addToCart(productId) {
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

  renderCart();
  openCart();
}

function removeFromCart(productId) {
  cart = cart.filter(
    (item) => String(item.productId) !== String(productId)
  );

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

checkoutForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!cart.length) {
    alert("Your bag is empty.");
    return;
  }

  const submitButton = checkoutForm.querySelector(
    'button[type="submit"]'
  );

  submitButton.disabled = true;
  submitButton.textContent = "Placing order…";

  try {
    const formData = new FormData(checkoutForm);

    const reference = createOrderReference();
    const shippingFee = getSelectedShippingFee();
    const subtotal = calculateSubtotal();
    const total = subtotal + shippingFee;

    const orderData = {
      order_reference: reference,
      customer_name: String(
        formData.get("name") || ""
      ).trim(),
      phone: String(formData.get("phone") || "").trim(),
      address: String(formData.get("address") || "").trim(),
      payment_method: String(
        formData.get("payment") || ""
      ).trim(),
      notes:
        String(formData.get("notes") || "").trim() || null,
      shipping_fee: shippingFee,
      subtotal,
      total,
      status: "Pending"
    };

    const { data: order, error: orderError } =
      await supabaseClient
        .from("orders")
        .insert(orderData)
        .select("id, order_reference")
        .single();

    if (orderError) {
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
        line_total:
          Number(product.price) * Number(item.quantity)
      };
    });

    const { error: itemsError } = await supabaseClient
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      throw itemsError;
    }

    cart = [];
    renderCart();
    checkoutForm.reset();
    checkoutDialog.close();

    orderReference.textContent = order.order_reference;
    successDialog.showModal();
  } catch (error) {
    console.error("Checkout error:", error);

    alert(
      `Could not place your order: ${
        error?.message || "Unknown error"
      }`
    );
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Place order";
  }
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
await Promise.all([
  loadShopSettings(),
  loadProducts(),
  loadStoreMenuItems()
]);

  renderCart();
}

initializeStorefront();
