
const DEFAULT_SETTINGS = {
  shopName: "Wonder Peps PH",
  logoUrl: "",
  heroTitle: "Soft pink shopping made easy.",
  heroSubtitle: "Browse products, add them to your bag, and send your order details in just a few taps.",
  facebook: "",
  tiktok: "",
  shipping90Label: "Nearby area",
  shipping120Label: "Standard shipping",
  shipping150Label: "Farther area"
};

function getSettings() {
  try {
    return { ...DEFAULT_SETTINGS, ...(JSON.parse(localStorage.getItem("wp_settings")) || {}) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function applySettings() {
  const s = getSettings();
  document.title = s.shopName;
  document.querySelector("#brandName").innerHTML = s.shopName.replace(/\sPH$/i, ' <small>PH</small>');
  document.querySelector("#heroTitle").textContent = s.heroTitle;
  document.querySelector("#heroSubtitle").textContent = s.heroSubtitle;
  document.querySelector("#footerBrand").textContent = `© ${s.shopName}`;

  const logo = document.querySelector("#brandLogo");
  const fallback = document.querySelector("#brandFallback");
  if (s.logoUrl) {
    logo.src = s.logoUrl;
    logo.hidden = false;
    fallback.hidden = true;
  } else {
    logo.hidden = true;
    fallback.hidden = false;
  }

  const fb = document.querySelector("#facebookLink");
  const tt = document.querySelector("#tiktokLink");
  if (s.facebook) { fb.href = s.facebook; fb.hidden = false; } else fb.hidden = true;
  if (s.tiktok) { tt.href = s.tiktok; tt.hidden = false; } else tt.hidden = true;

  const ship = document.querySelector('select[name="shipping"]');
  if (ship) {
    ship.options[1].textContent = `₱90 — ${s.shipping90Label}`;
    ship.options[2].textContent = `₱120 — ${s.shipping120Label}`;
    ship.options[3].textContent = `₱150 — ${s.shipping150Label}`;
  }
}

const DEFAULT_PRODUCTS = [
  { id: "tirz-15", name: "Tirzepatide 15 mg", price: 1500, stock: 10, category: "Peptide", emoji: "♡", description: "Product listing ready for your price, photo, and details." },
  { id: "tirz-30", name: "Tirzepatide 30 mg", price: 2000, stock: 10, category: "Peptide", emoji: "♡", description: "Product listing ready for your price, photo, and details." },
  { id: "tirz-60", name: "Tirzepatide 60 mg", price: 2500, stock: 10, category: "Peptide", emoji: "♡", description: "Product listing ready for your price, photo, and details." },
  { id: "gluta-1200", name: "Glutaone 1200 mg", price: 650, stock: 10, category: "Glutathione", emoji: "✧", description: "Product listing ready for your price, photo, and details." }
];

const currency = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 });

function getProducts() {
  const saved = localStorage.getItem("wp_products");
  if (!saved) {
    localStorage.setItem("wp_products", JSON.stringify(DEFAULT_PRODUCTS));
    return DEFAULT_PRODUCTS;
  }
  try { return JSON.parse(saved); } catch { return DEFAULT_PRODUCTS; }
}

function getCart() {
  try { return JSON.parse(localStorage.getItem("wp_cart")) || []; } catch { return []; }
}

function saveCart(cart) {
  localStorage.setItem("wp_cart", JSON.stringify(cart));
  renderCart();
}

function renderProducts(filter = "") {
  const grid = document.querySelector("#productGrid");
  const products = getProducts().filter(p => p.name.toLowerCase().includes(filter.toLowerCase()));
  grid.innerHTML = products.map(p => `
    <article class="product-card">
      <div class="product-image">${p.image ? `<img src="${p.image}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover">` : p.emoji || "♡"}</div>
      <div class="product-body">
        <span class="stock">${p.stock > 0 ? `${p.stock} in stock` : "Sold out"}</span>
        <h3>${p.name}</h3>
        <p>${p.description || ""}</p>
        <div class="price-row">
          <strong>${p.price > 0 ? currency.format(p.price) : "Price to be added"}</strong>
        </div>
        <button class="add-button" data-add="${p.id}" ${p.stock < 1 ? "disabled" : ""}>Add to bag</button>
      </div>
    </article>
  `).join("") || `<div class="empty">No products found.</div>`;

  grid.querySelectorAll("[data-add]").forEach(btn => {
    btn.addEventListener("click", () => addToCart(btn.dataset.add));
  });
}

function addToCart(productId) {
  const product = getProducts().find(p => p.id === productId);
  if (!product || product.stock < 1) return;
  const cart = getCart();
  const found = cart.find(i => i.id === productId);
  if (found) found.qty += 1;
  else cart.push({ id: productId, qty: 1 });
  saveCart(cart);
  document.querySelector("#cartDrawer").classList.add("open");
}

function renderCart() {
  const cart = getCart();
  const products = getProducts();
  const container = document.querySelector("#cartItems");
  let subtotal = 0;
  let count = 0;

  const rows = cart.map(item => {
    const product = products.find(p => p.id === item.id);
    if (!product) return "";
    subtotal += product.price * item.qty;
    count += item.qty;
    return `
      <div class="cart-item">
        <div class="cart-thumb">${product.emoji || "♡"}</div>
        <div>
          <strong>${product.name}</strong>
          <div>${currency.format(product.price)}</div>
        </div>
        <div class="qty">
          <button data-dec="${item.id}">−</button>
          <span>${item.qty}</span>
          <button data-inc="${item.id}">+</button>
        </div>
      </div>
    `;
  }).join("");

  container.innerHTML = rows || `<div class="empty">Your bag is empty.</div>`;
  document.querySelector("#cartSubtotal").textContent = currency.format(subtotal);
  document.querySelector("#checkoutTotal").textContent = currency.format(subtotal + getSelectedShipping());
  document.querySelector("#cartCount").textContent = count;

  container.querySelectorAll("[data-inc]").forEach(btn => btn.onclick = () => changeQty(btn.dataset.inc, 1));
  container.querySelectorAll("[data-dec]").forEach(btn => btn.onclick = () => changeQty(btn.dataset.dec, -1));
}

function changeQty(id, amount) {
  let cart = getCart();
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += amount;
  cart = cart.filter(i => i.qty > 0);
  saveCart(cart);
}


function getSelectedShipping() {
  const field = document.querySelector('select[name="shipping"]');
  return field ? Number(field.value || 0) : 0;
}

function updateCheckoutTotal() {
  const cart = getCart();
  const products = getProducts();
  const subtotal = cart.reduce((sum, item) => {
    const p = products.find(p => p.id === item.id);
    return sum + ((p?.price || 0) * item.qty);
  }, 0);
  document.querySelector("#checkoutTotal").textContent = currency.format(subtotal + getSelectedShipping());
}

function createOrder(formData) {
  const cart = getCart();
  const products = getProducts();
  const items = cart.map(i => {
    const p = products.find(p => p.id === i.id);
    return { id: i.id, name: p?.name || i.id, price: p?.price || 0, qty: i.qty };
  });
  const shipping = Number(formData.get("shipping") || 0);
  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0) + shipping;
  const reference = `WPPH-${Date.now().toString().slice(-8)}`;
  const order = {
    reference,
    createdAt: new Date().toISOString(),
    status: "Pending",
    customer: Object.fromEntries(formData.entries()),
    shipping,
    items,
    total
  };
  const orders = JSON.parse(localStorage.getItem("wp_orders") || "[]");
  orders.unshift(order);
  localStorage.setItem("wp_orders", JSON.stringify(orders));
  localStorage.removeItem("wp_cart");
  renderCart();
  return reference;
}

document.querySelector("#searchInput").addEventListener("input", e => renderProducts(e.target.value));
document.querySelector("#cartButton").onclick = () => document.querySelector("#cartDrawer").classList.add("open");
document.querySelector("#closeCart").onclick = () => document.querySelector("#cartDrawer").classList.remove("open");
document.querySelector("#cartDrawer").addEventListener("click", e => {
  if (e.target.id === "cartDrawer") e.currentTarget.classList.remove("open");
});
document.querySelector('select[name="shipping"]')?.addEventListener("change", updateCheckoutTotal);

document.querySelector("#checkoutButton").onclick = () => {
  if (!getCart().length) return alert("Your bag is empty.");
  document.querySelector("#checkoutDialog").showModal();
};
document.querySelector("#closeCheckout").onclick = () => document.querySelector("#checkoutDialog").close();
document.querySelector("#checkoutForm").addEventListener("submit", e => {
  e.preventDefault();
  const reference = createOrder(new FormData(e.currentTarget));
  e.currentTarget.reset();
  document.querySelector("#checkoutDialog").close();
  document.querySelector("#orderReference").textContent = reference;
  document.querySelector("#successDialog").showModal();
});
document.querySelector("#closeSuccess").onclick = () => document.querySelector("#successDialog").close();

applySettings();
renderProducts();
renderCart();
