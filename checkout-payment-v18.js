const currency = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  maximumFractionDigits: 0
});

const brandName = document.querySelector("#brandName");
const brandLogo = document.querySelector("#brandLogo");
const brandFallback = document.querySelector("#brandFallback");
const menuBrandName = document.querySelector("#menuBrandName");
const menuBrandLogo = document.querySelector("#menuBrandLogo");
const menuBrandFallback = document.querySelector("#menuBrandFallback");
const menuBrandTagline = document.querySelector("#menuBrandTagline");
const heroTitle = document.querySelector("#heroTitle");
const heroSubtitle = document.querySelector("#heroSubtitle");
const heroEyebrow = document.querySelector("#heroEyebrow");
const heroImage = document.querySelector("#heroImage");
const heroFallback = document.querySelector("#heroFallback");
const catalogEyebrow = document.querySelector("#catalogEyebrow");
const catalogTitle = document.querySelector("#catalogTitle");
const catalogSubtitle = document.querySelector("#catalogSubtitle");
const catalogHeading = document.querySelector(".section-heading");
const footerBrand = document.querySelector("#footerBrand");
const facebookLink = document.querySelector("#facebookLink");
const tiktokLink = document.querySelector("#tiktokLink");

const productGrid = document.querySelector("#productGrid");
const variantDialog = document.querySelector("#variantDialog");
const closeVariantDialogButton = document.querySelector(
  "#closeVariantDialog"
);
const variantDialogTitle = document.querySelector(
  "#variantDialogTitle"
);
const variantDialogProductName = document.querySelector(
  "#variantDialogProductName"
);
const variantDialogDescription = document.querySelector(
  "#variantDialogDescription"
);
const variantDialogImage = document.querySelector(
  "#variantDialogImage"
);
const variantDialogImageFallback = document.querySelector(
  "#variantDialogImageFallback"
);
const variantOptions = document.querySelector("#variantOptions");
const variantSelectedPrice = document.querySelector(
  "#variantSelectedPrice"
);
const variantSelectedStock = document.querySelector(
  "#variantSelectedStock"
);
const variantQuantity = document.querySelector("#variantQuantity");
const decreaseVariantQuantity = document.querySelector(
  "#decreaseVariantQuantity"
);
const increaseVariantQuantity = document.querySelector(
  "#increaseVariantQuantity"
);
const confirmVariantButton = document.querySelector(
  "#confirmVariantButton"
);
const variantDialogError = document.querySelector(
  "#variantDialogError"
);
const searchInput = document.querySelector("#searchInput");

const cartButton = document.querySelector("#cartButton");
const cartCount = document.querySelector("#cartCount");
const cartDrawer = document.querySelector("#cartDrawer");
const closeCart = document.querySelector("#closeCart");
const favoritesDrawer = document.getElementById("favoritesDrawer");
const favoritesButton = document.getElementById("favoritesButton");
const closeFavorites = document.getElementById("closeFavorites");
const cartItems = document.querySelector("#cartItems");
const cartSubtotal = document.querySelector("#cartSubtotal");
const checkoutButton = document.querySelector("#checkoutButton");
const closeCheckout = document.querySelector("#closeCheckout");
const checkoutDialog = document.querySelector("#checkoutDialog");
const checkoutForm = document.querySelector("#checkoutForm");
const checkoutTotal = document.querySelector("#checkoutTotal");
const paymentMethodsList = document.querySelector("#paymentMethodsList");
const selectedPaymentInput = document.querySelector("#selectedPaymentInput");
const selectedShippingInput = document.querySelector("#selectedShippingInput");
const shippingFeeOptions = document.querySelector("#shippingFeeOptions");
const selectedShippingMethodInput = document.querySelector("#selectedShippingMethodInput");
const shippingMethodOptions = document.querySelector("#shippingMethodOptions");
const shippingFeeSection = document.querySelector("#shippingFeeSection");
const shippingFeeHelp = document.querySelector("#shippingFeeHelp");
const externalCheckoutSection = document.querySelector("#externalCheckoutSection");
const externalCheckoutMessage = document.querySelector("#externalCheckoutMessage");
const externalCheckoutLink = document.querySelector("#externalCheckoutLink");
const paymentMethodSection = document.querySelector("#paymentMethodSection");
const orderNotesField = document.querySelector("#orderNotesField");
const checkoutTotalRow = document.querySelector("#checkoutTotalRow");
const proceedPaymentButton = document.querySelector("#proceedPaymentButton");
const checkoutFormError = document.querySelector("#checkoutFormError");
const paymentStepDialog = document.querySelector("#paymentStepDialog");
const paymentStepContent = document.querySelector("#paymentStepContent");
const paymentStepBackButton = document.querySelector("#paymentStepBackButton");
const paymentStepContinueButton = document.querySelector("#paymentStepContinueButton");
const paymentStepCloseButton = document.querySelector("#paymentStepCloseButton");

const successDialog = document.querySelector("#successDialog");

const orderReference = document.querySelector("#orderReference");
const successExternalCheckout = document.querySelector("#successExternalCheckout");
const successExternalMessage = document.querySelector("#successExternalMessage");
const successExternalLink = document.querySelector("#successExternalLink");
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
let selectedCategory = "All";
let products = [];
let productVariants = [];
let productSoldCounts = new Map();
let activeVariantProduct = null;
let selectedVariant = null;
let selectedVariantQuantity = 1;
let variantSourceButton = null;
let cart = loadSavedCart();
let paymentMethods = [];
let paymentMethodShippingLinks = [];
let selectedPaymentMethod = null;
let shippingFees = [];
let selectedShippingFee = null;
let shippingMethods = [];
let selectedShippingMethod = null;
let paymentStepReceiptFile = null;
let paymentStepReceiptPreviewUrl = null;
let storefrontCategoryOrder = [];

function startStorefrontAtTop() {
  if (window.location.hash) return;

  const previousScrollBehavior = document.documentElement.style.scrollBehavior;
  document.documentElement.style.scrollBehavior = "auto";
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  requestAnimationFrame(() => {
    document.documentElement.style.scrollBehavior = previousScrollBehavior;
  });
}

// Messenger and other in-app browsers sometimes restore a previous scroll position
// after the document first paints. Repeat this after their restoration point.
window.addEventListener("pageshow", startStorefrontAtTop);
window.addEventListener("load", () => {
  // Messenger restores its remembered position later than a normal mobile browser.
  // Reset through its full restore window, but only during the page's first seconds.
  [0, 80, 250, 600, 1200, 1800].forEach((delay) => {
    setTimeout(startStorefrontAtTop, delay);
  });
});

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

function isCashOnDeliveryMethod(method = selectedPaymentMethod) {
  return /cash\s*on\s*delivery|\bcod\b/i.test(
    String(method?.payment_name || "")
  );
}

function showStoreNotice(message, type = "warning", title = "Just a moment 🌸") {
  let notice = document.getElementById("storeNotice");

  if (!notice) {
    notice = document.createElement("div");
    notice.id = "storeNotice";
    notice.setAttribute("role", "status");
    notice.setAttribute("aria-live", "polite");
    notice.innerHTML = '<span class="store-notice-icon" aria-hidden="true">♡</span><span class="store-notice-copy"><strong class="store-notice-title"></strong><span class="store-notice-message"></span></span>';
    document.body.appendChild(notice);
  }

  notice.className = `store-notice store-notice-${type}`;
  notice.querySelector(".store-notice-title").textContent = title;
  notice.querySelector(".store-notice-message").textContent = message;
  requestAnimationFrame(() => notice.classList.add("show"));

  clearTimeout(notice.hideTimeout);
  notice.hideTimeout = setTimeout(() => notice.classList.remove("show"), 2800);
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
    showStoreNotice(message, "error");
  }
}

const pageScrollLockOwners = new Set();
let lockedPageScrollY = 0;

function lockPageScroll(owner) {
  if (!owner || pageScrollLockOwners.has(owner)) return;

  if (pageScrollLockOwners.size === 0) {
    lockedPageScrollY = window.scrollY || window.pageYOffset || 0;
    document.body.style.top = `-${lockedPageScrollY}px`;
    document.body.classList.add("page-scroll-locked");
  }

  pageScrollLockOwners.add(owner);
}

function unlockPageScroll(owner) {
  if (owner) pageScrollLockOwners.delete(owner);
  if (pageScrollLockOwners.size > 0) return;

  document.body.classList.remove("page-scroll-locked");
  document.body.style.top = "";

  const previousScrollBehavior = document.documentElement.style.scrollBehavior;
  document.documentElement.style.scrollBehavior = "auto";
  window.scrollTo(0, lockedPageScrollY);
  requestAnimationFrame(() => {
    document.documentElement.style.scrollBehavior = previousScrollBehavior;
  });
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
    ) + '<span class="brand-heart" aria-hidden="true">♥</span>';
  }

  if (menuBrandName) {
    menuBrandName.innerHTML = escapeHtml(shopName).replace(
      /\sPH$/i,
      " <small>PH</small>"
    );
  }

  if (menuBrandTagline) {
    menuBrandTagline.textContent =
      settings.menu_tagline || "Everything lovely, in one place";
  }

  if (heroTitle) {
    const configuredHeroTitle =
      settings.hero_title || "Soft pink shopping made easy.";
    heroTitle.innerHTML = escapeHtml(configuredHeroTitle).replace(
      /\sPH$/i,
      ' <small class="hero-title-ph">PH</small>'
    );
  }

  if (heroSubtitle) {
    heroSubtitle.textContent =
      settings.hero_subtitle ||
      "Browse products, add them to your bag, and send your order details in just a few taps.";
  }

  if (heroEyebrow) {
    heroEyebrow.textContent = settings.hero_eyebrow || "";
}

  if (catalogEyebrow) {
    catalogEyebrow.textContent =
      settings.catalog_eyebrow || "OUR COLLECTION";
  }

  if (catalogTitle) {
    catalogTitle.textContent =
      settings.catalog_title || "Find your new favorite";
  }

  if (catalogSubtitle) {
    catalogSubtitle.textContent =
      settings.catalog_subtitle ||
      "Sweet little picks, chosen just for you.";
  }

  if (catalogHeading) {
    const catalogImageUrl = String(settings.catalog_image_url || "").trim();
    if (catalogImageUrl) {
      catalogHeading.style.setProperty(
        "--catalog-image",
        `url(${JSON.stringify(catalogImageUrl)})`
      );
    } else {
      // Never fall back to a bundled bunny image. The catalog artwork is
      // controlled only by the image selected in Admin settings.
      catalogHeading.style.setProperty("--catalog-image", "none");
    }
  }

  if (footerBrand) {
    footerBrand.textContent = `© ${shopName}`;
  }

  if (brandLogo && brandFallback) {
    brandLogo.hidden = true;
    brandFallback.hidden = true;
  }

  if (menuBrandLogo && menuBrandFallback) {
    if (settings.logo_url) {
      menuBrandLogo.src = settings.logo_url;
      menuBrandLogo.hidden = false;
      menuBrandFallback.hidden = true;
    } else {
      menuBrandLogo.hidden = true;
      menuBrandFallback.hidden = false;
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

  // Load category order from admin settings
  if (settings.category_order && Array.isArray(settings.category_order)) {
    storefrontCategoryOrder = settings.category_order;
  } else {
    storefrontCategoryOrder = [];
  }

}

/* -------------------------
   PRODUCTS
------------------------- */

async function loadProducts() {
  const grid = productGrid || document.getElementById("favoritesGrid");
   grid.innerHTML = `
   <p class="empty">Loading products...</p>
`;

  const [
    { data: productData, error: productError },
    { data: variantData, error: variantError },
    { data: soldData, error: soldError }
  ] = await Promise.all([
    supabaseClient
      .from("products")
      .select("*")
      .eq("is_visible", true)
      .order("created_at", { ascending: false }),

    supabaseClient
      .from("product_variants")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),

    // This RPC returns aggregate totals only, so no customer/order details are
    // exposed to storefront visitors. See supabase-sold-counts.sql.
    supabaseClient.rpc("get_product_sold_counts")
  ]);
  if (productError) {
     grid.innerHTML = `
      <p class="empty">
        Could not load products: ${escapeHtml(productError.message)}
      </p>
    `;
    return;
  }

  if (variantError) {
    console.error(
      "Could not load product variants:",
      variantError.message
    );
  }

  productVariants = variantData || [];
  productSoldCounts = new Map(
    (soldError ? [] : soldData || []).map((row) => [
      String(row.product_id),
      Number(row.sold_count || 0)
    ])
  );

  if (soldError) {
    console.warn("Could not load sold counts:", soldError.message);
  }

  products = (productData || []).map((product) => ({
    ...product,
    variants: productVariants.filter(
      (variant) =>
        String(variant.product_id) === String(product.id)
    )
  }));
if (typeof pruneMissingFavorites === "function") {
  pruneMissingFavorites(products);
}
const isFavoritesPage = !!document.getElementById("favoritesGrid");

if (isFavoritesPage) {
  const favoriteIds = getFavorites();

  const favoriteProducts = products.filter((product) =>
    favoriteIds.includes(String(product.id))
  );

  renderProducts(favoriteProducts, grid);
} else {
  renderProducts(products, grid);

  renderCategoryFilters();
}
if (typeof renderFavoritesDrawer === "function") {
    renderFavoritesDrawer();
}

if (typeof updateFavoritesBadge === "function") {
    updateFavoritesBadge();
}
}
function getProductVariants(productId) {
  return productVariants.filter(
    (variant) =>
      String(variant.product_id) === String(productId)
  );
}

function formatSoldCount(count) {
  const amount = Number(count || 0);
  if (amount < 1000) return String(amount);
  const compact = amount >= 10000
    ? Math.round(amount / 1000)
    : Math.round(amount / 100) / 10;
  return `${compact}K`;
}
function renderCategoryFilters() {

    const container = document.getElementById("categoryFilters");

    if (!container) return;

    const allCategories = [
        ...new Set(
            products
                .map(product => product.category)
                .filter(Boolean)
        )
    ];

    // Use saved category order from admin, or default to alphabetical
    let orderedCategories = [];
    if (storefrontCategoryOrder.length > 0) {
      // Use admin-set order, but only for categories that exist
      orderedCategories = storefrontCategoryOrder.filter(cat => allCategories.includes(cat));
      // Add any new categories not in saved order
      const newCats = allCategories.filter(cat => !orderedCategories.includes(cat));
      orderedCategories = [...orderedCategories, ...newCats.sort()];
    } else {
      // Fallback to alphabetical if no saved order
      orderedCategories = allCategories.sort();
    }

    const categories = ["All", ...orderedCategories];

    container.innerHTML = categories
        .map(category => `
            <button
                class="category-chip ${selectedCategory === category ? "active" : ""}"
                data-category="${category}">
                ${category}
            </button>
        `)
        .join("");

    container.querySelectorAll(".category-chip")
        .forEach(button => {

            button.addEventListener("click", () => {

                selectedCategory = button.dataset.category;

                renderCategoryFilters();

                if (selectedCategory === "All") {

                    renderProducts(products);

                } else {

                    renderProducts(
                        products.filter(
                            product =>
                                product.category === selectedCategory
                        )
                    );

                }

            });

        });

}
function renderProducts(list, grid = productGrid) {
  if (!list.length) {
     grid.innerHTML =
      `<p class="empty">No products are available yet.</p>`;
    return;
  }

   grid.innerHTML = list
    .map((product) => {
      const variants = getProductVariants(product.id);
      const hasVariants = variants.length > 0;
      const soldCount = productSoldCounts.get(String(product.id)) || 0;
      const productBadge = String(product.badge || "").trim().slice(0, 24);
const displayedStock = hasVariants
  ? variants.reduce(
      (total, variant) =>
        total + Number(variant.stock || 0),
      0
    )
  : Number(product.stock || 0);
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

${productBadge ? `<span class="product-badge">${productBadge}</span>` : ""}

<button
    class="favorite-button ${isFavorite(product.id) ? "is-favorite" : ""}"
    type="button"
    aria-label="${isFavorite(product.id) ? "Remove from favorites" : "Add to favorites"}"
    data-favorite-product="${product.id}">

    <svg
        class="favorite-icon"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true">

        <path
            d="M12 21C12 21 3 15.5 3 8.8C3 5.6 5.4 3.5 8.2 3.5C10.1 3.5 11.4 4.5 12 5.7C12.6 4.5 13.9 3.5 15.8 3.5C18.6 3.5 21 5.6 21 8.8C21 15.5 12 21 12 21Z" />
    </svg>

</button>

    ${image}

    <div class="product-body">
            <h3>${escapeHtml(product.name)}</h3>

            <p class="product-description">
              ${escapeHtml(String(product.description || "").trim())}
            </p>

            <div class="price-row">
              <strong>${formatCurrency(product.price)}</strong>
            </div>

            <div class="product-stats" aria-label="Product availability and sales">
              <span class="stock">Stock: ${displayedStock}</span>
              ${soldCount > 0 ? `<span class="sold-count">${formatSoldCount(soldCount)} sold</span>` : ""}
            </div>

            <button
              class="add-button"
              type="button"
              data-add-product="${product.id}"
              ${displayedStock < 1 ? "disabled" : ""}
            >
              ${
                displayedStock < 1
                  ? "Out of stock"
                  : hasVariants
                    ? "Choose variant"
                    : "Add to bag"
              }
            </button>
          </div>
        </article>
      `;
    })
    .join("");
   grid
    .querySelectorAll("[data-add-product]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        const product = getProductById(
          button.dataset.addProduct
        );
       
        if (!product) return;

        const variants = getProductVariants(product.id);

        if (variants.length) {
          openVariantSelector(product, button);
        } else {
          addToCart(product.id, button);
        }
      });
    });
   }
   const activeGrid =
   productGrid || document.getElementById("favoritesGrid");

   if (activeGrid) {
   activeGrid.addEventListener("click", (event) => {
    const button = event.target.closest("[data-favorite-product]");

    if (!button) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const productId = button.dataset.favoriteProduct;

const added = toggleFavorite(productId);

button.classList.toggle("is-favorite", added);
button.setAttribute(
  "aria-label",
  added ? "Remove from favorites" : "Add to favorites"
);

const favoritesGrid = document.getElementById("favoritesGrid");

if (favoritesGrid && !added) {
  const favoriteIds = getFavorites();

  const favoriteProducts = products.filter((product) =>
    favoriteIds.includes(String(product.id))
  );

  renderProducts(favoriteProducts, favoritesGrid);
}
  });
}

if (searchInput) {
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
}

function resetVariantDialog() {
  activeVariantProduct = null;
  selectedVariant = null;
  selectedVariantQuantity = 1;
  variantSourceButton = null;

  variantOptions.innerHTML = "";
  variantSelectedPrice.textContent = formatCurrency(0);
  variantSelectedStock.textContent = "—";
  variantQuantity.textContent = "1";
  variantDialogError.textContent = "";
  confirmVariantButton.disabled = true;
}

function updateVariantDialogImage(product, variant) {
  const imageUrl = variant?.image_url || product?.image_url || "";

  if (imageUrl) {
    variantDialogImage.src = imageUrl;
    variantDialogImage.alt = `${product.name} ${variant?.name || ""}`.trim();
    variantDialogImage.hidden = false;
    variantDialogImageFallback.hidden = true;
  } else {
    variantDialogImage.removeAttribute("src");
    variantDialogImage.hidden = true;
    variantDialogImageFallback.hidden = false;
  }
}

function selectVariant(variantId) {
  const variants = getProductVariants(activeVariantProduct?.id);

  selectedVariant =
    variants.find(
      (variant) => String(variant.id) === String(variantId)
    ) || null;

  if (!selectedVariant) return;

  selectedVariantQuantity = 1;

  variantOptions
    .querySelectorAll("[data-variant-option]")
    .forEach((option) => {
      option.classList.toggle(
        "selected",
        String(option.dataset.variantOption) ===
          String(selectedVariant.id)
      );
    });

  variantOptions
    .querySelectorAll('input[type="radio"]')
    .forEach((input) => {
      input.checked =
        String(input.value) === String(selectedVariant.id);
    });

  variantSelectedPrice.textContent =
    formatCurrency(selectedVariant.price);

  variantSelectedStock.textContent =
    String(Number(selectedVariant.stock || 0));

  variantQuantity.textContent = "1";

  variantDialogError.textContent = "";

  confirmVariantButton.disabled =
    Number(selectedVariant.stock || 0) < 1;

  updateVariantDialogImage(
    activeVariantProduct,
    selectedVariant
  );
}

function openVariantSelector(product, sourceButton = null) {
  resetVariantDialog();

  activeVariantProduct = product;
  variantSourceButton = sourceButton;

  const variants = getProductVariants(product.id);

  variantDialogTitle.textContent = "Choose Variant";
  variantDialogProductName.textContent = product.name;
  variantDialogDescription.textContent =
    product.description || "";

  updateVariantDialogImage(product, null);

  variantOptions.innerHTML = variants
    .map((variant) => {
      const outOfStock = Number(variant.stock || 0) < 1;

      return `
        <label
          class="variant-option-card${outOfStock ? " disabled" : ""}"
          data-variant-option="${variant.id}"
        >
          <input
            type="radio"
            name="storefrontVariant"
            value="${variant.id}"
            ${outOfStock ? "disabled" : ""}
          />

          <div class="variant-option-main">
            <strong>${escapeHtml(variant.name)}</strong>
            <div class="variant-option-meta">
              <span>${formatCurrency(variant.price)}</span>
              <small>
                ${
                  outOfStock
                    ? "Out of stock"
                    : `Stock: ${Number(variant.stock || 0)}`
                }
              </small>
            </div>
          </div>

          ${
            variant.badge
              ? `<span class="variant-option-badge">${escapeHtml(variant.badge)}</span>`
              : ""
          }
        </label>
      `;
    })
    .join("");

  variantOptions
    .querySelectorAll("[data-variant-option]")
    .forEach((option) => {
      option.addEventListener("click", () => {
        const radio = option.querySelector('input[type="radio"]');

        if (radio?.disabled) return;

        selectVariant(option.dataset.variantOption);
      });
    });

  const defaultVariant =
    variants.find(
      (variant) =>
        variant.is_default &&
        Number(variant.stock || 0) > 0
    ) ||
    variants.find(
      (variant) => Number(variant.stock || 0) > 0
    );

  if (defaultVariant) {
    selectVariant(defaultVariant.id);
  }

  variantDialog.showModal();
}

function closeVariantSelector() {
  variantDialog.close();
  resetVariantDialog();
}

closeVariantDialogButton?.addEventListener(
  "click",
  closeVariantSelector
);

variantDialog?.addEventListener("click", (event) => {
  if (event.target === variantDialog) {
    closeVariantSelector();
  }
});
/* -------------------------
   SHOPPING BAG
------------------------- */
function getCartItem(productId, variantId = null) {
  return cart.find(
    (item) =>
      String(item.productId) === String(productId) &&
      String(item.variantId || "") === String(variantId || "")
  );
}

function getProductById(id) {
  return products.find((product) => String(product.id) === String(id));
}
function addSelectedVariantToCart() {
  if (!activeVariantProduct || !selectedVariant) {
    variantDialogError.textContent =
      "Please choose a variant first.";
    return;
  }

  const availableStock = Number(selectedVariant.stock || 0);

  if (availableStock < 1) {
    variantDialogError.textContent =
      "This variant is currently out of stock.";
    return;
  }

  const existingItem = getCartItem(
    activeVariantProduct.id,
    selectedVariant.id
  );

  const existingQuantity = existingItem
    ? Number(existingItem.quantity || 0)
    : 0;

  const requestedTotal =
    existingQuantity + selectedVariantQuantity;

  if (requestedTotal > availableStock) {
    variantDialogError.textContent =
      "You cannot add more than the available stock.";
    return;
  }

  if (existingItem) {
    existingItem.quantity = requestedTotal;
  } else {
    cart.push({
      productId: activeVariantProduct.id,
      variantId: selectedVariant.id,
      variantName: selectedVariant.name,
      variantSku: selectedVariant.sku || null,
      unitPrice: Number(selectedVariant.price || 0),
      imageUrl:
        selectedVariant.image_url ||
        activeVariantProduct.image_url ||
        null,
      quantity: selectedVariantQuantity
    });
  }

  const productName = activeVariantProduct.name;
  const variantName = selectedVariant.name;
  const sourceButton = variantSourceButton;

  saveCart();
  renderCart();
  closeVariantSelector();

  showAddedToBag(`${productName} - ${variantName}`);
  animateBag();

  if (sourceButton) {
    flyHeartToBag(sourceButton);
  }
}                                                                                                                                                                                                                                                                                                                                                                                                                    
decreaseVariantQuantity?.addEventListener("click", () => {
  if (!selectedVariant) return;

  selectedVariantQuantity = Math.max(
    1,
    selectedVariantQuantity - 1
  );

  variantQuantity.textContent = String(selectedVariantQuantity);
  variantDialogError.textContent = "";
});

increaseVariantQuantity?.addEventListener("click", () => {
  if (!selectedVariant) {
    variantDialogError.textContent =
      "Please choose a variant first.";
    return;
  }

  const availableStock = Number(selectedVariant.stock || 0);

  if (selectedVariantQuantity >= availableStock) {
    variantDialogError.textContent =
      "You reached the available stock.";
    return;
  }

  selectedVariantQuantity++;

  variantQuantity.textContent = String(selectedVariantQuantity);
  variantDialogError.textContent = "";
});

confirmVariantButton?.addEventListener(
  "click",
  addSelectedVariantToCart
);

function addToCart(productId, sourceButton = null) {
  const product = getProductById(productId);

  if (!product || Number(product.stock || 0) < 1) {
    showStoreNotice("This product is currently unavailable.");
    return;
  }

  const existingItem = cart.find(
    (item) => String(item.productId) === String(productId)
  );

  const currentQuantity = existingItem ? existingItem.quantity : 0;

  if (currentQuantity >= Number(product.stock)) {
    showStoreNotice(
      "You already have the maximum available quantity in your bag. Please check your bag.",
      "warning",
      "Oopsie! This is the last one 🌸"
    );
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

function removeCartItem(productId, variantId = null) {
  cart = cart.filter(
    (item) =>
      !(
        String(item.productId) === String(productId) &&
        String(item.variantId || "") === String(variantId || "")
      )
  );

  saveCart();
  renderCart();
}

function changeQuantity(productId, variantId, amount) {
  const item = getCartItem(productId, variantId);

  if (!item) return;

  const product = getProductById(productId);

  if (!product) return;

  const stock = item.variantId
    ? Number(
        getProductVariants(productId).find(
          (variant) =>
            String(variant.id) === String(item.variantId)
        )?.stock || 0
      )
    : Number(product.stock || 0);

  const newQuantity = Number(item.quantity || 0) + amount;

  if (newQuantity < 1) {
    removeCartItem(productId, variantId);
    return;
  }

  if (newQuantity > stock) {
    showStoreNotice(
      "You already have the maximum available quantity in your bag. Please check your bag.",
      "warning",
      "Oopsie! This is the last one 🌸"
    );
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

    const itemPrice =
  item.variantId && Number.isFinite(Number(item.unitPrice))
    ? Number(item.unitPrice)
    : Number(product.price || 0);

return total + itemPrice * Number(item.quantity || 0);
  }, 0);
}

function calculateProductCodFee() {
  return roundToTwo(cart.reduce((total, item) => {
    const product = getProductById(item.productId);
    if (!product) return total;
    const variant = item.variantId
      ? product.variants?.find((entry) => String(entry.id) === String(item.variantId))
      : null;
    const fee = variant?.cod_fee == null ? product.cod_fee : variant.cod_fee;
    return total + Math.max(0, Number(fee || 0)) * Number(item.quantity || 0);
  }, 0));
}

function getCodFeeForCart() {
  const hasProductCodFee = cart.some((item) => {
    const product = getProductById(item.productId);
    const variant = item.variantId
      ? product?.variants?.find((entry) => String(entry.id) === String(item.variantId))
      : null;
    const fee = variant?.cod_fee == null ? product?.cod_fee : variant.cod_fee;
    return Math.max(0, Number(fee || 0)) > 0;
  });
  return hasProductCodFee
    ? calculateProductCodFee()
    : Math.max(0, Number(selectedPaymentMethod?.cod_fee || 0));
}

function getSelectedShippingFee() {
  return selectedShippingFee
    ? Number(selectedShippingFee.amount || 0)
    : Number(selectedShippingInput?.value || 0);
}

function updateProceedPaymentAvailability() {
  if (!proceedPaymentButton) return;
  proceedPaymentButton.hidden = false;
  // Keep this button usable so openPaymentStep() can explain exactly which
  // shipping, fee, or payment selection is missing. A disabled button gives
  // customers no feedback and looks broken on mobile.
  proceedPaymentButton.disabled = false;
}

async function loadShippingOptions() {
  if (!shippingMethodOptions) return;
  shippingMethodOptions.innerHTML = '<p class="empty">Loading shipping options…</p>';

  const [{ data: methodData, error: methodError }, { data: feeData, error: feeError }] = await Promise.all([
    supabaseClient.from("shipping_methods").select("*").eq("is_active", true).order("sort_order", { ascending: true }).order("id", { ascending: true }),
    supabaseClient.from("shipping_fees").select("*").eq("is_active", true).order("sort_order", { ascending: true }).order("id", { ascending: true })
  ]);

  if (methodError || feeError) {
    shippingMethods = [];
    shippingFees = [];
    shippingMethodOptions.innerHTML = `<div class="shipping-fee-empty"><strong>Shipping options are unavailable.</strong><span>Please try again shortly.</span></div>`;
    console.error("Could not load shipping options:", methodError?.message || feeError?.message);
    updateProceedPaymentAvailability();
    return;
  }

  shippingMethods = methodData || [];
  shippingFees = feeData || [];
  selectedShippingMethod = null;
  selectedShippingFee = null;
  renderShippingMethods();
  renderShippingFees();
  updateShippingChoiceVisibility();
}

function renderShippingMethods() {
  if (!shippingMethodOptions) return;
  if (!shippingMethods.length) {
    shippingMethodOptions.innerHTML = `<div class="shipping-fee-empty"><strong>No shipping options are available yet.</strong><span>Please contact the shop before checking out.</span></div>`;
    return;
  }
  shippingMethodOptions.innerHTML = shippingMethods.map((method) => {
    const selected = String(selectedShippingMethod?.id) === String(method.id);
    return `<button class="shipping-method-option${selected ? " selected" : ""}" type="button" data-shipping-method="${method.id}" aria-pressed="${selected}">
      <span class="shipping-fee-check" aria-hidden="true">${selected ? "✓" : "♡"}</span>
      <span class="shipping-method-copy"><strong>${escapeHtml(method.name)}</strong><small>${escapeHtml(method.description || (method.method_type === "external" ? "Marketplace shipping checkout" : "Courier delivery"))}</small></span>
      <span class="shipping-method-arrow" aria-hidden="true">›</span>
    </button>`;
  }).join("");
  shippingMethodOptions.querySelectorAll("[data-shipping-method]").forEach((button) => {
    button.addEventListener("click", () => selectShippingMethod(button.dataset.shippingMethod));
  });
}

function feesForSelectedMethod() {
  if (!selectedShippingMethod) return [];
  return shippingFees.filter((fee) => String(fee.shipping_method_id) === String(selectedShippingMethod.id));
}

function renderShippingFees() {
  if (!shippingFeeOptions) return;
  const availableFees = feesForSelectedMethod();
  if (!selectedShippingMethod || selectedShippingMethod.method_type !== "courier") {
    shippingFeeOptions.innerHTML = "";
    return;
  }
  if (!availableFees.length) {
    shippingFeeOptions.innerHTML = `<div class="shipping-fee-empty"><strong>No fees are configured for this courier.</strong><span>Please choose another option or contact the shop.</span></div>`;
    updateProceedPaymentAvailability();
    return;
  }
  shippingFeeOptions.innerHTML = availableFees
    .map((fee) => {
      const isSelected = selectedShippingFee &&
        String(selectedShippingFee.id) === String(fee.id);

      return `
        <button
          class="shipping-fee-option${isSelected ? " selected" : ""}"
          type="button"
          data-shipping-select="${fee.id}"
          aria-pressed="${isSelected ? "true" : "false"}"
        >
          <span class="shipping-fee-check" aria-hidden="true">${isSelected ? "✓" : "♡"}</span>
          <span class="shipping-fee-label">${escapeHtml(fee.label || "Delivery area")}</span>
          <strong>${formatCurrency(fee.amount || 0)}</strong>
        </button>
      `;
    })
    .join("");

  shippingFeeOptions
    .querySelectorAll("[data-shipping-select]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        selectShippingFee(button.dataset.shippingSelect);
      });
    });
}

function updateShippingChoiceVisibility() {
  const isCourier = selectedShippingMethod?.method_type === "courier";
  const isExternal = selectedShippingMethod?.method_type === "external";
  if (shippingFeeSection) shippingFeeSection.hidden = !isCourier;
  if (externalCheckoutSection) externalCheckoutSection.hidden = !isExternal;
  if (shippingFeeHelp && isCourier) shippingFeeHelp.textContent = `Choose the delivery area for ${selectedShippingMethod.name}.`;
  if (externalCheckoutMessage && isExternal) externalCheckoutMessage.textContent = `Pay for your items here first. After payment, you will continue to ${selectedShippingMethod.name} to arrange and pay for shipping.`;
  if (externalCheckoutLink && isExternal) {
    externalCheckoutLink.hidden = true;
  }
  if (paymentMethodSection) paymentMethodSection.hidden = false;
  if (orderNotesField) orderNotesField.hidden = false;
  if (checkoutTotalRow) checkoutTotalRow.hidden = false;
  updateProceedPaymentAvailability();
}

function selectShippingMethod(methodId) {
  const method = shippingMethods.find((item) => String(item.id) === String(methodId));
  if (!method) return;
  selectedShippingMethod = method;
  selectedShippingFee = null;
  if (selectedPaymentMethod && !availablePaymentMethods().some((payment) => String(payment.id) === String(selectedPaymentMethod.id))) {
    selectedPaymentMethod = null;
    if (selectedPaymentInput) selectedPaymentInput.value = "";
  }
  if (selectedShippingMethodInput) selectedShippingMethodInput.value = method.name || "";
  if (selectedShippingInput) {
    selectedShippingInput.value = "";
    delete selectedShippingInput.dataset.shippingId;
  }
  renderShippingMethods();
  renderShippingFees();
  updateShippingChoiceVisibility();
  renderPaymentMethods();
  clearCheckoutFormError();
  updateCheckoutTotal();
}

function selectShippingFee(feeId) {
  const fee = shippingFees.find(
    (item) => String(item.id) === String(feeId)
  );

  if (!fee) return;
  selectedShippingFee = fee;
  if (selectedShippingInput) {
    selectedShippingInput.value = String(Number(fee.amount || 0));
    selectedShippingInput.dataset.shippingId = String(fee.id);
  }
  renderShippingFees();
  clearCheckoutFormError();
  updateCheckoutTotal();
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

      const itemImage =
  item.imageUrl ||
  product.image_url ||
  "";

const itemPrice =
  item.variantId
    ? Number(item.unitPrice || 0)
    : Number(product.price || 0);
      return `
        <article class="cart-item">
          <div class="cart-thumb">
            ${
              itemImage
  ? `
    <img
      src="${escapeHtml(itemImage)}"
      alt="${escapeHtml(product.name)}"
    />
  `
  : "♡"
            }
          </div>

          <div>
            <strong>${escapeHtml(product.name)}</strong>
${
  item.variantId
    ? `
      <p class="cart-variant-name">
        Variant: ${escapeHtml(item.variantName || "")}
      </p>

    `
    : ""
}

            <p>${formatCurrency(itemPrice)}</p>

            <div class="qty">
              <button
                type="button"
                data-decrease-product="${product.id}"
                data-decrease-variant="${item.variantId || ""}"
                aria-label="Decrease quantity">
                −
              </button>

              <span>${item.quantity}</span>

              <button
                type="button"
              data-increase-product="${product.id}"
              data-increase-variant="${item.variantId || ""}"  
                aria-label="Increase quantity">
                +
              </button>
            </div>
          </div>

          <button
  class="icon-button"
  type="button"
  data-remove-product="${product.id}"
  data-remove-variant="${item.variantId || ""}"
  aria-label="Remove product"
>
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
  .querySelectorAll("[data-increase-product]")
  .forEach((button) => {
    button.addEventListener("click", () => {
      changeQuantity(
        button.dataset.increaseProduct,
        button.dataset.increaseVariant || null,
        1
      );
    });
  });

cartItems
  .querySelectorAll("[data-decrease-product]")
  .forEach((button) => {
    button.addEventListener("click", () => {
      changeQuantity(
        button.dataset.decreaseProduct,
        button.dataset.decreaseVariant || null,
        -1
      );
    });
  });

cartItems
  .querySelectorAll("[data-remove-product]")
  .forEach((button) => {
    button.addEventListener("click", () => {
      removeCartItem(
        button.dataset.removeProduct,
        button.dataset.removeVariant || null
      );
    });
  });
}

function openCart() {
  lockPageScroll("cart");
  cartDrawer.classList.add("open");
  cartDrawer.setAttribute("aria-hidden", "false");
}

function closeCartDrawer() {
  cartDrawer.classList.remove("open");
  cartDrawer.setAttribute("aria-hidden", "true");
  unlockPageScroll("cart");
}
function openFavorites() {
  lockPageScroll("favorites");
  favoritesDrawer.classList.add("open");
  favoritesDrawer.setAttribute("aria-hidden", "false");
}

function closeFavoritesDrawer() {
  favoritesDrawer.classList.remove("open");
  favoritesDrawer.setAttribute("aria-hidden", "true");
  unlockPageScroll("favorites");
}
cartButton.addEventListener("click", openCart);

closeCart.addEventListener("click", closeCartDrawer);
favoritesButton.addEventListener("click", openFavorites);

closeFavorites.addEventListener("click", closeFavoritesDrawer);

cartDrawer.addEventListener("click", (event) => {
  if (event.target === cartDrawer) {
    closeCartDrawer();
  }
});

favoritesDrawer.addEventListener("click", (event) => {
  if (event.target === favoritesDrawer) {
    closeFavoritesDrawer();
  }
});

checkoutButton.addEventListener("click", () => {
  if (!cart.length) {
    showStoreNotice("Your bag is empty.");
    return;
  }

  clearCheckoutFormError();
  lockPageScroll("checkout-flow");
  closeCartDrawer();
  updateCheckoutTotal();
  checkoutDialog.showModal();
});

if (closeCheckout) {
  closeCheckout.addEventListener("click", () => {
    checkoutDialog.close();
    unlockPageScroll("checkout-flow");
  });
}
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

  const [{ data, error }, linksResult] = await Promise.all([
    supabaseClient.from("payment_methods").select("*").eq("is_visible", true).order("sort_order", { ascending: true }),
    supabaseClient.from("payment_method_shipping_methods").select("payment_method_id,shipping_method_id")
  ]);

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
    updateProceedPaymentAvailability();
    return;
  }

  paymentMethods = data || [];
  paymentMethodShippingLinks = linksResult.error ? [] : (linksResult.data || []);
  selectedPaymentMethod = null;
  if (selectedPaymentInput) {
    selectedPaymentInput.value = "";
  }
  renderPaymentMethods();
}

function availablePaymentMethods() {
  if (!selectedShippingMethod) return [];
  const allowedIds = new Set(paymentMethodShippingLinks.filter((link) => String(link.shipping_method_id) === String(selectedShippingMethod.id)).map((link) => String(link.payment_method_id)));
  return paymentMethods.filter((method) => allowedIds.has(String(method.id)));
}

function renderPaymentMethods() {
  if (!paymentMethodsList) {
    return;
  }

  const availableMethods = availablePaymentMethods();
  if (!selectedShippingMethod) {
    paymentMethodsList.innerHTML = `<div class="payment-step-summary"><strong>Choose a shipping option first</strong><p class="tiny-note">Available payment methods depend on your selected courier.</p></div>`;
    updateProceedPaymentAvailability();
    return;
  }
  if (!availableMethods.length) {
    paymentMethodsList.innerHTML = `
      <div class="payment-step-summary">
        <strong>No payment methods available</strong>
        <p class="tiny-note">No payment method is assigned to ${escapeHtml(selectedShippingMethod.name || "this shipping option")}.</p>
      </div>
    `;
    updateProceedPaymentAvailability();
    return;
  }

  paymentMethodsList.innerHTML = availableMethods
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

  updateProceedPaymentAvailability();

  paymentMethodsList
    .querySelectorAll("[data-payment-select]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        selectPaymentMethod(button.dataset.paymentSelect);
      });
    });
}

function selectPaymentMethod(methodId) {
  const method = availablePaymentMethods().find(
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
  if (!selectedShippingMethod) {
    showCheckoutError("Please choose a shipping option to continue.");
    shippingMethodOptions?.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }

  if (selectedShippingMethod.method_type === "courier" && !selectedShippingFee) {
    showCheckoutError("Please choose a shipping fee to continue.");
    shippingFeeOptions?.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }

  if (!selectedPaymentMethod) {
    showCheckoutError("Please choose a payment method to continue.");
    return;
  }

  const isCashOnDelivery = isCashOnDeliveryMethod();
  const payOnDeliveryOnly = isCashOnDelivery
    && !selectedPaymentMethod.deposit_required
    && !selectedPaymentMethod.receipt_required
    && !selectedPaymentMethod.reference_required;

  if (selectedShippingMethod.method_type === "external" && payOnDeliveryOnly) {
    showCheckoutError(`Shopee and TikTok shipping require the item to be paid first. Please choose an online payment method.`);
    paymentMethodSection?.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }

  const subtotal = calculateSubtotal();
  const shippingFee = getSelectedShippingFee();
  const codFee = isCashOnDelivery
    ? getCodFeeForCart()
    : 0;
  const total = roundToTwo(subtotal + shippingFee + codFee);
  const depositPercentage = Number(selectedPaymentMethod.deposit_percentage || 0);
  // A deposit covers the selected percentage of the products, plus the full
  // delivery charge. Shipping should never be left for the remaining balance.
  const amountDueNow = payOnDeliveryOnly
    ? 0
    : selectedPaymentMethod.deposit_required
    ? roundToTwo(subtotal * (depositPercentage / 100) + shippingFee)
    : roundToTwo(subtotal + shippingFee);
  const remainingBalance = roundToTwo(total - amountDueNow);
  const instructions = selectedPaymentMethod.short_description || "Please follow the payment instructions provided.";
  const qrUrl = selectedPaymentMethod.qr_url && String(selectedPaymentMethod.qr_url).trim();
  const requiresReceipt = Boolean(selectedPaymentMethod.receipt_required);
  const requiresReference = Boolean(selectedPaymentMethod.reference_required);
  const amountDueLabel = isCashOnDelivery && selectedPaymentMethod.deposit_required
    ? `Pay now (${depositPercentage}% deposit + shipping)`
    : "Amount due now";
  const amountDueRow = payOnDeliveryOnly
    ? ""
    : `<div class="cart-summary payment-row payment-due-row"><div><span>${escapeHtml(amountDueLabel)}</span><strong>${formatCurrency(amountDueNow)}</strong></div></div>`;
  const remainingBalanceRow = selectedPaymentMethod.deposit_required || payOnDeliveryOnly
    ? `<div class="cart-summary payment-row payment-total-row"><div><span>${isCashOnDelivery ? "Pay upon delivery" : "Remaining balance"}</span><strong>${formatCurrency(remainingBalance)}</strong></div></div>`
    : "";
  const codFeeRow = isCashOnDelivery && codFee > 0
    ? `<div class="cart-summary payment-row payment-cod-row"><div><span>COD fee</span><strong>${formatCurrency(codFee)}</strong></div></div>`
    : "";
  const paymentBalanceRows = `${amountDueRow}${remainingBalanceRow}`;
  const noteIsVisible = selectedPaymentMethod.instructions_visible !== false;
  const customInstructions = String(selectedPaymentMethod.instructions || "").trim();
  const formatBuyerNote = (value) => String(value || "")
    .replaceAll("{total}", formatCurrency(total))
    .replaceAll("{cod_fee}", formatCurrency(codFee))
    .replaceAll("{shipping_fee}", formatCurrency(shippingFee));
  const buyerPaymentNote = !noteIsVisible
    ? ""
    : payOnDeliveryOnly
    ? formatBuyerNote(customInstructions || "No payment or receipt is required now. Pay {total} when your courier delivers the order.")
    : isCashOnDelivery
    ? formatBuyerNote(customInstructions || `Pay ${formatCurrency(amountDueNow)} now using the QR code and upload your receipt. The remaining ${formatCurrency(remainingBalance)} will be paid when your order is delivered.`)
    : formatBuyerNote(customInstructions);

  clearPaymentStepReceiptState();
  showPaymentStepFeedback("");

  paymentStepContent.innerHTML = `
    <div class="payment-step-qr ${qrUrl ? "has-qr" : "no-qr"}">
      ${qrUrl
        ? `<img src="${escapeHtml(qrUrl)}" alt="${escapeHtml(selectedPaymentMethod.payment_name || "Payment QR")}" loading="lazy" />`
        : payOnDeliveryOnly
        ? `<div class="payment-step-qr-placeholder payment-cod-status"><span class="payment-status-icon" aria-hidden="true">♡</span><span><strong>No payment needed now</strong><small>Pay when your courier delivers your order.</small></span></div>`
        : `<div class="payment-step-qr-placeholder"><span class="payment-status-icon" aria-hidden="true">✦</span><span><strong>No QR code available</strong><small>Follow the payment instructions below.</small></span></div>`}
    </div>
    <div class="payment-step-summary payment-step-order-summary">
      <div class="payment-step-method">
        <span>Payment method</span>
        <strong>${escapeHtml(selectedPaymentMethod.payment_name || "Payment method")}</strong>
        <p class="tiny-note">${escapeHtml(instructions)}</p>
      </div>
      <div class="cart-summary payment-row payment-product-row"><div><span>Product subtotal</span><strong>${formatCurrency(subtotal)}</strong></div></div>
      <div class="cart-summary payment-row payment-shipping-row"><div><span>Shipping option</span><strong>${escapeHtml(selectedShippingMethod?.name || "—")}</strong></div></div>
      <div class="cart-summary payment-row payment-fee-row"><div><span>Shipping fee</span><strong class="${selectedShippingMethod?.method_type === "external" ? "external-shipping-fee-value" : ""}">${selectedShippingMethod?.method_type === "external" ? `Paid separately via ${escapeHtml(selectedShippingMethod.name)}` : formatCurrency(shippingFee)}</strong></div></div>
      ${codFeeRow}
      ${paymentBalanceRows}
      ${buyerPaymentNote ? `<p class="payment-step-custom-note">♡ ${escapeHtml(buyerPaymentNote)}</p>` : ""}
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

  if (paymentStepContinueButton) {
    paymentStepContinueButton.disabled = false;
    paymentStepContinueButton.textContent = payOnDeliveryOnly || (!requiresReceipt && !requiresReference)
      ? "Place Order"
      : "Continue Payment";
  }

  clearCheckoutFormError();
  checkoutDialog.close();
  paymentStepDialog.showModal();
  paymentStepDialog.scrollTop = 0;
  paymentStepContent.scrollTop = 0;
}

function resetCheckoutState() {
  checkoutForm.reset();
  selectedPaymentMethod = null;
  selectedShippingMethod = null;
  selectedShippingFee = null;
  clearPaymentStepReceiptState();
  showPaymentStepFeedback("");
  if (selectedPaymentInput) {
    selectedPaymentInput.value = "";
  }
  if (selectedShippingInput) {
    selectedShippingInput.value = "";
    delete selectedShippingInput.dataset.shippingId;
  }
  if (selectedShippingMethodInput) selectedShippingMethodInput.value = "";
  renderShippingMethods();
  renderShippingFees();
  updateShippingChoiceVisibility();
  renderPaymentMethods();
  clearCheckoutFormError();
}

async function submitOrder() {
  if (!cart.length) {
    showStoreNotice("Your bag is empty.");
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
    const customerName = String(formData.get("name") || "").trim();
const customerUsername = String(formData.get("username") || "").trim();
const phone = String(formData.get("phone") || "").trim();
const email = String(formData.get("email") || "").trim();

const province = String(formData.get("province") || "").trim();
const city = String(formData.get("city") || "").trim();
const barangay = String(formData.get("barangay") || "").trim();
const street = String(formData.get("street") || "").trim();
const houseUnit = String(formData.get("house_unit") || "").trim();
const zipcode = String(formData.get("zipcode") || "").trim();

const formattedAddress = [
    houseUnit,
    street,
    barangay ? `Barangay ${barangay}` : "",
    city,
    province,
    zipcode
]
.filter(Boolean)
.join(", ");
    const isCashOnDelivery = isCashOnDeliveryMethod();
    const codFee = isCashOnDelivery
      ? getCodFeeForCart()
      : 0;
    const total = roundToTwo(subtotal + shippingFee + codFee);
    const paymentMethodName = String(
      selectedPaymentMethod?.payment_name || formData.get("payment") || ""
    ).trim();
    const payOnDeliveryOnly = isCashOnDelivery
      && !selectedPaymentMethod?.deposit_required
      && !selectedPaymentMethod?.receipt_required
      && !selectedPaymentMethod?.reference_required;
    const amountDueNow = payOnDeliveryOnly
      ? 0
      : selectedPaymentMethod?.deposit_required
      ? roundToTwo(
          subtotal * (Number(selectedPaymentMethod.deposit_percentage || 0) / 100) + shippingFee
        )
      : roundToTwo(subtotal + shippingFee);
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
      customer_name: customerName,
customer_username: customerUsername || null,
phone,
email: email || null,

address: formattedAddress,
province,
city,
barangay,
street,
house_unit: houseUnit,
zipcode: zipcode || null,
      payment_method: paymentMethodName,
      shipping_method: selectedShippingMethod?.name || null,
      shipping_method_type: selectedShippingMethod?.method_type || null,
      notes: String(formData.get("notes") || "").trim() || null,
      shipping_fee: shippingFee,
      payment_fee: codFee,
      subtotal,
      total,
      amount_paid: amountDueNow,
      payment_status: "Pending",
      receipt_image: uploadedReceiptPath,
      reference_number: referenceNumber || null,
      paid_at: uploadedReceiptPath ? new Date().toISOString() : null,
      status: "Pending"
    };

    const orderItems = cart.map((item) => {
  const product = getProductById(item.productId);

  const unitPrice =
    item.variantId && Number.isFinite(Number(item.unitPrice))
      ? Number(item.unitPrice)
      : Number(product.price || 0);

      const variantId =
  item.variantId &&
  String(item.variantId) !== "null" &&
  String(item.variantId) !== "undefined"
    ? item.variantId
    : null;

  return {
    product_id: product.id,
    product_name: product.name,

    variant_id: variantId,
   variant_name: variantId ? item.variantName || null : null,
   variant_sku: variantId ? item.variantSku || null : null,

    unit_price: unitPrice,
    quantity: Number(item.quantity || 0),
    line_total: unitPrice * Number(item.quantity || 0)
  };
});

    const completedShippingMethod = selectedShippingMethod ? { ...selectedShippingMethod } : null;
    const { data: order, error: orderError } = await supabaseClient
      .rpc("place_storefront_order", {
        p_order: orderData,
        p_items: orderItems
      })
      .single();

    if (orderError) {
      if (uploadedReceiptPath) {
        await deleteUploadedReceipt(uploadedReceiptPath);
      }
      throw orderError;
    }

   clearSavedCart();
renderCart();
paymentStepDialog.close();
resetCheckoutState();

    orderReference.textContent = order.order_ref;
    const usesExternalShipping = completedShippingMethod?.method_type === "external";
    successDialog.classList.toggle("external-shipping-success", usesExternalShipping);
    if (successExternalCheckout) successExternalCheckout.hidden = !usesExternalShipping;
    if (usesExternalShipping && successExternalMessage) {
      successExternalMessage.textContent = `Your item payment was submitted. Now continue to ${completedShippingMethod.name} to arrange and pay for shipping.`;
    }
    if (usesExternalShipping && successExternalLink) {
      successExternalLink.href = completedShippingMethod.external_url || "#";
      successExternalLink.textContent = completedShippingMethod.button_label || `Continue to ${completedShippingMethod.name}`;
    }
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
    showStoreNotice("Your bag is empty.");
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
  unlockPageScroll("checkout-flow");
});

successDialog.addEventListener("click", (event) => {
  if (event.target === successDialog) {
    successDialog.close();
    unlockPageScroll("checkout-flow");
  }
});

checkoutDialog.addEventListener("click", (event) => {
  if (event.target === checkoutDialog) {
    checkoutDialog.close();
    unlockPageScroll("checkout-flow");
  }
});

paymentStepDialog.addEventListener("click", (event) => {
  if (event.target === paymentStepDialog) {
    paymentStepDialog.close();
    unlockPageScroll("checkout-flow");
  }
});

paymentStepCloseButton?.addEventListener("click", () => {
  paymentStepDialog.close();
  unlockPageScroll("checkout-flow");
});

[checkoutDialog, paymentStepDialog, successDialog].forEach((dialog) => {
  dialog?.addEventListener("cancel", () => {
    unlockPageScroll("checkout-flow");
  });
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

  const menuGroups = [];

  items.forEach((item) => {
    const sectionName = String(item.section || "Menu").trim() || "Menu";
    let group = menuGroups.find((entry) => entry.name === sectionName);

    if (!group) {
      group = { name: sectionName, items: [] };
      menuGroups.push(group);
    }

    group.items.push(item);
  });

  storeMenuItems.innerHTML = menuGroups
    .map((group, groupIndex) => `
      <section class="store-menu-section" aria-labelledby="menuGroup${groupIndex}">
        <h3 id="menuGroup${groupIndex}" class="store-menu-heading">
          ${escapeHtml(group.name)}
        </h3>
        <div class="store-menu-links">
          ${group.items.map((item) => {
            const target = item.open_new_tab
              ? `target="_blank" rel="noopener"`
              : "";

            return `
              <a class="store-menu-link" href="${escapeHtml(item.url)}" ${target}>
                <span class="store-menu-icon" aria-hidden="true">
                  ${getStoreMenuIcon(item)}
                </span>
                <span class="store-menu-label">${escapeHtml(item.label)}</span>
                <span class="store-menu-arrow" aria-hidden="true">›</span>
              </a>
            `;
          }).join("")}
        </div>
      </section>
    `)
    .join("");
}

function getStoreMenuIcon(item) {
  const searchableText = `${item.label || ""} ${item.section || ""} ${item.url || ""}`.toLowerCase();

  if (/contact|message|email|mail|messenger/.test(searchableText)) {
    return `<svg viewBox="0 0 24 24" fill="none"><path d="M4 6.5h16v11H4z"/><path d="m5 8 7 5 7-5"/></svg>`;
  }

  if (/community|group|join|facebook/.test(searchableText)) {
    return `<svg viewBox="0 0 24 24" fill="none"><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.3"/><path d="M3.5 19c.4-4 2.2-6 5.5-6s5.1 2 5.5 6M14.5 14c3.1-.6 5.2 1 5.7 4"/></svg>`;
  }

  if (/faq|help|question/.test(searchableText)) {
    return `<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9"/><path d="M9.8 9a2.3 2.3 0 1 1 3.5 2c-1 .6-1.3 1.1-1.3 2M12 17h.01"/></svg>`;
  }

  if (/home|shop|store|catalog|product/.test(searchableText)) {
    return `<svg viewBox="0 0 24 24" fill="none"><path d="M6 8h12l1 12H5L6 8Z"/><path d="M9 9V6.7a3 3 0 0 1 6 0V9"/></svg>`;
  }

  return `<svg viewBox="0 0 24 24" fill="none"><path d="M12 20s-7-4.2-7-9.5A3.8 3.8 0 0 1 12 8a3.8 3.8 0 0 1 7 2.5C19 15.8 12 20 12 20Z"/></svg>`;
}

function openMenuDrawer() {
  lockPageScroll("menu");
  menuDrawer.classList.add("open");
  menuDrawer.setAttribute("aria-hidden", "false");
}

function closeMenuDrawer() {
  menuDrawer.classList.remove("open");
  menuDrawer.setAttribute("aria-hidden", "true");
  unlockPageScroll("menu");
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
            loadPaymentMethods(),
            loadShippingOptions()
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
