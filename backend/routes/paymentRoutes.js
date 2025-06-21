// routes/paymentRoutes.js
const express = require("express");
const router = express.Router();
const { filterPelanggan } = require("./filterAuth.js");
const tripayController = require("../controllers/tripayController");

// Create Tripay transaction
router.post("/tripay/create", filterPelanggan, tripayController.createTripayTransaction);

// Tripay callback handler
router.post("/tripay-callback", tripayController.handleTripayCallback);

// List payment channels
router.get("/channels", tripayController.getTripayChannels);

module.exports = router;
