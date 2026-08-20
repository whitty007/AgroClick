/* =========================================================
   cart.js — cart grouped by shop, quantity editing, and
   checkout via Razorpay.
   ---------------------------------------------------------
   Put your real Razorpay TEST key below to try real Razorpay
   Checkout (sign up free at razorpay.com → Dashboard → API
   Keys). Until you do, "Pay & Order" uses a clearly-labelled
   demo payment dialog so the site still works end-to-end.
   Real production payments ALSO need a backend to create the
   order and verify the payment signature — Razorpay docs:
   https://razorpay.com/docs/payments/server-integration/
   ========================================================= */

const RAZORPAY_KEY_ID = ""; // e.g. "rzp_test_xxxxxxxxxxxxxx" — leave blank for demo mode

function initCartPage(){
  renderCart();
  document.addEventListener("agroclick:langchange", renderCart);
}

function renderCart(){
  const mount = document.getElementById("cartGroups");
  const empty = document.getElementById("cartEmpty");
  const cart = DB.getCart();
  const shopIds = Object.keys(cart);

  if(shopIds.length === 0){
    mount.innerHTML = "";
    empty.style.display = "block";
    return;
  }
  empty.style.display = "none";

  mount.innerHTML = shopIds.map(shopId=>{
    const shop = DB.getShop(shopId);
    if(!shop) return "";
    const lines = Object.entries(cart[shopId]).map(([itemId, qty])=>{
      const item = shop.items.find(i=>i.id===itemId);
      if(!item) return null;
      return { item, qty };
    }).filter(Boolean);
    const subtotal = lines.reduce((sum,l)=>sum + l.item.price*l.qty, 0);

    return `
    <div class="cart-shop-group">
      <h3>${escapeHtml(shop.name)} <span class="muted" style="font-size:.8rem;">· ${escapeHtml(shop.location)}</span></h3>
      ${lines.map(l=>`
        <div class="cart-line">
          <img src="${l.item.image}" alt="">
          <div class="name">${escapeHtml(l.item.name)}<div class="muted" style="font-size:.78rem;">₹${l.item.price}${t('per_kg')}</div></div>
          <div class="qty-stepper">
            <button onclick="changeQty('${shopId}','${l.item.id}', -1)">−</button>
            <span>${l.qty}</span>
            <button onclick="changeQty('${shopId}','${l.item.id}', 1)">+</button>
          </div>
          <div class="lineprice">₹${l.item.price*l.qty}</div>
        </div>`).join("")}
      <div class="cart-summary-row">
        <span>${t('subtotal')}</span>
        <span>₹${subtotal}</span>
      </div>
      <button class="btn btn-primary btn-block mt-2" onclick="payShop('${shopId}', ${subtotal})">${t('btn_pay_order')}</button>
    </div>`;
  }).join("");
}

function changeQty(shopId, itemId, delta){
  const cart = DB.getCart();
  const current = (cart[shopId] && cart[shopId][itemId]) || 0;
  DB.setCartQty(shopId, itemId, current + delta);
  renderCart();
}

function payShop(shopId, amount){
  const user = requireLogin("cart.html");
  if(!user) return;
  if(amount <= 0) return;

  const shop = DB.getShop(shopId);
  if(RAZORPAY_KEY_ID && window.Razorpay){
    try {
      const options = {
        key: RAZORPAY_KEY_ID,
        amount: Math.round(amount * 100),
        currency: "INR",
        name: "AgroClick",
        description: shop.name,
        handler: function(response){
          completeOrder(shopId, amount);
        },
        prefill: { contact: user.mobile, name: user.name },
        theme: { color: "#3F6B35" },
      };
      const rzp = new Razorpay(options);
      rzp.on("payment.failed", function(){
        toast(getLang()==='ta' ? "கட்டணம் தோல்வியடைந்தது" : "Payment failed", "error");
      });
      rzp.open();
    } catch(err) {
      console.error("Razorpay init failed:", err);
      toast(getLang()==='ta' ? "Razorpay ஏற்ற முடியவில்லை" : "Could not load payment gateway", "error");
    }
  }else{
    const label = getLang()==='ta'
      ? `₹${amount} செலுத்தி ஆர்டர் செய்யவா?`
      : `Pay ₹${amount} and place this order?`;
    if(confirm(label)) completeOrder(shopId, amount);
  }
}

function completeOrder(shopId, amount){
  const user = DB.getCurrentUser();
  const shop = DB.getShop(shopId);
  const cart = DB.getCart()[shopId] || {};
  const items = Object.entries(cart).map(([itemId, qty])=>{
    const item = shop.items.find(i=>i.id===itemId);
    return item ? { itemId, name:item.name, qty, price:item.price } : null;
  }).filter(Boolean);

  const order = {
    id: newId("order"),
    shopId: shop.id,
    shopName: shop.name,
    customerMobile: user.mobile,
    customerName: user.name,
    items, total: amount,
    status: "placed",
    date: Date.now(),
  };
  DB.addOrder(order);
  DB.clearShopCart(shopId);
  alert(t('order_confirmed'));
  renderCart();
  renderNavbar(); // refresh so "My Orders" link appears
}
