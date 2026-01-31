// backend/routes/qrisBotRoutes.js
const express = require("express");
const router = express.Router();

const { createQrisOrderBot } = require("../bots/qrisOrderBot");
const bot = createQrisOrderBot();

console.log("[qris-bot] typeof bot.webhookCallback =", typeof bot.webhookCallback);

router.get("/health", (_req, res) => {
  res.json({ ok: true, mode: "webhook", hasWebhook: true });
});

// ✅ handler asli untuk Telegram webhook
router.post("/webhook", bot.webhookCallback("/qris-bot/webhook"));

module.exports = router;
