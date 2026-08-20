/* =========================================================
   common.js — runs on every page: navbar, footer, toasts,
   auth guards, the "harvest strip" signature motif, and the
   chatbot launcher mount point.
   ========================================================= */

/* ---------- escape user-entered text before it goes into innerHTML ----------
   (item names/descriptions, review comments, customer names, etc. are all
   typed by users — always escape before inserting as HTML, even in a demo) */
function escapeHtml(str){
  if(str===undefined || str===null) return "";
  return String(str).replace(/[&<>"']/g, c=>({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
  }[c]));
}

/* ---------- toast ---------- */
function toast(msg, type){
  let root = document.getElementById("toast-root");
  if(!root){
    root = document.createElement("div");
    root.id = "toast-root";
    document.body.appendChild(root);
  }
  const el = document.createElement("div");
  el.className = "toast " + (type || "info");
  el.textContent = msg;
  root.appendChild(el);
  setTimeout(()=>{ el.remove(); }, 3800);
}

/* ---------- harvest strip (signature SVG motif: ploughed
   field rows with sown seeds — reused as section divider) ---------- */
function harvestStripSVG(){
  return `
  <svg viewBox="0 0 1200 40" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" role="presentation">
    <style>
      .hv-line{ stroke:var(--paddy); fill:none; stroke-width:2.5; stroke-linecap:round; }
      .hv-a{ fill:var(--turmeric); } .hv-b{ fill:var(--soil); }
    </style>
    <defs>
      <pattern id="hvPattern" width="100" height="40" patternUnits="userSpaceOnUse">
        <path class="hv-line" d="M0 24 Q25 8 50 24 T100 24"/>
        <circle class="hv-a" cx="25" cy="13" r="3"/>
        <circle class="hv-b" cx="75" cy="13" r="3"/>
      </pattern>
    </defs>
    <rect width="1200" height="40" fill="url(#hvPattern)"/>
  </svg>`;
}

function applyPremiumTheme(){
  const user = DB.getCurrentUser();
  if(user && user.isPremium){
    document.body.classList.add("theme-premium");
  } else {
    document.body.classList.remove("theme-premium");
  }
}

/* ---------- navbar ---------- */
function renderNavbar(){
  applyPremiumTheme();
  const mount = document.getElementById("navbar");
  if(!mount) return;
  const user = DB.getCurrentUser();
  const selectedLocation = DB.getLocation();
  const lang = getLang();
  const hasOrders = user ? DB.ordersForCustomer(user.mobile).length > 0 : false;


  const placeOptions = TN_PLACES.map(p=>{
    const label = lang === "ta" ? p.ta : p.en;
    return `<option value="${p.en}" ${p.en===selectedLocation?"selected":""}>${escapeHtml(label)}</option>`;
  }).join("");

  mount.innerHTML = `
    <div class="nav-inner">
      <div class="nav-left">
        <a href="index.html" class="nav-brand">
          <img src="assets/logo.svg" alt="">
          <span class="brand-text" data-i18n="brand">AgroClick</span>
        </a>
        <div class="location-box">
          <select id="locationSelect" aria-label="Choose location">
            <option value="" data-i18n="choose_location">Choose your place</option>
            ${placeOptions}
          </select>
        </div>
      </div>
      <div class="nav-right">
        ${hasOrders ? `<a href="my-orders.html" class="btn btn-secondary btn-sm" style="background:rgba(255,255,255,.12);color:#fff;border-color:rgba(255,255,255,.4);" data-i18n="nav_my_orders">My Orders</a>` : ``}
        <div class="lang-toggle" role="group" aria-label="Language">
          <button data-lang="en" class="${lang==='en'?'active':''}">EN</button>
          <button data-lang="ta" class="${lang==='ta'?'active':''}">த</button>
        </div>
        ${user
          ? `
            ${user.isPremium
              ? `<span class="premium-badge-chip" title="${lang==='ta'?'அக்ரோகிளிக் பிரீமியம் கணக்கு':'AgroClick Premium Member'}">👑 Premium</span>`
              : `<button type="button" class="btn-upgrade-nav" id="navUpgradeBtn" title="${lang==='ta'?'பிரீமியத்திற்கு மேம்படுத்து':'Upgrade to Premium'}">⭐ Upgrade</button>`
            }
            <div class="nav-user" id="navUserChip" title="${t('nav_logout')}"><span class="dot"></span><span>${escapeHtml(user.name)}</span></div>`
          : `<a href="login.html" class="btn-nav-login" data-i18n="nav_login">Login</a>`
        }
      </div>
    </div>`;

  const locSelect = document.getElementById("locationSelect");
  if(locSelect){
    locSelect.addEventListener("change", (e)=>{
      DB.setLocation(e.target.value);
      document.dispatchEvent(new CustomEvent("agroclick:locationchange", { detail:e.target.value }));
    });
  }


  mount.querySelectorAll(".lang-toggle button").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      setLanguage(btn.getAttribute("data-lang"));
      renderNavbar(); // rebuild so option labels / chip text refresh
      renderManageShopFab();
    });
  });

  const upgradeBtn = document.getElementById("navUpgradeBtn");
  if(upgradeBtn && user){
    upgradeBtn.addEventListener("click", ()=>{
      triggerGlobalPremiumModal(user);
    });
  }

  const chip = document.getElementById("navUserChip");
  if(chip){
    chip.addEventListener("click", ()=>{
      if(confirm(lang==='ta' ? "வெளியேற விரும்புகிறீர்களா?" : "Log out of AgroClick?")){
        DB.clearSession();
        toast(lang==='ta' ? "வெளியேறிவிட்டீர்கள்" : "Logged out", "info");
        setTimeout(()=>location.href="index.html", 400);
      }
    });
  }
}

function triggerGlobalPremiumModal(user){
  if(!user){
    location.href = "login.html?redirect=premium.html";
    return;
  }
  const isPremiumPage = window.location.pathname.endsWith("premium.html") ||
                        window.location.pathname.endsWith("premium") ||
                        window.location.href.includes("premium");
  if(isPremiumPage){
    const lang = getLang();
    const text = lang === 'ta'
      ? 'அக்ரோகிளிக் பிரீமியம் விற்பனையாளர் திட்டம் (₹499/ஆண்டு)\n\nவரம்பற்ற கடைகளை உருவாக்கவும், சிறந்த தேடல் பலன்களைப் பெறவும் இப்போது பிரீமியத்திற்கு மேம்படுத்த விரும்புகிறீர்களா?'
      : 'Activate AgroClick Premium Seller Plan (₹499/year) to unlock unlimited farm shops, #1 search placement, and zero commission across Tamil Nadu!';
    if (confirm(text)){
      user.isPremium = true;
      DB.saveUser(user);
      toast(lang==='ta' ? "பிரீமியம் திட்டம் இயக்கப்பட்டது! 👑" : "Premium Plan Activated! 👑", "success");
      setTimeout(() => { location.reload(); }, 1200);
    }
  } else {
    location.href = "premium.html";
  }
}



/* ---------- "Manage My Shop" floating button (bottom-left) ---------- */
function renderManageShopFab(){
  let fab = document.getElementById("manageShopFab");
  const user = DB.getCurrentUser();
  const shop = user ? DB.getShopByOwner(user.mobile) : null;
  if(!fab){
    fab = document.createElement("a");
    fab.id = "manageShopFab";
    fab.className = "manage-shop-fab";
    document.body.appendChild(fab);
  }
  fab.href = "manage-shop.html";
  fab.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg> <span data-i18n="btn_manage_shop">${t('btn_manage_shop')}</span>`;
  fab.classList.toggle("show", !!shop && !location.pathname.endsWith("manage-shop.html"));
}

/* ---------- footer ---------- */
function renderFooter(){
  const mount = document.getElementById("footer");
  if(!mount) return;
  mount.innerHTML = `
    <div class="harvest-strip">${harvestStripSVG()}</div>
    <footer>
      <div class="container">
        <div><strong data-i18n="brand">AgroClick</strong> — Farm to Home, Tamil Nadu</div>
        <div>© ${new Date().getFullYear()} AgroClick. All rights reserved.</div>
      </div>
    </footer>`;
}

/* ---------- auth guard ---------- */
function requireLogin(redirectTarget){
  const user = DB.getCurrentUser();
  if(!user){
    location.href = "login.html?redirect=" + encodeURIComponent(redirectTarget || location.pathname.split("/").pop());
    return null;
  }
  return user;
}

/* ---------- tiny modal helper ---------- */
function openModal(id){ document.getElementById(id).classList.add("show"); }
function closeModal(id){ document.getElementById(id).classList.remove("show"); }

/* ---------- image file -> base64 dataURL (demo image storage) ---------- */
function fileToDataURL(file, cb){
  const reader = new FileReader();
  reader.onload = ()=>cb(reader.result);
  reader.readAsDataURL(file);
}

/* ---------- page bootstrap ---------- */
document.addEventListener("DOMContentLoaded", ()=>{
  seedDemoDataIfEmpty();
  renderNavbar();
  renderFooter();
  renderManageShopFab();
  applyI18n(document);
  if(window.mountChatbot) window.mountChatbot();
});
