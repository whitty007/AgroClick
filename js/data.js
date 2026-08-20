/* =========================================================
   data.js — DEMO data layer.
   ---------------------------------------------------------
   This project has NO real backend (see README "Important
   limitations of this demo"). Everything is stored in the
   browser's localStorage so you can click through the full
   flow end-to-end. Swap this file for real API calls when
   you build a backend — every other file only talks to the
   `DB` object below, never to localStorage directly, so the
   rest of the app won't need to change much.
   ========================================================= */

/* ---------- Tamil Nadu places (used for location picker +
   "shops near me" sorting). Coordinates are town-centre
   approximations, accurate enough for sorting, not for
   navigation. ---------- */
const TN_PLACES = [
  { en:"Chennai", ta:"சென்னை", lat:13.0827, lng:80.2707 },
  { en:"Tambaram", ta:"தாம்பரம்", lat:12.9249, lng:80.1000 },
  { en:"Chengalpattu", ta:"செங்கல்பட்டு", lat:12.6921, lng:79.9764 },
  { en:"Kanchipuram", ta:"காஞ்சிபுரம்", lat:12.8342, lng:79.7036 },
  { en:"Vellore", ta:"வேலூர்", lat:12.9165, lng:79.1325 },
  { en:"Ranipet", ta:"ராணிப்பேட்டை", lat:12.9249, lng:79.3308 },
  { en:"Tiruvannamalai", ta:"திருவண்ணாமலை", lat:12.2253, lng:79.0747 },
  { en:"Villupuram", ta:"விழுப்புரம்", lat:11.9401, lng:79.4861 },
  { en:"Cuddalore", ta:"கடலூர்", lat:11.7480, lng:79.7714 },
  { en:"Krishnagiri", ta:"கிருஷ்ணகிரி", lat:12.5186, lng:78.2138 },
  { en:"Hosur", ta:"ஓசூர்", lat:12.7409, lng:77.8253 },
  { en:"Dharmapuri", ta:"தர்மபுரி", lat:12.1357, lng:78.1580 },
  { en:"Salem", ta:"சேலம்", lat:11.6643, lng:78.1460 },
  { en:"Namakkal", ta:"நாமக்கல்", lat:11.2189, lng:78.1677 },
  { en:"Erode", ta:"ஈரோடு", lat:11.3410, lng:77.7172 },
  { en:"Tiruppur", ta:"திருப்பூர்", lat:11.1085, lng:77.3411 },
  { en:"Coimbatore", ta:"கோயம்புத்தூர்", lat:11.0168, lng:76.9558 },
  { en:"Pollachi", ta:"பொள்ளாச்சி", lat:10.6588, lng:77.0084 },
  { en:"Udhagamandalam (Ooty)", ta:"உதகமண்டலம் (ஊட்டி)", lat:11.4102, lng:76.6950 },
  { en:"Coonoor", ta:"குன்னூர்", lat:11.3530, lng:76.7950 },
  { en:"Karur", ta:"கரூர்", lat:10.9601, lng:78.0766 },
  { en:"Tiruchirappalli", ta:"திருச்சிராப்பள்ளி", lat:10.7905, lng:78.7047 },
  { en:"Perambalur", ta:"பெரம்பலூர்", lat:11.2342, lng:78.8807 },
  { en:"Ariyalur", ta:"அரியலூர்", lat:11.1401, lng:79.0782 },
  { en:"Thanjavur", ta:"தஞ்சாவூர்", lat:10.7870, lng:79.1378 },
  { en:"Kumbakonam", ta:"கும்பகோணம்", lat:10.9602, lng:79.3845 },
  { en:"Mayiladuthurai", ta:"மயிலாடுதுறை", lat:11.1037, lng:79.6526 },
  { en:"Nagapattinam", ta:"நாகப்பட்டினம்", lat:10.7672, lng:79.8449 },
  { en:"Pudukkottai", ta:"புதுக்கோட்டை", lat:10.3833, lng:78.8200 },
  { en:"Karaikudi", ta:"காரைக்குடி", lat:10.0738, lng:78.7739 },
  { en:"Sivaganga", ta:"சிவகங்கை", lat:9.8438, lng:78.4809 },
  { en:"Madurai", ta:"மதுரை", lat:9.9252, lng:78.1198 },
  { en:"Dindigul", ta:"திண்டுக்கல்", lat:10.3673, lng:77.9803 },
  { en:"Kodaikanal", ta:"கொடைக்கானல்", lat:10.2381, lng:77.4892 },
  { en:"Theni", ta:"தேனி", lat:10.0104, lng:77.4768 },
  { en:"Virudhunagar", ta:"விருதுநகர்", lat:9.5680, lng:77.9624 },
  { en:"Sivakasi", ta:"சிவகாசி", lat:9.4530, lng:77.7980 },
  { en:"Rajapalayam", ta:"ராஜபாளையம்", lat:9.4517, lng:77.5537 },
  { en:"Tenkasi", ta:"தென்காசி", lat:8.9598, lng:77.3152 },
  { en:"Tirunelveli", ta:"திருநெல்வேலி", lat:8.7139, lng:77.7567 },
  { en:"Thoothukudi", ta:"தூத்துக்குடி", lat:8.7642, lng:78.1348 },
  { en:"Nagercoil", ta:"நாகர்கோவில்", lat:8.1833, lng:77.4119 },
  { en:"Kanyakumari", ta:"கன்னியாகுமரி", lat:8.0883, lng:77.5385 },
  { en:"Ambur", ta:"ஆம்பூர்", lat:12.7900, lng:78.7160 },
  { en:"Vaniyambadi", ta:"வாணியம்பாடி", lat:12.6833, lng:78.6167 },
  { en:"Tirupattur", ta:"திருப்பத்தூர்", lat:12.4900, lng:78.5700 },
  { en:"Neyveli", ta:"நெய்வேலி", lat:11.6090, lng:79.4737 },
];

/* ---------- localStorage keys ---------- */
const LS = {
  USERS:    "agroclick_users",
  SESSION:  "agroclick_session",
  SHOPS:    "agroclick_shops",
  ORDERS:   "agroclick_orders",
  CART:     "agroclick_cart",
  LANG:     "agroclick_lang",
  LOCATION: "agroclick_location",
};

function _read(key, fallback){
  try{
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  }catch(e){ console.error("DB read failed for", key, e); return fallback; }
}
function _write(key, value){
  try{ localStorage.setItem(key, JSON.stringify(value)); }
  catch(e){ console.error("DB write failed for", key, e); }
}
function newId(prefix){
  return prefix + "_" + Date.now().toString(36) + Math.random().toString(36).slice(2,7);
}

function _queueRemoteSync(){
  if (typeof window === "undefined") return;
  setTimeout(()=>{
    void syncStateToMongo();
    void syncStateToPg();
  }, 0);
}

async function syncStateToPg(){
  try {
    const res = await fetch("/api/pg/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        state: {
          users: DB.getUsers(),
          shops: DB.getShops(),
          orders: DB.getOrders(),
          cart: DB.getCart(),
          lang: DB.getLang(),
          location: DB.getLocation(),
        }
      })
    });
    return res.ok;
  } catch (error) {
    console.warn("PostgreSQL sync failed", error);
    return false;
  }
}

async function restoreStateFromPg(){
  try {
    const res = await fetch("/api/pg/state");
    if (!res.ok) return false;
    const payload = await res.json();
    if (!payload?.state) return false;

    const state = payload.state;
    if (state.users) _write(LS.USERS, state.users);
    if (state.shops) _write(LS.SHOPS, state.shops);
    if (state.orders) _write(LS.ORDERS, state.orders);
    if (state.cart) _write(LS.CART, state.cart);
    if (state.lang) _write(LS.LANG, state.lang);
    if (state.location) _write(LS.LOCATION, state.location);
    return true;
  } catch (error) {
    console.warn("PostgreSQL restore failed", error);
    return false;
  }
}


async function syncStateToMongo(){
  const uri = localStorage.getItem("agroclick_mongo_uri") || "";
  if (!uri) return false;

  try {
    const res = await fetch("/api/db/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uri,
        dbName: localStorage.getItem("agroclick_mongo_db") || "agroclick",
        state: {
          users: DB.getUsers(),
          session: DB.getSession(),
          shops: DB.getShops(),
          orders: DB.getOrders(),
          cart: DB.getCart(),
          lang: DB.getLang(),
          location: DB.getLocation(),
        }
      })
    });
    return res.ok;
  } catch (error) {
    console.warn("Mongo sync failed", error);
    return false;
  }
}

async function restoreStateFromMongo(){
  const uri = localStorage.getItem("agroclick_mongo_uri") || "";
  if (!uri) return false;

  try {
    const res = await fetch(`/api/db/state?uri=${encodeURIComponent(uri)}&dbName=${encodeURIComponent(localStorage.getItem("agroclick_mongo_db") || "agroclick")}`);
    if (!res.ok) return false;
    const payload = await res.json();
    if (!payload?.state) return false;

    const state = payload.state;
    if (state.users) _write(LS.USERS, state.users);
    if (state.session) _write(LS.SESSION, state.session);
    if (state.shops) _write(LS.SHOPS, state.shops);
    if (state.orders) _write(LS.ORDERS, state.orders);
    if (state.cart) _write(LS.CART, state.cart);
    if (state.lang) _write(LS.LANG, state.lang);
    if (state.location) _write(LS.LOCATION, state.location);
    return true;
  } catch (error) {
    console.warn("Mongo restore failed", error);
    return false;
  }
}


/* ---------- DB facade — swap internals for real API calls later ---------- */
const DB = {
  /* ---- users ---- */
  getUsers(){ return _read(LS.USERS, {}); },
  getUser(mobile){ return this.getUsers()[mobile] || null; },
  saveUser(user){
    const users = this.getUsers();
    users[user.mobile] = user;
    _write(LS.USERS, users);
    _queueRemoteSync();
  },

  /* ---- session ---- */
  getSession(){ return _read(LS.SESSION, null); },
  setSession(mobile){ _write(LS.SESSION, { mobile }); _queueRemoteSync(); },
  clearSession(){ localStorage.removeItem(LS.SESSION); _queueRemoteSync(); },
  getCurrentUser(){
    const s = this.getSession();
    return s ? this.getUser(s.mobile) : null;
  },

  /* ---- shops ---- */
  getShops(){ return _read(LS.SHOPS, []); },
  getShop(id){ return this.getShops().find(s => s.id === id) || null; },
  getShopByOwner(mobile){ return this.getShops().find(s => s.ownerMobile === mobile) || null; },
  saveShops(shops){ _write(LS.SHOPS, shops); _queueRemoteSync(); },
  saveShop(shop){
    const shops = this.getShops();
    const i = shops.findIndex(s => s.id === shop.id);
    if(i>-1) shops[i] = shop; else shops.push(shop);
    this.saveShops(shops);
  },
  removeShop(shopId){
    const shops = this.getShops().filter(s => s.id !== shopId);
    this.saveShops(shops);

    const orders = this.getOrders().filter(o => o.shopId !== shopId);
    this.saveOrders(orders);

    const cart = this.getCart();
    delete cart[shopId];
    this.saveCart(cart);
    return true;
  },

  /* ---- orders ---- */
  getOrders(){ return _read(LS.ORDERS, []); },
  saveOrders(orders){ _write(LS.ORDERS, orders); _queueRemoteSync(); },
  addOrder(order){
    const orders = this.getOrders();
    orders.unshift(order);
    this.saveOrders(orders);
  },
  updateOrder(orderId, updates){
    const orders = this.getOrders();
    const order = orders.find(o => o.id === orderId);
    if(!order) return null;
    Object.assign(order, updates);
    this.saveOrders(orders);
    return order;
  },
  ordersForCustomer(mobile){ return this.getOrders().filter(o => o.customerMobile === mobile); },
  ordersForShop(shopId){ return this.getOrders().filter(o => o.shopId === shopId); },

  /* ---- cart ---- (cart is per-browser, grouped by shopId) */
  getCart(){ return _read(LS.CART, {}); },
  saveCart(cart){ _write(LS.CART, cart); _queueRemoteSync(); },
  addToCart(shopId, itemId){
    const cart = this.getCart();
    if(!cart[shopId]) cart[shopId] = {};
    cart[shopId][itemId] = (cart[shopId][itemId] || 0) + 1;
    this.saveCart(cart);
  },
  setCartQty(shopId, itemId, qty){
    const cart = this.getCart();
    if(!cart[shopId]) cart[shopId] = {};
    if(qty <= 0){ delete cart[shopId][itemId]; if(Object.keys(cart[shopId]).length===0) delete cart[shopId]; }
    else cart[shopId][itemId] = qty;
    this.saveCart(cart);
  },
  clearShopCart(shopId){
    const cart = this.getCart();
    delete cart[shopId];
    this.saveCart(cart);
  },
  cartItemCount(){
    const cart = this.getCart();
    return Object.values(cart).reduce((sum, items) => sum + Object.values(items).reduce((a,b)=>a+b,0), 0);
  },

  /* ---- language / location prefs ---- */
  getLang(){ return _read(LS.LANG, "en"); },
  setLang(l){ _write(LS.LANG, l); _queueRemoteSync(); },
  getLocation(){ return _read(LS.LOCATION, ""); },
  setLocation(loc){ _write(LS.LOCATION, loc); _queueRemoteSync(); },
};

/* ---------- distance helper for "shops near me" ---------- */
function placeByName(name){
  return TN_PLACES.find(p => p.en === name) || null;
}
function haversineKm(lat1, lng1, lat2, lng2){
  const R = 6371;
  const dLat = (lat2-lat1) * Math.PI/180;
  const dLng = (lng2-lng1) * Math.PI/180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}
function sortShopsByProximity(shops, locationName){
  const origin = placeByName(locationName);
  if(!origin) return shops;
  return [...shops].sort((a,b)=>{
    const pa = placeByName(a.location), pb = placeByName(b.location);
    const da = pa ? haversineKm(origin.lat,origin.lng,pa.lat,pa.lng) : 99999;
    const db = pb ? haversineKm(origin.lat,origin.lng,pb.lat,pb.lng) : 99999;
    return da - db;
  });
}
function shopRating(shop){
  if(!shop.reviews || shop.reviews.length===0) return null;
  const avg = shop.reviews.reduce((a,r)=>a+r.rating,0) / shop.reviews.length;
  return Math.round(avg*10)/10;
}

/* ---------- one-time demo seed so the site isn't empty on first run ----------
   Clearly-labelled sample shops only — delete them any time from
   Manage My Shop, or wipe everything with localStorage.clear(). */
function seedDemoDataIfEmpty(){
  if(DB.getShops().length > 0) return;
  const demoShops = [
    {
      id:newId("shop"), ownerMobile:"9990000001", name:"Periyar Organic Farm (Sample)",
      ownerImage:"assets/placeholder-owner.svg", location:"Coimbatore",
      items:[
        { id:newId("item"), name:"Tomato", image:"assets/placeholder-crop.svg", price:28, desc:"Farm-fresh, vine-ripened tomatoes.", outOfStock:false },
        { id:newId("item"), name:"Banana (Nendran)", image:"assets/placeholder-crop.svg", price:55, desc:"Sweet Nendran bananas, hand-cut.", outOfStock:false },
      ],
      reviews:[ { id:newId("rev"), customer:"Kavitha", rating:5, comment:"Very fresh, delivered fast!", date:Date.now()-86400000 } ],
    },
    {
      id:newId("shop"), ownerMobile:"9990000002", name:"Thanjai Rice Mandram (Sample)",
      ownerImage:"assets/placeholder-owner.svg", location:"Thanjavur",
      items:[
        { id:newId("item"), name:"Ponni Rice", image:"assets/placeholder-crop.svg", price:62, desc:"Traditional Ponni rice, 1kg pack.", outOfStock:false },
        { id:newId("item"), name:"Turmeric (Whole)", image:"assets/placeholder-crop.svg", price:140, desc:"Sun-dried whole turmeric.", outOfStock:true },
      ],
      reviews:[],
    },
  ];
  DB.saveShops(demoShops);
}

document.addEventListener("DOMContentLoaded", async ()=>{
  const restoredPg = await restoreStateFromPg();
  if (!restoredPg) {
    await restoreStateFromMongo();
  }
});

