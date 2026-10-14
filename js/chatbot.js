/* =========================================================
   chatbot.js — AgroClick Help Bot (local keyword-based)
   ========================================================= */

/* ---------- comprehensive keyword-based response rules ---------- */
const CHAT_RULES = [
  // Greetings
  { keywords: ["hello", "hi ", "hey", "vanakkam", "namaste", "vanakam", "good morning", "good evening", "good afternoon"],
    en: "Vanakkam! Welcome to AgroClick. I can help you with ordering, selling, payments, delivery, and more. What would you like to know?",
    ta: "வணக்கம்! AgroClick-க்கு வரவேற்கிறோம். ஆர்டர், விற்பனை, கட்டணம், டெலிவரி மற்றும் பலவற்றில் உங்களுக்கு உதவ முடியும். என்ன தெரிந்து கொள்ள விரும்புகிறீர்கள்?" },

  // How to order
  { keywords: ["order", "buy", "purchase", "how to order", "how do i order", "place order"],
    en: "To order on AgroClick:\n1. Choose your location from the navbar\n2. Click 'Visit Shops' to browse nearby farms\n3. Open a shop and add items to your cart\n4. Go to your cart and tap 'Pay & Order'\n\nYour order goes straight to the farmer!",
    ta: "AgroClick-ல் ஆர்டர் செய்ய:\n1. நாவ்பாரில் இருந்து உங்கள் இடத்தைத் தேர்ந்தெடுக்கவும்\n2. 'கடைகளுக்குச் செல்லவும்' என்பதைக் கிளிக் செய்யுங்கள்\n3. ஒரு கடையைத் திறந்து பொருட்களைக் கார்ட்டில் சேர்க்கவும்\n4. உங்கள் கார்ட்டிற்குச் சென்று 'பணம் செலுத்தி ஆர்டர் செய்' என்பதை அழுத்தவும்\n\nஉங்கள் ஆர்டர் நேரடியாக விவசாயிக்குச் செல்கிறது!" },

  // Cart
  { keywords: ["cart", "view cart", "my cart", "checkout"],
    en: "To view your cart, click the cart button that appears when you add items. You can adjust quantities with +/- and proceed to pay. If the cart is empty, visit a shop first!",
    ta: "உங்கள் கார்ட்டைப் பார்க்க, பொருட்களைச் சேர்க்கும் போது தோன்றும் கார்ட் பொத்தானைக் கிளிக் செய்யுங்கள். +/- மூலம் அளவுகளை மாற்றலாம்." },

  // Seller / Become shop owner
  { keywords: ["seller", "sell", "become seller", "shop owner", "register shop", "farmer", "i am a farmer", "start selling", "sell my crops"],
    en: "To start a shop:\n1. Log in with your mobile number\n2. Click 'Become a Shop Owner' on the homepage\n3. Complete the details requested in the seller form\n4. Create your shop and add crop listings.\n\nThis demo does not verify KYC or execute seller payouts.",
    ta: "விற்பனையாளராக:\n1. உங்கள் மொபைல் எண்ணில் உள்நுழையவும்\n2. முகப்புப் பக்கத்தில் 'கடை உரிமையாளராக ஆகுங்கள்' என்பதைக் கிளிக் செய்யுங்கள்\n3. ஒரு முறை சரிபார்ப்பை முடிக்கவும்\n4. உங்கள் கடையை உருவாக்கி பயிர்களைச் சேர்க்கத் தொடங்குங்கள்!" },

  // Payment
  { keywords: ["payment", "pay", "upi", "card", "netbanking", "razorpay", "money", "how to pay"],
    en: "The checkout may use Razorpay when a live payment key and payment-verification backend are configured. Otherwise this demo shows a confirmation without charging you. Check the checkout screen before assuming a payment was made.",
    ta: "நேரடி Razorpay விசையும் கட்டண சரிபார்ப்பு சேவையகமும் அமைக்கப்பட்டால் செக் அவுட் அதைப் பயன்படுத்தும். இல்லையெனில் டெமோ உறுதிப்படுத்தல் மட்டுமே காட்டப்படும்; கட்டணம் வசூலிக்கப்படாது." },

  // Delivery
  { keywords: ["delivery", "deliver", "shipping", "ship", "when will i get", "how long", "time", "pickup"],
    en: "Delivery time and pickup details are not guaranteed by the app. Confirm the seller's arrangements before ordering; current listings do not include a delivery ETA.",
    ta: "டெலிவரி நேரம் மற்றும் பிக்அப் விவரங்களுக்கு செயலி உத்தரவாதம் அளிக்காது. ஆர்டர் செய்வதற்கு முன் விற்பனையாளரிடம் உறுதிப்படுத்தவும்; பட்டியல்களில் டெலிவரி நேரம் இல்லை." },

  // Login
  { keywords: ["login", "log in", "sign in", "otp", "mobile number", "verify", "verification", "register"],
    en: "To log in:\n1. Click 'Login' in the top navigation bar\n2. Enter your 10-digit mobile number (starting with 6-9)\n3. You'll receive a 4-digit OTP\n4. Enter the OTP to verify\n\nIf you're new, you'll be asked for your name.",
    ta: "உள்நுழைய:\n1. மேல் பட்டியில் 'Login' என்பதைக் கிளிக் செய்யுங்கள்\n2. உங்கள் 10 இலக்க மொபைல் எண்ணை உள்ளிடவும்\n3. ஒரு 4 இலக்க OTP பெறுவீர்கள்\n4. OTP-ஐ உள்ளிட்டு சரிபார்க்கவும்" },

  // About AgroClick
  { keywords: ["about", "what is agroclick", "about agroclick", "who are you", "tell me about", "agroclick"],
    en: "AgroClick is a marketplace for farmer shops and produce listings. Browse the Shops page to see the products and prices currently recorded in this app.",
    ta: "AgroClick விவசாயக் கடைகள் மற்றும் பொருள் பட்டியல்களுக்கான சந்தை. தற்போது செயலியில் பதிவு செய்யப்பட்ட பொருட்கள் மற்றும் விலைகளை Shops பக்கத்தில் பார்க்கலாம்." },

  // Return / Refund
  { keywords: ["return", "refund", "cancel order", "cancellation", "money back"],
    en: "If you need to cancel or return an order, please contact the farmer directly through the shop page. Since AgroClick connects you directly with local farmers, any returns or issues are handled between you and the seller.",
    ta: "ஆர்டரை ரத்து செய்ய அல்லது திரும்பப் பெற விரும்பினால், கடை பக்கம் மூலம் விவசாயியைத் தொடர்பு கொள்ளுங்கள்." },

  // Contact / Support
  { keywords: ["contact", "support", "help", "customer care", "phone number", "email", "reach you"],
    en: "For support, you can use this chatbot on any page. You can also visit the shop's page for direct farmer contact. AgroClick is committed to helping both farmers and customers quickly.",
    ta: "ஆதரவுக்கு, எந்த பக்கத்திலும் இந்த சாட்பாட்டைப் பயன்படுத்தலாம். விவசாயியை நேரடியாகத் தொடர்பு கொள்ள கடை பக்கத்தையும் பார்க்கலாம்." },

  // Location / Nearby
  { keywords: ["location", "nearby", "near me", "shop near", "where", "find shop"],
    en: "Use the location dropdown in the top navigation bar to select your town in Tamil Nadu. Shops will be automatically sorted by distance from your chosen location — the nearest shops appear first!",
    ta: "மேல் பட்டியில் உள்ள இருப்பிட நடுவரைப் பயன்படுத்தி உங்கள் நகரத்தைத் தேர்ந்தெடுக்கவும். அருகிலுள்ள கடைகள் முதலில் தோன்றும்!" },

  // Fresh / Quality
  { keywords: ["fresh", "quality", "organic", "natural", "pesticide", "chemical free"],
    en: "Farming methods and certifications are not verified by this demo. Confirm directly with the seller before relying on organic or pesticide-free claims.",
    ta: "இந்த டெமோ விவசாய முறைகள் அல்லது சான்றிதழ்களைச் சரிபார்க்காது. இயற்கை அல்லது பூச்சிக்கொல்லி இல்லாதது போன்ற கூற்றுகளை நம்புவதற்கு முன் விற்பனையாளரிடம் உறுதிப்படுத்தவும்." },

  // Price
  { keywords: ["price", "cost", "expensive", "cheap", "discount", "offer", "deal"],
    en: "Prices are entered by each shop and shown per kilogram when available. Use product search to compare recorded prices; the app does not provide live mandi or market rates.",
    ta: "ஒவ்வொரு கடையும் விலையை உள்ளிடுகிறது; கிடைக்கும் போது கிலோவுக்கான விலை காட்டப்படும். பதிவு செய்யப்பட்ட விலைகளைத் தேடி ஒப்பிடுங்கள்; நேரடி மண்டி அல்லது சந்தை விலைகள் வழங்கப்படுவதில்லை." },

  // Tamil Nadu districts
  { keywords: ["tamil nadu", "tamil", "chennai", "coimbatore", "madurai", "trichy", "salem", "erode", "thanjavur", "district"],
    en: "The locations available in this version are listed in the navbar. Choose a town there to sort shops by approximate distance.",
    ta: "இந்த பதிப்பில் கிடைக்கும் இடங்கள் மேல் பட்டியில் உள்ளன. நகரத்தைத் தேர்ந்தெடுத்து கடைகளை தோராயமான தூரத்தின் அடிப்படையில் வரிசைப்படுத்தவும்." },

  // Reviews
  { keywords: ["review", "rating", "feedback", "star", "comment"],
    en: "After receiving your order, you can leave a review for any shop. Visit the shop page, scroll to the reviews section, and submit your rating (1-5 stars) and comment. Reviews help other customers find the best farmers!",
    ta: "ஆர்டரைப் பெற்ற பிறகு, எந்த கடைக்கும் மதிப்புரை விடலாம். கடை பக்கத்திற்குச் சென்று மதிப்புரை பிரிவில் உங்கள் மதிப்பீட்டைச் சமர்ப்பிக்கவும்." },

  // Stock
  { keywords: ["stock", "available", "out of stock", "availability", "sold out"],
    en: "Each item on AgroClick shows its stock status. Items marked 'Out of stock' are temporarily unavailable. Browse other shops for similar products, or check back later when the farmer restocks!",
    ta: "AgroClick-ல் உள்ள ஒவ்வொரு பொருளும் கையிருப்பு நிலையைக் காட்டுகிறது. 'கையிருப்பு இல்லை' எனக் குறிக்கப்பட்ட பொருட்கள் தற்காலிகமாக கிடைக்கவில்லை." },

  // Product categories
  { keywords: ["vegetable", "vegetables", "fruit", "fruits", "rice", "spice", "spices", "tomato", "banana", "onion", "turmeric", "chili"],
    en: "AgroClick offers a wide variety:\n- Vegetables: tomato, onion, brinjal, capsicum, etc.\n- Fruits: banana, mango, etc.\n- Rice: Ponni, Sona Masoori, etc.\n- Spices: turmeric, chili, etc.\n\nBrowse our shops to see what's available!",
    ta: "AgroClick பலவகையான பொருட்களை வழங்குகிறது:\n- காய்கறிகள்: தக்காளி, வெங்காயம், கத்திரிக்காய்\n- பழங்கள்: வாழைப்பழம், மாம்பழம்\n- அரிசி: பொன்னி, சோனா மசூரி\n- மசாலா: மஞ்சள், மிளகாய்" },

  // Manage shop
  { keywords: ["manage shop", "add item", "my shop", "shop dashboard", "inventory", "manage items"],
    en: "To manage your shop, click the 'Manage My Shop' button (bottom-left) when logged in. From there you can:\n- Add new items\n- Toggle stock status\n- View incoming orders\n- Read customer reviews",
    ta: "உங்கள் கடையை நிர்வகிக்க, உள்நுழைந்ததும் 'எனது கடையை நிர்வகி' பொத்தானைக் கிளிக் செய்யுங்கள்." },

  // My orders
  { keywords: ["my order", "order status", "track order", "where is my order", "order history"],
    en: "To check your order status:\n1. Click 'My Orders' in the navigation bar\n2. You'll see all your past orders\n3. Status shows either 'Placed' or 'Delivered'\n\nYour order goes directly to the farmer for processing.",
    ta: "உங்கள் ஆர்டர் நிலையைச் சரிபார்க்க, வழிசெலுத்தல் பட்டியில் 'எனது ஆர்டர்கள்' என்பதைக் கிளிக் செய்யுங்கள்." },

  // How does it work
  { keywords: ["how does it work", "how it works", "how to use", "guide", "tutorial", "explain"],
    en: "AgroClick is simple:\n1. Pick your location in Tamil Nadu\n2. Browse nearby farmer shops\n3. Add fresh produce to your cart\n4. Pay securely online\n5. Get your order delivered or pick up from the farmer!\n\nFarmers get paid directly — no middlemen.",
    ta: "AgroClick எளிது:\n1. தமிழ்நாட்டில் உங்கள் இடத்தைத் தேர்ந்தெடுக்கவும்\n2. அருகிலுள்ள விவசாயிகள் கடைகளை உலாவுங்கள்\n3. புதிய பொருட்களைக் கார்ட்டில் சேர்க்கவும்\n4. பாதுகாப்பாக ஆன்லைனில் பணம் செலுத்தவும்\n5. உங்கள் ஆர்டரைப் பெறுங்கள்!" },

  // Thank you
  { keywords: ["thank", "thanks", "thank you", "nandri", "ok thanks"],
    en: "You're welcome! Happy to help. Is there anything else you'd like to know about AgroClick?",
    ta: "வரவேற்கிறோம்! உதவி செய்ததில் மகிழ்ச்சி. AgroClick பற்றி வேறு ஏதாவது தெரிந்து கொள்ள விரும்புகிறீர்களா?" },

  // Goodbye
  { keywords: ["bye", "goodbye", "see you", "poyittu varuven", "poyi varen"],
    en: "Goodbye! Thank you for using AgroClick. Have a wonderful day!",
    ta: "போய் வருகிறேன்! AgroClick-ஐப் பயன்படுத்தியதற்கு நன்றி. நல்ல நாள்!" },

  // Help
  { keywords: ["help me", "i need help", "assist", "assist me"],
    en: "I can help you with:\n- How to order farm-fresh produce\n- Becoming a seller/farmer on AgroClick\n- Payment options (UPI, cards, netbanking)\n- Delivery and pickup information\n- Shop location and browsing\n- Account and login issues\n\nJust ask about any of these!",
    ta: "நான் உங்களுக்கு உதவ முடியும்:\n- பண்ணை பொருட்களை எப்படி ஆர்டர் செய்வது\n- AgroClick-ல் விற்பனையாளராக எப்படி ஆவது\n- கட்டண விருப்பங்கள்\n- டெலிவரி மற்றும் பிக்அப் தகவல்\n- கடை இருப்பிடம் மற்றும் உலாவல்" },
];

/* =========================================================
   mountChatbot — injects the chatbot widget into every page
   ========================================================= */
let chatbotBusy = false;
let chatbotRecognition = null;
let chatbotListening = false;
let chatbotStopRequested = false;
let chatbotGotSpeech = false;
let chatbotVoiceSessionActive = false;
let chatbotSilenceTimer = null;
let chatbotSpeakingButton = null;

let voiceAssistantRecognition = null;
let voiceAssistantSessionId = 0;
let voiceAssistantLastTranscript = "";
let voiceAssistantState = {
  active: false,
  pendingAction: null,
  pendingPayload: {},
  lastPrompt: "",
};

const VOICE_PRODUCT_ALIASES = {
  tomato: ["tomato", "tomatoes", "தக்காளி", "தக்காளிகள்"],
  onion: ["onion", "onions", "வெங்காயம்", "வெங்காயங்கள்"],
  banana: ["banana", "bananas", "வாழை", "வாழைப்பழம்", "வாழைப்பழங்கள்"],
  mango: ["mango", "mangoes", "மாம்பழம்", "மாம்பழங்கள்"],
  rice: ["rice", "paddy", "அரிசி", "புழுங்கல் அரிசி"],
  turmeric: ["turmeric", "haldi", "மஞ்சள்", "மஞ்சள் தூள்"],
  chilli: ["chilli", "chili", "மிளகாய்", "மிளகாய்கள்"],
  brinjal: ["brinjal", "eggplant", "கத்தரி", "கத்தரிக்காய்"],
  carrot: ["carrot", "carrots", "கேரட்", "கேரட்டுகள்"],
  spinach: ["spinach", "palak", "கீரை", "பசலை"],
};

const VOICE_NUMBER_WORDS = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20,
  thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90,
  "சூன்": 0, "சுழியம்": 0, "பூஜ்ஜியம்": 0, "ஒன்று": 1, "இரண்டு": 2, "மூன்று": 3, "நான்கு": 4, "ஐந்து": 5, "ஆறு": 6, "ஏழு": 7, "எட்டு": 8, "ஒன்பது": 9, "பத்து": 10,
  "11": 11, "12": 12, "13": 13, "14": 14, "15": 15, "16": 16, "17": 17, "18": 18, "19": 19, "20": 20,
};

const VOICE_PAGE_TARGETS = Object.freeze({
  home: "index.html",
  shops: "shops.html",
  cart: "cart.html",
  orders: "my-orders.html",
  login: "login.html",
  seller: "become-shop-owner.html",
  manage_shop: "manage-shop.html",
  premium: "premium.html",
});

function getVoiceRecognitionTranscript(results) {
  const baseline = getChatRecognitionTranscript(results);
  if (!results || !results.length) return baseline;
  const candidates = [];
  for (let index = 0; index < results.length; index++) {
    const result = results[index];
    if (!result || !result.length) continue;
    const prefix = getChatRecognitionTranscript(Array.from(results).slice(0, index));
    for (const alternative of Array.from(result)) {
      if (typeof alternative?.transcript !== "string") continue;
      const transcript = sanitizeSpeechInput(`${prefix} ${alternative.transcript}`);
      if (transcript) candidates.push(transcript);
    }
  }
  if (!candidates.length) return baseline;
  return candidates.sort((left, right) => scoreVoiceTranscript(right) - scoreVoiceTranscript(left))[0] || baseline;
}

function scoreVoiceTranscript(transcript) {
  const lower = transcript.toLocaleLowerCase();
  let score = Math.min(transcript.length, 160) / 160;
  if (/(order|buy|purchase|want|need|add|remove|cart|checkout|shops|search|find|login|seller|எடு|வாங்க|ஆர்டர்|வேண்டும்|கார்ட்|கடைகள்)/i.test(lower)) {
    score += 2;
  }
  if (typeof getMarketplaceProducts === "function") {
    for (const product of getMarketplaceProducts()) {
      const name = String(product.name || "").toLocaleLowerCase();
      if (name && lower.includes(name)) score += 5;
    }
  }
  for (const aliases of Object.values(VOICE_PRODUCT_ALIASES)) {
    if (aliases.some(alias => lower.includes(alias.toLocaleLowerCase()))) score += 4;
  }
  return score;
}

function updateVoiceAssistantDisplay(text, status = "") {
  const display = document.getElementById("voice-assistant-transcript");
  if (!display) return;
  const response = [status, text].filter(Boolean).join(" ");
  display.textContent = [voiceAssistantLastTranscript, response].filter(Boolean).join("\n");
  display.hidden = !display.textContent;
}

function speakVoiceResponse(text, language = getLang(), onComplete = null) {
  const finish = () => {
    if (typeof onComplete === "function") onComplete();
  };
  if (!("speechSynthesis" in window)) {
    finish();
    return;
  }
  const cleanText = sanitizeNarrationText(text);
  if (!cleanText) {
    finish();
    return;
  }
  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = language === "ta" ? "ta-IN" : "en-IN";
  const voice = getPreferredSpeechVoice(language);
  if (!voice) {
    finish();
    return;
  }
  utterance.voice = voice;
  utterance.onend = finish;
  utterance.onerror = finish;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

function stopVoiceAssistantRecognition() {
  voiceAssistantSessionId++;
  if (voiceAssistantRecognition) {
    try { voiceAssistantRecognition.stop(); } catch (error) {}
  }
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  voiceAssistantRecognition = null;
  voiceAssistantState.active = false;
  voiceAssistantState.pendingAction = null;
  voiceAssistantState.pendingPayload = {};
  const button = document.getElementById("voice-assistant-fab");
  if (button) button.classList.remove("is-listening");
  updateVoiceAssistantDisplay(
    getLang() === "ta" ? "நிறுத்தப்பட்டது" : "Stopped listening"
  );
}

function startVoiceAssistantPrompt(promptText, pendingAction, payload = {}, options = {}) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    const message = getLang() === "ta"
      ? "இந்த உலாவியில் குரல் அடையாளம் காணுதல் ஆதரிக்கப்படவில்லை."
      : "Voice recognition is not supported in this browser.";
    updateVoiceAssistantDisplay(message);
    speakVoiceResponse(message, getLang());
    return;
  }

  const sessionId = ++voiceAssistantSessionId;
  voiceAssistantLastTranscript = "";
  voiceAssistantState.active = true;
  voiceAssistantState.pendingAction = pendingAction;
  voiceAssistantState.pendingPayload = payload;
  voiceAssistantState.lastPrompt = promptText;

  const button = document.getElementById("voice-assistant-fab");
  if (button) {
    button.classList.add("is-listening");
  }
  updateVoiceAssistantDisplay(promptText, getLang() === "ta" ? "கேட்கிறேன்:" : "Listening for:");

  const recognition = new SpeechRecognition();
  voiceAssistantRecognition = recognition;
  recognition.lang = getLang() === "ta" ? "ta-IN" : "en-IN";
  recognition.interimResults = true;
  recognition.continuous = false;
  recognition.maxAlternatives = 5;
  let usedPhraseHints = false;
  if (!options.skipPhraseHints && window.SpeechRecognitionPhrase && typeof getMarketplaceProducts === "function") {
    try {
      const phrases = getMarketplaceProducts()
        .slice(0, 30)
        .map(product => new window.SpeechRecognitionPhrase(product.name, 8));
      if (phrases.length) {
        recognition.phrases = phrases;
        usedPhraseHints = true;
      }
    } catch (error) {
      console.info("Speech contextual phrase hints are unavailable:", error.message);
    }
  }

  recognition.onresult = event => {
    const transcript = getVoiceRecognitionTranscript(event.results);
    if (!transcript) return;
    const passwordEntry = pendingAction === "password";
    voiceAssistantLastTranscript = passwordEntry
      ? ""
      : `${getLang() === "ta" ? "நீங்கள் சொன்னது:" : "You said:"} ${transcript}`;
    updateVoiceAssistantDisplay(
      passwordEntry
        ? (getLang() === "ta" ? "கடவுச்சொல் பெறப்பட்டது" : "Password received")
        : "",
    );
    const lastResult = event.results[event.results.length - 1];
    if (lastResult && !lastResult.isFinal) return;
    recognition.stop();
    if (button) button.classList.remove("is-listening");
    if (pendingAction === "quantity") {
      handleVoiceQuantity(transcript, payload);
      return;
    }
    if (pendingAction === "password") {
      handleVoicePassword(transcript, payload);
      return;
    }
    if (pendingAction === "checkout-confirm") {
      handleVoiceCheckoutConfirmation(transcript, payload);
      return;
    }
    if (pendingAction === "remove-confirm") {
      handleVoiceRemoveConfirmation(transcript, payload);
      return;
    }
    if (pendingAction === "stock-confirm") {
      handleVoiceStockConfirmation(transcript, payload);
      return;
    }
    if (pendingAction === "delivery-confirm") {
      handleVoiceDeliveryConfirmation(transcript, payload);
      return;
    }
    if (pendingAction === "logout-confirm") {
      handleVoiceLogoutConfirmation(transcript);
      return;
    }
    if (pendingAction === "shop-selection") {
      handleVoiceShopSelection(transcript, payload);
      return;
    }
    handleVoiceAssistantText(transcript);
  };

  recognition.onerror = event => {
    if (event.error === "phrases-not-supported" && usedPhraseHints) {
      startVoiceAssistantPrompt("", pendingAction, payload, { skipPhraseHints: true });
      return;
    }
    const errorText = event.error === "no-speech"
      ? (getLang() === "ta" ? "பேச்சு கேட்கவில்லை. மீண்டும் பொத்தானை அழுத்தி முயற்சிக்கவும்." : "I did not hear anything. Tap the voice button and try again.")
      : (getLang() === "ta" ? "குரல் உள்ளீட்டில் பிழை ஏற்பட்டது. மீண்டும் முயற்சிக்கவும்." : `Voice input error: ${event.error}. Tap the voice button to try again.`);
    updateVoiceAssistantDisplay(errorText);
    if (button) button.classList.remove("is-listening");
    speakVoiceResponse(errorText, getLang());
  };

  recognition.onend = () => {
    if (voiceAssistantRecognition !== recognition) return;
    voiceAssistantRecognition = null;
    if (voiceAssistantState.active && voiceAssistantState.pendingAction === pendingAction) {
      voiceAssistantState.active = false;
      if (button) button.classList.remove("is-listening");
    }
  };

  const beginListening = () => {
    if (sessionId !== voiceAssistantSessionId || !voiceAssistantState.active) return;
    updateVoiceAssistantDisplay(
      getLang() === "ta" ? "இப்போது பேசுங்கள்" : "Speak now",
      getLang() === "ta" ? "கேட்கிறேன்:" : "Listening:"
    );
    try {
      recognition.start();
    } catch (error) {
      voiceAssistantState.active = false;
      if (button) button.classList.remove("is-listening");
      const errorText = getLang() === "ta"
        ? "குரலைத் தொடங்க முடியவில்லை. மைக்ரோஃபோன் அனுமதியைச் சரிபார்க்கவும்."
        : "Could not start voice input. Check microphone permission and try again.";
      updateVoiceAssistantDisplay(errorText);
      console.warn("Voice assistant could not start:", error);
    }
  };
  if (promptText) speakVoiceResponse(promptText, getLang(), beginListening);
  else beginListening();
}

function getVoiceProductMatch(queryText) {
  const cleanText = sanitizeSpeechInput(queryText || "");
  if (!cleanText) return null;
  const products = getMarketplaceProducts().filter(product => product.available !== false);
  if (!products.length) return null;

  const normalized = cleanText.toLowerCase();
  const aliases = Object.entries(VOICE_PRODUCT_ALIASES);
  for (const [canonical, names] of aliases) {
    if (names.some(name => normalized.includes(String(name).toLowerCase()))) {
      const match = products.find(product => {
        const candidate = String(product.name || "").toLowerCase();
        return candidate.includes(canonical) || names.some(name => candidate.includes(String(name).toLowerCase()));
      });
      if (match) return match;
    }
  }

  const results = searchMarketplaceProducts(products, { query: cleanText, sort: "relevance" });
  return results[0] && results[0].score >= 0.2 ? results[0] : null;
}

function parseVoiceQuantity(value) {
  const clean = sanitizeSpeechInput(value || "");
  if (!clean) return null;
  const match = clean.match(/(\d+(?:\.\d+)?)\s*(kg|kilogram|kilograms|kilo|kgs|கிலோ|கி)/i);
  if (match) return Number(match[1]);

  const inLower = clean.toLowerCase();
  for (const [word, number] of Object.entries(VOICE_NUMBER_WORDS)) {
    const normalizedWord = String(word).toLowerCase();
    if (inLower.trim() === normalizedWord || inLower.includes(normalizedWord)) {
      if (inLower.trim() === normalizedWord || /(kg|kilogram|kilo|kgs|கிலோ|கி)/.test(inLower)) {
        return Number(number);
      }
    }
  }

  const digits = clean.match(/(\d+(?:\.\d+)?)/);
  if (digits) return Number(digits[1]);
  return null;
}

function navigateVoicePage(target, responseText = "") {
  if (!target) return;
  try {
    sessionStorage.setItem("agroclick_voice_navigation", JSON.stringify({
      transcript: voiceAssistantLastTranscript,
      response: responseText,
    }));
  } catch (error) {
    console.warn("Could not preserve voice feedback during navigation:", error);
  }
  window.location.href = target;
}

function voiceReply(text, { listenAgain = false } = {}) {
  updateVoiceAssistantDisplay(text);
  speakVoiceResponse(text, getLang(), () => {
    if (listenAgain) startVoiceAssistantPrompt("", "command");
  });
}

function getCartShopSummary(shopId) {
  const cart = DB.getCart();
  const shop = DB.getShop(shopId);
  if (!shop || !cart[shopId]) return null;
  const lines = Object.entries(cart[shopId]).map(([itemId, quantity]) => {
    const item = shop.items.find(entry => entry.id === itemId);
    return item ? { item, quantity: Number(quantity) } : null;
  }).filter(Boolean);
  return {
    shop,
    lines,
    total: lines.reduce((sum, line) => sum + Number(line.item.price) * line.quantity, 0),
  };
}

function beginVoiceCheckout() {
  const shopIds = Object.keys(DB.getCart());
  if (!shopIds.length) {
    voiceReply(getLang() === "ta" ? "உங்கள் கார்ட் காலியாக உள்ளது." : "Your cart is empty.");
    return;
  }
  const summary = getCartShopSummary(shopIds[0]);
  if (!summary || !summary.lines.length) {
    voiceReply(getLang() === "ta" ? "கார்ட்டில் செல்லுபடியாகும் பொருட்கள் இல்லை." : "There are no valid items in your cart.");
    return;
  }
  const items = summary.lines.map(line => `${line.item.name} ${line.quantity} kg`).join(", ");
  const hasOtherShops = shopIds.length > 1;
  const prompt = getLang() === "ta"
    ? `${items}. மொத்தம் ${summary.total} ரூபாய். ${hasOtherShops ? "இந்த உறுதிப்படுத்தல் இந்த கடைக்கு மட்டும் பொருந்தும். " : ""}${summary.shop.name} கடையிலிருந்து ஆர்டர் செய்யவா? ஆம் அல்லது இல்லை என்று சொல்லுங்கள்.`
    : `${items}. The total is ${summary.total} rupees. ${hasOtherShops ? "This confirmation applies to this shop only. " : ""}Do you want to order from ${summary.shop.name}? Say yes or no.`;
  const cart = DB.getCart();
  startVoiceAssistantPrompt(prompt, "checkout-confirm", {
    shopId: summary.shop.id,
    amount: summary.total,
    cartSnapshot: Object.entries(cart[summary.shop.id])
      .map(([itemId, quantity]) => [itemId, Number(quantity)])
      .sort(([left], [right]) => left.localeCompare(right)),
  });
}

function isVoiceYes(text) {
  return /^(yes|yeah|yep|confirm|place order|ஆம்|ஆமாம்|சரி|உறுதி)$/i.test(sanitizeSpeechInput(text));
}

function isVoiceNo(text) {
  return /^(no|nope|cancel|stop|வேண்டாம்|இல்லை|ரத்து)$/i.test(sanitizeSpeechInput(text));
}

function handleVoiceCheckoutConfirmation(text, payload = {}) {
  if (isVoiceNo(text)) {
    stopVoiceAssistantRecognition();
    voiceReply(getLang() === "ta" ? "ஆர்டர் ரத்து செய்யப்பட்டது." : "Order cancelled.");
    return;
  }
  if (!isVoiceYes(text)) {
    const prompt = getLang() === "ta" ? "ஆம் அல்லது இல்லை என்று சொல்லுங்கள்." : "Please say yes or no.";
    startVoiceAssistantPrompt(prompt, "checkout-confirm", payload);
    return;
  }
  const prompt = getLang() === "ta"
    ? "வாங்குதலை உறுதிப்படுத்த உங்கள் குரல் கடவுச்சொல்லை சொல்லுங்கள்."
    : "Say your voice confirmation password to continue.";
  startVoiceAssistantPrompt(prompt, "password", payload);
}

async function handleVoicePassword(text, payload = {}) {
  const passwordTokens = sanitizeSpeechInput(text).toLocaleLowerCase().split(/\s+/).filter(Boolean);
  const numberWords = passwordTokens.map(token =>
    Object.prototype.hasOwnProperty.call(VOICE_NUMBER_WORDS, token)
      ? String(VOICE_NUMBER_WORDS[token])
      : token
  );
  const password = numberWords.join("");
  updateVoiceAssistantDisplay(getLang() === "ta" ? "கடவுச்சொல் சரிபார்க்கப்படுகிறது" : "Checking password");
  try {
    const response = await fetch("/api/verify-voice-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const result = await response.json();
    if (!response.ok || !result.success) {
      const retryText = getLang() === "ta"
        ? "கடவுச்சொல் தவறாக உள்ளது. மீண்டும் சொல்லுங்கள்."
        : "That password did not match. Please try again.";
      startVoiceAssistantPrompt(retryText, "password", payload);
      return;
    }
    const summary = getCartShopSummary(payload.shopId);
    const cart = DB.getCart();
    const currentSnapshot = summary
      ? Object.entries(cart[payload.shopId] || {})
        .map(([itemId, quantity]) => [itemId, Number(quantity)])
        .sort(([left], [right]) => left.localeCompare(right))
      : [];
    if (!summary || summary.total !== Number(payload.amount) ||
        JSON.stringify(currentSnapshot) !== JSON.stringify(payload.cartSnapshot)) {
      voiceReply(getLang() === "ta"
        ? "கார்ட் மாறியுள்ளது. மீண்டும் கார்ட்டை சரிபார்க்கவும்."
        : "Your cart changed. Please review it and try checkout again.");
      return;
    }
    if (typeof window.payShop === "function") {
      const checkoutResult = window.payShop(summary.shop.id, summary.total, true);
      stopVoiceAssistantRecognition();
      const message = checkoutResult === "payment_pending"
        ? (getLang() === "ta" ? "கட்டணத் திரையை முடிக்கவும்." : "The payment screen is open. Complete payment there.")
        : (getLang() === "ta" ? "ஆர்டர் பதிவு செய்யப்பட்டது." : "Your order has been placed.");
      updateVoiceAssistantDisplay(message);
      speakVoiceResponse(message, getLang());
      return;
    }
    voiceReply(getLang() === "ta" ? "கட்டண வசதி இந்தப் பக்கத்தில் இல்லை." : "Checkout is not available on this page.");
  } catch (error) {
    console.error("Voice password verification failed:", error);
    voiceReply(getLang() === "ta"
      ? "கடவுச்சொல்லை சரிபார்க்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்."
      : "Could not verify the password. Please try again.");
  }
}

function handleVoiceRemoveConfirmation(text, payload = {}) {
  if (isVoiceNo(text)) {
    voiceReply(getLang() === "ta" ? "சரி, எதையும் நீக்கவில்லை." : "Okay, nothing was removed.");
    return;
  }
  if (!isVoiceYes(text)) {
    const prompt = getLang() === "ta" ? "ஆம் அல்லது இல்லை என்று சொல்லுங்கள்." : "Please say yes or no.";
    startVoiceAssistantPrompt(prompt, "remove-confirm", payload);
    return;
  }
  DB.setCartQty(payload.shopId, payload.itemId, 0);
  if (typeof window.renderCart === "function") window.renderCart();
  voiceReply(getLang() === "ta" ? `${payload.productName} கார்ட்டிலிருந்து நீக்கப்பட்டது.` : `Removed ${payload.productName} from your cart.`, { listenAgain: true });
}

function handleVoiceStockConfirmation(text, payload = {}) {
  if (isVoiceNo(text)) {
    voiceReply(getLang() === "ta" ? "சரி, இருப்பு மாற்றப்படவில்லை." : "Okay, stock was not changed.");
    return;
  }
  if (!isVoiceYes(text)) {
    const prompt = getLang() === "ta" ? "ஆம் அல்லது இல்லை என்று சொல்லுங்கள்." : "Please say yes or no.";
    startVoiceAssistantPrompt(prompt, "stock-confirm", payload);
    return;
  }
  const user = DB.getCurrentUser();
  const shop = user && DB.getShopByOwner(user.mobile);
  const item = shop && shop.items.find(entry => entry.id === payload.itemId);
  if (!item) {
    voiceReply(getLang() === "ta" ? "உங்கள் கடையில் அந்த பொருள் இல்லை." : "That product was not found in your shop.");
    return;
  }
  if (payload.quantity !== null && payload.quantity !== undefined) {
    item.quantity = Number(payload.quantity);
  }
  item.outOfStock = !payload.available || (item.quantity !== null && Number(item.quantity) <= 0);
  DB.saveShop(shop);
  if (typeof window.renderItems === "function") window.renderItems();
  voiceReply(getLang() === "ta" ? "இருப்பு புதுப்பிக்கப்பட்டது." : "Stock updated.", { listenAgain: true });
}

function getVoiceOwnedProductMatch(text) {
  const user = typeof DB !== "undefined" && typeof DB.getCurrentUser === "function"
    ? DB.getCurrentUser()
    : null;
  const shop = user && typeof DB.getShopByOwner === "function"
    ? DB.getShopByOwner(user.mobile)
    : null;
  if (!shop) return null;
  const lower = sanitizeSpeechInput(text).toLocaleLowerCase();
  return shop.items.find(item => lower.includes(String(item.name || "").toLocaleLowerCase())) || null;
}

function handleVoiceDeliveryConfirmation(text, payload = {}) {
  if (isVoiceNo(text)) {
    voiceReply(getLang() === "ta" ? "சரி, ஆர்டர் நிலை மாற்றப்படவில்லை." : "Okay, the order status was not changed.");
    return;
  }

  function handleVoiceLogoutConfirmation(text) {
    if (isVoiceNo(text)) {
      voiceReply(getLang() === "ta" ? "சரி, உள்நுழைந்தே இருக்கிறீர்கள்." : "Okay, you are still signed in.");
      return;
    }
    if (!isVoiceYes(text)) {
      const prompt = getLang() === "ta" ? "ஆம் அல்லது இல்லை என்று சொல்லுங்கள்." : "Please say yes or no.";
      startVoiceAssistantPrompt(prompt, "logout-confirm");
      return;
    }
    DB.clearSession();
    navigateVoicePage("index.html");
  }
  if (!isVoiceYes(text)) {
    const prompt = getLang() === "ta" ? "ஆம் அல்லது இல்லை என்று சொல்லுங்கள்." : "Please say yes or no.";
    startVoiceAssistantPrompt(prompt, "delivery-confirm", payload);
    return;
  }
  const user = DB.getCurrentUser();
  const shop = user && DB.getShopByOwner(user.mobile);
  const order = shop && DB.ordersForShop(shop.id).find(entry => entry.id === payload.orderId && entry.status !== "delivered");
  if (!order) {
    voiceReply(getLang() === "ta" ? "ஆர்டரை கண்டறிய முடியவில்லை." : "I could not find that order.");
    return;
  }
  const updated = DB.updateOrder(order.id, { status: "delivered" });
  if (!updated) return;
  if (typeof window.renderOrders === "function") window.renderOrders();
  voiceReply(getLang() === "ta" ? "ஆர்டர் வழங்கப்பட்டதாகக் குறிக்கப்பட்டது." : "Order marked as delivered.", { listenAgain: true });
}

function handleVoiceQuantityLegacy(text, payload = {}) {
  const qty = parseVoiceQuantity(text);
  const productName = payload.productName || "";
  if (!qty || qty <= 0) {
    const prompt = getLang() === "ta"
      ? "எத்தனை கிலோ வேண்டுமா? தயவுசெய்து எண்ணை சொல்லுங்கள்."
      : "How many kilograms do you want? Please say the quantity.";
    updateVoiceAssistantDisplay(prompt);
    startVoiceAssistantPrompt(prompt, "quantity", payload);
    return;
  }

  const user = DB && typeof DB.getCurrentUser === "function" ? DB.getCurrentUser() : null;
  if (!user) {
    try {
      sessionStorage.setItem("agroclick_voice_pending_order", JSON.stringify({ productName, quantity: qty }));
    } catch (error) {
      console.error("Could not preserve the requested voice order:", error);
      voiceReply(getLang() === "ta" ? "உள்நுழைவுக்கு முன் ஆர்டரை சேமிக்க முடியவில்லை." : "Could not preserve your order before login.");
      return;
    }
    navigateVoicePage(`login.html?redirect=${encodeURIComponent("cart.html?voice=resume")}`);
    return;
  }

  const product = getVoiceProductMatch(productName || payload.product || "");
  if (product && product.shopId && product.id) {
    if (product.quantity !== null && qty > Number(product.quantity)) {
      voiceReply(getLang() === "ta"
        ? `மன்னிக்கவும், ${product.name} ${product.quantity} கிலோ மட்டுமே உள்ளது.`
        : `Only ${product.quantity} kg of ${product.name} is available.`);
      return;
    }
    DB.setCartQty(product.shopId, product.id, qty);
    const cartUrl = "cart.html?voice=checkout";
    navigateVoicePage(cartUrl);
    return;
  }

  const fallbackText = getLang() === "ta"
    ? "பொருளை கண்டுபிடிக்க முடியவில்லை. மீண்டும் சொல்லுங்கள்."
    : "I could not find that product. Please say the product name again.";
  updateVoiceAssistantDisplay(fallbackText);
  voiceReply(fallbackText);
}

function routeVoiceNavigation(text) {
  const clean = sanitizeSpeechInput(text || "");
  const lower = clean.toLowerCase();
  const lang = getLang();

  const navMap = [
    { match: /(home|index|main page|முகப்பு|ஹோம்)/i, target: "index.html", en: "Opening the homepage.", ta: "முகப்புப் பக்கத்தை திறக்கிறேன்." },
    { match: /(shop|shops|browse shops|visit shops|market|கடைகள்|சந்தை)/i, target: "shops.html", en: "Opening the shops page.", ta: "கடைகள் பக்கத்தை திறக்கிறேன்." },
    { match: /(cart|checkout|my cart|shopping cart|கார்ட்|செக் அவுட்)/i, target: "cart.html", en: "Opening your cart.", ta: "உங்கள் கார்ட்டை திறக்கிறேன்." },
    { match: /(orders|my orders|order history|ஆர்டர்கள்|எனது ஆர்டர்கள்)/i, target: "my-orders.html", en: "Opening your orders.", ta: "உங்கள் ஆர்டர்களை திறக்கிறேன்." },
    { match: /(login|log in|sign in|உள்நுழை|லாகின்)/i, target: "login.html", en: "Opening login.", ta: "உள்நுழைவை திறக்கிறேன்." },
    { match: /(sell|seller|shop owner|become seller|farmer|விற்பனை|கடை உரிமையாளர்|விவசாயி)/i, target: "become-shop-owner.html", en: "Opening the seller flow.", ta: "விற்பனையாளருக்கான பக்கத்தை திறக்கிறேன்." },
    { match: /(premium|upgrade|vip|பிரீமியம்|மேம்படுத்தல்)/i, target: "premium.html", en: "Opening premium options.", ta: "பிரீமியம் விருப்பங்களை திறக்கிறேன்." },
    { match: /(manage shop|my shop|shop dashboard|கடை மேலாண்மை|என் கடை)/i, target: "manage-shop.html", en: "Opening shop management.", ta: "கடை மேலாண்மை பக்கத்தை திறக்கிறேன்." },
  ];

  const match = navMap.find(entry => entry.match.test(lower));
  if (match) {
    const response = match[lang === "ta" ? "ta" : "en"];
    updateVoiceAssistantDisplay(response);
    speakVoiceResponse(response, lang);
    navigateVoicePage(match.target);
    return true;
  }
  return false;
}

function handleVoiceAssistantTextLegacy(text) {
  const clean = sanitizeSpeechInput(text || "");
  if (!clean) return;
  const lang = getLang();
  const lower = clean.toLowerCase();

  if (routeVoiceNavigation(clean)) return;

  if (/(help|what can you do|assist|உதவி|நீங்கள் எப்படி)/i.test(lower)) {
    const response = lang === "ta"
      ? "நான் AgroClick-இல் கடைகளை திறக்கலாம், பொருட்களைத் தேடலாம், ஆர்டர் செய்யலாம், மற்றும் வாங்குதலை உறுதிப்படுத்தலாம்."
      : "I can open pages, search products, help you order, and confirm purchases in AgroClick.";
    speakVoiceResponse(response, lang);
    return;
  }

  const product = getVoiceProductMatch(clean);
  const productNames = product
    ? [product.name, ...(VOICE_PRODUCT_ALIASES[String(product.name || "").toLowerCase()] || [])]
      .filter(Boolean)
      .some(name => lower.includes(String(name).toLowerCase()))
    : false;
  if (product && (productNames || /(order|buy|purchase|want|need|get|add|shop|search|find|ஆர்டர்|வாங்க|தேடு|கண்டுபிடி|வேண்டும்|வேணும்)/i.test(lower))) {
    const productName = product.name || "";
    const target = `shops.html?query=${encodeURIComponent(productName)}&voice=qty&product=${encodeURIComponent(productName)}`;
    updateVoiceAssistantDisplay(
      lang === "ta" ? `${productName} பொருளைத் தேடுகிறேன்` : `Looking for ${productName}`
    );
    if (window.location.pathname.endsWith("shops.html")) {
      const input = document.getElementById("productQuery");
      if (input) {
        input.value = productName;
        if (typeof window.renderProductResults === "function") window.renderProductResults();
      }
      const prompt = lang === "ta" ? `${productName} எத்தனை கிலோ வேண்டுமா?` : `How many kilograms of ${productName} do you want?`;
      startVoiceAssistantPrompt(prompt, "quantity", { productName });
    } else {
      navigateVoicePage(target);
    }
    return;
  }

  const response = lang === "ta"
    ? "சொன்னதை புரிந்து கொள்ளவில்லை. ஒரு பொருளை அல்லது பக்கத்தை சொல்லுங்கள்."
    : "I couldn't understand that. Please say a product or a page you want to open.";
  updateVoiceAssistantDisplay(response);
  speakVoiceResponse(response, lang);
}

function parseVoiceIntentLocally(text) {
  const clean = sanitizeSpeechInput(text);
  const lower = clean.toLocaleLowerCase();
  if (!clean) return { action: "unknown" };
  if (/(cancel|stop|never mind|ரத்து|நிறுத்து|வேண்டாம்)/i.test(lower)) return { action: "cancel" };
  if (/(help|what can you do|assist|உதவி|நீங்கள் எப்படி)/i.test(lower)) return { action: "help" };
  if (/(checkout|\bpay\b|place order|complete my order|செக் அவுட்|பணம் செலுத்து)/i.test(lower)) return { action: "checkout" };
  if (/(my cart|show cart|open cart|view cart|கார்ட்|வண்டி)/i.test(lower)) return { action: "show_cart" };
  if (/(my orders|order history|show orders|ஆர்டர்கள்|எனது ஆர்டர்கள்)/i.test(lower)) return { action: "show_orders" };
  if (/(log out|logout|sign out|வெளியேறு)/i.test(lower)) return { action: "logout" };

  if (/(tamil|தமிழ்)/i.test(lower) && /(language|speak|switch|தமிழ்)/i.test(lower)) {
    return { action: "change_language", language: "ta" };
  }
  if (/(english|ஆங்கிலம்)/i.test(lower) && /(language|speak|switch|ஆங்கிலம்)/i.test(lower)) {
    return { action: "change_language", language: "en" };
  }

  const location = typeof TN_PLACES !== "undefined"
    ? TN_PLACES.find(place => lower.includes(place.en.toLocaleLowerCase()) || lower.includes(place.ta))
    : null;
  if (location && /(location|place|town|city|set|near|இடம்|ஊர்|நகரம்)/i.test(lower)) {
    return { action: "change_location", location: location.en };
  }

  const product = getVoiceProductMatch(clean) || getVoiceOwnedProductMatch(clean);
  if (product && /(out of stock|mark.*stock|available|in stock|இருப்பு|கையிருப்பு)/i.test(lower)) {
    return {
      action: "manage_stock",
      product: product.name,
      available: !/(out of stock|mark.*out|இல்லை|தீர்ந்தது)/i.test(lower),
      quantity: parseVoiceQuantity(clean),
    };
  }
  if (product && /(remove|delete|take .*out|நீக்கு|அகற்று)/i.test(lower)) {
    return { action: "remove_from_cart", product: product.name };
  }
  if (product && /(change|set|make|update).*(quantity|amount|kg)|அளவை/i.test(lower)) {
    return { action: "set_quantity", product: product.name, quantity: parseVoiceQuantity(clean) };
  }
  if (product && /(order|buy|purchase|want|need|get|add|ஆர்டர்|வாங்க|வேண்டும்|வேணும்)/i.test(lower)) {
    return { action: "add_to_cart", product: product.name, quantity: parseVoiceQuantity(clean) };
  }
  if (product && /(search|find|show|தேடு|கண்டுபிடி|காட்டு)/i.test(lower)) {
    return { action: "search_products", product: product.name };
  }
  if (product) return { action: "add_to_cart", product: product.name, quantity: parseVoiceQuantity(clean) };

  const pages = [
    { re: /(manage shop|my shop|shop dashboard|கடை மேலாண்மை|என் கடை)/i, page: "manage_shop" },
    { re: /(become seller|shop owner|seller|farmer|விற்பனையாளர்|விவசாயி)/i, page: "seller" },
    { re: /(premium|upgrade|பிரீமியம்)/i, page: "premium" },
    { re: /(my orders|orders|history|ஆர்டர்கள்)/i, page: "orders" },
    { re: /(cart|checkout|கார்ட்)/i, page: "cart" },
    { re: /(shop|shops|market|கடைகள்|சந்தை)/i, page: "shops" },
    { re: /(login|log in|sign in|உள்நுழை|லாகின்)/i, page: "login" },
    { re: /(home|homepage|main page|முகப்பு|ஹோம்)/i, page: "home" },
  ];
  const page = pages.find(item => item.re.test(lower));
  return page ? { action: "navigate", page: page.page } : { action: "unknown" };
}

function validateClientVoiceIntent(value) {
  const actions = new Set([
    "navigate", "search_products", "add_to_cart", "remove_from_cart",
    "set_quantity", "checkout", "show_cart", "show_orders",
    "change_language", "change_location", "manage_stock", "logout",
    "mark_delivered", "help", "cancel", "unknown",
  ]);
  if (!value || !actions.has(value.action)) return null;
  return {
    action: value.action,
    page: Object.hasOwn(VOICE_PAGE_TARGETS, value.page) ? value.page : null,
    product: typeof value.product === "string" ? value.product.slice(0, 100) : null,
    quantity: Number.isFinite(Number(value.quantity)) && Number(value.quantity) > 0 ? Number(value.quantity) : null,
    location: typeof value.location === "string" ? value.location.slice(0, 100) : null,
    language: value.language === "ta" || value.language === "en" ? value.language : null,
    available: typeof value.available === "boolean" ? value.available : null,
    reply: typeof value.reply === "string" ? value.reply.slice(0, 300) : null,
  };
}

async function getAiVoiceIntent(text) {
  if (typeof fetch !== "function") return null;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch("/api/voice-command", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        language: getLang() === "ta" ? "ta" : "en",
        products: typeof getMarketplaceProducts === "function"
          ? getMarketplaceProducts().filter(item => item.available !== false).map(item => item.name).slice(0, 50)
          : [],
      }),
      signal: controller.signal,
    });
    if (!response.ok) return null;
    return validateClientVoiceIntent(await response.json());
  } catch (error) {
    console.warn("AI voice interpretation unavailable; using local command matching:", error.message);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function resolveIntentProduct(name) {
  if (!name) return null;
  const normalized = sanitizeSpeechInput(name).toLocaleLowerCase();
  const products = getMarketplaceProducts().filter(product => product.available !== false);
  return products.find(product => String(product.name).toLocaleLowerCase() === normalized) ||
    getVoiceProductMatch(name);
}

function startVoiceOrder(productName, quantity, selectedProduct = null) {
  const normalized = sanitizeSpeechInput(productName).toLocaleLowerCase();
  const products = getMarketplaceProducts().filter(product => product.available !== false);
  const candidates = selectedProduct
    ? [selectedProduct]
    : products.filter(product => String(product.name).toLocaleLowerCase() === normalized);
  if (candidates.length > 1) {
    const candidateChoices = candidates.map((item, index) =>
      `${index + 1}: ${item.shopName}, ${item.location}, ${item.price} rupees per kg`
    ).join(". ");
    const prompt = getLang() === "ta"
      ? `பல கடைகளில் ${productName} உள்ளது. ${candidateChoices}. எந்த கடை வேண்டும்? கடை பெயர் அல்லது எண்ணைச் சொல்லுங்கள்.`
      : `${productName} is listed by more than one shop. ${candidateChoices}. Which shop would you like? Say its name or number.`;
    startVoiceAssistantPrompt(prompt, "shop-selection", {
      productName,
      quantity,
      candidates: candidates.map(item => ({
        id: item.id,
        shopId: item.shopId,
        name: item.name,
        shopName: item.shopName,
        location: item.location,
      })),
    });
    return;
  }
  const product = selectedProduct || candidates[0] || resolveIntentProduct(productName);
  if (!product) {
    voiceReply(getLang() === "ta" ? "அந்த பொருள் தற்போது கிடைக்கவில்லை." : "I could not find an available listing for that product.");
    return;
  }
  if (quantity === null || quantity === undefined) {
    const prompt = getLang() === "ta"
      ? `${product.name} எத்தனை கிலோ வேண்டும்?`
      : `How many kilograms of ${product.name} would you like?`;
    startVoiceAssistantPrompt(prompt, "quantity", { productName: product.name });
    return;
  }
  const qty = Number(quantity);
  if (!Number.isFinite(qty) || qty <= 0) {
    voiceReply(getLang() === "ta" ? "சரியான அளவைச் சொல்லுங்கள்." : "Please say a valid quantity.");
    return;
  }
  if (product.quantity !== null && qty > Number(product.quantity)) {
    voiceReply(getLang() === "ta"
      ? `${product.name} ${product.quantity} கிலோ மட்டுமே உள்ளது.`
      : `Only ${product.quantity} kg of ${product.name} is available.`);
    return;
  }
  if (!DB.getCurrentUser()) {
    try {
      sessionStorage.setItem("agroclick_voice_pending_order", JSON.stringify({
        productName: product.name,
        quantity: qty,
      }));
    } catch (error) {
      console.error("Could not preserve the requested voice order:", error);
      voiceReply(getLang() === "ta" ? "ஆர்டரை உள்நுழைவுக்கு முன் சேமிக்க முடியவில்லை." : "Could not preserve the order before login.");
      return;
    }
    navigateVoicePage(`login.html?redirect=${encodeURIComponent("cart.html?voice=resume")}`);
    return;
  }
  DB.setCartQty(product.shopId, product.id, qty);
  navigateVoicePage(
    "cart.html?voice=checkout",
    getLang() === "ta"
      ? `${product.name} ${qty} கிலோ கார்ட்டில் சேர்க்கப்பட்டது. ஆர்டரை சரிபார்க்கிறேன்.`
      : `Added ${qty} kg of ${product.name}. Reviewing your order.`,
  );
}

function handleVoiceShopSelection(text, payload = {}) {
  const lower = sanitizeSpeechInput(text).toLocaleLowerCase();
  const ordinal = lower.match(/\b(first|one|1|second|two|2|third|three|3)\b/);
  const ordinalIndex = ordinal
    ? ({ first: 0, one: 0, "1": 0, second: 1, two: 1, "2": 1, third: 2, three: 2, "3": 2 })[ordinal[1]]
    : -1;
  const candidates = (payload.candidates || []).map(candidate => {
    const current = getMarketplaceProducts().find(item => item.id === candidate.id && item.shopId === candidate.shopId);
    return current || null;
  }).filter(Boolean);
  const chosen = ordinalIndex >= 0
    ? candidates[ordinalIndex]
    : candidates.find(candidate =>
      lower.includes(String(candidate.shopName).toLocaleLowerCase()) ||
      lower.includes(String(candidate.location).toLocaleLowerCase())
    );
  if (!chosen) {
    const prompt = getLang() === "ta"
      ? "கடை பெயர் அல்லது பட்டியலில் உள்ள எண்ணைச் சொல்லுங்கள்."
      : "Please say the shop name or one of the listed numbers.";
    startVoiceAssistantPrompt(prompt, "shop-selection", payload);
    return;
  }
  startVoiceOrder(payload.productName, payload.quantity, chosen);
}

function executeVoiceIntent(intent, rawText = "") {
  const lang = getLang();
  const pageTarget = intent.page && VOICE_PAGE_TARGETS[intent.page];
  switch (intent.action) {
    case "navigate":
      if (pageTarget) {
        const labels = {
          home: ["Opening the homepage.", "முகப்புப் பக்கத்தை திறக்கிறேன்."],
          shops: ["Opening shops.", "கடைகள் பக்கத்தை திறக்கிறேன்."],
          cart: ["Opening your cart.", "உங்கள் கார்ட்டை திறக்கிறேன்."],
          orders: ["Opening your orders.", "உங்கள் ஆர்டர்களை திறக்கிறேன்."],
          login: ["Opening login.", "உள்நுழைவை திறக்கிறேன்."],
          seller: ["Opening the seller page.", "விற்பனையாளர் பக்கத்தை திறக்கிறேன்."],
          manage_shop: ["Opening shop management.", "கடை மேலாண்மையை திறக்கிறேன்."],
          premium: ["Opening premium options.", "பிரீமியம் விருப்பங்களை திறக்கிறேன்."],
        };
        navigateVoicePage(pageTarget, labels[intent.page][lang === "ta" ? 1 : 0]);
      }
      else voiceReply(lang === "ta" ? "அந்த பக்கத்தை கண்டறிய முடியவில்லை." : "I could not identify that page.");
      return;
    case "search_products":
      navigateVoicePage(
        intent.product ? `shops.html?query=${encodeURIComponent(intent.product)}` : "shops.html",
        intent.product
          ? (lang === "ta" ? `${intent.product} பொருளைத் தேடுகிறேன்.` : `Searching for ${intent.product}.`)
          : (lang === "ta" ? "பொருட்களைத் தேடுகிறேன்." : "Opening product search."),
      );
      return;
    case "add_to_cart":
    case "set_quantity":
      if (!intent.product) {
        voiceReply(intent.reply || (lang === "ta" ? "எந்த பொருளை சேர்க்க வேண்டும்?" : "Which product would you like to add?"), { listenAgain: true });
        return;
      }
      startVoiceOrder(intent.product, intent.quantity ?? parseVoiceQuantity(rawText));
      return;
    case "remove_from_cart": {
      const product = resolveIntentProduct(intent.product);
      const cart = DB.getCart();
      if (!product || !cart[product.shopId]?.[product.id]) {
        voiceReply(lang === "ta" ? "அந்த பொருள் கார்ட்டில் இல்லை." : "That product is not in your cart.");
        return;
      }
      startVoiceAssistantPrompt(
        lang === "ta" ? `${product.name} பொருளை கார்ட்டிலிருந்து நீக்கவா? ஆம் அல்லது இல்லை என்று சொல்லுங்கள்.` : `Remove ${product.name} from your cart? Say yes or no.`,
        "remove-confirm",
        { shopId: product.shopId, itemId: product.id, productName: product.name },
      );
      return;
    }
    case "checkout":
    case "show_cart":
      if (window.location.pathname.endsWith("cart.html")) beginVoiceCheckout();
      else navigateVoicePage(
        "cart.html?voice=checkout",
        lang === "ta" ? "உங்கள் கார்ட்டை திறக்கிறேன்." : "Opening your cart.",
      );
      return;
    case "show_orders":
      navigateVoicePage(
        "my-orders.html",
        lang === "ta" ? "உங்கள் ஆர்டர்களை திறக்கிறேன்." : "Opening your orders.",
      );
      return;
    case "logout":
      if (!DB.getCurrentUser()) {
        voiceReply(lang === "ta" ? "நீங்கள் ஏற்கனவே வெளியேறியுள்ளீர்கள்." : "You are already signed out.");
        return;
      }
      startVoiceAssistantPrompt(
        lang === "ta" ? "வெளியேற விரும்புகிறீர்களா? ஆம் அல்லது இல்லை என்று சொல்லுங்கள்." : "Are you sure you want to log out? Say yes or no.",
        "logout-confirm",
      );
      return;
    case "change_language":
      if (intent.language && typeof setLanguage === "function") {
        setLanguage(intent.language);
        voiceReply(intent.language === "ta" ? "தமிழ் மொழிக்கு மாற்றப்பட்டது." : "Switched to English.", { listenAgain: true });
      }
      return;
    case "change_location": {
      const requested = intent.location;
      const place = typeof TN_PLACES === "undefined" ? null : TN_PLACES.find(candidate =>
        candidate.en.toLocaleLowerCase() === String(requested || "").toLocaleLowerCase() ||
        candidate.ta === requested ||
        String(requested || "").toLocaleLowerCase().includes(candidate.en.toLocaleLowerCase())
      );
      if (!place) {
        voiceReply(lang === "ta" ? "அந்த இடம் பட்டியலில் இல்லை." : "I could not find that town in the location list.");
        return;
      }
      DB.setLocation(place.en);
      const select = document.getElementById("locationSelect");
      if (select) select.value = place.en;
      document.dispatchEvent(new CustomEvent("agroclick:locationchange", { detail: place.en }));
      voiceReply(lang === "ta" ? `${place.ta} இடமாக அமைக்கப்பட்டது.` : `Location set to ${place.en}.`, { listenAgain: true });
      return;
    }
    case "manage_stock": {
      const user = DB.getCurrentUser();
      const shop = user && DB.getShopByOwner(user.mobile);
      const product = shop && shop.items.find(item =>
        item.name.toLocaleLowerCase() === String(intent.product || "").toLocaleLowerCase()
      );
      if (!product || typeof intent.available !== "boolean") {
        voiceReply(lang === "ta" ? "உங்கள் கடையில் அந்த பொருளை கண்டறிய முடியவில்லை." : "I could not find that product in your shop.");
        return;
      }
      startVoiceAssistantPrompt(
        lang === "ta" ? `${product.name} இருப்பை மாற்றவா? ஆம் அல்லது இல்லை என்று சொல்லுங்கள்.` : `Change stock availability for ${product.name}? Say yes or no.`,
        "stock-confirm",
        { itemId: product.id, available: intent.available, quantity: intent.quantity },
      );
      return;
    }
    case "mark_delivered": {
      const user = DB.getCurrentUser();
      const shop = user && DB.getShopByOwner(user.mobile);
      if (!shop) {
        voiceReply(lang === "ta" ? "உங்கள் கடை கணக்கில் உள்நுழையவும்." : "Log in to your shop-owner account first.");
        return;
      }
      let orders = DB.ordersForShop(shop.id).filter(order => order.status !== "delivered");
      if (intent.product) {
        const query = intent.product.toLocaleLowerCase();
        orders = orders.filter(order =>
          order.customerName.toLocaleLowerCase().includes(query) ||
          order.items.some(item => item.name.toLocaleLowerCase().includes(query))
        );
      }
      if (orders.length !== 1) {
        voiceReply(lang === "ta"
          ? "எந்த நிலுவை ஆர்டரை வழங்கியதாகக் குறிக்க வேண்டும் என்பதை தெளிவாகச் சொல்லுங்கள்."
          : "I found more than one pending order. Please specify the customer or product.");
        return;
      }
      const order = orders[0];
      startVoiceAssistantPrompt(
        lang === "ta"
          ? `${order.customerName} அவர்களின் ஆர்டரை வழங்கியதாகக் குறிக்கவா? ஆம் அல்லது இல்லை என்று சொல்லுங்கள்.`
          : `Mark ${order.customerName}'s order as delivered? Say yes or no.`,
        "delivery-confirm",
        { orderId: order.id },
      );
      return;
    }
    case "cancel":
      stopVoiceAssistantRecognition();
      voiceReply(lang === "ta" ? "சரி, ரத்து செய்துவிட்டேன்." : "Okay, cancelled.");
      return;
    case "help":
      voiceReply(lang === "ta"
        ? "கடைகளைத் திறக்க, பொருளைத் தேட அல்லது ஆர்டர் செய்ய, கார்ட் மற்றும் ஆர்டர்களைப் பார்க்க, இடம் அல்லது மொழியை மாற்ற, உங்கள் கடை இருப்பை நிர்வகிக்க என்னிடம் சொல்லுங்கள்."
        : "Ask me to open any page, find or order a product, manage your cart, review orders, change your town or language, or update your shop stock.", { listenAgain: true });
      return;
    default:
      voiceReply(intent.reply || (lang === "ta"
        ? "அதை புரிந்து கொள்ளவில்லை. மீண்டும் சொல்லுங்கள் அல்லது உதவி என்று கேளுங்கள்."
        : "I could not understand that. Try again, or say help."), { listenAgain: true });
  }
}

function handleVoiceQuantity(text, payload = {}) {
  startVoiceOrder(
    payload.productName || payload.product || "",
    parseVoiceQuantity(text) ?? payload.quantity ?? null,
  );
}

function isVoiceInformationQuestion(text) {
  const clean = sanitizeSpeechInput(text);
  const startsAsQuestion = /^(?:(?:what|which|who|when|where|why|how|can|could|would|is|are|do|does|tell me|explain)\b|(?:என்ன|எது|எப்படி|ஏன்|எங்கே|எவ்வளவு|சொல்லுங்கள்)(?:\s|$))/i.test(clean);
  const asksAboutMarketplaceFacts = /\b(price|cost|available|details|delivery|payment|farm|seller|shop)\b|விலை|கிடைக்க|விவரம்|கட்டணம்|டெலிவரி/i.test(clean);
  const explicitOrder = /\b(order me|buy me|get me|i want|i need|add .* cart|purchase)\b|ஆர்டர் செய்ய|வாங்கி தர|கார்ட்டில் சேர்/i.test(clean);
  return !explicitOrder && (startsAsQuestion || asksAboutMarketplaceFacts);
}

async function handleVoiceAssistantText(text) {
  const clean = sanitizeSpeechInput(text || "");
  if (!clean) return;
  if (isVoiceInformationQuestion(clean)) {
    const answer = await getVoiceAssistantAnswer(clean);
    voiceReply(answer || (getLang() === "ta"
      ? "இந்தக் கேள்விக்குப் பதிலளிக்க AI சேவை தற்போது கிடைக்கவில்லை."
      : "The AI answer service is currently unavailable. Please try again."), { listenAgain: true });
    return;
  }
  const localIntent = parseVoiceIntentLocally(clean);
  let intent = null;
  if (["unknown", "add_to_cart", "search_products", "navigate"].includes(localIntent.action)) {
    updateVoiceAssistantDisplay(
      getLang() === "ta" ? "உங்கள் கோரிக்கையை புரிந்துகொள்கிறேன்" : "Understanding your request"
    );
    intent = await getAiVoiceIntent(clean);
  }
  const resolvedIntent = intent || localIntent;
  if (resolvedIntent.action === "unknown") {
    if (intent?.reply) {
      voiceReply(intent.reply, { listenAgain: true });
      return;
    }
    const answer = await getVoiceAssistantAnswer(clean);
    voiceReply(answer || (getLang() === "ta"
      ? "இந்தக் கேள்விக்குப் பதிலளிக்க AI சேவை தற்போது கிடைக்கவில்லை."
      : "The AI answer service is currently unavailable. Please try again."), { listenAgain: true });
    return;
  }
  executeVoiceIntent(resolvedIntent, clean);
}

async function getVoiceAssistantAnswer(text) {
  if (typeof fetch !== "function") return null;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 40000);
  const language = getLang();
  const products = typeof getMarketplaceProducts === "function"
    ? getMarketplaceProducts()
      .filter(item => item.available !== false)
      .slice(0, 5)
      .map(item => ({
        name: item.name,
        category: item.category,
        price: item.price,
        quantity: item.quantity,
        available: true,
        shopName: item.shopName,
        location: item.location,
      }))
    : [];
  try {
    const response = await fetch("/api/chatbot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, language, products }),
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Voice assistant service returned ${response.status}.`);
    const data = await response.json();
    if (typeof data.reply !== "string" || !data.reply.trim()) {
      throw new Error("Voice assistant returned an empty answer.");
    }
    return data.reply.trim();
  } catch (error) {
    console.warn("AI voice answer unavailable:", error.message);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function triggerVoiceAssistantFlow(kind, payload = {}) {
  if (kind === "quantity" && payload.quantity !== undefined) {
    handleVoiceQuantity(String(payload.quantity), payload);
    return;
  }
  if (kind === "checkout") {
    beginVoiceCheckout();
    return;
  }
  const phrase = kind === "quantity"
    ? (getLang() === "ta" ? `${payload.productName || "பொருளை"} எத்தனை கிலோ வேண்டுமா?` : `How many kilograms${payload.productName ? ` of ${payload.productName}` : ""} do you want?`)
    : (getLang() === "ta" ? "வாங்குதலை உறுதிப்படுத்த உங்கள் பாஸ்வேர்டை சொல்லுங்கள்." : "Please say your password to confirm this purchase.");
  startVoiceAssistantPrompt(phrase, kind, payload);
}

window.triggerVoiceAssistantFlow = triggerVoiceAssistantFlow;
window.beginVoiceCheckout = beginVoiceCheckout;
window.consumePendingVoiceOrder = function() {
  let pending;
  try {
    pending = JSON.parse(sessionStorage.getItem("agroclick_voice_pending_order") || "null");
    sessionStorage.removeItem("agroclick_voice_pending_order");
  } catch (error) {
    console.error("Could not restore the pending voice order:", error);
    voiceReply(getLang() === "ta" ? "நிலுவையில் உள்ள ஆர்டரை மீட்டெடுக்க முடியவில்லை." : "Could not restore the pending order.");
    return false;
  }
  if (!pending || !DB.getCurrentUser()) return false;
  const product = resolveIntentProduct(pending.productName);
  const quantity = Number(pending.quantity);
  if (!product || !Number.isFinite(quantity) || quantity <= 0 ||
      (product.quantity !== null && quantity > Number(product.quantity))) {
    voiceReply(getLang() === "ta" ? "உள்நுழைவுக்குப் பிறகு அந்த பொருள் அல்லது அளவு கிடைக்கவில்லை." : "That product or quantity is no longer available.");
    return false;
  }
  DB.setCartQty(product.shopId, product.id, quantity);
  if (typeof window.renderCart === "function") window.renderCart();
  updateVoiceAssistantDisplay(getLang() === "ta"
    ? `${product.name} ${quantity} கிலோ கார்ட்டில் சேர்க்கப்பட்டது`
    : `Added ${quantity} kg of ${product.name} to your cart`);
  return true;
};

function mountVoiceAssistant() {
  if (document.getElementById("voice-assistant-fab")) return;

  const button = document.createElement("button");
  button.id = "voice-assistant-fab";
  button.type = "button";
  button.className = "voice-assistant-fab";
  button.setAttribute("aria-label", getLang() === "ta" ? "குரல் உதவி" : "Voice assistant");
  button.textContent = "🎙";
  button.addEventListener("click", () => {
    if (voiceAssistantState.active) {
      stopVoiceAssistantRecognition();
      return;
    }
    const prompt = getLang() === "ta"
      ? "நீங்கள் என்ன செய்ய விரும்புகிறீர்கள்?"
      : "What would you like to do?";
    startVoiceAssistantPrompt(prompt, "command", {});
  });
  const widget = document.createElement("div");
  widget.className = "voice-assistant-widget";
  const transcript = document.createElement("div");
  transcript.id = "voice-assistant-transcript";
  transcript.className = "voice-assistant-transcript";
  transcript.setAttribute("role", "status");
  transcript.setAttribute("aria-live", "polite");
  transcript.hidden = true;
  widget.append(transcript, button);
  document.body.appendChild(widget);
  try {
    const navigation = JSON.parse(sessionStorage.getItem("agroclick_voice_navigation") || "null");
    sessionStorage.removeItem("agroclick_voice_navigation");
    if (navigation && typeof navigation === "object") {
      voiceAssistantLastTranscript = typeof navigation.transcript === "string" ? navigation.transcript : "";
      updateVoiceAssistantDisplay(typeof navigation.response === "string" ? navigation.response : "");
    }
  } catch (error) {
    console.warn("Could not restore voice feedback after navigation:", error);
  }
}

function mountChatbot() {
  if (document.getElementById("chatbot-fab")) return;

  const lang = getLang();

  const fab = document.createElement("button");
  fab.id = "chatbot-fab";
  fab.setAttribute("aria-label", t("chat_title"));
  fab.setAttribute("aria-controls", "chatbot-panel");
  fab.setAttribute("aria-expanded", "false");
  fab.textContent = "🌾";
  document.body.appendChild(fab);

  const panel = document.createElement("div");
  panel.id = "chatbot-panel";
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-label", t("chat_title"));
  panel.innerHTML = `
    <div class="chatbot-head">
      <span data-i18n="chat_title">${escapeHtml(t('chat_title'))}</span>
      <button id="chatbotCloseBtn" aria-label="Close">&times;</button>
    </div>
    <label class="chat-language-label" for="chatbotLanguage">${escapeHtml(t("chat_language"))}</label>
    <select id="chatbotLanguage" aria-label="${escapeHtml(t("chat_language"))}">
      <option value="en" ${lang === "en" ? "selected" : ""}>English</option>
      <option value="ta" ${lang === "ta" ? "selected" : ""}>தமிழ்</option>
    </select>
    <div id="chatbotStatus" class="chatbot-status" aria-live="polite"></div>
    <div class="chatbot-body" id="chatbotBody"></div>
    <div class="chat-quick" id="chatbotQuick"></div>
    <form class="chatbot-input" id="chatbotForm">
      <input id="chatbotInput" type="text" data-i18n-ph="chat_placeholder" placeholder="${escapeHtml(t('chat_placeholder'))}" autocomplete="off" aria-label="${escapeHtml(t('chat_placeholder'))}">
      <button type="button" id="chatbotMic" aria-label="${escapeHtml(t("chat_mic"))}" title="${escapeHtml(t("chat_mic"))}">🎙</button>
      <button type="submit" id="chatbotSend" aria-label="${escapeHtml(t("chat_send"))}">➤</button>
    </form>`;
  document.body.appendChild(panel);

  renderChatQuickReplies();
  addChatMessage(t('chat_greeting'), "bot");

  fab.addEventListener("click", () => {
    const isOpen = panel.classList.toggle("show");
    fab.setAttribute("aria-expanded", String(isOpen));
    if (isOpen) document.getElementById("chatbotInput").focus();
  });
  document.getElementById("chatbotCloseBtn").addEventListener("click", () => {
    stopChatRecognition();
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    panel.classList.remove("show");
    fab.setAttribute("aria-expanded", "false");
    fab.focus();
  });

  document.getElementById("chatbotForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const input = document.getElementById("chatbotInput");
    const text = input.value.trim();
    if (!text) return;
    stopChatRecognition();
    input.value = "";
    void handleUserChatMessage(text);
  });
  document.getElementById("chatbotMic").addEventListener("click", toggleChatRecognition);
  document.getElementById("chatbotLanguage").addEventListener("change", event => {
    setLanguage(event.target.value);
  });

  document.addEventListener("agroclick:langchange", () => {
    document.querySelector("#chatbot-panel .chatbot-head span").textContent = t("chat_title");
    panel.setAttribute("aria-label", t("chat_title"));
    document.getElementById("chatbotInput").setAttribute("placeholder", t("chat_placeholder"));
    document.getElementById("chatbotInput").setAttribute("aria-label", t("chat_placeholder"));
    document.getElementById("chatbotLanguage").setAttribute("aria-label", t("chat_language"));
    document.querySelector(".chat-language-label").textContent = t("chat_language");
    document.getElementById("chatbotMic").setAttribute("aria-label", t("chat_mic"));
    document.getElementById("chatbotMic").setAttribute("title", t("chat_mic"));
    document.getElementById("chatbotSend").setAttribute("aria-label", t("chat_send"));
    document.getElementById("chatbotLanguage").value = getLang();
    renderChatQuickReplies();
  });
}

function setChatStatus(message, state = "") {
  const status = document.getElementById("chatbotStatus");
  if (!status) return;
  status.textContent = message;
  status.className = `chatbot-status ${state}`.trim();
}

function addTypingIndicator() {
  const body = document.getElementById("chatbotBody");
  const msg = document.createElement("div");
  msg.className = "chat-msg bot typing";
  msg.innerHTML = "<span></span><span></span><span></span>";
  body.appendChild(msg);
  body.scrollTop = body.scrollHeight;
  return msg;
}

function stopChatRecognition() {
  chatbotVoiceSessionActive = false;
  clearTimeout(chatbotSilenceTimer);
  chatbotSilenceTimer = null;
  if (chatbotRecognition) {
    chatbotStopRequested = true;
  }
  if (chatbotRecognition && chatbotListening) {
    chatbotListening = false;
    chatbotRecognition.stop();
  }
}

function getChatRecognitionTranscript(results) {
  let transcript = "";
  for (let i = 0; i < results.length; i++) {
    const alternative = results[i] && results[i][0];
    if (alternative && typeof alternative.transcript === "string") {
      transcript += alternative.transcript;
    }
  }
  return sanitizeSpeechInput(transcript);
}

function sanitizeSpeechInput(text = "") {
  return String(text)
    .replace(/https?:\/\/\S+/gi, " ")
    .replace(/[\u200B-\u200D\uFEFF]/g, " ")
    .replace(/[\u{1F300}-\u{1FAFF}]/gu, " ")
    .replace(/[^\p{L}\p{M}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function sanitizeNarrationText(text = "") {
  return sanitizeSpeechInput(text).replace(/\b(kg|₹|rs|rs\.)\b/gi, " ").trim();
}

function getPreferredSpeechVoice(language = "en") {
  const lang = String(language || "en").toLowerCase();
  const pickVoice = voices => {
    const exact = voices.filter(candidate =>
      (candidate.lang || "").toLowerCase().startsWith(lang)
    );
    if (exact.length) return exact[0];
    const fallback = voices.filter(candidate =>
      (candidate.lang || "").toLowerCase().startsWith(lang === "ta" ? "ta" : "en")
    );
    return fallback[0] || voices[0] || null;
  };

  const voices = window.speechSynthesis && typeof window.speechSynthesis.getVoices === "function"
    ? window.speechSynthesis.getVoices()
    : [];
  return pickVoice(voices);
}

function toggleChatRecognition() {
  if (chatbotVoiceSessionActive) {
    stopChatRecognition();
    return;
  }
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    setChatStatus(t("chat_voice_unsupported"), "error");
    return;
  }
  if (chatbotBusy) return;

  chatbotVoiceSessionActive = true;
  chatbotStopRequested = false;
  chatbotGotSpeech = false;
  document.getElementById("chatbotInput").value = "";
  startChatRecognition(SpeechRecognition);
}

function startChatRecognition(SpeechRecognition) {
  if (!chatbotVoiceSessionActive || chatbotBusy) return;
  const recognition = new SpeechRecognition();
  chatbotRecognition = recognition;
  recognition.lang = getLang() === "ta" ? "ta-IN" : "en-IN";
  recognition.interimResults = true;
  recognition.continuous = true;
  recognition.onstart = () => {
    if (chatbotBusy || !chatbotVoiceSessionActive) {
      recognition.stop();
      return;
    }
    chatbotListening = true;
    chatbotGotSpeech = false;
    setChatStatus(t("chat_listening"), "listening");
    const mic = document.getElementById("chatbotMic");
    mic.classList.add("is-listening");
    mic.setAttribute("aria-pressed", "true");
    mic.setAttribute("aria-label", t("chat_mic_stop"));
  };
  recognition.onresult = event => {
    const input = document.getElementById("chatbotInput");
    const transcript = getChatRecognitionTranscript(event.results);
    if (transcript) {
      chatbotGotSpeech = true;
      input.value = transcript;
      clearTimeout(chatbotSilenceTimer);
      chatbotSilenceTimer = setTimeout(() => {
        const spokenText = sanitizeSpeechInput(input.value);
        chatbotVoiceSessionActive = false;
        chatbotStopRequested = true;
        if (chatbotRecognition === recognition && chatbotListening) {
          chatbotListening = false;
          recognition.stop();
        }
        chatbotRecognition = null;
        chatbotSilenceTimer = null;
        chatbotGotSpeech = false;
        const mic = document.getElementById("chatbotMic");
        mic.classList.remove("is-listening");
        mic.setAttribute("aria-pressed", "false");
        mic.setAttribute("aria-label", t("chat_mic"));
        input.value = "";
        if (spokenText) void handleUserChatMessage(spokenText);
      }, 3000);
    }
  };
  recognition.onerror = event => {
    if (event.error !== "no-speech") {
      chatbotVoiceSessionActive = false;
      clearTimeout(chatbotSilenceTimer);
      chatbotSilenceTimer = null;
    }
    const mic = document.getElementById("chatbotMic");
    if (!chatbotVoiceSessionActive) {
      chatbotListening = false;
      mic.classList.remove("is-listening");
      mic.setAttribute("aria-pressed", "false");
      mic.setAttribute("aria-label", t("chat_mic"));
    }
    if (event.error === "no-speech") {
      setChatStatus(t("chat_voice_empty"), "error");
      return;
    }
    const message = event.error === "not-allowed" || event.error === "service-not-allowed"
      ? t("chat_mic_denied")
      : t("chat_voice_error");
    setChatStatus(message, "error");
  };
  recognition.onend = () => {
    chatbotListening = false;
    if (chatbotRecognition === recognition) chatbotRecognition = null;
    if (chatbotVoiceSessionActive && !chatbotStopRequested) {
      startChatRecognition(SpeechRecognition);
      return;
    }
    const mic = document.getElementById("chatbotMic");
    mic.classList.remove("is-listening");
    mic.setAttribute("aria-pressed", "false");
    mic.setAttribute("aria-label", t("chat_mic"));
    if (!chatbotBusy &&
        !document.getElementById("chatbotStatus").classList.contains("error")) {
      setChatStatus(!chatbotStopRequested && !chatbotGotSpeech ? t("chat_voice_empty") : "");
    }
    chatbotStopRequested = false;
    if (!chatbotVoiceSessionActive) chatbotGotSpeech = false;
  };
  try {
    recognition.start();
  } catch (error) {
    chatbotListening = false;
    if (chatbotRecognition === recognition) chatbotRecognition = null;
    chatbotVoiceSessionActive = false;
    clearTimeout(chatbotSilenceTimer);
    chatbotSilenceTimer = null;
    setChatStatus(t("chat_voice_error"), "error");
    console.warn("Speech recognition could not start:", error);
  }
}

async function handleUserChatMessage(text) {
  if (chatbotBusy || !text.trim()) return;
  chatbotBusy = true;
  addChatMessage(text, "user");
  const typingMsg = addTypingIndicator();
  const language = getLang();
  const products = typeof window.searchMarketplaceProducts === "function" &&
    typeof window.getMarketplaceProducts === "function"
    ? window.searchMarketplaceProducts(window.getMarketplaceProducts(), { query: text, sort: "relevance" })
      .slice(0, 5)
      .map(product => ({
        name: product.name,
        category: product.category,
        price: product.price,
        quantity: product.quantity,
        available: product.available,
        shopName: product.shopName,
        location: product.location,
      }))
    : [];
  setChatStatus(t("chat_processing"), "processing");
  document.getElementById("chatbotSend").disabled = true;
  document.getElementById("chatbotMic").disabled = true;

  let requestTimeout;
  try {
    const controller = new AbortController();
    requestTimeout = setTimeout(() => controller.abort(), 40000);
    const res = await fetch("/api/chatbot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, language, products }),
      signal: controller.signal,
    });
    clearTimeout(requestTimeout);
    if (!res.ok) throw new Error(`Chatbot service returned ${res.status}.`);
    const data = await res.json();
    if (typeof data.reply !== "string" || !data.reply.trim()) throw new Error("Chatbot returned an empty response.");
    renderBotReply(typingMsg, data.reply, language);
    if (data.mode === "demo") setChatStatus(data.notice || t("chat_demo_mode"), "demo");
    else setChatStatus("");
  } catch (error) {
    console.warn("Chatbot service unavailable; using the local demo response:", error);
    const fallback = getLocalReply(text, products);
    renderBotReply(typingMsg, fallback, language);
    setChatStatus(error.name === "AbortError" ? t("chat_ai_unavailable") : t("chat_error"), "error");
  } finally {
    clearTimeout(requestTimeout);
    chatbotBusy = false;
    document.getElementById("chatbotSend").disabled = false;
    document.getElementById("chatbotMic").disabled = false;
    document.getElementById("chatbotInput").focus();
  }
}

function renderBotReply(message, text, language) {
  message.className = "chat-msg bot";
  message.replaceChildren();
  const content = document.createElement("span");
  content.textContent = text;
  message.appendChild(content);
  const speaker = document.createElement("button");
  speaker.type = "button";
  speaker.className = "chat-speak-btn";
  speaker.textContent = "🔊";
  speaker.setAttribute("aria-label", t("chat_speak"));
  speaker.title = t("chat_speak");
  speaker.addEventListener("click", () => speakChatMessage(text, language, speaker));
  message.appendChild(speaker);
  const body = document.getElementById("chatbotBody");
  body.scrollTop = body.scrollHeight;
}

function speakChatMessage(text, language, button) {
  if (!("speechSynthesis" in window)) {
    setChatStatus(t("chat_speech_unsupported"), "error");
    return;
  }
  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
    if (chatbotSpeakingButton) {
      chatbotSpeakingButton.setAttribute("aria-label", t("chat_speak"));
      chatbotSpeakingButton.title = t("chat_speak");
      chatbotSpeakingButton = null;
    }
    return;
  }
  const cleanText = sanitizeNarrationText(text);
  if (!cleanText) {
    setChatStatus(language === "ta" ? t("chat_tamil_voice_missing") : t("chat_voice_missing"), "error");
    return;
  }
  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = language === "ta" ? "ta-IN" : "en-IN";
  const voice = getPreferredSpeechVoice(language);
  if (!voice) {
    setChatStatus(language === "ta" ? t("chat_tamil_voice_missing") : t("chat_voice_missing"), "error");
    return;
  }
  utterance.voice = voice;
  utterance.onstart = () => {
    chatbotSpeakingButton = button;
    button.setAttribute("aria-label", t("chat_speaking_stop"));
    button.title = t("chat_speaking_stop");
    setChatStatus("");
  };
  utterance.onend = utterance.onerror = () => {
    if (chatbotSpeakingButton) {
      chatbotSpeakingButton.setAttribute("aria-label", t("chat_speak"));
      chatbotSpeakingButton.title = t("chat_speak");
      chatbotSpeakingButton = null;
    }
  };
  window.speechSynthesis.speak(utterance);
}

/* =========================================================
   Quick reply buttons for common questions
   ========================================================= */
const QUICK_TOPICS = [
  { key: "chat_q1", en: "How do I order?", ta: "நான் எப்படி ஆர்டர் செய்வது?", keywords: ["order"] },
  { key: "chat_q2", en: "How do I become a seller?", ta: "நான் எப்படி விற்பனையாளராக ஆகலாம்?", keywords: ["seller"] },
  { key: "chat_q3", en: "Payment options", ta: "கட்டண விருப்பங்கள்", keywords: ["payment"] },
  { key: "chat_q4", en: "Delivery info", ta: "டெலிவரி தகவல்", keywords: ["delivery"] },
];

function renderChatQuickReplies() {
  const quick = document.getElementById("chatbotQuick");
  const lang = getLang();
  quick.innerHTML = QUICK_TOPICS.map(b =>
    `<button data-topic="${b.key}">${lang === 'ta' ? b.ta : b.en}</button>`
  ).join("");

  quick.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", () => {
      const topic = QUICK_TOPICS.find(t => t.key === btn.dataset.topic);
      if (!topic) return;
      void handleUserChatMessage(btn.textContent);
    });
  });
}


/* =========================================================
   Local keyword matching — no external API calls
   ========================================================= */
function getLocalReply(text, products = []) {
  if (products.length) {
    const lang = getLang();
    const heading = lang === "ta"
      ? "சந்தையில் தற்போது உள்ள பொருத்தமான பட்டியல்கள்:"
      : "Matching listings currently in the marketplace:";
    const details = products.map(product => {
      const quantity = product.quantity === null ? (lang === "ta" ? "அளவு குறிப்பிடப்படவில்லை" : "quantity not listed") : `${product.quantity} kg`;
      const price = product.price === null ? (lang === "ta" ? "விலை குறிப்பிடப்படவில்லை" : "price not listed") : `₹${product.price}/kg`;
      return `• ${product.name} — ${price}, ${quantity}; ${product.shopName} (${product.location})`;
    });
    const mandiNote = /mandi|bulk|wholesale|மண்டி|மொத்த/i.test(text)
      ? (lang === "ta" ? "\nஇந்த செயலியில் தனி மொத்த மண்டி விற்பனை அம்சம் இல்லை." : "\nThis app has no dedicated bulk mandi-sales feature.")
      : "";
    return `${heading}\n${details.join("\n")}${mandiNote}`;
  }
  const lower = text.toLowerCase().trim();
  if (/mandi|bulk|wholesale|மண்டி|மொத்த/i.test(text)) {
    return getLang() === "ta"
      ? "தற்போதைய AgroClick செயலியில் மொத்த மண்டி விற்பனைக்கான தனி அம்சம் இல்லை. Shops பக்கத்தில் விவசாயிகள் பதிவு செய்த பொருட்களைப் பார்க்கலாம்."
      : "AgroClick does not currently have a dedicated bulk mandi-sales feature. Browse farmer-entered listings on the Shops page.";
  }
  if (/tomato|tomatoes|onion|mango|banana|brinjal|turmeric|chilli|spice|vegetable|fruit|rice|crop|product|price|stock|available|தக்காளி|வெங்காயம்|மாம்பழம்|வாழை|கத்தரிக்காய்|மஞ்சள்|மசாலா|காய்கறி|பழம்|அரிசி|பொருள்|விலை|இருப்பு/i.test(text)) {
    return t("chat_product_no_matches");
  }

  for (const rule of CHAT_RULES) {
    for (const kw of rule.keywords) {
      if (lower.includes(kw)) {
        const lang = getLang();
        return rule[lang] || rule.en;
      }
    }
  }

  // Default fallback
  const lang = getLang();
  if (lang === 'ta') {
    return "நான் AgroClick உதவி பாட். ஆர்டர், விற்பனை, கட்டணம், டெலிவரி, இருப்பிடம், கணக்கு போன்ற தலைப்புகளைப் பற்றி கேள்வி கேட்கலாம். மேலே உள்ள பொத்தான்களை முயற்சிக்கவும்!";
  }
  return "I can help you with ordering, selling, payments, delivery, shop location, and account questions. Try one of the quick buttons above, or type your question!";
}

/* =========================================================
   Add a chat message (standard text, no flickering animation)
   ========================================================= */
function addChatMessage(text, sender) {
  const body = document.getElementById("chatbotBody");
  const msg = document.createElement("div");
  msg.className = "chat-msg " + sender;
  msg.textContent = text;
  body.appendChild(msg);
  body.scrollTop = body.scrollHeight;
  return msg;
}

window.mountChatbot = mountChatbot;
