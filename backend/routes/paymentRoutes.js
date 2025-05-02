const express = require("express");
const router = express.Router();
const {
    createMidtransTransaction,
} = require("../controllers/paymentController.js");

router.post("/checkout", createMidtransTransaction);

module.exports = router;
