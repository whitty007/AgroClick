/* Deterministic marketplace search shared by the shops page and assistant. */
const PRODUCT_SCORE_WEIGHTS = Object.freeze({
  name: 0.5,
  category: 0.2,
  location: 0.15,
  price: 0.1,
  quantity: 0.05,
});

function normalizeSearchText(value) {
  return typeof value === "string"
    ? value.trim().toLocaleLowerCase().replace(/\s+/g, " ")
    : "";
}

function getMarketplaceProducts() {
  if (typeof DB === "undefined" || !DB || typeof DB.getShops !== "function") return [];
  const products = [];
  const shops = DB.getShops();
  if (!Array.isArray(shops)) return products;
  for (const shop of shops) {
    if (!shop || typeof shop !== "object" || !Array.isArray(shop.items)) continue;
    for (const item of shop.items) {
      if (!item || typeof item !== "object") continue;
      const price = item.price === null || item.price === undefined || item.price === ""
        ? NaN
        : Number(item.price);
      const quantity = item.quantity === undefined || item.quantity === null || item.quantity === ""
        ? null
        : Number(item.quantity);
      products.push({
        id: typeof item.id === "string" ? item.id : "",
        name: typeof item.name === "string" ? item.name : "",
        category: typeof item.category === "string" ? item.category : "",
        price: Number.isFinite(price) && price >= 0 ? price : null,
        quantity: Number.isFinite(quantity) && quantity >= 0 ? quantity : null,
        description: typeof item.desc === "string" ? item.desc : "",
        available: item.outOfStock !== true && !(Number.isFinite(quantity) && quantity <= 0),
        image: typeof item.image === "string" ? item.image : "assets/placeholder-crop.svg",
        shopId: typeof shop.id === "string" ? shop.id : "",
        shopName: typeof shop.name === "string" ? shop.name : "",
        location: typeof shop.location === "string" ? shop.location : "",
      });
    }
  }
  return products;
}

function textRelevance(value, query) {
  const normalizedValue = normalizeSearchText(value);
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedValue || !normalizedQuery) return 0;
  if (normalizedValue === normalizedQuery) return 1;
  if (normalizedValue.includes(normalizedQuery)) return 0.85;
  const simplify = token => token.replace(/(?:es|s)$/i, "");
  const queryTokens = normalizedQuery.split(" ").filter(Boolean).map(simplify);
  const valueTokens = normalizedValue.split(" ").filter(Boolean).map(simplify);
  const matched = valueTokens.filter(token =>
    queryTokens.some(queryToken => token.startsWith(queryToken) || queryToken.startsWith(token))
  ).length;
  return valueTokens.length ? matched / valueTokens.length : 0;
}

function validSearchNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : null;
}

function scoreMarketplaceProduct(product, filters) {
  const name = textRelevance(product.name, filters.query);
  const category = textRelevance(product.category, filters.category);
  const location = textRelevance(product.location, filters.location);
  let price = 0;
  if (Number.isFinite(product.price) && filters.minPrice !== null && filters.maxPrice !== null) {
    price = Math.max(0, 1 - Math.abs(product.price - filters.targetPrice) / Math.max(filters.targetPrice, 1));
  } else if (Number.isFinite(product.price) && filters.maxPrice !== null) {
    price = filters.maxPrice === 0 ? 1 : Math.max(0, 1 - product.price / filters.maxPrice);
  } else if (Number.isFinite(product.price) && filters.minPrice !== null && filters.minPrice > 0) {
    price = Math.min(filters.minPrice / Math.max(product.price, 1), 1);
  }
  const quantityTarget = filters.minQuantity;
  const quantity = Number.isFinite(quantityTarget) && Number.isFinite(product.quantity)
    ? product.quantity / (product.quantity + Math.max(quantityTarget, 1))
    : 0;
  const hasCriteria = Boolean(filters.query || filters.category || filters.location ||
    Number.isFinite(filters.targetPrice) || Number.isFinite(filters.minQuantity));
  const score = hasCriteria
    ? (name * PRODUCT_SCORE_WEIGHTS.name) +
      (category * PRODUCT_SCORE_WEIGHTS.category) +
      (location * PRODUCT_SCORE_WEIGHTS.location) +
      (price * PRODUCT_SCORE_WEIGHTS.price) +
      (quantity * PRODUCT_SCORE_WEIGHTS.quantity)
    : 0;
  return {
    score,
    scoreBreakdown: { name, category, location, price, quantity },
  };
}

function searchMarketplaceProducts(products, options = {}) {
  const source = Array.isArray(products) ? products : [];
  const filters = {
    query: normalizeSearchText(options.query),
    category: normalizeSearchText(options.category),
    location: normalizeSearchText(options.location),
    minPrice: validSearchNumber(options.minPrice),
    maxPrice: validSearchNumber(options.maxPrice),
    minQuantity: validSearchNumber(options.minQuantity),
    targetPrice: validSearchNumber(options.targetPrice),
  };
  if (filters.targetPrice === null) {
    filters.targetPrice = filters.minPrice !== null && filters.maxPrice !== null
      ? (filters.minPrice + filters.maxPrice) / 2
      : null;
  }
  const sort = options.sort || "relevance";
  const ranked = [];

  source.forEach((product, index) => {
    if (!product || typeof product !== "object" || product.available === false) return;
    const validPrice = validSearchNumber(product.price);
    const validQuantity = validSearchNumber(product.quantity);
    const price = validPrice === null ? NaN : validPrice;
    const quantity = validQuantity;
    if (quantity === 0) return;
    if (filters.query && textRelevance(product.name, filters.query) === 0 &&
        textRelevance(product.category, filters.query) === 0 &&
        textRelevance(product.description, filters.query) === 0) return;
    if (filters.category && textRelevance(product.category, filters.category) === 0) return;
    if (filters.location && textRelevance(product.location, filters.location) === 0) return;
    if (filters.minPrice !== null && (!Number.isFinite(price) || price < filters.minPrice)) return;
    if (filters.maxPrice !== null && (!Number.isFinite(price) || price > filters.maxPrice)) return;
    if (filters.minQuantity !== null &&
        (!Number.isFinite(quantity) || quantity < filters.minQuantity)) return;

    const result = scoreMarketplaceProduct({ ...product, price, quantity }, filters);
    ranked.push({
      ...product,
      price: validPrice,
      quantity,
      score: result.score,
      scoreBreakdown: result.scoreBreakdown,
      _index: index,
    });
  });

  function optionalNumberSortValue(value, emptyValue) {
    const number = validSearchNumber(value);
    return number === null ? emptyValue : number;
  }
  const sorters = {
    priceAsc: (a, b) => optionalNumberSortValue(a.price, Infinity) -
      optionalNumberSortValue(b.price, Infinity),
    priceDesc: (a, b) => optionalNumberSortValue(b.price, -Infinity) -
      optionalNumberSortValue(a.price, -Infinity),
    name: (a, b) => normalizeSearchText(a.name).localeCompare(normalizeSearchText(b.name)),
    quantityDesc: (a, b) => optionalNumberSortValue(b.quantity, -Infinity) -
      optionalNumberSortValue(a.quantity, -Infinity),
  };
  const comparator = sorters[sort];
  ranked.sort((a, b) => {
    const comparison = comparator ? comparator(a, b) : b.score - a.score;
    return comparison || a._index - b._index;
  });
  return ranked.map(({ _index, ...product }) => product);
}

window.getMarketplaceProducts = getMarketplaceProducts;
window.searchMarketplaceProducts = searchMarketplaceProducts;
