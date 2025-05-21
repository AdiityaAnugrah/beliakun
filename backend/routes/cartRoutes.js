const express = require("express");
const router = express.Router();
const {
    addToCart,
    getCart,
    updateQuantity,
    deleteCartItem,
} = require("../controllers/cartController.js");
const { filterPelanggan } = require("./filterAuth.js");

router.post("/", filterPelanggan, addToCart);
router.get("/", filterPelanggan, getCart);
router.patch("/", filterPelanggan, updateQuantity);
router.delete("/:productId", filterPelanggan, deleteCartItem);
module.exports = router;
