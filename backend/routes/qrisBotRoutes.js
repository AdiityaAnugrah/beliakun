// backend/routes/qrisBotRoutes.js
const express = require("express");
const router = express.Router();

const { createQrisOrderBot } = require("../bots/qrisOrderBot");

const bot = createQrisOrderBot();

/**
 * Telegraf webhook callback:
 * - handler express function valid
 * - auto send response 200
 */
router.post("/webhook", bot.webhookCallback("/qris-bot/webhook"));

// optional health check
router.get("/health", (_req, res) => {
  res.json({ ok: true, mode: "webhook" });
});

module.exports = router;
