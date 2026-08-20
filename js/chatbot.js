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
    en: "To become a seller:\n1. Log in with your mobile number\n2. Click 'Become a Shop Owner' on the homepage\n3. Complete the one-time verification\n4. Create your shop and add your crops!\n\nYour payment goes directly to your bank account.",
    ta: "விற்பனையாளராக:\n1. உங்கள் மொபைல் எண்ணில் உள்நுழையவும்\n2. முகப்புப் பக்கத்தில் 'கடை உரிமையாளராக ஆகுங்கள்' என்பதைக் கிளிக் செய்யுங்கள்\n3. ஒரு முறை சரிபார்ப்பை முடிக்கவும்\n4. உங்கள் கடையை உருவாக்கி பயிர்களைச் சேர்க்கத் தொடங்குங்கள்!" },

  // Payment
  { keywords: ["payment", "pay", "upi", "card", "netbanking", "razorpay", "money", "how to pay"],
    en: "AgroClick supports secure online payments via Razorpay. You can pay using:\n- UPI (Google Pay, PhonePe, etc.)\n- Credit/Debit cards\n- Netbanking\n\nAll payments are encrypted and secure.",
    ta: "AgroClick Razorpay மூலம் பாதுகாப்பான ஆன்லைன் கட்டணங்களை ஆதரிக்கிறது:\n- UPI (Google Pay, PhonePe முதலியன)\n- கிரெடிட்/டெபிட் கார்டுகள்\n- நெட் பேங்கிங்\n\nஅனைத்து கட்டணங்களும் குறியாக்கம் செய்யப்பட்டவை." },

  // Delivery
  { keywords: ["delivery", "deliver", "shipping", "ship", "when will i get", "how long", "time", "pickup"],
    en: "AgroClick connects you directly with local farmers. Delivery/pickup arrangements are made between you and the farmer at checkout. Most farmers offer same-day or next-day local delivery.",
    ta: "AgroClick உங்களை நேரடியாக உள்ளூர் விவசாயிகளுடன் இணைக்கிறது. டெலிவரி/பிக்அப் ஏற்பாடுகள் செக் அவுட் செய்யும் போது செய்யப்படுகின்றன." },

  // Login
  { keywords: ["login", "log in", "sign in", "otp", "mobile number", "verify", "verification", "register"],
    en: "To log in:\n1. Click 'Login' in the top navigation bar\n2. Enter your 10-digit mobile number (starting with 6-9)\n3. You'll receive a 4-digit OTP\n4. Enter the OTP to verify\n\nIf you're new, you'll be asked for your name.",
    ta: "உள்நுழைய:\n1. மேல் பட்டியில் 'Login' என்பதைக் கிளிக் செய்யுங்கள்\n2. உங்கள் 10 இலக்க மொபைல் எண்ணை உள்ளிடவும்\n3. ஒரு 4 இலக்க OTP பெறுவீர்கள்\n4. OTP-ஐ உள்ளிட்டு சரிபார்க்கவும்" },

  // About AgroClick
  { keywords: ["about", "what is agroclick", "about agroclick", "who are you", "tell me about", "agroclick"],
    en: "AgroClick is a farm-to-home marketplace connecting Tamil Nadu farmers directly with customers. We eliminate middlemen so farmers get fair prices and customers get fresh produce at honest rates. Available across all districts in Tamil Nadu.",
    ta: "AgroClick தமிழ்நாடு விவசாயிகளை நேரடியாக வாடிக்கையாளர்களுடன் இணைக்கும் பண்ணை-முதல்-வீடு சந்தை. இடைத்தரகர்களை நீக்கி விவசாயிகளுக்கு நியாயமான விலையை வழங்குகிறோம்." },

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
    en: "AgroClick farms provide fresh, locally-grown produce directly from Tamil Nadu farmers. Many farmers follow organic and sustainable farming practices. Check individual shop listings for details about their farming methods.",
    ta: "AgroClick பண்ணைகள் தமிழ்நாடு விவசாயிகளிடமிருந்து புதிய, உள்ளூர் விளைபொருட்களை வழங்குகின்றன. பல விவசாயிகள் இயற்கை விவசாய நடைமுறைகளைப் பின்பற்றுகின்றனர்." },

  // Price
  { keywords: ["price", "cost", "expensive", "cheap", "discount", "offer", "deal"],
    en: "AgroClick offers fair, direct-from-farm prices with no middleman markup. Each shop sets its own prices — browse different shops to compare. You get the best value buying directly from farmers!",
    ta: "AgroClick இடைத்தரகர் இல்லாமல் நியாயமான, நேரடி விலைகளை வழங்குகிறது. ஒவ்வொரு கடையும் தனது சொந்த விலைகளை நிர்ணயிக்கிறது." },

  // Tamil Nadu districts
  { keywords: ["tamil nadu", "tamil", "chennai", "coimbatore", "madurai", "trichy", "salem", "erode", "thanjavur", "district"],
    en: "AgroClick covers all major districts in Tamil Nadu including Chennai, Coimbatore, Madurai, Trichy, Salem, Erode, Thanjavur, and many more. Select your location in the navbar to find shops near you!",
    ta: "AgroClick சென்னை, கோயம்புத்தூர், மதுரை, திருச்சி, சேலம், ஈரோடு, தஞ்சாவூர் உள்ளிட்ட அனைத்து முக்கிய மாவட்டங்களையும் உள்ளடக்கியது." },

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
function mountChatbot() {
  if (document.getElementById("chatbot-fab")) return;

  const lang = getLang();

  const fab = document.createElement("button");
  fab.id = "chatbot-fab";
  fab.setAttribute("aria-label", "Chat help");
  fab.textContent = "🌾";
  document.body.appendChild(fab);

  const panel = document.createElement("div");
  panel.id = "chatbot-panel";
  panel.innerHTML = `
    <div class="chatbot-head">
      <span data-i18n="chat_title">${t('chat_title')}</span>
      <button id="chatbotCloseBtn" aria-label="Close">&times;</button>
    </div>
    <div class="chatbot-body" id="chatbotBody"></div>
    <div class="chat-quick" id="chatbotQuick"></div>
    <form class="chatbot-input" id="chatbotForm">
      <input id="chatbotInput" type="text" data-i18n-ph="chat_placeholder" placeholder="${t('chat_placeholder')}" autocomplete="off">
      <button type="submit">➤</button>
    </form>`;
  document.body.appendChild(panel);

  renderChatQuickReplies();
  addChatMessage(t('chat_greeting'), "bot");

  fab.addEventListener("click", () => panel.classList.toggle("show"));
  document.getElementById("chatbotCloseBtn").addEventListener("click", () => panel.classList.remove("show"));

  document.getElementById("chatbotForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const input = document.getElementById("chatbotInput");
    const text = input.value.trim();
    if (!text) return;
    input.value = "";
    void handleUserChatMessage(text);
  });

  document.addEventListener("agroclick:langchange", () => {
    document.querySelector("#chatbot-panel .chatbot-head span").textContent = t('chat_title');
    document.getElementById("chatbotInput").setAttribute("placeholder", t('chat_placeholder'));
    renderChatQuickReplies();
  });
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

async function handleUserChatMessage(text) {
  addChatMessage(text, "user");
  const typingMsg = addTypingIndicator();

  try {
    const res = await fetch("/api/chatbot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.reply) {
        typingMsg.classList.remove("typing");
        typingMsg.textContent = data.reply;
        document.getElementById("chatbotBody").scrollTop = document.getElementById("chatbotBody").scrollHeight;
        return;
      }
    }
  } catch (e) {
    console.warn("Backend chatbot endpoint unreachable, using local fallback:", e);
  }

  const reply = getLocalReply(text);
  typingMsg.classList.remove("typing");
  typingMsg.textContent = reply;
  document.getElementById("chatbotBody").scrollTop = document.getElementById("chatbotBody").scrollHeight;
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
function getLocalReply(text) {
  const lower = text.toLowerCase().trim();

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
