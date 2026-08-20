/* =========================================================
   shops-list.js — renders all shops, sorted by distance from
   the location chosen in the navbar (see data.js sortShopsByProximity).
   ========================================================= */

function initShopsPage(){
  renderShopsList();
  document.addEventListener("agroclick:locationchange", renderShopsList);
  document.addEventListener("agroclick:langchange", renderShopsList);
}

function renderShopsList(){
  const mount = document.getElementById("shopsGrid");
  const empty = document.getElementById("shopsEmpty");
  let shops = DB.getShops();

  if(shops.length === 0){
    mount.innerHTML = "";
    empty.style.display = "block";
    return;
  }
  empty.style.display = "none";

  const loc = DB.getLocation();
  if(loc) shops = sortShopsByProximity(shops, loc);

  mount.innerHTML = shops.map(shop=>{
    const rating = shopRating(shop);
    return `
    <div class="card">
      <img class="card-img" src="${shop.ownerImage}" alt="${escapeHtml(shop.name)}">
      <div class="card-body">
        <h3>${escapeHtml(shop.name)}</h3>
        <div class="card-meta">📍 ${shop.location}</div>
        ${rating ? `<div class="card-rating">★ ${rating} <span class="muted">(${shop.reviews.length})</span></div>` : `<div class="card-meta muted">${getLang()==='ta'?'மதிப்புரைகள் இல்லை':'No reviews yet'}</div>`}
      </div>
      <div class="card-foot">
        <a class="btn btn-primary btn-block btn-sm" href="shop-detail.html?shopId=${shop.id}">${t('btn_visit_shop')}</a>
      </div>
    </div>`;
  }).join("");
}
