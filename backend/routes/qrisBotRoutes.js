// backend/routes/qrisBotRoutes.js
const express = require("express");
const router = express.Router();

const { createQrisOrderBot } = require("../bots/qrisOrderBot");
const bot = createQrisOrderBot();

router.get("/health", (_req, res) => {
  res.json({ ok: true, mode: "rbxcave-webhook" });
});

// ✅ validasi secret token dari Telegram (opsional tapi bagus)
router.use((req, res, next) => {
  if (req.path !== "/webhook") return next();

  const expected = process.env.TELEGRAM_WEBHOOK_SECRET || "";
  const got = req.get("x-telegram-bot-api-secret-token") || "";

  if (expected && got !== expected) {
    console.log("[qris-bot] blocked webhook (bad secret):", got);
    return res.status(401).send("unauthorized");
  }

  next();
});

// ✅ PENTING: karena router di-mount pada /qris-bot,
// maka path untuk telegraf harus "/webhook"
router.post("/webhook", bot.webhookCallback("/webhook"));

module.exports = router;
