const money = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 2 });
const statusEl = document.querySelector("#salesPageStatus");
const contentEl = document.querySelector("#salesContent");
const summaryEl = document.querySelector("#salesSummary");
const tableBody = document.querySelector("#salesTableBody");
const cardsEl = document.querySelector("#salesCards");
const dialog = document.querySelector("#saleDialog");
const form = document.querySelector("#saleForm");
const formStatus = document.querySelector("#saleFormStatus");
const titleEl = document.querySelector("#saleDialogTitle");
const filters = { search: document.querySelector("#salesSearch"), from: document.querySelector("#salesDateFrom"), to: document.querySelector("#salesDateTo"), source: document.querySelector("#salesSource"), status: document.querySelector("#salesStatusFilter") };
let records = [];

const esc = (v) => String(v ?? "").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");
const num = (v) => Number(v || 0);
const revenue = (r) => num(r.gross_amount) + num(r.shipping_amount);
const expenses = (r) => num(r.cost_amount) + num(r.platform_fees) + num(r.other_expenses);
const net = (r) => revenue(r) - expenses(r);
const localInputDate = (value = new Date()) => { const d = new Date(value); const pad = (n) => String(n).padStart(2,"0"); return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`; };

async function verifyAccess(){
  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) return location.replace("admin.html");
  const { data, error } = await supabaseClient.rpc("is_admin");
  if (error || data !== true) return location.replace("admin.html");
  await loadSales();
}

async function loadSales(){
  statusEl.textContent="Loading sales…";
  const { data, error } = await supabaseClient.from("sales_records").select("*").order("sale_date",{ascending:false});
  if(error){statusEl.textContent=`Sales tracker needs setup: ${error.message}`;return;}
  records=data||[];statusEl.textContent="";contentEl.hidden=false;render();
}

function filtered(){
  const q=filters.search.value.trim().toLowerCase(); const from=filters.from.value?new Date(`${filters.from.value}T00:00:00`):null; const to=filters.to.value?new Date(`${filters.to.value}T23:59:59`):null;
  return records.filter(r=>{const d=new Date(r.sale_date);return(!q||[r.reference,r.customer_name,r.channel].some(v=>String(v||"").toLowerCase().includes(q)))&&(!from||d>=from)&&(!to||d<=to)&&(filters.source.value==="all"||r.source===filters.source.value)&&(filters.status.value==="all"||r.status===filters.status.value);});
}

function render(){
  const rows=filtered(); const active=rows.filter(r=>r.status!=="voided"); const totalRevenue=active.reduce((s,r)=>s+revenue(r),0); const totalExpenses=active.reduce((s,r)=>s+expenses(r),0); const totalNet=totalRevenue-totalExpenses;
  summaryEl.innerHTML=`<article class="sales-stat"><span>Recorded sales</span><strong>${active.length}</strong></article><article class="sales-stat"><span>Total revenue</span><strong>${money.format(totalRevenue)}</strong></article><article class="sales-stat"><span>Total expenses</span><strong>${money.format(totalExpenses)}</strong></article><article class="sales-stat net"><span>Estimated net</span><strong>${money.format(totalNet)}</strong></article>`;
  if(!rows.length){tableBody.innerHTML='<tr><td colspan="7">No sales match these filters.</td></tr>';cardsEl.innerHTML='<p>No sales match these filters.</p>';return;}
  tableBody.innerHTML=rows.map(r=>`<tr class="${r.status==='voided'?'voided':''}"><td>${new Date(r.sale_date).toLocaleDateString()}</td><td><strong>${esc(r.reference||'—')}</strong><br><small>${esc(r.customer_name||'')}</small></td><td><span class="sales-source">${esc(r.channel||r.source)}</span></td><td>${money.format(revenue(r))}</td><td>${money.format(expenses(r))}</td><td class="net-positive">${money.format(net(r))}</td><td><button class="secondary-button" data-edit-sale="${r.id}">Edit</button>${r.source==='manual'?` <button class="secondary-button danger" data-delete-sale="${r.id}">Delete</button>`:''}</td></tr>`).join('');
  cardsEl.innerHTML=rows.map(r=>`<article class="sales-mobile-card ${r.status==='voided'?'voided':''}"><header><div><strong>${esc(r.reference||'—')}</strong><small>${esc(r.customer_name||'')}</small></div><span class="sales-source">${esc(r.channel||r.source)}</span></header><div class="amount-row"><span>Revenue<br><strong>${money.format(revenue(r))}</strong></span><span>Expenses<br><strong>${money.format(expenses(r))}</strong></span><span>Net<br><strong>${money.format(net(r))}</strong></span></div><p><button class="secondary-button" data-edit-sale="${r.id}">Edit</button>${r.source==='manual'?` <button class="secondary-button danger" data-delete-sale="${r.id}">Delete</button>`:''}</p></article>`).join('');
}

function openForm(record=null){form.reset();form.elements.id.value=record?.id||"";form.elements.source.value=record?.source||"manual";titleEl.textContent=record?"Edit sale":"Add manual sale";form.elements.saleDate.value=localInputDate(record?.sale_date);form.elements.reference.value=record?.reference||"";form.elements.channel.value=record?.channel||"";form.elements.customerName.value=record?.customer_name||"";form.elements.grossAmount.value=num(record?.gross_amount);form.elements.shippingAmount.value=num(record?.shipping_amount);form.elements.costAmount.value=num(record?.cost_amount);form.elements.platformFees.value=num(record?.platform_fees);form.elements.otherExpenses.value=num(record?.other_expenses);form.elements.notes.value=record?.notes||"";formStatus.textContent="";dialog.showModal();}

form.addEventListener("submit",async e=>{e.preventDefault();const f=new FormData(form);const id=String(f.get("id")||"");const values={sale_date:new Date(String(f.get("saleDate"))).toISOString(),reference:String(f.get("reference")||"").trim(),channel:String(f.get("channel")||"").trim(),customer_name:String(f.get("customerName")||"").trim()||null,gross_amount:num(f.get("grossAmount")),shipping_amount:num(f.get("shippingAmount")),cost_amount:num(f.get("costAmount")),platform_fees:num(f.get("platformFees")),other_expenses:num(f.get("otherExpenses")),notes:String(f.get("notes")||"").trim()||null,updated_at:new Date().toISOString()};formStatus.textContent="Saving…";const query=id?supabaseClient.from("sales_records").update(values).eq("id",id):supabaseClient.from("sales_records").insert({...values,source:"manual",status:"recorded"});const{error}=await query;if(error){formStatus.textContent=error.message;return;}dialog.close();await loadSales();});

async function handleAction(e){const edit=e.target.closest("[data-edit-sale]");if(edit)return openForm(records.find(r=>String(r.id)===edit.dataset.editSale));const del=e.target.closest("[data-delete-sale]");if(!del||!confirm("Delete this manual sale?"))return;const{error}=await supabaseClient.from("sales_records").delete().eq("id",del.dataset.deleteSale).eq("source","manual");if(error)return alert(error.message);await loadSales();}
tableBody.addEventListener("click",handleAction);cardsEl.addEventListener("click",handleAction);
Object.values(filters).forEach(el=>el.addEventListener("input",render));
document.querySelector("#openManualSale").addEventListener("click",()=>openForm());document.querySelector("#closeSaleDialog").addEventListener("click",()=>dialog.close());document.querySelector("#cancelSale").addEventListener("click",()=>dialog.close());
document.querySelector("#exportSales").addEventListener("click",()=>{const rows=filtered();const cells=v=>`"${String(v??"").replaceAll('"','""')}"`;const csv=[["Date","Reference","Source","Channel","Customer","Gross","Shipping","Cost","Fees","Other expenses","Net","Status","Notes"],...rows.map(r=>[r.sale_date,r.reference,r.source,r.channel,r.customer_name,r.gross_amount,r.shipping_amount,r.cost_amount,r.platform_fees,r.other_expenses,net(r),r.status,r.notes])].map(row=>row.map(cells).join(",")).join("\n");const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));a.download=`wonderpeps-sales-${new Date().toISOString().slice(0,10)}.csv`;a.click();URL.revokeObjectURL(a.href);});
verifyAccess();
