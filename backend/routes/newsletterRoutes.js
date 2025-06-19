const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");
const { subscribeNewsletter } = require("../controllers/newsletterController");

// 1 request per 15 detik per IP (bisa diubah)
const limiter = rateLimit({
  windowMs: 15 * 1000, // 15 seconds
  max: 1,
  message: {
    status: "error",
    message: "Too many requests, please wait a moment.",
  },
});

router.post("/", limiter, subscribeNewsletter);

module.exports = router;
