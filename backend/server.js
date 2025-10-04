// server.js
const express = require("express");
const dotenv = require("dotenv");
dotenv.config();

// Pasang guard SEBELUM require routes (biar error path kelihatan jelas)
require("./utils/routeGuard");

const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const path = require("path");

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

// === routes persist auth (baru; tidak ganggu auth lama) ===
const authPersistRoutes = require("./routes/authPersistRoutes.js");

const app = express();
app.set("trust proxy", 1);

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
    if (!origin) return cb(null, true); // curl/postman tanpa Origin
    if (allowedOrigins.includes(origin)) return cb(null, true);
    return cb(null, false);
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

app.use(cookieParser()); // WAJIB sebelum routes (agar /auth/refresh bisa baca cookie)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

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
      console.log(`✅ SERVER BERJALAN DI PORT [${PORT}]`);
      console.log("CORS allowed origins:", allowedOrigins);
    });
  })
  .catch((err) => {
    console.error("Error initializing models: ", err);
  });
