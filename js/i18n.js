/* =========================================================
   i18n.js — English / Tamil text for the whole site.
   Add data-i18n="key" to any element's text, data-i18n-ph="key"
   to an input's placeholder, and call applyI18n() after the
   page (or any new DOM you inject) is ready.
   ========================================================= */

const DICT = {
  // ---- brand / nav ----
  brand:                { en:"AgroClick", ta:"அக்ரோகிளிக்" },
  nav_login:             { en:"Login", ta:"உள்நுழைக" },
  nav_my_orders:         { en:"My Orders", ta:"எனது ஆர்டர்கள்" },
  nav_logout:            { en:"Logout", ta:"வெளியேறு" },
  choose_location:       { en:"Choose your place", ta:"உங்கள் இடத்தைத் தேர்வு செய்யவும்" },

  // ---- hero ----
  hero_eyebrow:          { en:"Direct from Tamil Nadu farms", ta:"தமிழ்நாடு பண்ணைகளில் இருந்து நேரடியாக" },
  hero_title:            { en:"Fresh from the farm, straight to your home", ta:"பண்ணையிலிருந்து புதிதாக, உங்கள் வீட்டிற்கு நேரடியாக" },
  hero_lede:             { en:"Buy vegetables, fruits, rice and spices directly from farmers near you — no middlemen, fair prices for everyone.", ta:"உங்களுக்கு அருகிலுள்ள விவசாயிகளிடமிருந்து காய்கறிகள், பழங்கள், அரிசி மற்றும் மசாலாப் பொருட்களை நேரடியாக வாங்குங்கள் — இடைத்தரகர் இல்லை, அனைவருக்கும் நியாயமான விலை." },
  btn_visit_shops:       { en:"Visit Shops", ta:"கடைகளுக்குச் செல்லவும்" },
  btn_become_owner:      { en:"Become a Shop Owner", ta:"கடை உரிமையாளராக ஆகுங்கள்" },
  btn_manage_shop:       { en:"Manage My Shop", ta:"எனது கடையை நிர்வகி" },

  how_title:             { en:"How AgroClick works", ta:"அக்ரோகிளிக் எப்படி வேலை செய்கிறது" },
  how1_t:                { en:"Pick your place", ta:"உங்கள் இடத்தைத் தேர்வு செய்யுங்கள்" },
  how1_d:                { en:"Choose your town so we show shops closest to you first.", ta:"உங்கள் ஊரைத் தேர்ந்தெடுக்கவும், அருகிலுள்ள கடைகளை முதலில் காட்டுவோம்." },
  how2_t:                { en:"Order farm-fresh produce", ta:"பண்ணை பொருட்களை ஆர்டர் செய்யுங்கள்" },
  how2_d:                { en:"Browse shops, add items to cart, and pay securely online.", ta:"கடைகளைப் பார்வையிடவும், பொருட்களைக் கார்ட்டில் சேர்க்கவும், பாதுகாப்பாக ஆன்லைனில் பணம் செலுத்தவும்." },
  how3_t:                { en:"Support a local farmer", ta:"உள்ளூர் விவசாயியை ஆதரியுங்கள்" },
  how3_d:                { en:"Your payment goes straight to the farmer who grew it.", ta:"உங்கள் பணம் அதை வளர்த்த விவசாயிக்கு நேரடியாகச் செல்கிறது." },

  // ---- login ----
  login_title:           { en:"Login to AgroClick", ta:"அக்ரோகிளிக்கில் உள்நுழையவும்" },
  login_sub:             { en:"We'll send a one-time code to verify your number.", ta:"உங்கள் எண்ணைச் சரிபார்க்க ஒரு முறை குறியீட்டை அனுப்புவோம்." },
  label_mobile:          { en:"Mobile number", ta:"மொபைல் எண்" },
  btn_send_otp:          { en:"Send OTP", ta:"OTP அனுப்பவும்" },
  otp_title:             { en:"Enter the OTP", ta:"OTP-ஐ உள்ளிடவும்" },
  otp_sub:               { en:"sent to", ta:"அனுப்பப்பட்டது" },
  btn_verify:            { en:"Verify", ta:"சரிபார்க்கவும்" },
  resend_otp:            { en:"Resend OTP", ta:"OTP-ஐ மீண்டும் அனுப்பு" },
  resend_in:             { en:"Resend in", ta:"இதில் மீண்டும் அனுப்பு" },
  ask_name_title:        { en:"What should we call you?", ta:"நாங்கள் உங்களை என்ன என்று அழைக்க வேண்டும்?" },
  ask_name_sub:          { en:"This is just for us to greet you nicely.", ta:"இது உங்களை அழகாக வரவேற்க மட்டுமே." },
  label_name:            { en:"Your name", ta:"உங்கள் பெயர்" },
  btn_continue:          { en:"Continue", ta:"தொடரவும்" },
  err_mobile:            { en:"Enter a valid 10-digit mobile number.", ta:"சரியான 10 இலக்க மொபைல் எண்ணை உள்ளிடவும்." },
  err_otp:               { en:"Incorrect OTP. Please try again.", ta:"தவறான OTP. மீண்டும் முயற்சிக்கவும்." },
  err_name:              { en:"Please tell us your name.", ta:"உங்கள் பெயரைச் சொல்லுங்கள்." },
  demo_otp_banner:       { en:"A verification code has been sent to your mobile number.", ta:"உங்கள் மொபைல் எண்ணுக்கு சரிபார்ப்புக் குறியீடு அனுப்பப்பட்டது." },

  // ---- KYC / become shop owner ----
  kyc_title:             { en:"Verify your details", ta:"உங்கள் விவரங்களைச் சரிபார்க்கவும்" },
  kyc_sub:               { en:"We verify every farmer once, to keep AgroClick trustworthy for customers.", ta:"வாடிக்கையாளர்களுக்கு நம்பகத்தன்மையை உறுதி செய்ய, ஒவ்வொரு விவசாயியையும் ஒரு முறை சரிபார்க்கிறோம்." },
  label_location:        { en:"Your location", ta:"உங்கள் இடம்" },
  label_aadhar:          { en:"Aadhaar number", ta:"ஆதார் எண்" },
  btn_send_aadhar_otp:   { en:"Send Aadhaar OTP", ta:"ஆதார் OTP அனுப்பவும்" },
  label_account:         { en:"Bank account number", ta:"வங்கி கணக்கு எண்" },
  label_ifsc:            { en:"IFSC code", ta:"IFSC குறியீடு" },
  btn_save_continue:     { en:"Save & Continue", ta:"சேமித்து தொடரவும்" },
  kyc_done_msg:          { en:"Identity verified. You won't need to do this again.", ta:"அடையாளம் சரிபார்க்கப்பட்டது. இதை மீண்டும் செய்ய தேவையில்லை." },
  free_shop_limit_title: { en:"Free Shop Limit Reached", ta:"இலவச கடை வரம்பு எட்டப்பட்டது" },
  free_shop_limit_msg:   { en:"You have already created a free shop on AgroClick. The free plan allows 1 farm shop per seller.", ta:"நீங்கள் ஏற்கனவே அக்ரோகிளிக்கில் 1 இலவச கடையை உருவாக்கியுள்ளீர்கள். இலவச திட்டம் 1 கடையை மட்டுமே அனுமதிக்கும்." },
  upgrade_hint_msg:      { en:"Upgrade to Premium to create multiple farm shops, get featured search placement, and reach more customers!", ta:"பல பண்ணை கடைகளை உருவாக்க, தேடல் சிறப்பம்சத்தைப் பெற பிரீமியம் திட்டத்திற்கு மேம்படுத்தவும்!" },
  btn_upgrade_premium:   { en:"Upgrade to Premium", ta:"பிரீமியத்திற்கு மேம்படுத்தவும்" },
  btn_manage_existing_shop:{ en:"Manage My Existing Shop", ta:"எனது தற்போதைய கடையை நிர்வகி" },

  // ---- premium page ----
  prem_badge_title:      { en:"AgroClick Premium Seller", ta:"அக்ரோகிளிக் பிரீமியம் விற்பனையாளர்" },
  prem_hero_title:       { en:"Expand Your Farm Business Across Tamil Nadu", ta:"தமிழ்நாட முழுவதும் உங்கள் விவசாய வணிகத்தை விரிவாக்குங்கள்" },
  prem_hero_sub:         { en:"Unlock multiple farm shops, top search ranking in your district, zero middlemen commission, and priority customer support.", ta:"வரம்பற்ற பண்ணை கடைகள், உங்கள் மாவட்டத்தின் சிறந்த தேடல் இடம், இடைத்தரகர் இல்லாத கட்டணம் மற்றும் முன்னுரிமை ஆதரவைப் பெறுங்கள்." },
  prem_b1_title:         { en:"Multiple Farm Shops", ta:"பல பண்ணை கடைகள்" },
  prem_b1_desc:          { en:"Create and manage multiple shops across Chennai, Coimbatore, Madurai, Salem, Trichy, and 40+ Tamil Nadu locations under 1 seller account.", ta:"சென்னை, கோவை, மதுரை, சேலம், திருச்சி மற்றும் 40+ தமிழ்நாட இடங்களில் ஒரே கணக்கில் பல கடைகளை உருவாக்கலாம்." },
  prem_b2_title:         { en:"Featured #1 Search Ranking", ta:"சிறந்த #1 தேடல் இடம்" },
  prem_b2_desc:          { en:"Your shop produce gets highlighted at the very top of shop listings when customers search for fresh vegetables, fruits, and rice.", ta:"வாடிக்கையாளர்கள் தேடும் போது உங்கள் கடை பொருட்கள் பட்டியலின் மிக உச்சியில் முதன்மையாகக் காட்டப்படும்." },
  prem_b3_title:         { en:"Gold Verified Seller Badge", ta:"தங்க சான்றளிக்கப்பட்ட விற்பனையாளர் பேட்ஜ்" },
  prem_b3_desc:          { en:"Display a golden '👑 Premium Verified Farmer' trust badge on your shop profile to win instant customer confidence.", ta:"வாடிக்கையாளர் நம்பிக்கையை வெல்ல உங்கள் கடையின் சுயவிவரத்தில் தங்க '👑 பிரீமியம் சரிபார்க்கப்பட்ட விவசாயி' பேட்ஜைக் காண்பிக்கவும்." },
  prem_b4_title:         { en:"Direct Customer Marketing", ta:"நேரடி வாடிக்கையாளர் சந்தைப்படுத்தல்" },
  prem_b4_desc:          { en:"Receive 100% direct customer payments to your bank account via Razorpay with zero middleman deductions or extra platform fees.", ta:"இடைத்தரகர் பிடித்தம் இல்லாமல் 100% நேரடி வாடிக்கையாளர் பணத்தை ரேஸர்பே மூலம் உங்கள் வங்கி கணக்கில் நேரடியாகப் பெறுங்கள்." },
  prem_plan_tag:         { en:"Recommended for Farmers & Sellers", ta:"விவசாயிகள் மற்றும் விற்பனையாளர்களுக்கு பரிந்துரைக்கப்படுகிறது" },
  prem_plan_name:        { en:"Premium Seller Annual Membership", ta:"பிரீமியம் விற்பனையாளர் வருடாந்திர உறுப்பினர்" },
  prem_plan_sub:         { en:"Includes all premium features for 365 days.", ta:"365 நாட்களுக்கு அனைத்து பிரீமியம் அம்சங்களும் அடங்கும்." },
  prem_check1:           { en:"Create & manage unlimited farm shops", ta:"வரம்பற்ற பண்ணை கடைகளை உருவாக்கி நிர்வகிக்கலாம்" },
  prem_check2:           { en:"Top #1 search placement in your district", ta:"உங்கள் மாவட்டத்தில் சிறந்த #1 தேடல் இடம்" },
  prem_check3:           { en:"Golden Verified Farmer Trust Badge", ta:"தங்க சான்றளிக்கப்பட்ட விவசாயி நம்பிக்கை பேட்ஜ்" },
  prem_check4:           { en:"Direct WhatsApp & Call Customer Support", ta:"நேரடி வாட்ஸ்அப் மற்றும் அழைப்பு வாடிக்கையாளர் ஆதரவு" },
  prem_check5:           { en:"Zero Commission on sales via Razorpay", ta:"ரேஸர்பே மூலம் விற்பனையில் பூஜ்ஜிய கமிஷன்" },
  btn_activate_premium_now: { en:"Activate Premium Plan Now (₹499/yr)", ta:"இப்போது பிரீமியம் திட்டத்தை இயக்குங்கள் (₹499/ஆண்டு)" },


  kyc_security_note:     { en:"We verify every farmer to ensure AgroClick remains trustworthy. Your Aadhaar and bank details are securely processed.", ta:"அக்ரோகிளிக் நம்பகத்தன்மையை உறுதி செய்ய ஒவ்வொரு விவசாயியையும் சரிபார்க்கிறோம். உங்கள் ஆதார் மற்றும் வங்கி விவரங்கள் பாதுகாப்பாக செயலாக்கப்படுகின்றன." },
  err_aadhar:            { en:"Enter a valid 12-digit Aadhaar number.", ta:"சரியான 12 இலக்க ஆதார் எண்ணை உள்ளிடவும்." },
  err_account:           { en:"Enter your bank account number.", ta:"உங்கள் வங்கி கணக்கு எண்ணை உள்ளிடவும்." },

  // ---- shop creation ----
  shop_create_title:     { en:"Create your shop", ta:"உங்கள் கடையை உருவாக்குங்கள்" },
  shop_create_sub:       { en:"Tell customers who you are.", ta:"நீங்கள் யார் என்று வாடிக்கையாளர்களிடம் சொல்லுங்கள்." },
  label_shop_name:       { en:"Shop name", ta:"கடை பெயர்" },
  label_owner_photo:     { en:"Your photo", ta:"உங்கள் புகைப்படம்" },
  upload_tap:            { en:"Tap to upload", ta:"பதிவேற்ற தட்டவும்" },
  btn_create_shop:       { en:"Create Shop", ta:"கடையை உருவாக்கு" },
  shop_created_alert:    { en:"Your shop has been created!", ta:"உங்கள் கடை உருவாக்கப்பட்டது!" },

  // ---- manage shop ----
  manage_title:          { en:"Manage My Shop", ta:"எனது கடையை நிர்வகி" },
  tab_items:             { en:"Items", ta:"பொருட்கள்" },
  tab_orders:            { en:"Orders", ta:"ஆர்டர்கள்" },
  tab_reviews:           { en:"Reviews", ta:"மதிப்புரைகள்" },
  btn_add_item:          { en:"Add Item", ta:"பொருள் சேர்" },
  btn_remove_shop:       { en:"Remove Shop", ta:"கடையை அகற்று" },
  no_items_yet:          { en:"No items added", ta:"பொருட்கள் சேர்க்கப்படவில்லை" },
  no_items_sub:          { en:"Add your first crop so customers can find it.", ta:"வாடிக்கையாளர்கள் கண்டுபிடிக்க உங்கள் முதல் பொருளைச் சேருங்கள்." },
  add_item_title:        { en:"Add a new item", ta:"புதிய பொருளைச் சேர்க்கவும்" },
  label_item_name:       { en:"Crop / product name", ta:"பயிர் / பொருளின் பெயர்" },
  label_item_price:      { en:"Price per kg (₹)", ta:"ஒரு கிலோவுக்கான விலை (₹)" },
  label_item_desc:       { en:"Description", ta:"விளக்கம்" },
  label_item_photo:      { en:"Photo", ta:"புகைப்படம்" },
  btn_save_item:         { en:"Add to shop", ta:"கடையில் சேர்" },
  mark_out_of_stock:     { en:"Mark out of stock", ta:"கையிருப்பு இல்லை எனக் குறி" },
  mark_in_stock:         { en:"Mark back in stock", ta:"மீண்டும் கையிருப்பில் உள்ளது எனக் குறி" },
  remove_item:           { en:"Remove", ta:"அகற்று" },
  out_of_stock:          { en:"Out of stock", ta:"கையிருப்பு இல்லை" },
  in_stock:              { en:"In stock", ta:"கையிருப்பில் உள்ளது" },
  no_orders_yet:         { en:"No orders yet.", ta:"இன்னும் ஆர்டர்கள் இல்லை." },
  no_reviews_yet:        { en:"No reviews yet.", ta:"இன்னும் மதிப்புரைகள் இல்லை." },
  confirm_remove_item:   { en:"Remove this item from your shop?", ta:"இந்தப் பொருளை உங்கள் கடையில் இருந்து அகற்றவா?" },
  confirm_remove_shop:   { en:"Remove your shop and all its listed items? This cannot be undone.", ta:"உங்கள் கடையை மற்றும் அதில் உள்ள அனைத்துப் பொருட்களையும் அகற்றவா? இதை மீட்டெடுக்க முடியாது." },
  shop_removed_msg:      { en:"Your shop has been removed.", ta:"உங்கள் கடை அகற்றப்பட்டது." },
  btn_mark_delivered:    { en:"Mark as Delivered", ta:"வழங்கப்பட்டதாக குறி" },
  order_status_delivered:{ en:"Delivered", ta:"வழங்கப்பட்டது" },

  // ---- shops list / detail ----
  shops_title:           { en:"Shops near you", ta:"உங்களுக்கு அருகிலுள்ள கடைகள்" },
  shops_sub:             { en:"Sorted by distance from your chosen place.", ta:"நீங்கள் தேர்ந்தெடுத்த இடத்திலிருந்து தூரத்தின் அடிப்படையில் வரிசைப்படுத்தப்பட்டுள்ளது." },
  no_shops_yet:          { en:"No shops yet", ta:"இன்னும் கடைகள் இல்லை" },
  no_shops_sub:          { en:"Be the first — become a shop owner.", ta:"முதலில் இருங்கள் — கடை உரிமையாளராக ஆகுங்கள்." },
  btn_visit_shop:        { en:"Visit Shop", ta:"கடைக்குச் செல்லவும்" },
  btn_add_to_cart:       { en:"Add", ta:"சேர்" },
  added_label:           { en:"Added", ta:"சேர்க்கப்பட்டது" },
  cart_btn:              { en:"Cart", ta:"கார்ட்" },
  reviews_title:         { en:"Customer reviews", ta:"வாடிக்கையாளர் மதிப்புரைகள்" },
  add_review_title:      { en:"Add your review", ta:"உங்கள் மதிப்புரையைச் சேர்க்கவும்" },
  label_rating:          { en:"Rating", ta:"மதிப்பீடு" },
  label_comment:         { en:"Comment", ta:"கருத்து" },
  btn_submit_review:     { en:"Submit Review", ta:"மதிப்புரையை அனுப்பவும்" },
  no_items_in_shop:      { en:"This shop hasn't added any items yet.", ta:"இந்தக் கடை இன்னும் பொருட்களைச் சேர்க்கவில்லை." },

  // ---- cart / checkout ----
  cart_title:            { en:"Your Cart", ta:"உங்கள் கார்ட்" },
  empty_cart:            { en:"Your cart is empty", ta:"உங்கள் கார்ட் காலியாக உள்ளது" },
  empty_cart_sub:        { en:"Visit a shop and add some fresh produce.", ta:"ஒரு கடைக்குச் சென்று சில புதிய பொருட்களைச் சேர்க்கவும்." },
  subtotal:              { en:"Subtotal", ta:"துணை மொத்தம்" },
  btn_pay_order:         { en:"Pay & Order", ta:"பணம் செலுத்தி ஆர்டர் செய்" },
  order_confirmed:       { en:"Your order is confirmed!", ta:"உங்கள் ஆர்டர் உறுதி செய்யப்பட்டது!" },
  payment_demo_note:     { en:"Secure online payment via Razorpay.", ta:"Razorpay மூலம் பாதுகாப்பான ஆன்லைன் கட்டணம்." },

  // ---- orders ----
  orders_title:          { en:"My Orders", ta:"எனது ஆர்டர்கள்" },
  no_orders_placed:      { en:"You haven't placed any orders yet.", ta:"நீங்கள் இன்னும் எந்த ஆர்டரும் செய்யவில்லை." },
  order_status_placed:   { en:"Placed", ta:"வைக்கப்பட்டது" },
  order_total:           { en:"Total", ta:"மொத்தம்" },

  // ---- chatbot ----
  chat_title:            { en:"AgroClick Help", ta:"அக்ரோகிளிக் உதவி" },
  chat_greeting:         { en:"Vanakkam! 🌾 How can I help you today?", ta:"வணக்கம்! 🌾 இன்று நான் உங்களுக்கு எப்படி உதவலாம்?" },
  chat_placeholder:      { en:"Type your question...", ta:"உங்கள் கேள்வியை தட்டச்சு செய்யவும்..." },
  chat_q1:               { en:"How do I order?", ta:"நான் எப்படி ஆர்டர் செய்வது?" },
  chat_q2:               { en:"How do I become a seller?", ta:"நான் எப்படி விற்பனையாளராக ஆகலாம்?" },
  chat_q3:               { en:"Payment options", ta:"கட்டண விருப்பங்கள்" },
  chat_q4:               { en:"Delivery info", ta:"டெலிவரி தகவல்" },
  chat_fallback:         { en:"I can help you with ordering, selling, payments, delivery, and login. Try one of the buttons above or type your question!", ta:"ஆர்டர், விற்பனை, கட்டணம், டெலிவரி மற்றும் உள்நுழைவு பற்றி உதவ முடியும். மேலே உள்ள பொத்தான்களை முயற்சிக்கவும்!" },

  // ---- common ----
  cancel:                { en:"Cancel", ta:"ரத்து செய்" },
  close:                 { en:"Close", ta:"மூடு" },
  back:                  { en:"Back", ta:"பின் செல்" },
  loading:               { en:"Loading...", ta:"ஏற்றுகிறது..." },
  per_kg:                { en:"/kg", ta:"/கிலோ" },
};

function getLang(){ return DB.getLang(); }

function t(key){
  const entry = DICT[key];
  if(!entry) return key;
  return entry[getLang()] || entry.en;
}

function applyI18n(root){
  const scope = root || document;
  const lang = getLang();
  document.documentElement.setAttribute("lang", lang);
  scope.querySelectorAll("[data-i18n]").forEach(el=>{
    el.textContent = t(el.getAttribute("data-i18n"));
  });
  scope.querySelectorAll("[data-i18n-ph]").forEach(el=>{
    el.setAttribute("placeholder", t(el.getAttribute("data-i18n-ph")));
  });
}

function setLanguage(lang){
  DB.setLang(lang);
  applyI18n(document);
  document.dispatchEvent(new CustomEvent("agroclick:langchange"));
}
