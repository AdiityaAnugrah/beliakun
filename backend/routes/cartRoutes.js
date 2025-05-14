const express = require("express");
const router = express.Router();
const { addToCart, getCart } = require("../controllers/cartController.js");
const { filterPelanggan } = require("./filterAuth.js");

router.post("/", filterPelanggan, addToCart);
router.get("/", filterPelanggan, getCart);
module.exports = router;
