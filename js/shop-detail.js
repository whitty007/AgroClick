/* =========================================================
   shop-detail.js — single shop's items + reviews (shop-detail.html)
   ========================================================= */

let _detailShopId = null;

function initShopDetailPage(){
  const params = new URLSearchParams(location.search);
  _detailShopId = params.get("shopId");
  const shop = DB.getShop(_detailShopId);
  if(!shop){
    location.href = "shops.html";
    return;
  }

  renderShopHeader(shop);
  renderShopItems(shop);
  renderShopReviews(shop);
  updateCartFab();

  document.getElementById("reviewForm").addEventListener("submit", onSubmitReview);
  document.getElementById("cartFab").addEventListener("click", ()=>location.href="cart.html");
  document.addEventListener("agroclick:langchange", ()=>{
    renderShopItems(DB.getShop(_detailShopId));
    renderShopReviews(DB.getShop(_detailShopId));
  });
}

function renderShopHeader(shop){
  const rating = shopRating(shop);
  document.getElementById("shopHeroImg").src = shop.ownerImage;
  document.getElementById("shopHeroName").textContent = shop.name;
  document.getElementById("shopHeroLoc").textContent = "📍 " + shop.location;
  document.getElementById("shopHeroStars").textContent = rating ? `★ ${rating} (${shop.reviews.length})` : "";
}

function renderShopItems(shop){
  const mount = document.getElementById("itemsGrid");
  const empty = document.getElementById("itemsEmpty");
  if(shop.items.length===0){
    mount.innerHTML=""; empty.style.display="block"; return;
  }
  empty.style.display = "none";
  const cart = DB.getCart()[shop.id] || {};
  mount.innerHTML = shop.items.map(item=>{
    const inCart = cart[item.id] || 0;
    return `
    <div class="card">
      <img class="card-img" src="${item.image}" alt="${escapeHtml(item.name)}">
      <div class="card-body">
        <h3>${escapeHtml(item.name)}</h3>
        <div class="card-price">₹${item.price}${t('per_kg')}</div>
        <div class="card-meta">${escapeHtml(item.desc || "")}</div>
        ${item.outOfStock ? `<span class="badge badge-out">${t('out_of_stock')}</span>` : ``}
      </div>
      <div class="card-foot">
        <button class="btn ${inCart?'btn-secondary':'btn-primary'} btn-block btn-sm"
          ${item.outOfStock ? "disabled" : ""}
          onclick="onAddToCart('${item.id}', this)">
          ${item.outOfStock ? t('out_of_stock') : (inCart ? `✓ ${t('added_label')} (${inCart})` : t('btn_add_to_cart'))}
        </button>
      </div>
    </div>`;
  }).join("");
}

function onAddToCart(itemId, btnEl){
  const user = DB.getCurrentUser();
  if(!user){
    toast(getLang()==='ta' ? "ஆர்டர் செய்ய தயவுசெய்து முதலில் உள்நுழையவும்" : "Please login to add items & place an order", "warning");
    setTimeout(()=>{
      const target = "shop-detail.html?shopId=" + _detailShopId;
      location.href = "login.html?redirect=" + encodeURIComponent(target);
    }, 1000);
    return;
  }
  DB.addToCart(_detailShopId, itemId);
  toast(getLang()==='ta' ? "கார்ட்டில் சேர்க்கப்பட்டது" : "Added to cart", "success");
  renderShopItems(DB.getShop(_detailShopId));
  updateCartFab();
}


function updateCartFab(){
  const fab = document.getElementById("cartFab");
  const count = DB.cartItemCount();
  fab.classList.toggle("show", count>0);
  fab.querySelector(".count").textContent = count;
  fab.querySelector(".label").textContent = t('cart_btn');
}

function renderShopReviews(shop){
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

function onSubmitReview(e){
  e.preventDefault();
  const user = requireLogin("shop-detail.html?shopId=" + _detailShopId);
  if(!user) return;
  const rating = parseInt(document.getElementById("reviewRating").value, 10);
  const comment = document.getElementById("reviewComment").value.trim();
  if(!comment){
    toast(getLang()==='ta' ? "கருத்தை உள்ளிடவும்" : "Please write a comment", "error");
    return;
  }
  const shop = DB.getShop(_detailShopId);
  shop.reviews.push({ id:newId("rev"), customer:user.name, rating, comment, date:Date.now() });
  DB.saveShop(shop);
  document.getElementById("reviewForm").reset();
  renderShopHeader(shop);
  renderShopReviews(shop);
  toast(getLang()==='ta' ? "மதிப்புரை சேர்க்கப்பட்டது" : "Review added", "success");
}
