import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";
import pg from "pg";
const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const app = express();
const PORT = Number(process.env.PORT || 3000);
const OTP_TTL_MS = 5 * 60 * 1000;
const OTP_RATE_LIMIT_MS = 60 * 1000;
const pendingOtps = new Map();
const otpRateLimits = new Map();
let mongoClient = null;
let mongoUri = process.env.MONGODB_URI || "";
let mongoDbName = process.env.MONGODB_DB_NAME || "agroclick";

/* PostgreSQL pool instance */
let pgPool = null;

function buildPgConfig(inputConfig = null) {

  let config;
  if (inputConfig) {
    config = typeof inputConfig === "string" ? { connectionString: inputConfig } : { ...inputConfig };
  } else if (process.env.DATABASE_URL) {
    config = { connectionString: process.env.DATABASE_URL };
  } else {
    config = {
      host: process.env.PGHOST || "localhost",
      port: Number(process.env.PGPORT || 5432),
      user: process.env.PGUSER || "postgres",
      password: process.env.PGPASSWORD || "postgres",
      database: process.env.PGDATABASE || "agroclick",
    };
  }

  const connStr = String(config.connectionString || "");
  const hostStr = String(config.host || "");
  const isRemote = connStr.includes("supabase") || connStr.includes("neon.tech") || connStr.includes("render.com") || connStr.includes("amazonaws.com") || connStr.includes("sslmode=require") || (hostStr && hostStr !== "localhost" && hostStr !== "127.0.0.1");

  if (isRemote && !config.ssl) {
    config.ssl = { rejectUnauthorized: false };
  }
  config.connectionTimeoutMillis = 10000;
  return config;
}

async function getPgPool(customConfig = null) {
  if (customConfig) {
    const config = buildPgConfig(customConfig);
    if (pgPool) await pgPool.end().catch(() => {});
    pgPool = new Pool(config);
    return pgPool;
  }

  if (!pgPool) {
    const config = buildPgConfig();
    pgPool = new Pool(config);
  }
  return pgPool;
}


async function initPgSchema(pool) {
  const schemaSql = `
    CREATE TABLE IF NOT EXISTS users (
      mobile VARCHAR(15) PRIMARY KEY,
      name VARCHAR(100),
      is_owner BOOLEAN DEFAULT FALSE,
      is_premium BOOLEAN DEFAULT FALSE,
      kyc_verified BOOLEAN DEFAULT FALSE,
      aadhar VARCHAR(12),
      bank_account VARCHAR(20),
      ifsc VARCHAR(11),
      location VARCHAR(100),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- Ensure column exists if table was created previously
    ALTER TABLE users ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE;

    CREATE TABLE IF NOT EXISTS shops (
      id VARCHAR(50) PRIMARY KEY,
      owner_mobile VARCHAR(15) REFERENCES users(mobile) ON DELETE CASCADE,
      name VARCHAR(150) NOT NULL,
      owner_image TEXT,
      location VARCHAR(100) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS shop_items (
      id VARCHAR(50) PRIMARY KEY,
      shop_id VARCHAR(50) REFERENCES shops(id) ON DELETE CASCADE,
      name VARCHAR(100) NOT NULL,
      image TEXT,
      price NUMERIC(10, 2) NOT NULL,
      description TEXT,
      out_of_stock BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS shop_reviews (
      id VARCHAR(50) PRIMARY KEY,
      shop_id VARCHAR(50) REFERENCES shops(id) ON DELETE CASCADE,
      customer_name VARCHAR(100) NOT NULL,
      rating INTEGER CHECK (rating >= 1 AND rating <= 5),
      comment TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS orders (
      id VARCHAR(50) PRIMARY KEY,
      customer_mobile VARCHAR(15) NOT NULL,
      customer_name VARCHAR(100) NOT NULL,
      shop_id VARCHAR(50) REFERENCES shops(id) ON DELETE CASCADE,
      shop_name VARCHAR(150) NOT NULL,
      total NUMERIC(10, 2) NOT NULL,
      location VARCHAR(100) NOT NULL,
      status VARCHAR(30) DEFAULT 'Placed',
      payment_method VARCHAR(50) DEFAULT 'Razorpay',
      payment_id VARCHAR(100),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id SERIAL PRIMARY KEY,
      order_id VARCHAR(50) REFERENCES orders(id) ON DELETE CASCADE,
      item_name VARCHAR(100) NOT NULL,
      price NUMERIC(10, 2) NOT NULL,
      qty INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS app_state (
      id VARCHAR(50) PRIMARY KEY DEFAULT 'app_state',
      state JSONB NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await pool.query(schemaSql);
}

async function saveStateToPg(state, customConfig = null) {
  const pool = await getPgPool(customConfig);
  await initPgSchema(pool);

  // 1. Save state document into app_state JSONB
  await pool.query(
    `INSERT INTO app_state (id, state, updated_at)
     VALUES ('app_state', $1, CURRENT_TIMESTAMP)
     ON CONFLICT (id) DO UPDATE SET state = $1, updated_at = CURRENT_TIMESTAMP`,
    [JSON.stringify(state)]
  );

  // 2. Sync to normalized relational SQL tables
  if (state.users && typeof state.users === "object") {
    for (const u of Object.values(state.users)) {
      if (!u.mobile) continue;
      await pool.query(
        `INSERT INTO users (mobile, name, is_owner, is_premium, kyc_verified, aadhar, bank_account, ifsc, location)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (mobile) DO UPDATE SET
           name = EXCLUDED.name,
           is_owner = EXCLUDED.is_owner,
           is_premium = EXCLUDED.is_premium,
           kyc_verified = EXCLUDED.kyc_verified,
           aadhar = EXCLUDED.aadhar,
           bank_account = EXCLUDED.bank_account,
           ifsc = EXCLUDED.ifsc,
           location = EXCLUDED.location`,
        [u.mobile, u.name || "", Boolean(u.isOwner), Boolean(u.isPremium), Boolean(u.kycVerified), u.aadhar || null, u.bankAccount || null, u.ifsc || null, u.location || ""]
      );
    }
  }


  if (Array.isArray(state.shops)) {
    for (const s of state.shops) {
      if (!s.id) continue;
      // Ensure owner user exists
      if (s.ownerMobile) {
        await pool.query(
          `INSERT INTO users (mobile, name, is_owner) VALUES ($1, $2, TRUE) ON CONFLICT (mobile) DO UPDATE SET is_owner = TRUE`,
          [s.ownerMobile, "Farmer Owner"]
        );
      }
      await pool.query(
        `INSERT INTO shops (id, owner_mobile, name, owner_image, location)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) DO UPDATE SET
           owner_mobile = EXCLUDED.owner_mobile,
           name = EXCLUDED.name,
           owner_image = EXCLUDED.owner_image,
           location = EXCLUDED.location`,
        [s.id, s.ownerMobile || null, s.name, s.ownerImage || null, s.location || ""]
      );

      if (Array.isArray(s.items)) {
        for (const item of s.items) {
          if (!item.id) continue;
          await pool.query(
            `INSERT INTO shop_items (id, shop_id, name, image, price, description, out_of_stock)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             ON CONFLICT (id) DO UPDATE SET
               shop_id = EXCLUDED.shop_id,
               name = EXCLUDED.name,
               image = EXCLUDED.image,
               price = EXCLUDED.price,
               description = EXCLUDED.description,
               out_of_stock = EXCLUDED.out_of_stock`,
            [item.id, s.id, item.name, item.image || null, Number(item.price || 0), item.desc || null, Boolean(item.outOfStock)]
          );
        }
      }

      if (Array.isArray(s.reviews)) {
        for (const r of s.reviews) {
          if (!r.id) continue;
          await pool.query(
            `INSERT INTO shop_reviews (id, shop_id, customer_name, rating, comment)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (id) DO UPDATE SET
               customer_name = EXCLUDED.customer_name,
               rating = EXCLUDED.rating,
               comment = EXCLUDED.comment`,
            [r.id, s.id, r.customer || "Anonymous", Number(r.rating || 5), r.comment || ""]
          );
        }
      }
    }
  }

  if (Array.isArray(state.orders)) {
    for (const o of state.orders) {
      if (!o.id) continue;
      await pool.query(
        `INSERT INTO orders (id, customer_mobile, customer_name, shop_id, shop_name, total, location, status, payment_method, payment_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (id) DO UPDATE SET
           status = EXCLUDED.status,
           total = EXCLUDED.total`,
        [o.id, o.customerMobile || "", o.customerName || "Customer", o.shopId || "", o.shopName || "", Number(o.total || 0), o.location || "", o.status || "Placed", o.paymentMethod || "Razorpay", o.paymentId || null]
      );
    }
  }

  return true;
}

async function loadStateFromPg(customConfig = null) {
  const pool = await getPgPool(customConfig);
  await initPgSchema(pool);
  const res = await pool.query(`SELECT state FROM app_state WHERE id = 'app_state'`);
  return res.rows[0]?.state || null;
}

async function connectToMongo(uri = mongoUri, dbName = mongoDbName) {
  if (!uri) return { ok: false, error: "No MongoDB URI configured." };
  if (mongoClient && typeof mongoClient.topology?.isConnected === "function" && mongoClient.topology.isConnected()) {
    mongoUri = uri;
    mongoDbName = dbName;
    return { ok: true, connected: true, dbName: mongoDbName };
  }

  try {
    const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
    await client.connect();
    mongoClient = client;
    mongoUri = uri;
    mongoDbName = dbName;
    return { ok: true, connected: true, dbName: mongoDbName };
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    return { ok: false, error: error.message };
  }
}

async function getMongoDb(uri = mongoUri, dbName = mongoDbName) {
  const result = await connectToMongo(uri, dbName);
  if (!result.ok) throw new Error(result.error);
  return mongoClient.db(mongoDbName);
}

async function saveStateToMongo(state, uri = mongoUri, dbName = mongoDbName) {
  const db = await getMongoDb(uri, dbName);
  await db.collection("app_state").updateOne(
    { _id: "app_state" },
    { $set: { state, updatedAt: new Date() } },
    { upsert: true }
  );
  return true;
}

async function loadStateFromMongo(uri = mongoUri, dbName = mongoDbName) {
  const db = await getMongoDb(uri, dbName);
  const doc = await db.collection("app_state").findOne({ _id: "app_state" });
  return doc?.state || null;
}

/* =========================================================
   Local keyword-based chatbot responses — no external API needed.
   ========================================================= */
const CHATBOT_RULES = [
  // Greetings
  { keywords: ["hello", "hi", "hey", "vanakkam", "namaste", "vanakam"],
    reply: { en: "Vanakkam! Welcome to AgroClick. How can I help you today?", ta: "வணக்கம்! AgroClick-க்கு வரவேற்கிறோம். இன்று நான் உங்களுக்கு எப்படி உதவலாம்?" } },

  // Ordering
  { keywords: ["order", "how to order", "how do i order", "buy", "purchase", "place order"],
    reply: { en: "To order on AgroClick:\n1. Choose your location from the navbar.\n2. Click 'Visit Shops' to browse nearby farms.\n3. Open a shop and add items to your cart.\n4. Go to your cart and tap 'Pay & Order'.\nThat's it — your order goes straight to the farmer!", ta: "AgroClick-ல் ஆர்டர் செய்ய:\n1. நாவ்பாரில் இருந்து உங்கள் இடத்தைத் தேர்ந்தெடுக்கவும்.\n2. 'கடைகளுக்குச் செல்லவும்' என்பதைக் கிளிக் செய்யுங்கள்.\n3. ஒரு கடையைத் திறந்து பொருட்களைக் கார்ட்டில் சேர்க்கவும்.\n4. உங்கள் கார்ட்டிற்குச் சென்று 'பணம் செலுத்தி ஆர்டர் செய்' என்பதை அழுத்தவும்.\nமுடிந்தது!" } },

  // Cart
  { keywords: ["cart", "my cart", "view cart", "checkout"],
    reply: { en: "To view your cart, click the cart button that appears when you add items. You can adjust quantities and proceed to pay. If the cart is empty, visit a shop first to add some fresh produce!", ta: "உங்கள் கார்ட்டைப் பார்க்க, பொருட்களைச் சேர்க்கும் போது தோன்றும் கார்ட் பொத்தானைக் கிளிக் செய்யுங்கள். அளவுகளை மாற்றி பணம் செலுத்தலாம்." } },

  // Seller / Become shop owner
  { keywords: ["seller", "sell", "become seller", "shop owner", "register shop", "farmers", "farmer", "i am a farmer", "i am a seller", "start selling"],
    reply: { en: "To become a seller on AgroClick:\n1. Log in with your mobile number.\n2. Click 'Become a Shop Owner' on the homepage.\n3. Complete the one-time verification (location, Aadhaar, bank details).\n4. Create your shop and start adding your crops!\nYour payment goes directly to your bank account.", ta: "AgroClick-ல் விற்பனையாளராக:\n1. உங்கள் மொபைல் எண்ணில் உள்நுழையவும்.\n2. முகப்புப் பக்கத்தில் 'கடை உரிமையாளராக ஆகுங்கள்' என்பதைக் கிளிக் செய்யுங்கள்.\n3. ஒரு முறை சரிபார்ப்பை முடிக்கவும்.\n4. உங்கள் கடையை உருவாக்கி பயிர்களைச் சேர்க்கத் தொடங்குங்கள்!" } },

  // Payment
  { keywords: ["payment", "pay", "upi", "card", "netbanking", "razorpay", "money", "how to pay"],
    reply: { en: "AgroClick supports secure online payments via Razorpay. You can pay using UPI (Google Pay, PhonePe, etc.), credit/debit cards, or netbanking. All payments are encrypted and secure.", ta: "AgroClick Razorpay மூலம் பாதுகாப்பான ஆன்லைன் கட்டணங்களை ஆதரிக்கிறது. UPI (Google Pay, PhonePe, முதலியன), கிரெடிட்/டெபிட் கார்டுகள் அல்லது நெட் பேங்கிங் மூலம் பணம் செலுத்தலாம்." } },

  // Delivery
  { keywords: ["delivery", "deliver", "shipping", "ship", "when will i get", "how long", "time"],
    reply: { en: "AgroClick connects you directly with local farmers. Delivery arrangements are coordinated between you and the farmer at the time of ordering. Most farmers offer same-day or next-day pickup/delivery in their local area.", ta: "AgroClick உங்களை நேரடியாக உள்ளூர் விவசாயிகளுடன் இணைக்கிறது. டெலிவரி ஏற்பாடுகள் ஆர்டர் செய்யும் போது உங்களுக்கும் விவசாயிக்கும் இடையே ஒருங்கிணைக்கப்படுகின்றன." } },

  // Login
  { keywords: ["login", "log in", "sign in", "otp", "mobile number", "verify", "verification"],
    reply: { en: "To log in, click the 'Login' button in the top navigation bar. Enter your 10-digit mobile number (starting with 6-9), and you'll receive an OTP to verify. If you're new, you'll be asked for your name after verification.", ta: "உள்நுழைய, மேல் பட்டியில் உள்ள 'Login' பொத்தானைக் கிளிக் செய்யுங்கள். உங்கள் 10 இலக்க மொபைல் எண்ணை உள்ளிடவும். OTP அனுப்பப்படும்." } },

  // About AgroClick
  { keywords: ["about", "what is agroclick", "about agroclick", "who are you", "tell me about"],
    reply: { en: "AgroClick is a farm-to-home marketplace connecting Tamil Nadu farmers directly with customers. We eliminate middlemen so farmers get fair prices and customers get fresh produce at honest rates. Available across all districts in Tamil Nadu.", ta: "AgroClick தமிழ்நாடு விவசாயிகளை நேரடியாக வாடிக்கையாளர்களுடன் இணைக்கும் ஒரு பண்ணை-முதல்-வீடு சந்தை. இடைத்தரகர்களை நீக்கி விவசாயிகளுக்கு நியாயமான விலையையும் வாடிக்கையாளர்களுக்கு புதிய பொருட்களையும் வழங்குகிறோம்." } },

  // Return / Refund
  { keywords: ["return", "refund", "cancel order", "cancellation"],
    reply: { en: "If you need to cancel or return an order, please contact the farmer directly through the shop page. Since AgroClick connects you directly with local farmers, any returns or issues are handled between you and the seller.", ta: "ஆர்டரை ரத்து செய்ய அல்லது திரும்பப் பெற விரும்பினால், கடை பக்கம் மூலம் விவசாயியைத் தொடர்பு கொள்ளுங்கள்." } },

  // Contact / Support
  { keywords: ["contact", "support", "help", "customer care", "phone number", "email"],
    reply: { en: "For support, you can reach us through this chatbot or visit our website for more information. AgroClick is committed to helping both farmers and customers resolve any issues quickly.", ta: "ஆதரவுக்கு, இந்த சாட்பாட் மூலம் அல்லது எங்கள் இணையதளம் மூலம் எங்களைத் தொடர்பு கொள்ளலாம்." } },

  // Location / Nearby
  { keywords: ["location", "nearby", "near me", "shop near", "where"],
    reply: { en: "Use the location dropdown in the top navigation bar to select your town in Tamil Nadu. Shops will be automatically sorted by distance from your chosen location — the nearest shops appear first!", ta: "மேல் பட்டியில் உள்ள இருப்பிட நடுவரைப் பயன்படுத்தி உங்கள் நகரத்தைத் தேர்ந்தெடுக்கவும். அருகிலுள்ள கடைகள் முதலில் தோன்றும்!" } },

  // Fresh / Quality
  { keywords: ["fresh", "quality", "organic", "natural", "pesticide"],
    reply: { en: "AgroClick farms provide fresh, locally-grown produce directly from Tamil Nadu farmers. Many farmers on our platform follow organic and sustainable farming practices. Check individual shop listings for details about their farming methods.", ta: "AgroClick பண்ணைகள் தமிழ்நாடு விவசாயிகளிடமிருந்து புதிய, உள்ளூர் விளைபொருட்களை வழங்குகின்றன. பல விவசாயிகள் இயற்கை விவசாய நடைமுறைகளைப் பின்பற்றுகின்றனர்." } },

  // Price
  { keywords: ["price", "cost", "expensive", "cheap", "discount", "offer"],
    reply: { en: "AgroClick offers fair, direct-from-farm prices with no middleman markup. Each shop sets its own prices — browse different shops to compare. Because you buy directly from farmers, you get the best value for fresh produce.", ta: "AgroClick இடைத்தரகர் இல்லாமல் நியாயமான, நேரடி விலைகளை வழங்குகிறது. ஒவ்வொரு கடையும் தனது சொந்த விலைகளை நிர்ணயிக்கிறது." } },

  // Tamil Nadu specific
  { keywords: ["tamil nadu", "tamil", "chennai", "coimbatore", "madurai", "trichy", "district"],
    reply: { en: "AgroClick covers all major districts in Tamil Nadu including Chennai, Coimbatore, Madurai, Trichy, Salem, Erode, Thanjavur, and many more. Select your location in the navbar to find shops near you!", ta: "AgroClick சென்னை, கோயம்புத்தூர், மதுரை, திருச்சி, சேலம், ஈரோடு, தஞ்சாவூர் உள்ளிட்ட தமிழ்நாட்டின் அனைத்து முக்கிய மாவட்டங்களையும் உள்ளடக்கியது." } },

  // Reviews
  { keywords: ["review", "rating", "feedback", "star"],
    reply: { en: "After receiving your order, you can leave a review for any shop. Visit the shop page, scroll to the reviews section, and submit your rating and comment. Reviews help other customers find the best farmers!", ta: "ஆர்டரைப் பெற்ற பிறகு, எந்த கடைக்கும் மதிப்புரை விடலாம். கடை பக்கத்திற்குச் சென்று மதிப்புரை பிரிவில் உங்கள் மதிப்பீட்டைச் சமர்ப்பிக்கவும்." } },

  // Stock / Available
  { keywords: ["stock", "available", "out of stock", "availability"],
    reply: { en: "Each item on AgroClick shows its stock status. If an item is out of stock, the farmer will restock it soon. You can still browse and add available items to your cart from any shop.", ta: "AgroClick-ல் உள்ள ஒவ்வொரு பொருளும் கையிருப்பு நிலையைக் காட்டுகிறது. ஒரு பொருள் கையிருப்பில் இல்லையெனில், விவசாயி விரைவில் நிரப்புவார்." } },

  // Multiple items
  { keywords: ["vegetable", "vegetables", "fruit", "fruits", "rice", "spice", "spices", "tomato", "banana", "onion"],
    reply: { en: "AgroClick offers a wide variety of farm-fresh produce including vegetables (tomato, onion, brinjal, etc.), fruits (banana, mango, etc.), rice varieties (Ponni, Sona Masoori, etc.), and spices (turmeric, chili, etc.). Browse our shops to see what's available!", ta: "AgroClick காய்கறிகள் (தக்காளி, வெங்காயம், கத்திரிக்காய் முதலியன), பழங்கள் (வாழைப்பழம், மாம்பழம் முதலியன), அரிசி வகைகள் (பொன்னி, சோனா மசூரி முதலியன), மசாலாப் பொருட்கள் (மஞ்சள், மிளகாய் முதலியன்) உள்ளிட்ட பலவகையான பண்ணை பொருட்களை வழங்குகிறது." } },

  // Manage shop
  { keywords: ["manage shop", "add item", "my shop", "shop dashboard", "inventory"],
    reply: { en: "To manage your shop, click the 'Manage My Shop' floating button (bottom-left) when logged in. From there you can add items, toggle stock status, view orders, and read customer reviews.", ta: "உங்கள் கடையை நிர்வகிக்க, உள்நுழைந்ததும் 'எனது கடையை நிர்வகி' என்ற மிதக்கும் பொத்தானைக் கிளிக் செய்யுங்கள்." } },

  // My orders
  { keywords: ["my order", "order status", "track order", "where is my order"],
    reply: { en: "To check your order status, click 'My Orders' in the navigation bar. You'll see all your past orders with their current status (Placed or Delivered). Your order goes directly to the farmer for processing.", ta: "உங்கள் ஆர்டர் நிலையைச் சரிபார்க்க, வழிசெலுத்தல் பட்டியில் 'எனது ஆர்டர்கள்' என்பதைக் கிளிக் செய்யுங்கள்." } },

  // Greeting variations
  { keywords: ["good morning", "good evening", "good afternoon", "good night"],
    reply: { en: "Hello! Welcome to AgroClick. How can I assist you today with fresh farm produce from Tamil Nadu?", ta: "வணக்கம்! AgroClick-க்கு வரவேற்கிறோம். தமிழ்நாட்டின் புதிய பண்ணை பொருட்களில் நான் எப்படி உதவ முடியும்?" } },

  // Thank you
  { keywords: ["thank", "thanks", "thank you", "nandri"],
    reply: { en: "You're welcome! Happy to help. Is there anything else you'd like to know about AgroClick?", ta: "வரவேற்கிறோம்! உதவி செய்ததில் மகிழ்ச்சி. AgroClick பற்றி வேறு ஏதாவது தெரிந்து கொள்ள விரும்புகிறீர்களா?" } },

  // How does it work
  { keywords: ["how does it work", "how it works", "how to use", "guide", "tutorial"],
    reply: { en: "AgroClick is simple:\n1. Pick your location in Tamil Nadu.\n2. Browse nearby farmer shops.\n3. Add fresh produce to your cart.\n4. Pay securely online.\n5. Get your order delivered or pick it up from the farmer!\nFarmers get paid directly — no middlemen.", ta: "AgroClick எளிது:\n1. தமிழ்நாட்டில் உங்கள் இடத்தைத் தேர்ந்தெடுக்கவும்.\n2. அருகிலுள்ள விவசாயிகள் கடைகளை உலாவுங்கள்.\n3. புதிய பொருட்களைக் கார்ட்டில் சேர்க்கவும்.\n4. பாதுகாப்பாக ஆன்லைனில் பணம் செலுத்தவும்.\n5. உங்கள் ஆர்டரைப் பெறுங்கள்!" } },
];

function getLocalChatReply(text) {
  const lower = text.toLowerCase().trim();

  for (const rule of CHATBOT_RULES) {
    for (const kw of rule.keywords) {
      if (lower.includes(kw)) {
        const lang = "en";
        return rule.reply[lang] || rule.reply.en;
      }
    }
  }

  return "I can help you with:\n- How to order\n- Becoming a seller\n- Payment options\n- Delivery information\n- Shop & location\n- Account & login\n\nTry asking about any of these topics!";
}

/* =========================================================
   OTP helpers
   ========================================================= */
function normalizeMobile(mobile) {
  return String(mobile || "").replace(/\D/g, "");
}

function generateOtp() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

function storeOtp(mobile, otp) {
  pendingOtps.set(mobile, { otp, expiresAt: Date.now() + OTP_TTL_MS });
}

function getOtpRecord(mobile) {
  return pendingOtps.get(mobile);
}

function clearOtp(mobile) {
  pendingOtps.delete(mobile);
}

async function sendOtpViaTwilio(phoneNumber, message) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_FROM_NUMBER;

  if (!accountSid || !authToken || !fromNumber) return false;

  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`
    },
    body: new URLSearchParams({
      To: phoneNumber,
      From: fromNumber,
      Body: message
    })
  });
  return response.ok;
}

async function sendOtpViaMsg91(phoneNumber, message) {
  const authKey = process.env.MSG91_AUTH_KEY;
  const senderId = process.env.MSG91_SENDER_ID;

  if (!authKey || !senderId) return false;

  const url = new URL("https://control.msg91.com/api/sendhttp.php");
  url.searchParams.set("authkey", authKey);
  url.searchParams.set("mob", phoneNumber.replace(/^\+/, ""));
  url.searchParams.set("message", message);
  url.searchParams.set("sender", senderId);
  url.searchParams.set("route", "4");
  url.searchParams.set("country", "91");

  const response = await fetch(url.toString());
  return response.ok;
}

/* =========================================================
   Express middleware & routes
   ========================================================= */
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(express.static(path.join(__dirname, "..")));


app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  next();
});

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

/* ---- OTP send ---- */
app.post("/api/send-otp", async (req, res) => {
  const rawMobile = String(req.body.mobile || "").trim();
  const digits = normalizeMobile(rawMobile);

  if (!/^[6-9]\d{9}$/.test(digits)) {
    return res.status(400).json({ success: false, error: "Invalid mobile number." });
  }

  const lastOtpTime = otpRateLimits.get(digits);
  if (lastOtpTime && Date.now() - lastOtpTime < OTP_RATE_LIMIT_MS) {
    const waitSec = Math.ceil((OTP_RATE_LIMIT_MS - (Date.now() - lastOtpTime)) / 1000);
    return res.status(429).json({ success: false, error: `Please wait ${waitSec} seconds before requesting another OTP.` });
  }

  const otp = generateOtp();
  const phoneNumber = `+91${digits}`;
  storeOtp(digits, otp);
  otpRateLimits.set(digits, Date.now());

  const isDemoMode = (process.env.OTP_DEMO_MODE || "true").trim() !== "false" ||
    (!process.env.TWILIO_ACCOUNT_SID && !process.env.MSG91_AUTH_KEY);

  if (isDemoMode) {
    console.log(`[otp-demo] ${digits} => ${otp}`);
    return res.json({ success: true, message: "Demo OTP generated.", demoOtp: otp, showCode: true });
  }

  try {
    const message = `Your AgroClick verification code is ${otp}. It is valid for 5 minutes.`;
    let sent = false;

    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM_NUMBER) {
      sent = await sendOtpViaTwilio(phoneNumber, message);
    } else if (process.env.MSG91_AUTH_KEY && process.env.MSG91_SENDER_ID) {
      sent = await sendOtpViaMsg91(phoneNumber, message);
    }

    if (sent) {
      return res.json({ success: true, message: "OTP sent successfully.", showCode: false });
    }
    // Fallback to demo mode if SMS delivery fails or credentials are incomplete
    console.log(`[otp-fallback] ${digits} => ${otp}`);
    return res.json({ success: true, message: "Demo OTP generated.", demoOtp: otp, showCode: true });
  } catch (err) {
    console.error("send otp error:", err);
    console.log(`[otp-fallback] ${digits} => ${otp}`);
    return res.json({ success: true, message: "Demo OTP generated.", demoOtp: otp, showCode: true });
  }
});


/* ---- OTP verify ---- */
app.post("/api/verify-otp", (req, res) => {
  const rawMobile = String(req.body.mobile || "").trim();
  const digits = normalizeMobile(rawMobile);
  const enteredOtp = String(req.body.otp || "").trim();

  if (!/^[6-9]\d{9}$/.test(digits)) {
    return res.status(400).json({ success: false, error: "Invalid mobile number." });
  }

  const record = getOtpRecord(digits);
  if (!record) {
    return res.status(400).json({ success: false, error: "OTP expired or not requested." });
  }

  if (Date.now() > record.expiresAt) {
    clearOtp(digits);
    return res.status(400).json({ success: false, error: "OTP expired." });
  }

  if (enteredOtp !== record.otp) {
    return res.status(401).json({ success: false, error: "Incorrect OTP." });
  }

  clearOtp(digits);
  return res.json({ success: true, message: "OTP verified." });
});

const SYSTEM_PROMPT = `You are AgroClick Assistant, the official AI help assistant for AgroClick — Tamil Nadu's direct farm-to-home marketplace connecting local farmers directly with customers.

YOUR ROLE & GUIDELINES:
1. Always identify yourself as AgroClick Assistant.
2. Be polite, friendly, clear, and helpful.
3. Help users with buying farm-fresh produce, seller/farmer registration (Aadhaar & Bank KYC), shop location sorting across Tamil Nadu, Razorpay payments, and delivery.
4. Reply in clear Tamil script if the user writes in Tamil (தமிழ்). Reply in plain English if the user writes in English.
5. Provide clean, well-formatted, natural responses without technical meta-text.`;

async function callAiChatbotApi(userText) {
  const geminiKey = (process.env.GEMINI_API_KEY || "").trim();
  const openaiKey = (process.env.OPENAI_API_KEY || "").trim();
  const groqKey = (process.env.GROQ_API_KEY || "").trim();

  // 1. Google Gemini API (using native systemInstruction)
  if (geminiKey) {
    const models = ["gemini-3.6-flash", "gemini-1.5-flash", "gemma-4-26b-a4b-it"];
    for (const m of models) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${geminiKey}`;
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: SYSTEM_PROMPT }]
            },
            contents: [
              {
                role: "user",
                parts: [{ text: userText }]
              }
            ],
            generationConfig: {
              maxOutputTokens: 1024,
              temperature: 0.4
            }
          })
        });
        if (response.ok) {
          const data = await response.json();
          const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidate && candidate.trim()) {
            return candidate.trim();
          }
        }
      } catch (err) {
        console.warn(`Gemini model ${m} call failed, trying next:`, err.message);
      }
    }
  }





  // 2. OpenAI API
  if (openaiKey) {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openaiKey}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          max_tokens: 150,
          temperature: 0.3,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userText }
          ]
        })
      });
      if (response.ok) {
        const data = await response.json();
        const reply = data.choices?.[0]?.message?.content;
        if (reply) return reply.trim();
      }
    } catch (err) {
      console.warn("OpenAI API call failed, falling back:", err.message);
    }
  }

  // 3. Groq API
  if (groqKey) {
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${groqKey}`
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          max_tokens: 150,
          temperature: 0.3,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userText }
          ]
        })
      });
      if (response.ok) {
        const data = await response.json();
        const reply = data.choices?.[0]?.message?.content;
        if (reply) return reply.trim();
      }
    } catch (err) {
      console.warn("Groq API call failed, falling back:", err.message);
    }
  }

  // Fallback to local keyword rules
  return getLocalChatReply(userText);
}


/* ---- Chatbot Route ---- */
app.post("/api/chatbot", async (req, res) => {
  const userText = String(req.body.text || "").trim();
  if (!userText) {
    return res.json({ reply: "Please type a question and I'll do my best to help!" });
  }

  try {
    const reply = await callAiChatbotApi(userText);
    res.json({ reply });
  } catch (error) {
    console.error("Chatbot endpoint error:", error);
    res.json({ reply: getLocalChatReply(userText) });
  }
});


/* ---- MongoDB connection & sync ---- */
app.post("/api/db/connect", async (req, res) => {
  const { uri, dbName } = req.body || {};
  if (!uri) {
    return res.status(400).json({ success: false, error: "Please provide a MongoDB URI." });
  }

  try {
    const result = await connectToMongo(uri, dbName || mongoDbName);
    if (!result.ok) {
      return res.status(500).json({ success: false, error: result.error });
    }
    return res.json({ success: true, message: "MongoDB connected successfully." });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/api/db/status", async (_req, res) => {
  try {
    const connected = mongoClient && typeof mongoClient.topology?.isConnected === "function" && mongoClient.topology.isConnected();
    res.json({ connected: Boolean(connected), uriConfigured: Boolean(mongoUri), dbName: mongoDbName });
  } catch (error) {
    res.status(500).json({ connected: false, error: error.message });
  }
});

app.post("/api/db/sync", async (req, res) => {
  const { uri, dbName, state } = req.body || {};
  if (!state) {
    return res.status(400).json({ success: false, error: "No state payload provided." });
  }

  try {
    await saveStateToMongo(state, uri || mongoUri, dbName || mongoDbName);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/api/db/state", async (req, res) => {
  const uri = String(req.query.uri || "");
  const dbName = String(req.query.dbName || "");

  try {
    const state = await loadStateFromMongo(uri || mongoUri, dbName || mongoDbName);
    res.json({ success: true, state });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/* ---- PostgreSQL connection & sync ---- */
app.post("/api/pg/connect", async (req, res) => {
  const { connectionString, host, port, user, password, database } = req.body || {};
  const config = connectionString
    ? { connectionString }
    : { host, port: Number(port || 5432), user, password, database };

  try {
    const pool = await getPgPool(config);
    const result = await pool.query("SELECT NOW() as current_time");
    await initPgSchema(pool);
    res.json({ success: true, message: "PostgreSQL connected successfully.", time: result.rows[0].current_time });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/api/pg/status", async (_req, res) => {
  try {
    const pool = await getPgPool();
    const result = await pool.query("SELECT 1 as active");
    const isConnected = Boolean(result.rows && result.rows.length > 0);
    res.json({ connected: isConnected, configured: Boolean(process.env.DATABASE_URL || process.env.PGHOST) });
  } catch (error) {
    const errMsg = error.message || (error.errors && error.errors[0] ? error.errors[0].message : String(error));
    console.error("PostgreSQL status check failed:", errMsg);
    res.json({ connected: false, configured: Boolean(process.env.DATABASE_URL || process.env.PGHOST), error: errMsg });
  }
});


app.post("/api/pg/sync", async (req, res) => {
  const { config, state } = req.body || {};
  if (!state) {
    return res.status(400).json({ success: false, error: "No state payload provided." });
  }

  try {
    await saveStateToPg(state, config);
    res.json({ success: true, message: "State synchronized with PostgreSQL successfully." });
  } catch (error) {
    console.error("PostgreSQL sync error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/api/pg/state", async (req, res) => {
  try {
    const state = await loadStateFromPg();
    res.json({ success: true, state });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});


/* ---- SPA fallback ---- */
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "..", "index.html"));
});

app.listen(PORT, () => {
  console.log(`AgroClick server running on http://localhost:${PORT}`);
});
