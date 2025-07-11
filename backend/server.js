const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
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

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
    res.send("|| API UDAH JALAN TOT ||");
});

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
// Redirect dari Tripay ke frontend React
app.get("/thank-you", (req, res) => {
  const { tripay_reference, tripay_merchant_ref } = req.query;

  const target = `https://beliakun.com/thank-you?tripay_reference=${encodeURIComponent(
    tripay_reference || ""
  )}&tripay_merchant_ref=${encodeURIComponent(tripay_merchant_ref || "")}`;

  return res.redirect(target);
});


// Menginisialisasi model
const { initModels } = require("./models/index.js");

const PORT = process.env.PORT || 4000;
initModels()
    .then(() => {
        app.listen(PORT, "0.0.0.0", () => {
            console.log(`✅ SERVER BERJALAN DI PORT [${PORT}]`);
        });
    })
    .catch((err) => {
        console.error("Error initializing models: ", err);
    });
