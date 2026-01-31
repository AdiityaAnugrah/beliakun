// backend/routes/qrisBotRoutes.js
const express = require("express");
const router = express.Router();

const { createQrisOrderBot } = require("../bots/qrisOrderBot");
const bot = createQrisOrderBot();

/**
 * Penting:
 * - Karena router ini di-mount di app.use("/qris-bot", router)
 * - Maka path di router harus "/webhook"
 * - Dan string webhookCallback harus path publik full: "/qris-bot/webhook"
 */
router.post("/webhook", bot.webhookCallback("/qris-bot/webhook"));

router.get("/health", (_req, res) => {
  res.json({ ok: true, mode: "webhook", hasWebhook: true });
});

module.exports = router;
