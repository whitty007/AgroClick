/* =========================================================
   shop.js — "Manage My Shop" dashboard: add/remove items,
   toggle stock, view incoming orders, view reviews.
   ========================================================= */

let _currentShopId = null;
let _newItemPhoto = "assets/placeholder-crop.svg";

function initManageShopPage(){
  const user = requireLogin("manage-shop.html");
  if(!user) return;

  const shop = DB.getShopByOwner(user.mobile);
  if(!shop){
    toast(getLang()==='ta' ? "முதலில் ஒரு கடையை உருவாக்குங்கள்" : "Create a shop first", "info");
    location.href = "become-shop-owner.html";
    return;
  }
  _currentShopId = shop.id;
  document.getElementById("shopNameHeading").textContent = shop.name;
  document.getElementById("shopLocBadge").textContent = shop.location;

  wireTabs();
  renderItems();
  renderOrders();
  renderReviews();

  document.getElementById("addItemBtn").addEventListener("click", ()=>openModal("addItemModal"));
  document.getElementById("removeShopBtn").addEventListener("click", removeMyShop);
  document.getElementById("addItemForm").addEventListener("submit", onAddItem);
  document.getElementById("itemPhotoInput").addEventListener("change", (e)=>{
    const file = e.target.files[0];
    if(!file) return;
    fileToDataURL(file, (url)=>{
      _newItemPhoto = url;
      const prev = document.getElementById("itemPhotoPreview");
      prev.src = url; prev.style.display = "block";
    });
  });

  document.addEventListener("agroclick:langchange", ()=>{ renderItems(); renderOrders(); renderReviews(); });
}

function wireTabs(){
  document.querySelectorAll(".tab-btn").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      document.querySelectorAll(".tab-btn").forEach(b=>{
        b.classList.remove("active");
        b.setAttribute("aria-selected", "false");
      });
      document.querySelectorAll(".tab-panel").forEach(p=>p.classList.remove("active"));
      btn.classList.add("active");
      btn.setAttribute("aria-selected", "true");
      document.getElementById(btn.dataset.tab).classList.add("active");
    });
  });
}

function currentShop(){ return DB.getShop(_currentShopId); }

function renderItems(){
  const shop = currentShop();
  const mount = document.getElementById("itemsGrid");
  const empty = document.getElementById("itemsEmpty");
  if(shop.items.length === 0){
    mount.innerHTML = "";
    empty.style.display = "block";
    return;
  }
  empty.style.display = "none";
  mount.innerHTML = shop.items.map(item=>`
    <div class="card manage-item-card ${item.outOfStock?'out':''}">
      <img class="card-img" src="${item.image}" alt="${escapeHtml(item.name)}">
      <div class="card-body">
        <h3>${escapeHtml(item.name)}</h3>
        <div class="card-price">₹${item.price}${t('per_kg')}</div>
        <div class="card-meta">${escapeHtml(item.desc || "")}</div>
        <span class="badge ${item.outOfStock?'badge-out':'badge-stock'}">${item.outOfStock?t('out_of_stock'):t('in_stock')}</span>
      </div>
      <div class="card-foot">
        <button class="btn btn-secondary btn-sm" onclick="toggleStock('${item.id}')">${item.outOfStock?t('mark_in_stock'):t('mark_out_of_stock')}</button>
        <button class="btn btn-danger btn-sm" onclick="removeItem('${item.id}')">${t('remove_item')}</button>
      </div>
    </div>`).join("");
}

function toggleStock(itemId){
  const shop = currentShop();
  const item = shop.items.find(i=>i.id===itemId);
  if(!item) return;
  item.outOfStock = !item.outOfStock;
  DB.saveShop(shop);
  renderItems();
  toast(item.outOfStock ? t('out_of_stock') : t('in_stock'), "info");
}

function removeItem(itemId){
  if(!confirm(t('confirm_remove_item'))) return;
  const shop = currentShop();
  shop.items = shop.items.filter(i=>i.id!==itemId);
  DB.saveShop(shop);
  renderItems();
}

function removeMyShop(){
  const shop = currentShop();
  if(!shop) return;
  if(!confirm(t('confirm_remove_shop'))) return;
  DB.removeShop(shop.id);
  toast(t('shop_removed_msg'), "success");
  location.href = "become-shop-owner.html";
}

function onAddItem(e){
  e.preventDefault();
  const name = document.getElementById("itemNameInput").value.trim();
  const price = parseFloat(document.getElementById("itemPriceInput").value);
  const desc = document.getElementById("itemDescInput").value.trim();
  if(!name || !price || price<=0){
    toast(getLang()==='ta' ? "பெயர் மற்றும் விலையை சரிபார்க்கவும்" : "Check the name and price", "error");
    return;
  }
  const shop = currentShop();
  shop.items.push({
    id:newId("item"), name, price, desc,
    image:_newItemPhoto, outOfStock:false,
  });
  DB.saveShop(shop);
  closeModal("addItemModal");
  document.getElementById("addItemForm").reset();
  document.getElementById("itemPhotoPreview").style.display = "none";
  _newItemPhoto = "assets/placeholder-crop.svg";
  renderItems();
  toast(getLang()==='ta' ? "பொருள் சேர்க்கப்பட்டது" : "Item added", "success");
}

function renderOrders(){
  const shop = currentShop();
  const orders = DB.ordersForShop(shop.id);
  const mount = document.getElementById("ordersList");
  const empty = document.getElementById("ordersEmpty");
  if(orders.length===0){ mount.innerHTML=""; empty.style.display="block"; return; }
  empty.style.display = "none";
  mount.innerHTML = orders.map(o=>`
    <div class="order-row">
      <div>
        <strong>${escapeHtml(o.customerName)}</strong> · <span class="muted">${new Date(o.date).toLocaleDateString()}</span><br>
        <span class="muted" style="font-size:.85rem;">${o.items.map(it=>`${escapeHtml(it.name)} × ${it.qty}`).join(", ")}</span>
      </div>
      <div style="text-align:right;">
        <div><strong>₹${o.total}</strong></div>
        <span class="order-status">${t(o.status === 'delivered' ? 'order_status_delivered' : 'order_status_placed')}</span>
        ${o.status !== 'delivered' ? `<button class="btn btn-secondary btn-sm mt-1" onclick="markOrderDelivered('${o.id}')">${t('btn_mark_delivered')}</button>` : ""}
      </div>
    </div>`).join("");
}

function markOrderDelivered(orderId){
  const updated = DB.updateOrder(orderId, { status: 'delivered' });
  if(!updated) return;
  renderOrders();
  toast(t('order_status_delivered'), 'success');
}

function renderReviews(){
  const shop = currentShop();
  const mount = document.getElementById("reviewsList");
  const empty = document.getElementById("reviewsEmpty");
  if(!shop.reviews || shop.reviews.length===0){ mount.innerHTML=""; empty.style.display="block"; return; }
  empty.style.display = "none";
  mount.innerHTML = shop.reviews.map(r=>`
    <div class="review-row">
      <div>
        <strong>${escapeHtml(r.customer)}</strong> · <span class="muted">${new Date(r.date).toLocaleDateString()}</span>
        <p style="margin:.3em 0 0;">${escapeHtml(r.comment)}</p>
      </div>
      <span class="stars">${"★".repeat(r.rating)}${"☆".repeat(5-r.rating)}</span>
    </div>`).join("");
}
