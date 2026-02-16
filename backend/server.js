// backend/server.js
const express = require("express");
const dotenv = require("dotenv");
const path = require("path");

// ✅ Paksa baca .env dari folder backend, dan override env lama (PM2 kadang nyangkut)
dotenv.config({ path: path.join(__dirname, ".env"), override: true });

// Pasang guard SEBELUM require routes (biar error path kelihatan jelas)
require("./utils/routeGuard");

const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

// ✅ SECURITY: Helmet.js for security headers
const helmet = require("helmet");

// ✅ SECURITY: Logging infrastructure
const logger = require("./config/logger");
const morganMiddleware = require("./middleware/morganLogger");

// === routes eksisting ===
const authRoutes = require("./routes/authRoutes.js");
const productRoutes = require("./routes/productRoutes.js");
const cartRoutes = require("./routes/cartRoutes.js");
const wishlistRoutes = require("./routes/wishlistRoutes");
const paymentRoutes = require("./routes/paymentRoutes.js");
const keyRoutes = require("./routes/keyRoutes.js");
const orderRoutes = require("./routes/orderRoutes.js");
const tokenAdsRoutes = require("./routes/tokenAdsRoutes.js");
const chatgptRoutes = require("./routes/chatgptRoutes.js");
const geminiRoutes = require("./routes/geminiRoutes.js");
const categoryRoutes = require("./routes/categoryRoutes.js");
const bennerHomeRoutes = require("./routes/bennerHomeRoutes.js");
const newsletterRoutes = require("./routes/newsletterRoutes.js");
const financeRoutes = require("./routes/financeRoutes.js");
const telegramRoutes = require("./routes/telegramRoutes.js");

// === routes bot untuk robux ===
const qrisBotRoutes = require("./routes/qrisBotRoutes.js");


// === routes persist auth (baru; tidak ganggu auth lama) ===
const authPersistRoutes = require("./routes/authPersistRoutes.js");

const app = express();
app.set("trust proxy", 1);

// ✅ SECURITY: Apply Helmet.js security headers FIRST
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false, // Allow embedding
}));

/* ===================== CORS aman utk credentials ===================== */
const allowedOrigins = (
  process.env.CORS_ORIGINS ||
  process.env.FRONTEND_URL ||
  "http://localhost:5173"
)
  .split(",")
  .map((s) => s.trim());

const corsOptions = {
  origin(origin, cb) {
    // ✅ SECURITY FIX: Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return cb(null, true);
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      return cb(null, true);
    }
    
    // ✅ SECURITY: Proper error response for unauthorized origins
    return cb(new Error(`Origin ${origin} not allowed by CORS policy`), false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Pakai CORS utama
app.use(cors(corsOptions));

// ❗ FIX: JANGAN pakai app.options("*", ...)
// path-to-regexp pada stack kamu menolak "*"
// Ganti ke RegExp agar lolos parser:
app.options(/.*/, cors(corsOptions)); // preflight untuk semua route
/* ==================================================================== */

// ✅ SECURITY: HTTP request logging
app.use(morganMiddleware);

app.use(cookieParser()); // WAJIB sebelum routes (agar /auth/refresh bisa baca cookie)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// route bot robux
app.use("/qris-bot", qrisBotRoutes);

app.get("/", (_req, res) => res.send("|| API UDAH JALAN TOT ||"));

/* ==== persist auth DULUAN di /auth ==== */
app.use("/auth", authPersistRoutes);

/* ==== routes eksisting ==== */
app.use("/auth", authRoutes);
app.use("/product", productRoutes);
app.use("/category", categoryRoutes);
app.use("/cart", cartRoutes);
app.use("/wishlist", wishlistRoutes);
app.use("/payment", paymentRoutes);
app.use("/order", orderRoutes);
app.use("/key", keyRoutes);
app.use("/token", tokenAdsRoutes);
app.use("/api", chatgptRoutes);
app.use("/api", geminiRoutes);
app.use("/bennerhome", bennerHomeRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/finance", financeRoutes);
app.use("/telegram", telegramRoutes);

// Redirect Tripay
app.get("/thank-you", (req, res) => {
  const { tripay_reference, tripay_merchant_ref } = req.query;
  const target = `https://beliakun.com/thank-you?tripay_reference=${encodeURIComponent(
    tripay_reference || ""
  )}&tripay_merchant_ref=${encodeURIComponent(tripay_merchant_ref || "")}`;
  return res.redirect(target);
});

// Init models & start
const { initModels } = require("./models/index.js");
const PORT = process.env.PORT || 4000;

initModels()
  .then(() => {
    app.listen(PORT, "0.0.0.0", () => {
      logger.info(`✅ SERVER BERJALAN DI PORT [${PORT}]`);
      logger.info(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🔗 CORS allowed origins: ${allowedOrigins.join(', ')}`);
      logger.info(`💾 Database: ${process.env.DB_NAME} @ ${process.env.DB_HOST}`);
    });
  })
  .catch((err) => {
    logger.error("❌ Error initializing models:", err);
    logger.logError(err);
    process.exit(1);
  });

// Global error handlers
process.on('uncaughtException', (err) => {
  logger.error('💥 Uncaught Exception:', err);
  logger.logError(err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
