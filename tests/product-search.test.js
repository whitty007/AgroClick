import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const source = await readFile(new URL("../js/product-search.js", import.meta.url), "utf8");
const context = { window: {}, DB: { getShops: () => [] } };
vm.runInNewContext(source, context);
const search = context.window.searchMarketplaceProducts;
const resultIds = results => Array.from(results, item => item.id);
const products = [
  { id: "1", name: "Tomato", category: "Vegetable", price: 28, quantity: 30, location: "Coimbatore", available: true },
  { id: "2", name: "Cherry tomato", category: "Vegetable", price: 55, quantity: 4, location: "Salem", available: true },
  { id: "3", name: "Ponni Rice", category: "Grain", price: 62, quantity: null, location: "Thanjavur", available: true },
  { id: "4", name: "Tomato", category: "Vegetable", price: 20, quantity: 50, location: "Madurai", available: false },
];

test("ranks exact product names ahead of partial matches and excludes unavailable products", () => {
  const results = search(products, { query: " tomato " });
  assert.deepEqual(resultIds(results), ["1", "2"]);
  assert.equal(results[0].score > results[1].score, true);
});

test("applies category, location, price, and quantity hard filters", () => {
  const results = search(products, {
    category: "vegetable",
    location: "coimbatore",
    minPrice: 25,
    maxPrice: 30,
    minQuantity: 10,
  });
  assert.deepEqual(resultIds(results), ["1"]);
});

test("does not treat unknown quantities or invalid records as sufficient stock", () => {
  const results = search([...products, null], { minQuantity: 1 });
  assert.deepEqual(resultIds(results), ["1", "2"]);
});

test("sorts by price deterministically and returns no false matches", () => {
  assert.deepEqual(resultIds(search(products, { sort: "priceAsc" })), ["1", "2", "3"]);
  assert.deepEqual(resultIds(search(products, { query: "mango" })), []);
});

test("prioritizes affordable products within a maximum and remains stable for ties", () => {
  const results = search(products, { maxPrice: 70 });
  assert.equal(results[0].scoreBreakdown.price > results[2].scoreBreakdown.price, true);
  const tied = search([
    { id: "a", name: "Tomato", price: 30, available: true },
    { id: "b", name: "Tomato", price: 30, available: true },
  ], { query: "tomato" });
  assert.deepEqual(resultIds(tied), ["a", "b"]);
});

test("handles large lists and malformed shop collections", () => {
  const largeList = Array.from({ length: 2000 }, (_, index) => ({
    id: String(index),
    name: index % 2 ? "Tomato" : "Onion",
    price: index + 1,
    available: true,
  }));
  assert.equal(search(largeList, { query: "tomato" }).length, 1000);
  context.DB.getShops = () => ({ invalid: true });
  assert.deepEqual(Array.from(context.window.getMarketplaceProducts()), []);
});

test("flattens valid marketplace listings and ignores malformed values", () => {
  context.DB.getShops = () => [
    { id: "shop-1", name: "Farm", location: "Salem", items: [
      { id: "item-1", name: "Mango", price: "30", quantity: "12" },
      { name: "Bad", price: "invalid", quantity: -1, outOfStock: true },
      null,
    ] },
    null,
  ];
  const listings = context.window.getMarketplaceProducts();
  assert.equal(listings.length, 2);
  assert.equal(listings[0].price, 30);
  assert.equal(listings[0].quantity, 12);
  assert.equal(listings[1].price, null);
  assert.equal(listings[1].available, false);
});
