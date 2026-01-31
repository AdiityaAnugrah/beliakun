// backend/routes/qrisBotRoutes.js
const express = require("express");
const router = express.Router();

const { createQrisOrderBot } = require("../bots/qrisOrderBot");
const bot = createQrisOrderBot();

console.log("[qris-bot] typeof bot.webhookCallback =", typeof bot.webhookCallback);

router.get("/health", (_req, res) => {
  res.json({ ok: true, mode: "webhook" });
});

// ✅ log dulu, baru serahkan ke telegraf
router.post(
  "/webhook",
  (req, _res, next) => {
    const u = req.body || {};
    const msg = u.message?.text || u.edited_message?.text || u.callback_query?.data || "";
    const chatId = u.message?.chat?.id || u.callback_query?.message?.chat?.id || null;
    console.log("[qris-bot] update IN:", {
      update_id: u.update_id,
      chatId,
      msg,
      hasMessage: !!u.message,
      hasCallback: !!u.callback_query,
    });
    next();
  },
  bot.webhookCallback("/qris-bot/webhook")
);

module.exports = router;
