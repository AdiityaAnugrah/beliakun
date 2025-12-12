// routes/telegramRoutes.js
const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const fetch = require("node-fetch");

const { Order } = require("../models");
const { tgSendMessage, tgSendPhoto } = require("../utils/telegram");

const TRIPAY_API = "https://tripay.co.id/api";

const PRICE = {
  "1 jam": 5000,
  "1 minggu": 25000,
  "1 bulan": 75000,
};
const PICK = { "1": "1 jam", "2": "1 minggu", "3": "1 bulan" };

router.post("/webhook", async (req, res) => {
  try {
    const msg = req.body?.message;
    const chatId = msg?.chat?.id;
    const text = (msg?.text || "").trim();

    if (!chatId) return res.sendStatus(200);

    if (text === "/start") {
      await tgSendMessage(chatId, `Halo! 🤖\nKetik /buy untuk beli key.\n\nChat ID: ${chatId}`);
      return res.sendStatus(200);
    }

    if (text === "/buy") {
      await tgSendMessage(
        chatId,
        `🛒 PILIH DURASI KEY:\n` +
          `1) 1 jam — Rp${PRICE["1 jam"].toLocaleString("id-ID")}\n` +
          `2) 1 minggu — Rp${PRICE["1 minggu"].toLocaleString("id-ID")}\n` +
          `3) 1 bulan — Rp${PRICE["1 bulan"].toLocaleString("id-ID")}\n\n` +
          `Balas: 1 / 2 / 3`
      );
      return res.sendStatus(200);
    }

    const durasi = PICK[text];
    if (!durasi) return res.sendStatus(200);

    const amount = PRICE[durasi];
    const merchantRef = `TG-${chatId}-${Date.now()}`;
    const expiredTime = Math.floor(Date.now() / 1000) + 30 * 60; // 30 menit

    // signature create: merchant_code + merchant_ref + amount :contentReference[oaicite:2]{index=2}
    const signature = crypto
      .createHmac("sha256", process.env.TRIPAY_PRIVATE_KEY)
      .update(process.env.TRIPAY_MERCHANT_CODE + merchantRef + amount)
      .digest("hex");

    const payload = {
      method: "QRIS",
      merchant_ref: merchantRef,
      amount,
      customer_name: "Telegram Buyer",
      customer_email: "buyer@telegram.local",
      customer_phone: "000",
      order_items: [{ sku: "KEY", name: `Key ${durasi}`, price: amount, quantity: 1 }],
      callback_url: `${process.env.BASE_URL}/payment/tripay-callback`,
      return_url: `${process.env.FRONTEND_URL}/thank-you`,
      expired_time: expiredTime,
      signature,
    };

    const response = await fetch(`${TRIPAY_API}/transaction/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.TRIPAY_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    if (!result.success) {
      await tgSendMessage(chatId, `❌ Gagal bikin QRIS.\n${result.message || "Unknown error"}`);
      return res.sendStatus(200);
    }

    // simpan order bot
    await Order.create({
      email: "buyer@telegram.local",
      status: "pending",
      total_harga: amount,
      tripay_merchant_ref: merchantRef,
      tripay_reference: result.data.reference,
      data_tripay: result.data,

      telegram_chat_id: chatId,
      key_durasi: durasi,
    });

    const qr = result.data.qr_url || result.data.qr_string; // tergantung response
    const caption =
      `✅ Invoice dibuat\n` +
      `Durasi: ${durasi}\n` +
      `Total: Rp${amount.toLocaleString("id-ID")}\n` +
      `Ref: ${result.data.reference}\n\n` +
      `Silakan bayar QRIS. Setelah sukses, key dikirim otomatis.`;

    if (qr) await tgSendPhoto(chatId, qr, caption);
    else await tgSendMessage(chatId, caption + `\n\n(Info: QR tidak ada di response)`);

    return res.sendStatus(200);
  } catch (e) {
    console.error("TG webhook error:", e);
    return res.sendStatus(200);
  }
});

module.exports = router;
