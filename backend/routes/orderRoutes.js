const express = require("express");
const router = express.Router();
const { getOrder, updateOrder } = require("../controllers/orderController.js");
const { filterPelanggan } = require("./filterAuth.js");

router.get("/", filterPelanggan, getOrder);
router.get("/:midtrans_id", filterPelanggan, getOrder);
router.post("/", updateOrder);
module.exports = router;
