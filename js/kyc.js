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
    document.getElementById("kycSection").style.display = "none";
    document.getElementById("kycDoneBanner").style.display = "flex";
    showShopForm(user);
  }else{
    document.getElementById("kycSection").style.display = "block";
    document.getElementById("kycDoneBanner").style.display = "none";
  }

  document.getElementById("aadharForm").addEventListener("submit", onSendAadharOtp);
  document.getElementById("aadharOtpForm").addEventListener("submit", onVerifyAadharOtp);
  document.getElementById("bankForm").addEventListener("submit", onSaveBank);
  document.getElementById("shopForm").addEventListener("submit", onCreateShop);
  document.getElementById("ownerPhotoInput").addEventListener("change", onOwnerPhotoChosen);
}

function showPremiumUpgradeModal(user, shop){
  const lang = getLang();
  const text = lang === 'ta'
    ? 'அக்ரோகிளிக் பிரீமியம் விற்பனையாளர் திட்டம் (₹499/ஆண்டு)\n\nபிரீமியத்திற்கு மேம்படுத்துவதன் மூலம் வரம்பற்ற கடைகளை உருவாக்கலாம், சிறந்த தேடல் விளம்பரத்தைப் பெறலாம்!'
    : 'AgroClick Premium Seller Plan (₹499/year)\n\nUpgrade to Premium to create multiple farm shops, get featured search placement, and reach more customers across Tamil Nadu!';

  if (confirm(text + "\n\n" + (lang==='ta' ? "இப்போது பிரீமியத்திற்கு மேம்படுத்த விரும்புகிறீர்களா?" : "Would you like to activate Premium Seller Plan now?"))){
    user.isPremium = true;
    DB.saveUser(user);
    toast(lang==='ta' ? "பிரீமியம் திட்டம் இயக்கப்பட்டடது! இப்போது கூடுதல் கடைகளை உருவாக்கலாம்." : "Premium Plan Activated! You can now create multiple farm shops.", "success");
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
  const aadhar = document.getElementById("aadharInput").value.replace(/\s/g,"");
  const loc = document.getElementById("kycLocation").value;
  const err = document.getElementById("aadharError");
  if(!/^\d{12}$/.test(aadhar) || !loc){
    err.style.display = "block";
    return;
  }
  err.style.display = "none";
  _aadharOtpPending = String(Math.floor(1000 + Math.random()*9000));
  document.getElementById("aadharDemoOtp").textContent = _aadharOtpPending;
  document.getElementById("aadharStep1").style.display = "none";
  document.getElementById("aadharStep2").style.display = "block";
  _kycAadharLast4 = aadhar.slice(-4);
  _kycLocation = loc;
  toast(getLang()==='ta' ? "ஆதார் OTP அனுப்பப்பட்டது" : "Aadhaar OTP sent", "success");
}

function onVerifyAadharOtp(e){
  e.preventDefault();
  const entered = document.getElementById("aadharOtpInput").value.trim();
  const err = document.getElementById("aadharOtpError");
  if(entered !== _aadharOtpPending){
    err.style.display = "block";
    return;
  }
  err.style.display = "none";
  document.getElementById("aadharBlock").style.display = "none";
  document.getElementById("bankBlock").style.display = "block";
}

function onSaveBank(e){
  e.preventDefault();
  const acc = document.getElementById("accountInput").value.trim();
  const ifsc = document.getElementById("ifscInput").value.trim();
  const err = document.getElementById("bankError");
  if(acc.length < 6 || !ifsc){
    err.style.display = "block";
    return;
  }
  err.style.display = "none";

  const user = DB.getCurrentUser();
  user.kyc = {
    verified: true,
    location: _kycLocation,
    aadharLast4: _kycAadharLast4,
    accountLast4: acc.slice(-4),
  };
  DB.saveUser(user);

  toast(t('kyc_done_msg'), "success");
  document.getElementById("kycSection").style.display = "none";
  showShopForm(user);
}

function showShopForm(user){
  document.getElementById("shopSection").style.display = "block";
  const locSelect = document.getElementById("shopLocation");
  populateLocationSelect(locSelect);
  if(user.kyc && user.kyc.location) locSelect.value = user.kyc.location;
}

let _ownerPhotoDataUrl = "assets/placeholder-owner.svg";
function onOwnerPhotoChosen(e){
  const file = e.target.files[0];
  if(!file) return;
  fileToDataURL(file, (dataUrl)=>{
    _ownerPhotoDataUrl = dataUrl;
    document.getElementById("ownerPhotoPreview").src = dataUrl;
    document.getElementById("ownerPhotoPreview").style.display = "block";
  });
}

function onCreateShop(e){
  e.preventDefault();
  const name = document.getElementById("shopNameInput").value.trim();
  const loc = document.getElementById("shopLocation").value;
  const err = document.getElementById("shopError");
  if(!name || !loc){
    err.style.display = "block";
    return;
  }
  err.style.display = "none";

  const user = DB.getCurrentUser();
  const shop = {
    id: newId("shop"),
    ownerMobile: user.mobile,
    name: name,
    ownerImage: _ownerPhotoDataUrl,
    location: loc,
    items: [],
    reviews: [],
  };
  DB.saveShop(shop);
  alert(t('shop_created_alert'));
  location.href = "index.html";
}
