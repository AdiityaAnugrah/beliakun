const express = require("express");
const router = express.Router();
const { checkoutManual } = require("../controllers/checkoutController.js");
const { filterPelanggan } = require("./filterAuth.js");

router.post("/manual", filterPelanggan, checkoutManual);

module.exports = router;
