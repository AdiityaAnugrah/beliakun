const express = require("express");
const router = express.Router();
const { getOrder, updateOrder } = require("../controllers/orderController.js");
const { filterPelanggan } = require("./filterAuth.js");
const { getOrderHistory } = require("../controllers/orderController.js");

router.get("/", filterPelanggan, getOrder);
router.get("/history", filterPelanggan, getOrderHistory);
router.get("/:midtrans_id", filterPelanggan, getOrder);
router.post("/", updateOrder);
module.exports = router;
