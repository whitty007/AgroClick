/* =========================================================
   shops-list.js — renders all shops, sorted by distance from
   the location chosen in the navbar (see data.js sortShopsByProximity).
   ========================================================= */

function initShopsPage(){
  const params = new URLSearchParams(location.search);
  const voiceQuery = params.get("query");
  const voiceProduct = params.get("product");
  const voiceMode = params.get("voice");

  if (voiceQuery) {
    const queryInput = document.getElementById("productQuery");
    if (queryInput) queryInput.value = voiceQuery;
  }

  renderShopsList();
  initProductSearch();
  if (voiceMode === "qty" && voiceProduct) {
    setTimeout(() => {
      if (typeof window.triggerVoiceAssistantFlow === "function") {
        window.triggerVoiceAssistantFlow("quantity", { productName: voiceProduct });
      }
    }, 300);
  }
  document.addEventListener("agroclick:locationchange", renderShopsList);
  document.addEventListener("agroclick:langchange", renderShopsList);
}

const PRODUCT_SEARCH_DEBOUNCE_MS = 300;
let productSearchTimer = null;
let shopSearchProducts = [];

function initProductSearch(){
  shopSearchProducts = getMarketplaceProducts();
  const controls = [
    "productQuery", "productCategory", "productLocation",
    "productMinPrice", "productMaxPrice", "productMinQuantity", "productSort",
  ];
  controls.forEach(id=>{
    const input = document.getElementById(id);
    if(!input) return;
    input.addEventListener(id === "productSort" ? "change" : "input", ()=>{
      clearTimeout(productSearchTimer);
      productSearchTimer = setTimeout(renderProductResults, PRODUCT_SEARCH_DEBOUNCE_MS);
    });
  });
  document.addEventListener("agroclick:statechange", ()=>{
    shopSearchProducts = getMarketplaceProducts();
    renderProductResults();
  });
  document.addEventListener("agroclick:langchange", renderProductResults);
  renderProductResults();
}

function numericSearchValue(id){
  const value = document.getElementById(id).value.trim();
  if(!value) return undefined;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : undefined;
}

function renderProductResults(){
  const mount = document.getElementById("productResults");
  const status = document.getElementById("productSearchStatus");
  if(!mount || !status) return;
  const filters = {
    query: document.getElementById("productQuery").value,
    category: document.getElementById("productCategory").value,
    location: document.getElementById("productLocation").value,
    minPrice: numericSearchValue("productMinPrice"),
    maxPrice: numericSearchValue("productMaxPrice"),
    minQuantity: numericSearchValue("productMinQuantity"),
    sort: document.getElementById("productSort").value,
  };
  const numericFields = ["productMinPrice", "productMaxPrice", "productMinQuantity"];
  if(numericFields.some(id=>{
    const input = document.getElementById(id);
    return !input.checkValidity() && (input.value.trim() !== "" || input.validity.badInput);
  })){
    mount.replaceChildren();
    status.textContent = t("product_search_invalid_number");
    return;
  }
  if(filters.minPrice !== undefined && filters.maxPrice !== undefined && filters.minPrice > filters.maxPrice){
    mount.replaceChildren();
    status.textContent = t("product_search_invalid_price");
    return;
  }
  const products = searchMarketplaceProducts(shopSearchProducts, filters);
  if(products.length === 0){
    mount.replaceChildren();
    status.textContent = t("product_search_no_results");
    return;
  }
  status.textContent = t("product_search_count").replace("{count}", String(products.length));
  const fragment = document.createDocumentFragment();
  products.forEach(product=>{
    const card = document.createElement("article");
    card.className = "card";
    card.setAttribute("role", "listitem");
    const breakdown = product.scoreBreakdown;
    const scoreParts = [
      `${t("score_name")} ${Math.round(breakdown.name * 100)}%`,
      `${t("score_category")} ${Math.round(breakdown.category * 100)}%`,
      `${t("score_location")} ${Math.round(breakdown.location * 100)}%`,
      `${t("score_price")} ${Math.round(breakdown.price * 100)}%`,
      `${t("score_quantity")} ${Math.round(breakdown.quantity * 100)}%`,
    ].join(" · ");
    const quantityLabel = product.quantity === null
      ? t("product_quantity_unknown")
      : `${product.quantity} kg ${t("product_available")}`;
    card.innerHTML = `
      <img class="card-img" src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}">
      <div class="card-body">
        <h3>${escapeHtml(product.name || t("product_unknown"))}</h3>
        ${product.category ? `<div class="card-meta">${escapeHtml(product.category)}</div>` : ""}
        <div class="card-price">${product.price === null ? t("product_price_unknown") : `₹${product.price}${t("per_kg")}`}</div>
        <div class="card-meta">${escapeHtml(product.location || t("product_location_unknown"))} · ${escapeHtml(product.shopName || t("product_shop_unknown"))}</div>
        <div class="card-meta">${escapeHtml(quantityLabel)}</div>
        ${filters.sort === "relevance" ? `<div class="card-meta">${t("product_match_score")} ${Math.round(product.score * 100)}% · ${escapeHtml(scoreParts)}</div>` : ""}
        <div class="card-meta">${escapeHtml(product.description)}</div>
      </div>
      <div class="card-foot">
        <a class="btn btn-primary btn-block btn-sm" href="shop-detail.html?shopId=${encodeURIComponent(product.shopId)}">${t("btn_visit_shop")}</a>
      </div>`;
    fragment.appendChild(card);
  });
  mount.replaceChildren(fragment);
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
