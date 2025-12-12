// utils/telegram.js
const fetch = require("node-fetch");

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

function mustToken() {
  if (!BOT_TOKEN) throw new Error("TELEGRAM_BOT_TOKEN belum di set");
}

async function tgSendMessage(chat_id, text) {
  mustToken();
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id, text }),
  });

  return res.json();
}

async function tgSendPhoto(chat_id, photo, caption) {
  mustToken();
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id, photo, caption }),
  });

  return res.json();
}

module.exports = { tgSendMessage, tgSendPhoto };
