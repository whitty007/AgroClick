/* =========================================================
   kyc.js — "Become a Shop Owner" flow:
     1) one-time identity check (location + Aadhaar OTP + bank
        account) — skipped automatically on every later visit
     2) shop creation form
   ---------------------------------------------------------
   IMPORTANT (read to_do.txt too): this is a UI demo of what a
   KYC step *looks like*. Real Aadhaar verification must go
   through a UIDAI-licensed KYC/Aadhaar-OTP API partner (e.g. a
   RBI/UIDAI-authorised provider) — a website can never verify
   Aadhaar OTPs itself. Never store full Aadhaar or bank account
   numbers in localStorage or any client-side storage in a real
   product; here we only ever keep the last 4 digits, purely so
   the demo has something to display.
   ========================================================= */

let _aadharOtpPending = null;
let _kycAadharLast4 = null;
let _kycLocation = null;

function initBecomeShopOwnerPage(){
  const user = requireLogin("become-shop-owner.html");
  if(!user) return;

  const existingShop = DB.getShopByOwner(user.mobile);
  if(existingShop && !user.isPremium){
    // Show free shop limit notice card with Premium Upgrade action
    document.getElementById("kycSection").style.display = "none";
    document.getElementById("kycDoneBanner").style.display = "none";
    document.getElementById("shopSection").style.display = "none";

    const noticeEl = document.getElementById("existingShopNotice");
    if(noticeEl){
      noticeEl.style.display = "block";
      const shopNameEl = document.getElementById("existingShopNameDisplay");
      if(shopNameEl && existingShop.name){
        shopNameEl.innerHTML = (getLang()==='ta'
          ? `நீங்கள் ஏற்கனவே <strong>${existingShop.name}</strong> என்ற இலவச கடையை உருவாக்கியுள்ளீர்கள். இலவச திட்டம் 1 பண்ணை கடையை மட்டுமே அனுமதிக்கும்.`
          : `You have already created 1 free shop (<strong>${existingShop.name}</strong>). The free plan allows 1 farm shop per seller.`);
      }

      const upgradeBtn = document.getElementById("btnUpgradePremium");
      if(upgradeBtn){
        upgradeBtn.onclick = () => {
          showPremiumUpgradeModal(user, existingShop);
        };
      }
    }
    return;
  }

  populateLocationSelect(document.getElementById("kycLocation"));

  if(user.kyc && user.kyc.verified){
    const kycSec = document.getElementById("kycSection");
    const kycDone = document.getElementById("kycDoneBanner");
    if(kycSec) kycSec.style.display = "none";
    if(kycDone) kycDone.style.display = "flex";
    showShopForm(user);
  }else{
    const kycSec = document.getElementById("kycSection");
    const kycDone = document.getElementById("kycDoneBanner");
    if(kycSec) kycSec.style.display = "block";
    if(kycDone) kycDone.style.display = "none";
  }

  const bind = (id, evt, fn) => {
    const el = document.getElementById(id);
    if(el && !el.dataset.bound){
      el.dataset.bound = "true";
      el.addEventListener(evt, fn);
    }
  };

  bind("aadharForm", "submit", onSendAadharOtp);
  bind("aadharOtpForm", "submit", onVerifyAadharOtp);
  bind("bankForm", "submit", onSaveBank);
  bind("shopForm", "submit", onCreateShop);
  bind("ownerPhotoInput", "change", onOwnerPhotoChosen);
}

function showPremiumUpgradeModal(user, shop){
  const lang = getLang();
  const text = lang === 'ta'
    ? 'அக்ரோகிளிக் பிரீமியம் விற்பனையாளர் திட்டம் (₹499/ஆண்டு)\n\nபிரீமியத்திற்கு மேம்படுத்துவதன் மூலம் வரம்பற்ற கடைகளை உருவாக்கலாம், சிறந்த தேடல் விளம்பரத்தைப் பெறலாம்!'
    : 'AgroClick Premium Seller Plan (₹499/year)\n\nUpgrade to Premium to create multiple farm shops, get featured search placement, and reach more customers across Tamil Nadu!';

  if (confirm(text + "\n\n" + (lang==='ta' ? "இப்போது பிரீமியத்திற்கு மேம்படுத்த விரும்புகிறீர்களா?" : "Would you like to activate Premium Seller Plan now?"))){
    user.isPremium = true;
    DB.saveUser(user);
    toast(lang==='ta' ? "பிரீமியம் திட்டம் இயக்கப்பட்டது! இப்போது கூடுதல் கடைகளை உருவாக்கலாம்." : "Premium Plan Activated! You can now create multiple farm shops.", "success");
    setTimeout(() => { location.reload(); }, 1200);
  }
}


function populateLocationSelect(select){
  if(!select) return;
  const lang = getLang();
  select.innerHTML = `<option value="" data-i18n="choose_location">${t('choose_location')}</option>` +
    TN_PLACES.map(p=>`<option value="${p.en}">${lang==='ta'?p.ta:p.en}</option>`).join("");
}

function onSendAadharOtp(e){
  e.preventDefault();
  const aadharEl = document.getElementById("aadharInput");
  const locEl = document.getElementById("kycLocation");
  const err = document.getElementById("aadharError");
  const aadhar = aadharEl ? aadharEl.value.replace(/\s/g,"") : "";
  const loc = locEl ? locEl.value : "";

  if(!/^\d{12}$/.test(aadhar) || !loc){
    if(err) err.style.display = "block";
    return;
  }
  if(err) err.style.display = "none";
  _aadharOtpPending = String(Math.floor(1000 + Math.random()*9000));
  const demoOtpEl = document.getElementById("aadharDemoOtp");
  if(demoOtpEl) demoOtpEl.textContent = _aadharOtpPending;
  
  const step1 = document.getElementById("aadharStep1");
  const step2 = document.getElementById("aadharStep2");
  if(step1) step1.style.display = "none";
  if(step2) step2.style.display = "block";

  _kycAadharLast4 = aadhar.slice(-4);
  _kycLocation = loc;
  toast(getLang()==='ta' ? "ஆதார் OTP அனுப்பப்பட்டது" : "Aadhaar OTP sent", "success");
}

function onVerifyAadharOtp(e){
  e.preventDefault();
  const otpInput = document.getElementById("aadharOtpInput");
  const entered = otpInput ? otpInput.value.trim() : "";
  const err = document.getElementById("aadharOtpError");

  if(entered !== _aadharOtpPending){
    if(err) err.style.display = "block";
    return;
  }
  if(err) err.style.display = "none";
  const aBlock = document.getElementById("aadharBlock");
  const bBlock = document.getElementById("bankBlock");
  if(aBlock) aBlock.style.display = "none";
  if(bBlock) bBlock.style.display = "block";
}

function onSaveBank(e){
  e.preventDefault();
  const accEl = document.getElementById("accountInput");
  const ifscEl = document.getElementById("ifscInput");
  const err = document.getElementById("bankError");
  const acc = accEl ? accEl.value.trim() : "";
  const ifsc = ifscEl ? ifscEl.value.trim() : "";

  if(acc.length < 6 || !ifsc){
    if(err) err.style.display = "block";
    return;
  }
  if(err) err.style.display = "none";

  const user = DB.getCurrentUser();
  if(!user) return;

  const loc = _kycLocation || user.location || user.kyc?.location || (document.getElementById("kycLocation") ? document.getElementById("kycLocation").value : "");
  const aadhar4 = _kycAadharLast4 || user.kyc?.aadharLast4 || "";

  user.kyc = {
    verified: true,
    location: loc,
    aadharLast4: aadhar4,
    accountLast4: acc.slice(-4),
  };
  user.kycVerified = true;
  user.location = loc || user.location;
  user.bankAccount = acc.slice(-4);
  user.ifsc = ifsc;
  if(aadhar4) user.aadhar = aadhar4;

  DB.saveUser(user);

  toast(t('kyc_done_msg'), "success");
  const kSec = document.getElementById("kycSection");
  if(kSec) kSec.style.display = "none";
  showShopForm(user);
}

function showShopForm(user){
  const sSec = document.getElementById("shopSection");
  if(sSec) sSec.style.display = "block";
  const locSelect = document.getElementById("shopLocation");
  populateLocationSelect(locSelect);
  if(locSelect && user.kyc && user.kyc.location) locSelect.value = user.kyc.location;
}

let _ownerPhotoDataUrl = "assets/placeholder-owner.svg";
function onOwnerPhotoChosen(e){
  const file = e.target.files[0];
  if(!file) return;
  fileToDataURL(file, (dataUrl)=>{
    _ownerPhotoDataUrl = dataUrl;
    const prev = document.getElementById("ownerPhotoPreview");
    if(prev){
      prev.src = dataUrl;
      prev.style.display = "block";
    }
  });
}

function onCreateShop(e){
  e.preventDefault();
  const nameEl = document.getElementById("shopNameInput");
  const locEl = document.getElementById("shopLocation");
  const err = document.getElementById("shopError");
  const name = nameEl ? nameEl.value.trim() : "";
  const loc = locEl ? locEl.value : "";

  if(!name || !loc){
    if(err) err.style.display = "block";
    return;
  }
  if(err) err.style.display = "none";

  const user = DB.getCurrentUser();
  if(!user) return;

  const shop = {
    id: newId("shop"),
    ownerMobile: user.mobile,
    name: name,
    ownerImage: _ownerPhotoDataUrl,
    location: loc,
    items: [],
    reviews: [],
  };
  
  user.isOwner = true;
  DB.saveUser(user);
  DB.saveShop(shop);

  alert(t('shop_created_alert'));
  location.href = "index.html";
}
