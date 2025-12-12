// routes/telegramRoutes.js
const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const fetch = require("node-fetch");

const { Order } = require("../models");
const { tgSendMessage, tgSendPhoto } = require("../utils/telegram");

const TRIPAY_API = "https://tripay.co.id/api";

// ====== Harga & Pilihan ======
const PRICE = {
  "1 jam": 5000,
  "1 minggu": 25000,
  "1 bulan": 75000,
};

const PICK = {
  "1": "1 jam",
  "2": "1 minggu",
  "3": "1 bulan",
};

// ====== Helper: format rupiah ======
const rupiah = (n) => `Rp${Number(n || 0).toLocaleString("id-ID")}`;

// ====== Helper: validasi secret header Telegram ======
function verifyTelegramSecret(req) {
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!expected) return true; // kalau belum diisi di .env, skip
  const got = req.get("x-telegram-bot-api-secret-token");
  return got === expected;
}

// ====== Helper: pesan menu pembelian ======
function menuText() {
  return (
    "🛒 **Beli Key**\n\n" +
    "Pilih durasi (balas angka):\n" +
    `1) 1 jam — ${rupiah(PRICE["1 jam"])}\n` +
    `2) 1 minggu — ${rupiah(PRICE["1 minggu"])}\n` +
    `3) 1 bulan — ${rupiah(PRICE["1 bulan"])}\n\n` +
    "✅ Balas: **1** / **2** / **3**\n" +
    "ℹ️ Bantuan: ketik **/help**"
  );
}

// ====== Helper: pesan help ======
function helpText() {
  return (
    "📌 **Cara beli key (mudah banget):**\n" +
    "1) Ketik **/buy**\n" +
    "2) Pilih durasi: balas **1 / 2 / 3**\n" +
    "3) Bot kirim **QR bayar**\n" +
    "4) Setelah pembayaran sukses → **key dikirim otomatis** ✅\n\n" +
    "Perintah:\n" +
    "• **/start** — mulai\n" +
    "• **/buy** — beli key\n" +
    "• **/help** — bantuan"
  );
}

// ====== Helper: ambil message dari update Telegram ======
function getMessageFromUpdate(body) {
  // Telegram bisa kirim message / edited_message, kita handle dua-duanya
  return body?.message || body?.edited_message || null;
}

router.post("/webhook", async (req, res) => {
  // Telegram butuh respon cepat. Kita selalu balas 200 di akhir.
  try {
    // 1) Security: validasi secret token header
    if (!verifyTelegramSecret(req)) {
      return res.sendStatus(401);
    }

    // 2) Ambil message
    const msg = getMessageFromUpdate(req.body);
    const chatId = msg?.chat?.id;
    const textRaw = msg?.text || "";
    const text = String(textRaw).trim();

    if (!chatId) return res.sendStatus(200);

    // (Opsional) log ringkas biar gampang debug
    console.log("[TG] chatId:", chatId, "text:", text || "(no text)");

    // 3) Commands
    if (text === "/start") {
      await tgSendMessage(
        chatId,
        "Halo! 👋\n" +
          "Aku bot BELIAKUN.\n\n" +
          "Untuk beli key, ketik: **/buy**\n" +
          "Kalau bingung, ketik: **/help**"
      );
      return res.sendStatus(200);
    }

    if (text === "/help") {
      await tgSendMessage(chatId, helpText());
      return res.sendStatus(200);
    }

    if (text === "/buy") {
      await tgSendMessage(chatId, menuText());
      return res.sendStatus(200);
    }

    // 4) Pembeli memilih durasi: 1/2/3
    const durasi = PICK[text];
    if (!durasi) {
      // Kalau user ngetik apa pun selain yang kita kenal, jangan diem (biar nggak bingung)
      await tgSendMessage(
        chatId,
        "Aku belum paham maksudnya 😅\n\n" +
          "Untuk beli key, ketik: **/buy**\n" +
          "Bantuan: **/help**"
      );
      return res.sendStatus(200);
    }

    // 5) Create invoice Tripay
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
      order_items: [
        { sku: "KEY", name: `Key ${durasi}`, price: amount, quantity: 1 },
      ],
      callback_url: `${process.env.BASE_URL}/payment/tripay-callback`,
      return_url: `${process.env.FRONTEND_URL}/thank-you`,
      expired_time: expiredTime,
      signature,
    };

    await tgSendMessage(
      chatId,
      "⏳ Sedang membuat invoice...\n" +
        "Tunggu sebentar ya (biasanya cepat kok)."
    );

    const response = await fetch(`${TRIPAY_API}/transaction/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.TRIPAY_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!result?.success) {
      await tgSendMessage(
        chatId,
        "❌ Gagal membuat invoice.\n" +
          `Alasan: ${result?.message || "Unknown error"}\n\n` +
          "Silakan coba lagi: ketik **/buy**"
      );
      return res.sendStatus(200);
    }

    // 6) Simpan order ke DB
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

    // 7) Kirim QR / link pembayaran
    const qrUrl = result.data.qr_url || result.data.qr_string;
    const checkoutUrl = result.data.checkout_url || result.data.pay_url;

    const caption =
      "✅ **Invoice berhasil dibuat!**\n\n" +
      `📦 Durasi: **${durasi}**\n` +
      `💳 Total: **${rupiah(amount)}**\n` +
      `🧾 Ref: **${result.data.reference}**\n` +
      "⏰ Batas bayar: **30 menit**\n\n" +
      "📌 **Cara bayar:**\n" +
      "1) Scan QRIS (atau buka link kalau ada)\n" +
      "2) Selesaikan pembayaran\n" +
      "3) Setelah sukses → **key akan dikirim otomatis di chat ini** ✅";

    if (qrUrl) {
      await tgSendPhoto(chatId, qrUrl, caption);
    } else if (checkoutUrl) {
      await tgSendMessage(chatId, caption + `\n\n🔗 Link bayar:\n${checkoutUrl}`);
    } else {
      await tgSendMessage(
        chatId,
        caption +
          "\n\n(Info: QR/link tidak tersedia di response. Silakan hubungi admin.)"
      );
    }

    return res.sendStatus(200);
  } catch (e) {
    console.error("TG webhook error:", e);
    // Jangan bikin Telegram retry berkali-kali, tetap 200
    return res.sendStatus(200);
  }
});

module.exports = router;
