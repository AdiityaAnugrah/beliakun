const express = require("express");
const router = express.Router();
const {
    addToWishlist,
    getWishlist,
    removeFromWishlist,
} = require("../controllers/wishlistController");
const { filterPelanggan } = require("./filterAuth");

router.get("/", filterPelanggan, getWishlist);
router.post("/", filterPelanggan, addToWishlist);
router.delete("/:productId", filterPelanggan, removeFromWishlist);

module.exports = router;
