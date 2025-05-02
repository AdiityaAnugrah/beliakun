const express = require("express");
const router = express.Router();
const { addToCart, getCart } = require("../controllers/cartController.js");
const { filterPelanggan } = require("./filterAuth.js");

router.post("/cart", filterPelanggan, addToCart);
router.get("/cart", filterPelanggan, getCart);
module.exports = router;
