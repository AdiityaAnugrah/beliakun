// routes/telegramRoutes.js
const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const fetch = require("node-fetch");

const { Order } = require("../models");

const TRIPAY_API = "https://tripay.co.id/api";

// ============================
// CONFIG
// ============================
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

const rupiah = (n) => `Rp${Number(n || 0).toLocaleString("id-ID")}`;

function nowUnix() {
  return Math.floor(Date.now() / 1000);
}

function safeStr(v) {
  return String(v ?? "").trim();
}

// ============================
// SECURITY: Telegram secret header
// ============================
function verifyTelegramSecret(req) {
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!expected) return true; // kalau belum di-set di .env, skip
  const got = req.get("x-telegram-bot-api-secret-token");
  return got === expected;
}

// ============================
// TELEGRAM API
// ============================
const TG_API = () => `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;

async function tgCall(method, payload) {
  const res = await fetch(`${TG_API()}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await res.json().catch(() => null);
  if (!json?.ok) {
    // jangan bikin Telegram retry; tapi log untuk debug
    console.error("[TG_API_ERROR]", method, json);
  }
  return json;
}

async function tgSendMessage(chatId, text, opts = {}) {
  return tgCall("sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: "Markdown",
    disable_web_page_preview: true,
    ...opts,
  });
}

async function tgEditMessage(chatId, messageId, text, opts = {}) {
  return tgCall("editMessageText", {
    chat_id: chatId,
    message_id: messageId,
    text,
    parse_mode: "Markdown",
    disable_web_page_preview: true,
    ...opts,
  });
}

async function tgSendPhoto(chatId, photo, caption, opts = {}) {
  return tgCall("sendPhoto", {
    chat_id: chatId,
    photo,
    caption,
    parse_mode: "Markdown",
    ...opts,
  });
}

async function tgAnswerCallback(callbackQueryId, opts = {}) {
  if (!callbackQueryId) return;
  return tgCall("answerCallbackQuery", {
    callback_query_id: callbackQueryId,
    ...opts,
  });
}

// ============================
// UI (copywriting “WAH”)
// ============================
function brandHeader() {
  return "✨ *BELIAKUN — Key Instan*";
}

function welcomeText() {
  return (
    `${brandHeader()}\n\n` +
    "Beli key cepat & aman:\n" +
    "✅ pilih durasi\n" +
    "✅ bayar QRIS\n" +
    "✅ key dikirim otomatis\n\n" +
    "👇 Klik tombol di bawah untuk mulai"
  );
}

function helpText() {
  return (
    "🧠 *Cara Beli (super gampang)*\n\n" +
    "1) Klik *🛒 Beli Key*\n" +
    "2) Pilih durasi\n" +
    "3) Bayar QRIS\n" +
    "4) Sukses → key dikirim otomatis ✅\n\n" +
    "Perintah:\n" +
    "• /buy  → tampilkan menu\n" +
    "• /status → cek pesanan terakhir\n" +
    "• /cancel → batalkan menu"
  );
}

function buyMenuText() {
  return (
    "🛒 *Pilih Durasi Key*\n" +
    "━━━━━━━━━━━━━━\n" +
    `⏱ *1 Jam*     — ${rupiah(PRICE["1 jam"])}\n` +
    `📅 *1 Minggu*  — ${rupiah(PRICE["1 minggu"])}\n` +
    `🗓 *1 Bulan*   — ${rupiah(PRICE["1 bulan"])}\n` +
    "━━━━━━━━━━━━━━\n\n" +
    "Klik tombol paket di bawah 👇"
  );
}

function loadingInvoiceText(durasi) {
  return (
    "⏳ *Menyiapkan invoice...*\n\n" +
    `📦 Paket: *${durasi}*\n` +
    "Mohon tunggu sebentar ya.\n" +
    "(Tenang, ini cepat—bukan loading “Windows Update” 😄)"
  );
}

function invoiceReadyCaption({ durasi, amount, reference }) {
  return (
    "✅ *Invoice Siap Dibayar*\n" +
    "━━━━━━━━━━━━━━\n" +
    `📦 Paket : *${durasi}*\n` +
    `💳 Total : *${rupiah(amount)}*\n` +
    `🧾 Ref   : *${reference}*\n` +
    "⏰ Batas bayar: *30 menit*\n" +
    "━━━━━━━━━━━━━━\n\n" +
    "📌 *Cara bayar:*\n" +
    "1) Scan QRIS (atau klik tombol *Bayar Sekarang*)\n" +
    "2) Selesaikan pembayaran\n" +
    "3) Sukses → *key dikirim otomatis di chat ini* ✅\n\n" +
    "Kalau sudah bayar, tinggal tunggu… botnya bukan mantan 😎"
  );
}

function unknownText() {
  return (
    "Aku belum paham 😅\n\n" +
    "✅ Klik *🛒 Beli Key* untuk mulai.\n" +
    "ℹ️ Kalau butuh panduan, klik *Bantuan*."
  );
}

function statusText(order) {
  if (!order) {
    return (
      "📭 *Belum ada pesanan*\n\n" +
      "Klik *🛒 Beli Key* untuk bikin invoice pertama kamu."
    );
  }

  const ref = order.tripay_reference || "-";
  const dur = order.key_durasi || "-";
  const st = order.status || "-";
  const total = rupiah(order.total_harga || 0);

  return (
    "🧾 *Status Pesanan Terakhir*\n" +
    "━━━━━━━━━━━━━━\n" +
    `📦 Paket : *${dur}*\n` +
    `💳 Total : *${total}*\n` +
    `🔖 Status: *${st}*\n` +
    `🧾 Ref   : *${ref}*\n` +
    "━━━━━━━━━━━━━━"
  );
}

// ============================
// KEYBOARDS
// ============================
function kbMain() {
  return {
    inline_keyboard: [
      [{ text: "🛒 Beli Key", callback_data: "BUY" }],
      [
        { text: "🧾 Status", callback_data: "STATUS" },
        { text: "ℹ️ Bantuan", callback_data: "HELP" },
      ],
    ],
  };
}

function kbBuy() {
  return {
    inline_keyboard: [
      [
        { text: `⏱ 1 Jam (${rupiah(PRICE["1 jam"])})`, callback_data: "DUR:1 jam" },
      ],
      [
        { text: `📅 1 Minggu (${rupiah(PRICE["1 minggu"])})`, callback_data: "DUR:1 minggu" },
      ],
      [
        { text: `🗓 1 Bulan (${rupiah(PRICE["1 bulan"])})`, callback_data: "DUR:1 bulan" },
      ],
      [{ text: "⬅️ Menu Utama", callback_data: "BACK" }],
    ],
  };
}

function kbAfterInvoice(checkoutUrl) {
  const rows = [];
  if (checkoutUrl) rows.push([{ text: "💳 Bayar Sekarang", url: checkoutUrl }]);
  rows.push([{ text: "🔁 Beli Lagi", callback_data: "BUY" }]);
  rows.push([{ text: "🧾 Status", callback_data: "STATUS" }]);
  rows.push([{ text: "ℹ️ Bantuan", callback_data: "HELP" }]);
  rows.push([{ text: "⬅️ Menu Utama", callback_data: "BACK" }]);
  return { inline_keyboard: rows };
}

// ============================
// PARSER UPDATE
// ============================
function parseIncoming(body) {
  // message text
  if (body?.message) {
    return {
      type: "message",
      chatId: body.message?.chat?.id,
      text: safeStr(body.message?.text),
      messageId: body.message?.message_id,
    };
  }

  // callback buttons
  if (body?.callback_query) {
    return {
      type: "callback",
      chatId: body.callback_query?.message?.chat?.id,
      data: safeStr(body.callback_query?.data),
      callbackQueryId: body.callback_query?.id,
      messageId: body.callback_query?.message?.message_id,
    };
  }

  // edited message (opsional)
  if (body?.edited_message) {
    return {
      type: "message",
      chatId: body.edited_message?.chat?.id,
      text: safeStr(body.edited_message?.text),
      messageId: body.edited_message?.message_id,
    };
  }

  return { type: "unknown" };
}

// ============================
// DB Helpers
// ============================
async function getLastTelegramOrder(chatId) {
  try {
    return await Order.findOne({
      where: { telegram_chat_id: chatId },
      order: [["createdAt", "DESC"]],
    });
  } catch (e) {
    console.error("[DB] getLastTelegramOrder error:", e);
    return null;
  }
}

async function saveOrderTelegram({ chatId, durasi, amount, merchantRef, tripayData }) {
  // DB kamu strict: data_mid & midtrans_id harus selalu ada
  return Order.create({
    data_mid: JSON.stringify({ source: "telegram", note: "no midtrans" }),
    midtrans_id: "-", // WAJIB (karena DB kamu NOT NULL)

    email: "buyer@telegram.local",
    status: "pending",
    total_harga: amount,

    tripay_merchant_ref: merchantRef,
    tripay_reference: tripayData?.reference || null,
    data_tripay: tripayData || null,

    telegram_chat_id: chatId,
    key_durasi: durasi,
  });
}

// ============================
// TRIPAY
// ============================
async function createTripayInvoice({ chatId, durasi }) {
  const amount = PRICE[durasi];
  const merchantRef = `TG-${chatId}-${Date.now()}`;
  const expiredTime = nowUnix() + 30 * 60;

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

  const result = await resp.json().catch(() => ({}));
  return { result, amount, merchantRef, expiredTime };
}

// ============================
// CORE HANDLER: Create invoice & send “WAH” UI
// ============================
async function handleCreateInvoice({ chatId, durasi, parentMessageId = null }) {
  // 1) tampilkan loading (edit kalau bisa, kalau tidak kirim baru)
  let loadingMsgId = parentMessageId;

  if (loadingMsgId) {
    await tgEditMessage(chatId, loadingMsgId, loadingInvoiceText(durasi), {
      reply_markup: kbMain(),
    });
  } else {
    const sent = await tgSendMessage(chatId, loadingInvoiceText(durasi), {
      reply_markup: kbMain(),
    });
    loadingMsgId = sent?.result?.message_id || null;
  }

  // 2) create invoice Tripay
  const { result, amount, merchantRef } = await createTripayInvoice({ chatId, durasi });

  if (!result?.success) {
    const reason = result?.message || "Unknown error";
    const failText =
      "❌ *Gagal membuat invoice*\n\n" +
      `Alasan: _${reason}_\n\n` +
      "Silakan coba lagi dengan klik *🛒 Beli Key*.";

    if (loadingMsgId) {
      await tgEditMessage(chatId, loadingMsgId, failText, { reply_markup: kbMain() });
    } else {
      await tgSendMessage(chatId, failText, { reply_markup: kbMain() });
    }
    return;
  }

  // 3) simpan order (DB strict safe)
  try {
    await saveOrderTelegram({
      chatId,
      durasi,
      amount,
      merchantRef,
      tripayData: result.data,
    });
  } catch (e) {
    console.error("[DB] saveOrderTelegram error:", e);
    const errText =
      "⚠️ *Invoice berhasil dibuat, tapi gagal simpan ke database.*\n" +
      "Silakan hubungi admin.\n\n" +
      `Ref: *${result?.data?.reference || "-"}*`;

    if (loadingMsgId) {
      await tgEditMessage(chatId, loadingMsgId, errText, { reply_markup: kbMain() });
    } else {
      await tgSendMessage(chatId, errText, { reply_markup: kbMain() });
    }
    return;
  }

  // 4) kirim invoice UI
  const qrUrl = result.data.qr_url || result.data.qr_string;
  const checkoutUrl = result.data.checkout_url || result.data.pay_url;

  const caption = invoiceReadyCaption({
    durasi,
    amount,
    reference: result.data.reference,
  });

  // Biar “WAH”: edit loading jadi “Invoice siap” (teks), lalu kirim QR photo terpisah
  if (loadingMsgId) {
    await tgEditMessage(
      chatId,
      loadingMsgId,
      "✅ *Invoice berhasil dibuat!*\n\nSekarang tinggal scan QRIS di bawah ya 👇",
      { reply_markup: kbAfterInvoice(checkoutUrl) }
    );
  }

  if (qrUrl) {
    await tgSendPhoto(chatId, qrUrl, caption, {
      reply_markup: kbAfterInvoice(checkoutUrl),
    });
  } else {
    // fallback kalau tidak ada QR
    await tgSendMessage(
      chatId,
      caption + (checkoutUrl ? `\n\n🔗 Link bayar:\n${checkoutUrl}` : ""),
      { reply_markup: kbAfterInvoice(checkoutUrl) }
    );
  }
}

// ============================
// ROUTE: TELEGRAM WEBHOOK
// ============================
router.post("/webhook", async (req, res) => {
  // selalu cepat balas 200 biar Telegram tidak retry spam
  try {
    if (!verifyTelegramSecret(req)) return res.sendStatus(401);

    const incoming = parseIncoming(req.body);
    const chatId = incoming.chatId;
    if (!chatId) return res.sendStatus(200);

    // callback: biar tombol nggak loading muter
    if (incoming.type === "callback") {
      await tgAnswerCallback(incoming.callbackQueryId);
    }

    // ======================
    // CALLBACK HANDLER
    // ======================
    if (incoming.type === "callback") {
      const data = incoming.data;

      if (data === "BACK") {
        await tgSendMessage(chatId, welcomeText(), { reply_markup: kbMain() });
        return res.sendStatus(200);
      }

      if (data === "HELP") {
        await tgSendMessage(chatId, helpText(), { reply_markup: kbMain() });
        return res.sendStatus(200);
      }

      if (data === "STATUS") {
        const last = await getLastTelegramOrder(chatId);
        await tgSendMessage(chatId, statusText(last), { reply_markup: kbMain() });
        return res.sendStatus(200);
      }

      if (data === "BUY") {
        await tgSendMessage(chatId, buyMenuText(), { reply_markup: kbBuy() });
        return res.sendStatus(200);
      }

      if (data.startsWith("DUR:")) {
        const durasi = data.replace("DUR:", "").trim();
        if (!PRICE[durasi]) {
          await tgSendMessage(chatId, "❌ Durasi tidak valid. Klik *🛒 Beli Key* lagi ya.", {
            reply_markup: kbMain(),
          });
          return res.sendStatus(200);
        }

        await handleCreateInvoice({
          chatId,
          durasi,
          parentMessageId: incoming.messageId || null, // edit message yang sama biar elegan
        });
        return res.sendStatus(200);
      }

      // fallback callback
      await tgSendMessage(chatId, "Tombol itu belum tersedia 😅 Balik ke menu ya.", {
        reply_markup: kbMain(),
      });
      return res.sendStatus(200);
    }

    // ======================
    // MESSAGE TEXT HANDLER
    // ======================
    const text = safeStr(incoming.text);

    // Commands
    if (text === "/start") {
      await tgSendMessage(chatId, welcomeText(), { reply_markup: kbMain() });
      return res.sendStatus(200);
    }

    if (text === "/help") {
      await tgSendMessage(chatId, helpText(), { reply_markup: kbMain() });
      return res.sendStatus(200);
    }

    if (text === "/buy") {
      await tgSendMessage(chatId, buyMenuText(), { reply_markup: kbBuy() });
      return res.sendStatus(200);
    }

    if (text === "/status") {
      const last = await getLastTelegramOrder(chatId);
      await tgSendMessage(chatId, statusText(last), { reply_markup: kbMain() });
      return res.sendStatus(200);
    }

    if (text === "/cancel") {
      await tgSendMessage(chatId, "✅ Oke. Kamu balik ke menu utama.", { reply_markup: kbMain() });
      return res.sendStatus(200);
    }

    // Manual input 1/2/3
    const durasi = PICK_TEXT[text];
    if (durasi) {
      await handleCreateInvoice({ chatId, durasi });
      return res.sendStatus(200);
    }

    // fallback agar buyer tidak bingung
    await tgSendMessage(chatId, unknownText(), { reply_markup: kbMain() });
    return res.sendStatus(200);
  } catch (err) {
    console.error("TG webhook error:", err);
    return res.sendStatus(200);
  }
});

module.exports = router;
