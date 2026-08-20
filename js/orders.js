/* =========================================================
   orders.js — customer's order history (my-orders.html)
   ========================================================= */

function initMyOrdersPage(){
  const user = requireLogin("my-orders.html");
  if(!user) return;
  renderMyOrders(user);
  document.addEventListener("agroclick:langchange", ()=>renderMyOrders(user));
}

function renderMyOrders(user){
  const orders = DB.ordersForCustomer(user.mobile);
  const mount = document.getElementById("ordersList");
  const empty = document.getElementById("ordersEmpty");
  if(orders.length === 0){
    mount.innerHTML = "";
    empty.style.display = "block";
    return;
  }
  empty.style.display = "none";
  mount.innerHTML = orders.map(o=>`
    <div class="order-row">
      <div>
        <strong>${escapeHtml(o.shopName)}</strong> · <span class="muted">${new Date(o.date).toLocaleString()}</span><br>
        <span class="muted" style="font-size:.85rem;">${o.items.map(it=>`${escapeHtml(it.name)} × ${it.qty}`).join(", ")}</span>
      </div>
      <div style="text-align:right;">
        <div>${t('order_total')}: <strong>₹${o.total}</strong></div>
        <span class="order-status">${t(o.status === 'delivered' ? 'order_status_delivered' : 'order_status_placed')}</span>
      </div>
    </div>`).join("");
}
