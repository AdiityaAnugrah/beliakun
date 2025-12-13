// routes/telegramRoutes.js
const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const fetch = require("node-fetch");

const { Order } = require("../models");

const TRIPAY_API = "https://tripay.co.id/api";

// ====== Harga & Pilihan ======
const PRICE = {
  "1 jam": 5000,
  "1 minggu": 25000,
  "1 bulan": 75000,
};

const PICK_TEXT = {
  "1": "1 jam",
  "2": "1 minggu",
  "3": "1 bulan",
};

// ====== Helper: format rupiah ======
const rupiah = (n) => `Rp${Number(n || 0).toLocaleString("id-ID")}`;

// ====== Helper: validasi secret header Telegram ======
function verifyTelegramSecret(req) {
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!expected) return true;
  const got = req.get("x-telegram-bot-api-secret-token");
  return got === expected;
}

// ====== Telegram API helper (biar bisa tombol / UI modern tanpa ubah utils lain) ======
const TG_API = () => `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;

async function tgSendMessageEx(chatId, text, opts = {}) {
  const payload = {
    chat_id: chatId,
    text,
    parse_mode: "Markdown",
    disable_web_page_preview: true,
    ...opts,
  };

  await fetch(`${TG_API()}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

async function tgSendPhotoEx(chatId, photo, caption, opts = {}) {
  const payload = {
    chat_id: chatId,
    photo,
    caption,
    parse_mode: "Markdown",
    ...opts,
  };

  await fetch(`${TG_API()}/sendPhoto`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

// ====== UI Blocks ======
function welcomeText() {
  return (
    "👋 *Halo! Selamat datang di BELIAKUN*\n\n" +
    "Di sini kamu bisa beli *Key* dengan cepat:\n" +
    "✅ pilih durasi\n" +
    "✅ bayar via QRIS\n" +
    "✅ setelah sukses, key dikirim otomatis di chat ini\n\n" +
    "Klik tombol di bawah ya 👇"
  );
}

function helpText() {
  return (
    "🧠 *Bantuan (super gampang)*\n\n" +
    "1) Klik *Beli Key*\n" +
    "2) Pilih durasi\n" +
    "3) Bot kirim QRIS\n" +
    "4) Selesaikan pembayaran\n" +
    "5) *Key dikirim otomatis* ✅\n\n" +
    "Kalau kamu lebih suka ketik manual:\n" +
    "• /buy → lalu balas *1 / 2 / 3*"
  );
}

function buyMenuText() {
  return (
    "🛒 *Beli Key*\n\n" +
    "Pilih durasi yang kamu mau:\n\n" +
    `⏱ 1 jam  — *${rupiah(PRICE["1 jam"])}*\n` +
    `📅 1 minggu — *${rupiah(PRICE["1 minggu"])}*\n` +
    `🗓 1 bulan — *${rupiah(PRICE["1 bulan"])}*\n\n` +
    "Klik tombol durasi di bawah 👇"
  );
}

function keyboardMain() {
  return {
    inline_keyboard: [
      [{ text: "🛒 Beli Key", callback_data: "BUY" }],
      [{ text: "ℹ️ Bantuan", callback_data: "HELP" }],
    ],
  };
}

function keyboardBuy() {
  return {
    inline_keyboard: [
      [
        { text: "⏱ 1 Jam", callback_data: "DUR:1 jam" },
        { text: "📅 1 Minggu", callback_data: "DUR:1 minggu" },
      ],
      [{ text: "🗓 1 Bulan", callback_data: "DUR:1 bulan" }],
      [{ text: "⬅️ Kembali", callback_data: "BACK" }],
    ],
  };
}

function keyboardBackToMain() {
  return {
    inline_keyboard: [[{ text: "⬅️ Menu Utama", callback_data: "BACK" }]],
  };
}

function keyboardPay(checkoutUrl) {
  const rows = [];
  if (checkoutUrl) {
    rows.push([{ text: "🔗 Buka Link Bayar", url: checkoutUrl }]);
  }
  rows.push([{ text: "🛒 Beli Lagi", callback_data: "BUY" }]);
  rows.push([{ text: "ℹ️ Bantuan", callback_data: "HELP" }]);
  return { inline_keyboard: rows };
}

// ====== parse update ======
function getIncoming(reqBody) {
  // message biasa
  if (reqBody?.message) {
    return {
      type: "message",
      chatId: reqBody.message?.chat?.id,
      text: (reqBody.message?.text || "").trim(),
    };
  }

  // tombol (callback_query)
  if (reqBody?.callback_query) {
    return {
      type: "callback",
      chatId: reqBody.callback_query?.message?.chat?.id,
      data: (reqBody.callback_query?.data || "").trim(),
      callbackQueryId: reqBody.callback_query?.id,
    };
  }

  // edited message (opsional)
  if (reqBody?.edited_message) {
    return {
      type: "message",
      chatId: reqBody.edited_message?.chat?.id,
      text: (reqBody.edited_message?.text || "").trim(),
    };
  }

  return { type: "unknown" };
}

async function answerCallback(callbackQueryId) {
  if (!callbackQueryId) return;
  await fetch(`${TG_API()}/answerCallbackQuery`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ callback_query_id: callbackQueryId }),
  });
}

// ====== create tripay invoice ======
async function createTripayInvoice({ chatId, durasi }) {
  const amount = PRICE[durasi];
  const merchantRef = `TG-${chatId}-${Date.now()}`;
  const expiredTime = Math.floor(Date.now() / 1000) + 30 * 60; // 30 menit

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

  const resp = await fetch(`${TRIPAY_API}/transaction/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.TRIPAY_API_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  const result = await resp.json();
  return { result, amount, merchantRef, expiredTime };
}

// ====== webhook ======
router.post("/webhook", async (req, res) => {
  // balas cepat ke Telegram
  try {
    if (!verifyTelegramSecret(req)) return res.sendStatus(401);

    const incoming = getIncoming(req.body);
    const chatId = incoming.chatId;

    if (!chatId) return res.sendStatus(200);

    // biar tombol ga loading muter
    if (incoming.type === "callback") {
      await answerCallback(incoming.callbackQueryId);
    }

    // ====== HANDLE CALLBACK BUTTON ======
    if (incoming.type === "callback") {
      const data = incoming.data;

      if (data === "BACK") {
        await tgSendMessageEx(chatId, welcomeText(), { reply_markup: keyboardMain() });
        return res.sendStatus(200);
      }

      if (data === "HELP") {
        await tgSendMessageEx(chatId, helpText(), { reply_markup: keyboardBackToMain() });
        return res.sendStatus(200);
      }

      if (data === "BUY") {
        await tgSendMessageEx(chatId, buyMenuText(), { reply_markup: keyboardBuy() });
        return res.sendStatus(200);
      }

      if (data.startsWith("DUR:")) {
        const durasi = data.replace("DUR:", "").trim();
        if (!PRICE[durasi]) {
          await tgSendMessageEx(chatId, "❌ Durasi tidak valid. Klik *Beli Key* lagi ya.", {
            reply_markup: keyboardMain(),
          });
          return res.sendStatus(200);
        }

        await tgSendMessageEx(
          chatId,
          "⏳ *Sedang membuat invoice...*\n" +
            "Biasanya cepat kok. Jangan kabur dulu ya 😄"
        );

        const { result, amount, merchantRef } = await createTripayInvoice({ chatId, durasi });

        if (!result?.success) {
          await tgSendMessageEx(
            chatId,
            "❌ *Gagal membuat invoice.*\n" +
              `Alasan: ${result?.message || "Unknown error"}\n\n` +
              "Klik *Beli Key* untuk coba lagi.",
            { reply_markup: keyboardMain() }
          );
          return res.sendStatus(200);
        }

        // simpan order
        await Order.create({
        // isi legacy field biar DB yang strict gak rewel
        data_mid: JSON.stringify({ source: "telegram", note: "no midtrans" }),
        midtrans_id: "-", // WAJIB: jangan null kalau DB kamu NOT NULL

        email: "buyer@telegram.local",
        status: "pending",
        total_harga: amount,

        tripay_merchant_ref: merchantRef,
        tripay_reference: result.data.reference,
        data_tripay: result.data,

        telegram_chat_id: chatId,
        key_durasi: durasi,
        });


        const qrUrl = result.data.qr_url || result.data.qr_string;
        const checkoutUrl = result.data.checkout_url || result.data.pay_url;

        const caption =
          "✅ *Invoice Berhasil Dibuat!*\n\n" +
          `📦 Durasi: *${durasi}*\n` +
          `💳 Total: *${rupiah(amount)}*\n` +
          `🧾 Ref: *${result.data.reference}*\n` +
          "⏰ Batas bayar: *30 menit*\n\n" +
          "*Cara bayar:*\n" +
          "1) Scan QRIS (atau klik tombol link bayar)\n" +
          "2) Selesaikan pembayaran\n" +
          "3) Setelah sukses → *key dikirim otomatis di chat ini* ✅\n\n" +
          "Kalau sudah bayar, tinggal tunggu… botnya bukan mantan, pasti balik 🫡";

        if (qrUrl) {
          await tgSendPhotoEx(chatId, qrUrl, caption, {
            reply_markup: keyboardPay(checkoutUrl),
          });
        } else {
          await tgSendMessageEx(chatId, caption + (checkoutUrl ? `\n\n🔗 ${checkoutUrl}` : ""), {
            reply_markup: keyboardPay(checkoutUrl),
          });
        }

        return res.sendStatus(200);
      }

      // fallback callback
      await tgSendMessageEx(chatId, "Aku bingung tombol yang kamu klik 😅 Balik ke menu ya.", {
        reply_markup: keyboardMain(),
      });
      return res.sendStatus(200);
    }

    // ====== HANDLE TEXT MESSAGE ======
    const text = (incoming.text || "").trim();

    // commands
    if (text === "/start") {
      await tgSendMessageEx(chatId, welcomeText(), { reply_markup: keyboardMain() });
      return res.sendStatus(200);
    }

    if (text === "/help") {
      await tgSendMessageEx(chatId, helpText(), { reply_markup: keyboardBackToMain() });
      return res.sendStatus(200);
    }

    if (text === "/buy") {
      await tgSendMessageEx(chatId, buyMenuText(), { reply_markup: keyboardBuy() });
      return res.sendStatus(200);
    }

    // support manual angka 1/2/3
    const durasi = PICK_TEXT[text];
    if (durasi) {
      await tgSendMessageEx(
        chatId,
        "⏳ *Sedang membuat invoice...*\n" +
          "Bentar ya. Ini bukan loading ML, ini beneran sebentar 😄"
      );

      const { result, amount, merchantRef } = await createTripayInvoice({ chatId, durasi });

      if (!result?.success) {
        await tgSendMessageEx(
          chatId,
          "❌ *Gagal membuat invoice.*\n" +
            `Alasan: ${result?.message || "Unknown error"}\n\n` +
            "Klik *Beli Key* untuk coba lagi.",
          { reply_markup: keyboardMain() }
        );
        return res.sendStatus(200);
      }

      await Order.create({
        // isi legacy field biar DB yang strict gak rewel
        data_mid: JSON.stringify({ source: "telegram", note: "no midtrans" }),
        midtrans_id: "-", // WAJIB: jangan null kalau DB kamu NOT NULL

        email: "buyer@telegram.local",
        status: "pending",
        total_harga: amount,

        tripay_merchant_ref: merchantRef,
        tripay_reference: result.data.reference,
        data_tripay: result.data,

        telegram_chat_id: chatId,
        key_durasi: durasi,
    });


      const qrUrl = result.data.qr_url || result.data.qr_string;
      const checkoutUrl = result.data.checkout_url || result.data.pay_url;

      const caption =
        "✅ *Invoice Berhasil Dibuat!*\n\n" +
        `📦 Durasi: *${durasi}*\n` +
        `💳 Total: *${rupiah(amount)}*\n` +
        `🧾 Ref: *${result.data.reference}*\n` +
        "⏰ Batas bayar: *30 menit*\n\n" +
        "*Cara bayar:*\n" +
        "1) Scan QRIS (atau klik tombol link bayar)\n" +
        "2) Selesaikan pembayaran\n" +
        "3) Setelah sukses → *key dikirim otomatis di chat ini* ✅";

      if (qrUrl) {
        await tgSendPhotoEx(chatId, qrUrl, caption, { reply_markup: keyboardPay(checkoutUrl) });
      } else {
        await tgSendMessageEx(chatId, caption + (checkoutUrl ? `\n\n🔗 ${checkoutUrl}` : ""), {
          reply_markup: keyboardPay(checkoutUrl),
        });
      }

      return res.sendStatus(200);
    }

    // fallback message biar pembeli ga bingung
    await tgSendMessageEx(
      chatId,
      "Aku belum paham 😅\n\n" +
        "✅ Untuk beli key, klik tombol *Beli Key*.\n" +
        "ℹ️ Kalau butuh panduan, klik *Bantuan*.",
      { reply_markup: keyboardMain() }
    );

    return res.sendStatus(200);
  } catch (err) {
    console.error("TG webhook error:", err);
    return res.sendStatus(200);
  }
});

module.exports = router;
