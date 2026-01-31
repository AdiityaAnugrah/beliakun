// backend/routes/qrisBotRoutes.js
const express = require("express");
const router = express.Router();

const { createQrisOrderBot } = require("../bots/qrisOrderBot");

const bot = createQrisOrderBot();

// Telegram akan POST ke: /qris-bot/webhook
router.post("/webhook", bot.webhookCallback("/qris-bot/webhook"));

// cek cepat
router.get("/health", (_req, res) => res.json({ ok: true, mode: "webhook" }));

module.exports = router;
