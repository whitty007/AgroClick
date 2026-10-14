# AgroClick 🌾 — Direct Farm-to-Home Digital Marketplace

> **Empowering Tamil Nadu Farmers by Eliminating Middlemen & Delivering Fresh Produce Directly to Homes.**

---

## 💡 The Project Idea & Vision

In traditional agricultural supply chains across Tamil Nadu, **middlemen and commission agents take up to 40%–60% of crop profits**, leaving hardworking farmers with low returns while consumers pay inflated prices for days-old produce.

**AgroClick** solves this core problem by creating a **direct farmer-to-consumer digital marketplace**:

1. **Direct Farmer Selling**: Local farmers complete a 1-time identity check (Aadhaar & Bank KYC), launch their digital farm shop, list freshly harvested crops, and set fair prices.
2. **Location-Based Discovery**: Customers select their town/district in Tamil Nadu (Chennai, Coimbatore, Madurai, Trichy, Salem, Thanjavur, Ooty, etc.) to view nearby farm shops sorted in real-time by physical proximity using the **Haversine geospatial formula**.
3. **Zero-Middlemen Payments**: Direct customer payments are processed via **Razorpay** (UPI, credit/debit cards, netbanking) straight to the farmer's bank account.
4. **Free & Premium Seller Plans**:
   - **Free Plan**: Allows 1 free farm shop per registered seller.
   - **Premium Plan (₹499/yr)**: Unlocks unlimited farm shops, #1 search placement in district listings, a **👑 Gold Verified Farmer Badge**, and an **Enhanced Metallic Gold VIP Theme**.

---

## 🚀 Key Features

- 🌾 **Direct Farmer-to-Home Ecommerce**: No commission agents or middlemen.
- 📍 **Geospatial Distance Sorting**: Haversine distance calculator across 40+ Tamil Nadu cities & towns.
- 👑 **Free vs. Premium Seller Membership**: Free shop limit enforcement + Premium multi-shop creation.
- 🤖 **AI Assistant Chatbot**: Powered by **Google Gemini API** (`gemini-3.8-flash`), OpenAI, or Groq with full Tamil Nadu agricultural knowledge & Tamil script support.
- 🗄️ **Supabase PostgreSQL Database**: Persistent PostgreSQL relational storage (`users`, `shops`, `shop_items`, `shop_reviews`, `orders`, `app_state` JSONB).
- 🌐 **Bilingual (English & Tamil)**: Instant i18n language toggle across all pages.
- 🎨 **Tamil Nadu Cultural Aesthetic System**: Design tokens inspired by terracotta soil (`#B5532C`), paddy fields (`#3F6B35`), turmeric gold (`#E0A526`), and rice husk cream (`#FAF7F2`).

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend UI** | HTML5, Vanilla CSS3 (Custom Design System tokens & glassmorphism), Vanilla JavaScript (ES Modules) |
| **Backend Server** | Node.js, Express.js |
| **Database** | Supabase PostgreSQL (`pg` connection pool with SSL auto-bootstrap) |
| **AI Integration** | Google Gemini API (`generativelanguage.googleapis.com`), OpenAI API, Groq API |
| **Payments** | Razorpay Payment Gateway |
| **Internationalization** | Custom i18n engine (`js/i18n.js`) with English & Tamil dictionary |

---

## 📂 Project Architecture

```
agroclick/
├── index.html              Hero page, location picker, featured shops
├── shops.html              Browse all farm shops sorted by distance
├── shop-detail.html        Single shop produce items, reviews, add-to-cart
├── become-shop-owner.html  Farmer KYC (Aadhaar/Bank) & shop registration
├── manage-shop.html        Seller dashboard: manage items, stock, orders, reviews
├── premium.html            Premium Seller Membership landing page
├── cart.html               Cart grouped by shop & Razorpay checkout
├── my-orders.html          Customer order history & status tracking
├── login.html              Mobile OTP login
├── schema.sql              PostgreSQL DDL database schema definition
├── css/
│   └── style.css           Full design system, tokens, responsive layout, animations & gold theme
├── js/
│   ├── server.js           Express server, Supabase PG pooler sync, AI Chatbot API
│   ├── data.js             Data access layer, TN places, Haversine formula, PG state sync
│   ├── i18n.js             Bilingual English / Tamil translation engine
│   ├── common.js           Navbar, footer, toasts, auth guards, premium theme loader
│   ├── auth.js             Mobile OTP authentication flow
│   ├── kyc.js              Aadhaar & bank KYC verification, shop creation & premium modal
│   ├── shop.js             Seller dashboard management logic
│   ├── shops-list.js       Location-based shop sorting logic
│   ├── shop-detail.js      Shop items & review submission logic
│   ├── cart.js             Cart management & Razorpay checkout integration
│   └── chatbot.js          Floating AI chatbot drawer widget & typing animation
├── .env                    Environment configuration (Database URL, AI keys)
├── package.json            Dependencies (`express`, `pg`, `dotenv`)
└── README.md               Project documentation
```

---

## ⚡ Quick Start & Installation

### 1. Clone & Install Dependencies

```powershell
cd c:\Projects\agroclick
npm install
```

### 2. Configure Environment Variables (`.env`)

Copy `.env.example` to `.env` and set your credentials:

```env
PORT=3000
OTP_DEMO_MODE=true

# Supabase PostgreSQL Connection
DATABASE_URL=postgresql://postgres.ref:Password@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres

# AI Chatbot Key (Google Gemini Recommended - Free)
GEMINI_API_KEY=your_gemini_api_key
```

Copy the PostgreSQL connection string from your Supabase project's **Connect** dialog and paste it as the `DATABASE_URL` value in `.env`. Use the pooler connection string if your network requires it, and URL-encode any special characters in the password. `DATABASE_URL` takes precedence over the individual `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, and `PGDATABASE` settings.

### 3. Run the Application

```powershell
npm run dev
```

Open **`http://localhost:3000`** in your browser!

Run the focused product-search tests with:

```powershell
npm test
```

## Smart product search, AI, and voice

- The Shops page searches the same shop/item records used by the buyer flow. Search text is debounced by 300 ms; filters cover product name, farmer-entered category and town, price range, and recorded available kilograms.
- Unavailable listings are excluded. A requested minimum quantity requires a recorded quantity, so older listings with no stock amount are not presented as satisfying that requirement.
- “Best match” uses a deterministic weighted score: product name 50%, category 20%, location 15%, price suitability 10%, and quantity suitability 5%. With a price range, price suitability is closeness to its midpoint; with only a maximum it favors lower prices within budget. A minimum-quantity filter is hard, with higher recorded stock receiving a bounded relevance score. Missing factor values score zero. Hard filters run before scoring, and ties retain marketplace order. Buyers can alternatively sort by price, name, or recorded quantity. This is not machine learning.
- Sellers can optionally enter category and available quantity when adding an item. Existing stock status continues to work. PostgreSQL schema bootstrap adds the corresponding nullable fields to existing databases; apply `schema.sql` manually if preferred.
- The chatbot uses the existing server-side provider integrations (`GEMINI_API_KEY`, `OPENAI_API_KEY`, or `GROQ_API_KEY`). API keys remain in server environment variables and are never sent to browser code. The browser retrieves up to five matching available listings from AgroClick's current data and sends only those details with the question.
- When no provider is configured or all configured providers fail, the assistant clearly indicates demo mode and uses rule-based help plus the supplied listing context. It does not invent product prices, available stock, or bulk mandi sales. Bulk mandi sales do not currently have a dedicated marketplace workflow.
- The chatbot language selector changes the site's existing English/Tamil setting. Microphone input uses the browser Web Speech API where implemented by the browser, requires microphone permission and a secure context (localhost or HTTPS), and leaves recognized text editable before sending. This API is not supported consistently across browsers. Text chat remains available when voice input is unsupported.
- Spoken replies are opt-in through each response's speaker control. Speech synthesis and Tamil voice availability vary by device; missing Tamil voices leave the response available as text and display an explanation.
- The floating voice manager is available on every page. It uses Web Speech recognition alternatives and, where supported, product-name phrase hints; Tamil combining marks are preserved. With `GEMINI_API_KEY`, recognized commands are sent to the server for structured intent interpretation, along with available listing names only. API keys and the voice password are not returned to the browser. Without Gemini, common commands use local matching.
- Voice commands cover page navigation, product search and ordering, cart removal and checkout, order history, language and town changes, sign-out, shop stock updates, and marking a uniquely matched seller order delivered. A purchase requires a spoken yes/no confirmation and `VOICE_CONFIRM_PASSWORD`; verification happens on the server. The demo still uses browser storage and does not charge money unless a real payment integration is configured.
- Web Speech recognition is provided by the browser and its accuracy depends on the selected English/Tamil language, microphone, network, and environment. The user must tap the microphone to start each new voice session; browsers generally do not preserve microphone permission across page navigation. Login OTP entry and any external payment-provider screen still require their normal secure interaction.

For AI, set at least one server-side provider key in `.env` and restart the server. Without a key, product search, deterministic matching, rule-based chatbot responses, and browser speech features where supported continue to work. The app's current demo data is explicitly labeled as sample data; live listings continue to depend on the application's existing browser storage/PostgreSQL setup.

---

## 📄 Database Setup (`schema.sql`)

AgroClick uses PostgreSQL (Supabase). The schema auto-bootstraps on server start, or can be executed manually:

```bash
psql -U postgres -d postgres -f schema.sql
```

Relational Tables:
- `users`: Seller/customer accounts, KYC info, `is_premium` status.
- `shops`: Farm shop details, owner mobile, location.
- `shop_items`: Crops, produce names, prices, images, stock status.
- `shop_reviews`: Customer ratings and comments.
- `orders`: Order totals, payment method, delivery status.
- `app_state`: Full JSONB snapshot sync.

---

## 📜 License

All rights reserved © AgroClick. Built for Tamil Nadu Farmers.
