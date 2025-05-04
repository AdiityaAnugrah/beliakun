const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const authRoutes = require("./routes/authRoutes.js");
const productRoutes = require("./routes/productRoutes.js");
const cartRoutes = require("./routes/cartRoutes.js");
const paymentRoutes = require("./routes/paymentRoutes.js");

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
app.use("/cart", cartRoutes);
app.use("/payment", paymentRoutes);

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
