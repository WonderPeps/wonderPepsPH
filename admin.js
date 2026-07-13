
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

function loadSettings() {
  let s = DEFAULT_SETTINGS;
  try { s = { ...DEFAULT_SETTINGS, ...(JSON.parse(localStorage.getItem("wp_settings")) || {}) }; } catch {}
  const f = document.querySelector("#settingsForm");
  Object.keys(DEFAULT_SETTINGS).forEach(k => f.elements[k].value = s[k] ?? "");
}
document.querySelector("#settingsForm").addEventListener("submit", e => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.currentTarget).entries());
  localStorage.setItem("wp_settings", JSON.stringify(data));
  alert("Shop profile saved.");
});

const DEFAULT_PRODUCTS = [
  { id: "tirz-15", name: "Tirzepatide 15 mg", price: 1500, stock: 10, category: "Peptide", emoji: "♡", description: "Product listing ready for your price, photo, and details." },
  { id: "tirz-30", name: "Tirzepatide 30 mg", price: 2000, stock: 10, category: "Peptide", emoji: "♡", description: "Product listing ready for your price, photo, and details." },
  { id: "tirz-60", name: "Tirzepatide 60 mg", price: 2500, stock: 10, category: "Peptide", emoji: "♡", description: "Product listing ready for your price, photo, and details." },
  { id: "gluta-1200", name: "Glutaone 1200 mg", price: 650, stock: 10, category: "Glutathione", emoji: "✧", description: "Product listing ready for your price, photo, and details." }
];
const currency = new Intl.NumberFormat("en-PH", { style:"currency", currency:"PHP", maximumFractionDigits:0 });

function products() {
  try { return JSON.parse(localStorage.getItem("wp_products")) || DEFAULT_PRODUCTS; } catch { return DEFAULT_PRODUCTS; }
}
function saveProducts(value) {
  localStorage.setItem("wp_products", JSON.stringify(value));
  renderProducts();
}
function renderProducts() {
  const list = document.querySelector("#adminProducts");
  list.innerHTML = products().map(p => `
    <article class="admin-product">
      <div>
        <strong>${p.name}</strong>
        <div>${currency.format(p.price)} · Stock ${p.stock}</div>
      </div>
      <div class="admin-actions">
        <button class="secondary-button" data-edit="${p.id}">Edit</button>
        <button class="secondary-button danger" data-delete="${p.id}">Delete</button>
      </div>
    </article>
  `).join("");
  list.querySelectorAll("[data-edit]").forEach(b => b.onclick = () => editProduct(b.dataset.edit));
  list.querySelectorAll("[data-delete]").forEach(b => b.onclick = () => deleteProduct(b.dataset.delete));
}
function editProduct(id) {
  const p = products().find(p => p.id === id);
  if (!p) return;
  const f = document.querySelector("#productForm");
  ["id","name","price","stock","category","image","description"].forEach(k => f.elements[k].value = p[k] ?? "");
  document.querySelector("#formTitle").textContent = "Edit product";
  document.querySelector("#cancelEdit").hidden = false;
  scrollTo({top:0,behavior:"smooth"});
}
function deleteProduct(id) {
  if (!confirm("Delete this product?")) return;
  saveProducts(products().filter(p => p.id !== id));
}
function resetForm() {
  const f = document.querySelector("#productForm");
  f.reset();
  f.elements.id.value = "";
  document.querySelector("#formTitle").textContent = "Add product";
  document.querySelector("#cancelEdit").hidden = true;
}
document.querySelector("#productForm").addEventListener("submit", e => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.currentTarget).entries());
  data.price = Number(data.price);
  data.stock = Number(data.stock);
  data.id = data.id || `${data.name.toLowerCase().replace(/[^a-z0-9]+/g,"-")}-${Date.now().toString().slice(-4)}`;
  data.emoji = "♡";
  const all = products();
  const index = all.findIndex(p => p.id === data.id);
  if (index >= 0) all[index] = {...all[index], ...data};
  else all.unshift(data);
  saveProducts(all);
  resetForm();
});
document.querySelector("#cancelEdit").onclick = resetForm;
document.querySelector("#resetButton").onclick = () => {
  if (!confirm("Reset products, cart, and orders on this device?")) return;
  localStorage.removeItem("wp_products");
  localStorage.removeItem("wp_cart");
  localStorage.removeItem("wp_orders");
  localStorage.setItem("wp_products", JSON.stringify(DEFAULT_PRODUCTS));
  renderProducts();
  renderOrders();
};
function renderOrders() {
  const list = document.querySelector("#ordersList");
  let orders = [];
  try { orders = JSON.parse(localStorage.getItem("wp_orders")) || []; } catch {}
  list.innerHTML = orders.map(o => `
    <article class="order-card">
      <strong>${o.reference}</strong>
      <p>${o.customer.name} · ${o.customer.phone}</p>
      <p>${o.items.map(i => `${i.qty}× ${i.name}`).join(", ")}</p>
      <p><strong>${currency.format(o.total)}</strong> · ${o.customer.payment} · ${o.status}</p>
    </article>
  `).join("") || `<div class="empty">No orders placed on this device yet.</div>`;
}
if (!localStorage.getItem("wp_products")) localStorage.setItem("wp_products", JSON.stringify(DEFAULT_PRODUCTS));
loadSettings();
renderProducts();
renderOrders();
