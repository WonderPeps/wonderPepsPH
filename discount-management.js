/* Wonder Peps PH — discount campaign management (On Hand only). */
(() => {
  "use strict";
  const root = document.getElementById("discountManagementSection");
  if (!root || typeof supabaseClient === "undefined") return;
  const money = (value) => new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 2 }).format(Number(value || 0));
  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  let products = [], variants = [], campaigns = [];
  root.innerHTML = `
    <div class="admin-section-header"><div><h2>Discount Management</h2><p class="tiny-note">Create and manage On Hand product and variant discounts.</p></div></div>
    <form id="discountForm" class="admin-form discount-form">
      <input type="hidden" name="id" />
      <label>Discount name<input name="name" maxlength="80" placeholder="e.g. Sweet Sale" required /></label>
      <label>Product<select name="product_id" required><option value="">Choose a product</option></select></label>
      <label>Apply to<select name="variant_id"><option value="">Entire product (all variants)</option></select></label>
      <div class="discount-form-row"><label>Discount type<select name="discount_type"><option value="percent">Percentage (%)</option><option value="fixed">Fixed amount (₱)</option></select></label><label>Discount value<input name="discount_value" type="number" min="0.01" step="0.01" required /></label></div>
      <div class="discount-form-row"><label>Starts at<input name="starts_at" type="datetime-local" /></label><label>Ends at<input name="ends_at" type="datetime-local" /></label></div>
      <label class="discount-active-toggle"><input name="is_active" type="checkbox" checked /> Active</label>
      <div class="modal-actions"><button class="secondary-button" type="button" id="discountCancel" hidden>Cancel edit</button><button class="primary-button" type="submit">Save discount</button></div>
      <p id="discountMessage" class="tiny-note" role="status"></p>
    </form>
    <div class="admin-section-header discount-list-heading"><div><h3>Saved discounts</h3><p class="tiny-note">Variant-specific discounts take priority over a product-wide discount.</p></div></div>
    <div id="discountCampaignList" class="discount-campaign-list"><p class="empty">Loading discounts…</p></div>`;
  const form = root.querySelector("#discountForm"), productSelect = form.elements.product_id, variantSelect = form.elements.variant_id;
  const message = root.querySelector("#discountMessage"), list = root.querySelector("#discountCampaignList");
  function fillProducts(selected = "") {
    productSelect.innerHTML = `<option value="">Choose a product</option>` + products.map(p => `<option value="${esc(p.id)}">${esc(p.name)}</option>`).join("");
    productSelect.value = selected;
    fillVariants();
  }
  function fillVariants(selected = "") {
    const pid = productSelect.value;
    const matches = variants.filter(v => String(v.product_id) === String(pid));
    variantSelect.innerHTML = `<option value="">Entire product (all variants)</option>` + matches.map(v => `<option value="${esc(v.id)}">${esc(v.name)} — ${money(v.price)}</option>`).join("");
    variantSelect.value = selected;
  }
  function reset() { form.reset(); form.elements.id.value = ""; form.elements.is_active.checked = true; fillVariants(); root.querySelector("#discountCancel").hidden = true; form.querySelector('[type="submit"]').textContent = "Save discount"; }
  function render() {
    if (!campaigns.length) { list.innerHTML = `<p class="empty">No discounts yet. Create your first discount above.</p>`; return; }
    list.innerHTML = campaigns.map(c => {
      const p = products.find(x => String(x.id) === String(c.product_id));
      const v = variants.find(x => String(x.id) === String(c.variant_id));
      const schedule = [c.starts_at ? `Starts ${new Date(c.starts_at).toLocaleString()}` : "No start date", c.ends_at ? `Ends ${new Date(c.ends_at).toLocaleString()}` : "No end date"].join(" · ");
      return `<article class="discount-campaign-card"><div class="discount-campaign-copy"><strong>${esc(c.name)}</strong><span>${esc(p?.name || "Deleted product")}${v ? ` · ${esc(v.name)}` : " · All variants"}</span><b>${c.discount_type === "percent" ? `${Number(c.discount_value)}% off` : `${money(c.discount_value)} off`}</b><small>${esc(schedule)}</small><small class="discount-status ${c.is_active ? "is-active" : "is-paused"}">${c.is_active ? "Active" : "Paused"}</small></div><div class="discount-actions"><button class="secondary-button" type="button" data-edit="${esc(c.id)}">Edit</button><button class="secondary-button" type="button" data-toggle="${esc(c.id)}">${c.is_active ? "Pause" : "Activate"}</button><button class="secondary-button danger" type="button" data-delete="${esc(c.id)}">Delete</button></div></article>`;
    }).join("");
  }
  async function load() {
    list.innerHTML = `<p class="empty">Loading discounts…</p>`;
    const [p, v, c] = await Promise.all([
      supabaseClient.from("products").select("id,name,price,is_active").order("name"),
      supabaseClient.from("product_variants").select("id,product_id,name,price,is_active").order("sort_order"),
      supabaseClient.from("discount_campaigns").select("*").order("created_at", { ascending: false })
    ]);
    if (p.error || v.error || c.error) { list.innerHTML = `<p class="empty">Could not load discounts: ${esc((p.error || v.error || c.error).message)}</p>`; return; }
    products = (p.data || []).filter(x => x.is_active !== false); variants = (v.data || []).filter(x => x.is_active !== false); campaigns = c.data || [];
    fillProducts(productSelect.value); render();
  }
  productSelect.addEventListener("change", () => fillVariants());
  form.addEventListener("submit", async (event) => {
    event.preventDefault(); message.textContent = "Saving…";
    const data = new FormData(form), id = data.get("id"), value = Number(data.get("discount_value"));
    const starts = data.get("starts_at"), ends = data.get("ends_at");
    if (!(value > 0) || (data.get("discount_type") === "percent" && value > 100)) { message.textContent = "Enter a valid discount (percentage must be 1–100)."; return; }
    if (starts && ends && new Date(ends) <= new Date(starts)) { message.textContent = "End date must be later than the start date."; return; }
    const payload = { name: String(data.get("name")).trim(), product_id: data.get("product_id"), variant_id: data.get("variant_id") || null, discount_type: data.get("discount_type"), discount_value: value, starts_at: starts ? new Date(starts).toISOString() : null, ends_at: ends ? new Date(ends).toISOString() : null, is_active: form.elements.is_active.checked };
    const result = id ? await supabaseClient.from("discount_campaigns").update(payload).eq("id", id) : await supabaseClient.from("discount_campaigns").insert(payload);
    if (result.error) { message.textContent = `Could not save: ${result.error.message}`; return; }
    message.textContent = "Discount saved."; reset(); await load();
  });
  root.querySelector("#discountCancel").addEventListener("click", reset);
  list.addEventListener("click", async (event) => {
    const edit = event.target.closest("[data-edit]"), toggle = event.target.closest("[data-toggle]"), del = event.target.closest("[data-delete]");
    if (edit) { const c = campaigns.find(x => String(x.id) === edit.dataset.edit); if (!c) return; form.elements.id.value = c.id; form.elements.name.value = c.name; fillProducts(c.product_id); fillVariants(c.variant_id || ""); form.elements.discount_type.value = c.discount_type; form.elements.discount_value.value = c.discount_value; form.elements.starts_at.value = c.starts_at ? new Date(c.starts_at).toISOString().slice(0,16) : ""; form.elements.ends_at.value = c.ends_at ? new Date(c.ends_at).toISOString().slice(0,16) : ""; form.elements.is_active.checked = c.is_active; root.querySelector("#discountCancel").hidden = false; form.querySelector('[type="submit"]').textContent = "Update discount"; form.scrollIntoView({ behavior: "smooth", block: "start" }); return; }
    if (toggle) { const c = campaigns.find(x => String(x.id) === toggle.dataset.toggle); if (!c) return; const { error } = await supabaseClient.from("discount_campaigns").update({ is_active: !c.is_active }).eq("id", c.id); if (error) alert(error.message); else await load(); return; }
    if (del) { const c = campaigns.find(x => String(x.id) === del.dataset.delete); if (!c || !confirm(`Delete discount “${c.name}”?`)) return; const { error } = await supabaseClient.from("discount_campaigns").delete().eq("id", c.id); if (error) alert(error.message); else await load(); }
  });
  load();
})();
