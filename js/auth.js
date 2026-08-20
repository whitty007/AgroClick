/* =========================================================
   auth.js — mobile number + OTP login (used by login.html)
   ---------------------------------------------------------
   This now uses a backend endpoint for OTP delivery and
   verification. If no SMS provider is configured, the backend
   can fall back to a demo OTP for local testing.
   ========================================================= */

let _pendingMobile = null;
let _resendTimer = null;

function startLoginFlow(){
  showStep(1);
  document.getElementById("mobileForm").addEventListener("submit", onSubmitMobile);
  document.getElementById("otpForm").addEventListener("submit", onSubmitOtp);
  document.getElementById("nameForm").addEventListener("submit", onSubmitName);
  document.getElementById("resendBtn").addEventListener("click", (e)=>{ e.preventDefault(); if(_pendingMobile) sendOtp(_pendingMobile, true); });
}

function showStep(n){
  [1,2,3].forEach(i=>{
    document.getElementById("step"+i).style.display = (i===n) ? "block" : "none";
  });
  document.querySelectorAll(".steps-indicator span").forEach((el,i)=>{
    el.classList.remove("active","done");
    if(i < n-1) el.classList.add("done");
    if(i === n-1) el.classList.add("active");
  });
}

function onSubmitMobile(e){
  e.preventDefault();
  const input = document.getElementById("mobileInput");
  const val = input.value.trim();
  const errEl = document.getElementById("mobileError");
  if(!/^[6-9]\d{9}$/.test(val)){
    errEl.style.display = "block";
    return;
  }
  errEl.style.display = "none";
  _pendingMobile = val;
  sendOtp(val, false);
}

let _localDemoOtp = null;

async function sendOtp(mobile, isResend){
  try {
    const res = await fetch("/api/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobile })
    });

    const data = await res.json();
    if(!res.ok || !data.success){
      toast(data.error || (getLang()==='ta' ? "OTP அனுப்ப முடியவில்லை" : "Unable to send OTP"), "error");
      return;
    }

    document.getElementById("otpDestination").textContent = mobile;
    const otpBanner = document.querySelector(".demo-otp-banner");
    const otpValueEl = document.getElementById("demoOtpValue");
    if(data.showCode){
      _localDemoOtp = data.demoOtp || null;
      if(otpBanner) otpBanner.style.display = "block";
      if(otpValueEl) {
        otpValueEl.textContent = data.demoOtp || "";
        otpValueEl.style.display = "block";
      }
    }else{
      _localDemoOtp = null;
      if(otpBanner) otpBanner.style.display = "none";
      if(otpValueEl) {
        otpValueEl.textContent = "";
        otpValueEl.style.display = "none";
      }
    }

    document.querySelectorAll(".otp-boxes input").forEach(b=>b.value="");
    const errEl = document.getElementById("otpError");
    if(errEl) errEl.style.display = "none";
    showStep(2);
    const firstBox = document.querySelector(".otp-boxes input");
    if(firstBox) firstBox.focus();
    toast((getLang()==='ta' ? "OTP அனுப்பப்பட்டது" : "OTP sent"), "success");
    startResendCountdown();
  } catch (err) {
    console.warn("OTP server API unreachable, using local demo fallback:", err);
    _localDemoOtp = String(Math.floor(1000 + Math.random() * 9000));
    document.getElementById("otpDestination").textContent = mobile;
    const otpBanner = document.querySelector(".demo-otp-banner");
    const otpValueEl = document.getElementById("demoOtpValue");
    if(otpBanner) otpBanner.style.display = "block";
    if(otpValueEl) {
      otpValueEl.textContent = _localDemoOtp;
      otpValueEl.style.display = "block";
    }
    document.querySelectorAll(".otp-boxes input").forEach(b=>b.value="");
    const errEl = document.getElementById("otpError");
    if(errEl) errEl.style.display = "none";
    showStep(2);
    const firstBox = document.querySelector(".otp-boxes input");
    if(firstBox) firstBox.focus();
    toast((getLang()==='ta' ? "OTP அனுப்பப்பட்டது" : "OTP sent"), "success");
    startResendCountdown();
  }
}

function startResendCountdown(){
  let secs = 30;
  const btn = document.getElementById("resendBtn");
  const label = document.getElementById("resendCountdown");
  btn.style.display = "none";
  label.style.display = "inline";
  clearInterval(_resendTimer);
  _resendTimer = setInterval(()=>{
    secs--;
    label.textContent = `${t('resend_in')} ${secs}s`;
    if(secs<=0){
      clearInterval(_resendTimer);
      btn.style.display = "inline";
      label.style.display = "none";
    }
  }, 1000);
  label.textContent = `${t('resend_in')} ${secs}s`;
}

function wireOtpBoxAutoAdvance(){
  const boxes = Array.from(document.querySelectorAll(".otp-boxes input"));
  boxes.forEach((box, i)=>{
    box.addEventListener("input", ()=>{
      box.value = box.value.replace(/\D/g,"").slice(0,1);
      if(box.value && i < boxes.length-1) boxes[i+1].focus();
    });
    box.addEventListener("keydown", (e)=>{
      if(e.key === "Backspace" && !box.value && i>0) boxes[i-1].focus();
    });
    box.addEventListener("paste", (e)=>{
      e.preventDefault();
      const pasted = (e.clipboardData || window.clipboardData).getData("text").replace(/\D/g,"").slice(0, boxes.length);
      pasted.split("").forEach((char, j)=>{
        if(boxes[i + j]) boxes[i + j].value = char;
      });
      const nextEmpty = boxes.findIndex(b => !b.value);
      if(nextEmpty !== -1) boxes[nextEmpty].focus();
      else boxes[boxes.length - 1].focus();
    });
  });
}

async function onSubmitOtp(e){
  e.preventDefault();
  const boxes = Array.from(document.querySelectorAll(".otp-boxes input"));
  const entered = boxes.map(b=>b.value).join("");
  const errEl = document.getElementById("otpError");

  if(entered.length < 4){
    if(errEl) {
      errEl.textContent = getLang()==='ta' ? "சரியான 4 இலக்க OTP ஐ உள்ளிடவும்" : "Enter a valid 4-digit OTP.";
      errEl.style.display = "block";
    }
    return;
  }

  if(!_pendingMobile){
    const mobInput = document.getElementById("mobileInput");
    _pendingMobile = mobInput ? mobInput.value.trim() : "";
  }

  try {
    const res = await fetch("/api/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobile: _pendingMobile, otp: entered })
    });

    const data = await res.json();
    if(!res.ok || !data.success){
      if(errEl) {
        errEl.textContent = data.error || (getLang()==='ta' ? "தவறான OTP." : "Incorrect OTP. Please try again.");
        errEl.style.display = "block";
      }
      return;
    }

    if(errEl) errEl.style.display = "none";

    const existing = DB.getUser(_pendingMobile);
    if(existing && existing.name){
      DB.setSession(_pendingMobile);
      finishLogin();
    }else{
      showStep(3);
    }
  } catch (err) {
    console.warn("OTP verify server API unreachable, attempting local fallback:", err);
    if(_localDemoOtp && entered === _localDemoOtp){
      if(errEl) errEl.style.display = "none";
      const existing = DB.getUser(_pendingMobile);
      if(existing && existing.name){
        DB.setSession(_pendingMobile);
        finishLogin();
      }else{
        showStep(3);
      }
    }else{
      if(errEl) {
        errEl.textContent = getLang()==='ta' ? "தவறான OTP." : "Incorrect OTP. Please try again.";
        errEl.style.display = "block";
      }
    }
  }
}


function onSubmitName(e){
  e.preventDefault();
  const nameInput = document.getElementById("nameInput");
  const name = nameInput.value.trim();
  if(!name){
    document.getElementById("nameError").style.display = "block";
    return;
  }
  document.getElementById("nameError").style.display = "none";
  const existing = DB.getUser(_pendingMobile) || { mobile:_pendingMobile, kyc:{ verified:false } };
  existing.name = name;
  DB.saveUser(existing);
  DB.setSession(_pendingMobile);
  finishLogin();
}

function finishLogin(){
  const params = new URLSearchParams(location.search);
  const redirect = params.get("redirect") || "index.html";
  toast((getLang()==='ta' ? "உள்நுழைவு வெற்றி!" : "Logged in!"), "success");
  setTimeout(()=>{ location.href = redirect; }, 500);
}
