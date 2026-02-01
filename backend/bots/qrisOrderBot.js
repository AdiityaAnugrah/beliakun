// backend/bots/qrisOrderBot.js
const { Telegraf, Markup } = require("telegraf");
const crypto = require("crypto");
const path = require("path");
const { makeRBXCaveClient } = require("../utils/rbxcaveClient");
const { PendingStore } = require("../utils/pendingStore");

// =========================
// KONFIG PAKET (EDIT DI SINI)
// =========================
// Catatan:
// - orderType:
//   - "gamepass_order" / "vip_server" => auto RBXCave (bot create order)
//   - "vilog_manual" => manual (admin yang proses, bot hanya kirim data & notif)
const PACKAGES = [
  // ===== RBXCave (contoh) =====
  // { key: "gp_100", orderType: "gamepass_order", label: "🎮 Gamepass 100 Robux", robuxAmount: 100, placeId: 12345678, priceIdr: 20000 },

  // ===== VILOG manual (sesuai list kamu) =====
  { key: "vilog_100", orderType: "vilog_manual", label: "🔐 VILOG 100⏣", robuxAmount: 100, placeId: 0, priceIdr: 10994 },
  { key: "vilog_200", orderType: "vilog_manual", label: "🔐 VILOG 200⏣", robuxAmount: 200, placeId: 0, priceIdr: 21987 },
  { key: "vilog_300", orderType: "vilog_manual", label: "🔐 VILOG 300⏣", robuxAmount: 300, placeId: 0, priceIdr: 32980 },
  { key: "vilog_400", orderType: "vilog_manual", label: "🔐 VILOG 400⏣", robuxAmount: 400, placeId: 0, priceIdr: 43973 },
  { key: "vilog_500", orderType: "vilog_manual", label: "🔐 VILOG 500⏣", robuxAmount: 500, placeId: 0, priceIdr: 54966 },
  { key: "vilog_600", orderType: "vilog_manual", label: "🔐 VILOG 600⏣", robuxAmount: 600, placeId: 0, priceIdr: 65959 },
  { key: "vilog_700", orderType: "vilog_manual", label: "🔐 VILOG 700⏣", robuxAmount: 700, placeId: 0, priceIdr: 76952 },
  { key: "vilog_800", orderType: "vilog_manual", label: "🔐 VILOG 800⏣", robuxAmount: 800, placeId: 0, priceIdr: 87869 },
  { key: "vilog_900", orderType: "vilog_manual", label: "🔐 VILOG 900⏣", robuxAmount: 900, placeId: 0, priceIdr: 98862 },
  { key: "vilog_1000", orderType: "vilog_manual", label: "🔐 VILOG 1000⏣", robuxAmount: 1000, placeId: 0, priceIdr: 109855 },

  { key: "vilog_2000", orderType: "vilog_manual", label: "🔐 VILOG 2000⏣", robuxAmount: 2000, placeId: 0, priceIdr: 219709 },
  { key: "vilog_3000", orderType: "vilog_manual", label: "🔐 VILOG 3000⏣", robuxAmount: 3000, placeId: 0, priceIdr: 329487 },
  { key: "vilog_4000", orderType: "vilog_manual", label: "🔐 VILOG 4000⏣", robuxAmount: 4000, placeId: 0, priceIdr: 439341 },
  { key: "vilog_5000", orderType: "vilog_manual", label: "🔐 VILOG 5000⏣", robuxAmount: 5000, placeId: 0, priceIdr: 549119 },
  { key: "vilog_6000", orderType: "vilog_manual", label: "🔐 VILOG 6000⏣", robuxAmount: 6000, placeId: 0, priceIdr: 658973 },
  { key: "vilog_7000", orderType: "vilog_manual", label: "🔐 VILOG 7000⏣", robuxAmount: 7000, placeId: 0, priceIdr: 768750 },
  { key: "vilog_8000", orderType: "vilog_manual", label: "🔐 VILOG 8000⏣", robuxAmount: 8000, placeId: 0, priceIdr: 878605 },
  { key: "vilog_9000", orderType: "vilog_manual", label: "🔐 VILOG 9000⏣", robuxAmount: 9000, placeId: 0, priceIdr: 988459 },

  { key: "vilog_10000", orderType: "vilog_manual", label: "🔐 VILOG 10000⏣", robuxAmount: 10000, placeId: 0, priceIdr: 1098237 },
  { key: "vilog_15000", orderType: "vilog_manual", label: "🔐 VILOG 15000⏣", robuxAmount: 15000, placeId: 0, priceIdr: 1647355 },
  { key: "vilog_20000", orderType: "vilog_manual", label: "🔐 VILOG 20000⏣", robuxAmount: 20000, placeId: 0, priceIdr: 2196473 },
  { key: "vilog_25000", orderType: "vilog_manual", label: "🔐 VILOG 25000⏣", robuxAmount: 25000, placeId: 0, priceIdr: 2745591 },
  { key: "vilog_40000", orderType: "vilog_manual", label: "🔐 VILOG 40000⏣", robuxAmount: 40000, placeId: 0, priceIdr: 4392869 },
  { key: "vilog_50000", orderType: "vilog_manual", label: "🔐 VILOG 50000⏣", robuxAmount: 50000, placeId: 0, priceIdr: 5491105 },
];

const PAGE_SIZE = 6;
const PENDING_TTL_MS = 1000 * 60 * 60; // 1 jam

// =========================
// UTIL
// =========================
function formatRupiah(n) {
  try {
    return "Rp " + new Intl.NumberFormat("id-ID").format(n);
  } catch {
    return "Rp " + String(n);
  }
}

function makeToken() {
  return crypto.randomBytes(6).toString("hex");
}

function findPackage(key) {
  return PACKAGES.find((p) => p.key === key);
}

function pagesCount() {
  return Math.max(1, Math.ceil(PACKAGES.length / PAGE_SIZE));
}

// =========================
// DISCORD WEBHOOK (PAYMENT NOTIF)
// =========================
async function notifyDiscordPaymentReceived(data) {
  const url = process.env.DISCORD_WEBHOOK_URL || "";
  if (!url) return;

  const nominal = formatRupiah(data.priceIdr || 0);
  const username = String(data.robloxUsername || data.vilogUsername || "-").trim();
  const paket = String(data.label || "-").trim();

  const content = `Payment received: ${nominal} from ${username} [${paket}]`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      console.log("[discord] webhook failed:", res.status, txt.slice(0, 200));
    } else {
      console.log("[discord] webhook sent:", content);
    }
  } catch (e) {
    console.log("[discord] webhook error:", e?.message || e);
  }
}

// =========================
// UI KEYBOARDS (Modern)
// =========================
function packagesKeyboard(page) {
  const totalPages = pagesCount();
  const p = Math.max(0, Math.min(page, totalPages - 1));
  const start = p * PAGE_SIZE;
  const items = PACKAGES.slice(start, start + PAGE_SIZE);

  const rows = [];
  for (let i = 0; i < items.length; i += 2) {
    const a = items[i];
    const b = items[i + 1];
    const row = [Markup.button.callback(`${a.label}`, `PKG:${a.key}`)];
    if (b) row.push(Markup.button.callback(`${b.label}`, `PKG:${b.key}`));
    rows.push(row);
  }

  const nav = [];
  if (p > 0) nav.push(Markup.button.callback("⬅️ Prev", `PAGE:${p - 1}`));
  nav.push(Markup.button.callback(`📄 ${p + 1}/${totalPages}`, "NOOP"));
  if (p < totalPages - 1) nav.push(Markup.button.callback("Next ➡️", `PAGE:${p + 1}`));
  rows.push(nav);

  rows.push([Markup.button.callback("🔄 Reset", "RESET")]);
  return Markup.inlineKeyboard(rows);
}

function usernamePromptKeyboard() {
  return Markup.inlineKeyboard([
    [Markup.button.callback("⬅️ Ganti Paket", "BACK_TO_PACKAGES")],
    [Markup.button.callback("🔄 Reset", "RESET")],
  ]);
}

function userPaymentKeyboard(token) {
  return Markup.inlineKeyboard([
    [Markup.button.callback("✅ Saya sudah bayar (upload bukti foto di chat ini)", "NOOP")],
    [Markup.button.callback("❌ Batalkan Transaksi", `U_CANCEL:${token}`)],
  ]);
}

function userCancelConfirmKeyboard(token) {
  return Markup.inlineKeyboard([
    [Markup.button.callback("✅ Ya, batalkan", `U_CANCEL_Y:${token}`)],
    [Markup.button.callback("↩️ Tidak jadi", `U_CANCEL_N:${token}`)],
  ]);
}

function adminMainKeyboard(token) {
  return Markup.inlineKeyboard([
    [Markup.button.callback("✅ ACC", `ACC:${token}`)],
    [Markup.button.callback("❌ TOLAK", `REJ:${token}`)],
  ]);
}

function adminAccKeyboard(token) {
  return Markup.inlineKeyboard([
    [Markup.button.callback("✅ ACC sekarang", `ACC_DO:${token}`)],
    [Markup.button.callback("📝 ACC + catatan", `ACC_NOTE:${token}`)],
    [Markup.button.callback("↩️ Kembali", `ACC_BACK:${token}`)],
  ]);
}

function rejectReasonKeyboard(token) {
  return Markup.inlineKeyboard([
    [Markup.button.callback("💸 Nominal kurang", `REJR:${token}:LESS`)],
    [Markup.button.callback("💰 Nominal lebih", `REJR:${token}:MORE`)],
    [Markup.button.callback("🖼️ Bukti blur/tidak jelas", `REJR:${token}:BLUR`)],
    [Markup.button.callback("✍️ Lainnya (ketik alasan)", `REJR:${token}:OTHER`)],
    [Markup.button.callback("↩️ Batal", `REJR:${token}:CANCEL`)],
  ]);
}

// =========================
// MESSAGES
// =========================
function msgWelcome() {
  return [
    "✨ *CENTRAGAME ORDER BOT*",
    "────────────────────",
    "Pilih paket dulu ya 👇",
    "",
    "🧩 *Cara kerja:*",
    "1) Pilih paket",
    "2) Isi data sesuai form",
    "3) Bayar via QRIS (foto)",
    "4) Upload bukti pembayaran",
    "5) Admin ACC / TOLAK",
    "",
    "🛑 Kamu bisa *batalkan kapan saja* sebelum admin ACC.",
  ].join("\n");
}

function msgPackagePicked(pkg) {
  if (pkg.orderType === "vilog_manual") {
    return [
      "🧾 *Detail Paket (VILOG / Manual)*",
      "────────────────────",
      `📦 Paket: *${pkg.label}*`,
      `💳 Harga: *${formatRupiah(pkg.priceIdr)}*`,
      `🎟️ Robux: *${pkg.robuxAmount}*`,
      "",
      "✍️ Kirim format ini *dalam 1 pesan* (copy-paste):",
      "",
      "*FORMAT ORDER VILOG*",
      "Username :",
      "Password :",
      "Jumlah order robux :",
      "Code pemulihan / Kode Backup Min 3 :",
      "1.",
      "2.",
      "3.",
      "",
      "_Catatan: kode yang sudah dipakai tidak bisa dipakai lagi._",
    ].join("\n");
  }

  // RBXCave default (simple)
  return [
    "🧾 *Detail Paket*",
    "────────────────────",
    `📦 Paket: *${pkg.label}*`,
    `💳 Harga: *${formatRupiah(pkg.priceIdr)}*`,
    `🎟️ Robux: *${pkg.robuxAmount}*`,
    "",
    "✍️ Sekarang kirim *username Roblox* kamu (1 pesan).",
    "Contoh: `AdiityaAnugrah`",
  ].join("\n");
}

function msgQrisCaption(data) {
  return [
    "🧾 *Pembayaran QRIS*",
    "────────────────────",
    `📦 Paket: *${data.label}*`,
    `💳 Nominal: *${formatRupiah(data.priceIdr)}*`,
    `🧾 Order ID: \`${data.orderId}\``,
    data.orderType === "vilog_manual"
      ? `👤 Username: \`${data.vilogUsername}\``
      : `👤 Username: \`${data.robloxUsername}\``,
    "",
    "✅ *Scan QRIS* lalu *upload foto bukti pembayaran* di chat ini.",
    "🔎 Admin akan verifikasi sebelum diproses.",
  ].join("\n");
}

function msgCancelConfirm(data) {
  return [
    "⚠️ *Konfirmasi Pembatalan*",
    "────────────────────",
    `🧾 Order ID: \`${data.orderId}\``,
    `📦 Paket: *${data.label}*`,
    `💳 Nominal: *${formatRupiah(data.priceIdr)}*`,
    "",
    "Kamu yakin mau batalkan transaksi ini?",
  ].join("\n");
}

function msgUserApproved(data, note) {
  return [
    "✅ *Pembayaran diterima!*",
    "────────────────────",
    `🧾 Order ID: \`${data.orderId}\``,
    `📦 Paket: *${data.label}*`,
    "",
    data.orderType === "vilog_manual"
      ? "🧑‍💻 *Order manual* — admin akan memproses akun kamu. Mohon standby."
      : "⚙️ Order sedang diproses (RBXCave).",
    note ? `\n📝 Catatan admin: ${note}` : "",
  ].join("\n");
}

function msgUserRejected(data, reason) {
  return [
    "❌ *Pembayaran ditolak*",
    "────────────────────",
    `🧾 Order ID: \`${data.orderId}\``,
    `📦 Paket: *${data.label}*`,
    "",
    `📌 Alasan: ${reason}`,
    "",
    "Ketik /start untuk buat order baru.",
  ].join("\n");
}

function parseVilogForm(text) {
  const t = String(text || "").trim();

  // Ambil field sederhana
  const getField = (label) => {
    const re = new RegExp(`${label}\\s*:\\s*(.+)`, "i");
    const m = t.match(re);
    return m ? String(m[1]).trim() : "";
  };

  const username = getField("Username");
  const password = getField("Password");
  let jumlah = getField("Jumlah order robux");

  // fallback angka di teks
  if (!jumlah) {
    const m = t.match(/Jumlah\s*order\s*robux\s*:\s*(\d+)/i);
    if (m) jumlah = m[1];
  }

  // codes 1/2/3
  const codes = [];
  for (const n of [1, 2, 3]) {
    const m = t.match(new RegExp(`\\b${n}\\s*\\.\\s*([^\\n]+)`, "m"));
    if (m) codes.push(String(m[1]).trim());
  }

  return {
    username,
    password,
    jumlahRobux: Number(jumlah || 0),
    codes,
  };
}

// =========================
// BOT
// =========================
function createQrisOrderBot() {
  const botToken = process.env.TELEGRAM_BOT_TOKEN_RBXCAVE;
  if (!botToken) throw new Error("TELEGRAM_BOT_TOKEN_RBXCAVE missing in backend/.env");

  // multi admin chat id: "-894...,450..."
  const adminChatIds = String(process.env.TELEGRAM_ADMIN_CHAT_ID || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const isAdminChat = (ctx) => adminChatIds.includes(String(ctx.chat?.id || ""));

  const qrisRelPath = process.env.QRIS_IMAGE_PATH || "assets/qris.jpg";
  const qrisAbsPath = path.join(__dirname, "..", qrisRelPath);

  const store = new PendingStore();
  const rbxcave = makeRBXCaveClient();
  const bot = new Telegraf(botToken);

  // cleanup expired pending
  setInterval(() => store.cleanupExpired(PENDING_TTL_MS), 60 * 1000).unref?.();

  // ===== Commands =====
  bot.command("myid", (ctx) => {
    ctx.reply(`chat_id: ${ctx.chat?.id}\nuser_id: ${ctx.from?.id}`);
  });

  // ✅ /cancel dengan konfirmasi
  bot.command("cancel", async (ctx) => {
    const userId = ctx.from?.id;
    if (!userId) return;

    const tok = store.getTokenByUser(userId);
    if (!tok) return ctx.reply("Tidak ada transaksi pending untuk dibatalkan.");

    const data = store.getByToken(tok);
    if (!data) {
      await store.clearUser(userId);
      await store.clearUserFlow(userId);
      return ctx.reply("Tidak ada transaksi pending untuk dibatalkan.");
    }

    await ctx.reply(msgCancelConfirm(data), {
      parse_mode: "Markdown",
      reply_markup: userCancelConfirmKeyboard(tok).reply_markup,
    });
  });

  // ===== Start =====
  bot.start(async (ctx) => {
    const userId = ctx.from?.id;
    if (userId) await store.clearUserFlow(userId);

    await ctx.reply(msgWelcome(), {
      parse_mode: "Markdown",
      reply_markup: packagesKeyboard(0).reply_markup,
    });
  });

  // ===== NOOP =====
  bot.action("NOOP", async (ctx) => ctx.answerCbQuery());

  // ===== Pagination =====
  bot.action(/PAGE:(\d+)/, async (ctx) => {
    await ctx.answerCbQuery();
    const page = Number(ctx.match[1] || 0);
    try {
      await ctx.editMessageText(msgWelcome(), {
        parse_mode: "Markdown",
        reply_markup: packagesKeyboard(page).reply_markup,
      });
    } catch {
      await ctx.reply(msgWelcome(), {
        parse_mode: "Markdown",
        reply_markup: packagesKeyboard(page).reply_markup,
      });
    }
  });

  // ===== Reset =====
  bot.action("RESET", async (ctx) => {
    await ctx.answerCbQuery("Reset");
    const userId = ctx.from?.id;
    if (userId) {
      await store.clearUser(userId);
      await store.clearUserFlow(userId);
    }
    try {
      await ctx.editMessageText("✅ Sudah di-reset. Ketik /start untuk mulai lagi.");
    } catch {
      await ctx.reply("✅ Sudah di-reset. Ketik /start untuk mulai lagi.");
    }
  });

  // ===== Back to packages =====
  bot.action("BACK_TO_PACKAGES", async (ctx) => {
    await ctx.answerCbQuery();
    const userId = ctx.from?.id;
    if (userId) await store.clearUserFlow(userId);

    await ctx.reply(msgWelcome(), {
      parse_mode: "Markdown",
      reply_markup: packagesKeyboard(0).reply_markup,
    });
  });

  // ===== Pick package =====
  bot.action(/PKG:(.+)/, async (ctx) => {
    await ctx.answerCbQuery();
    const pkgKey = ctx.match[1];
    const pkg = findPackage(pkgKey);
    if (!pkg) return ctx.reply("Paket tidak ditemukan. Ketik /start untuk ulang.");

    const userId = ctx.from?.id;
    if (!userId) return;

    const existing = store.getTokenByUser(userId);
    if (existing) {
      return ctx.reply("⚠️ Kamu masih punya transaksi pending.\nKetik /cancel untuk batalkan dulu.", {
        parse_mode: "Markdown",
      });
    }

    // set flow
    if (pkg.orderType === "vilog_manual") {
      await store.setUserFlow(userId, { step: "WAIT_VILOG_FORM", pkgKey });
    } else {
      await store.setUserFlow(userId, { step: "WAIT_USERNAME", pkgKey });
    }

    try {
      await ctx.editMessageText(msgPackagePicked(pkg), {
        parse_mode: "Markdown",
        reply_markup: usernamePromptKeyboard().reply_markup,
      });
    } catch {
      await ctx.reply(msgPackagePicked(pkg), {
        parse_mode: "Markdown",
        reply_markup: usernamePromptKeyboard().reply_markup,
      });
    }
  });

  // ===== Text handler =====
  bot.on("text", async (ctx, next) => {
    const fromId = ctx.from?.id;
    const chatId = String(ctx.chat?.id || "");

    // admin awaiting flows
    if (fromId && adminChatIds.length > 0 && adminChatIds.includes(chatId)) {
      const awaitObj = store.getAdminAwait(fromId);
      if (awaitObj?.step === "WAIT_CUSTOM_REASON" && awaitObj.token) {
        const reason = (ctx.message.text || "").trim();
        if (!reason) return;
        await store.clearAdminAwait(fromId);
        await finalizeReject(bot, store, awaitObj.token, `Alasan admin: ${reason}`, adminChatIds);
        return;
      }
      if (awaitObj?.step === "WAIT_ACC_NOTE" && awaitObj.token) {
        const note = (ctx.message.text || "").trim();
        if (!note) return;
        await store.clearAdminAwait(fromId);
        await approveAndProcess(bot, store, rbxcave, awaitObj.token, adminChatIds, note);
        return;
      }
    }

    // user flow
    const userId = ctx.from?.id;
    if (!userId) return next();

    const flow = store.getUserFlow(userId);
    if (!flow) return next();

    const pkg = findPackage(flow.pkgKey);
    if (!pkg) {
      await store.clearUserFlow(userId);
      return ctx.reply("Paket invalid. Ketik /start untuk mulai lagi.");
    }

    // ===== VILOG FORM =====
    if (flow.step === "WAIT_VILOG_FORM") {
      const parsed = parseVilogForm(ctx.message.text || "");
      if (!parsed.username || !parsed.password || !parsed.jumlahRobux || parsed.codes.length < 3) {
        return ctx.reply(
          [
            "⚠️ Format belum lengkap.",
            "Mohon isi minimal:",
            "- Username",
            "- Password",
            "- Jumlah order robux",
            "- 3 kode backup",
            "",
            "Kirim ulang formatnya dalam 1 pesan ya.",
          ].join("\n"),
          { parse_mode: "Markdown" }
        );
      }

      // Validasi jumlah harus sama dengan paket
      if (Number(parsed.jumlahRobux) !== Number(pkg.robuxAmount)) {
        return ctx.reply(
          `⚠️ Jumlah robux di form (${parsed.jumlahRobux}) tidak sama dengan paket (${pkg.robuxAmount}).\nMohon perbaiki dan kirim ulang.`,
          { parse_mode: "Markdown" }
        );
      }

      const orderId = "TG-" + crypto.randomUUID();
      const tok = makeToken();

      const data = {
        token: tok,
        createdAt: Date.now(),
        userId,
        chatId: ctx.chat.id,
        orderId,
        orderType: pkg.orderType, // vilog_manual
        label: pkg.label,
        priceIdr: pkg.priceIdr,
        robuxAmount: pkg.robuxAmount,
        placeId: pkg.placeId || 0,
        status: "WAIT_PROOF",

        // vilog fields
        vilogUsername: parsed.username,
        vilogPassword: parsed.password,
        vilogBackupCodes: parsed.codes,
        type: "vilog_manual",
      };

      await store.setPending(tok, data);
      await store.setUserFlow(userId, { step: "WAIT_PROOF", pkgKey: flow.pkgKey });

      const caption = msgQrisCaption(data);
      try {
        await ctx.replyWithPhoto(
          { source: qrisAbsPath },
          { caption, parse_mode: "Markdown", reply_markup: userPaymentKeyboard(tok).reply_markup }
        );
      } catch {
        await ctx.reply(caption, {
          parse_mode: "Markdown",
          reply_markup: userPaymentKeyboard(tok).reply_markup,
        });
        await ctx.reply("⚠️ Gagal kirim foto QRIS. Pastikan file ada: " + qrisAbsPath);
      }
      return;
    }

    // ===== USERNAME (RBXCave simple) =====
    if (flow.step === "WAIT_USERNAME") {
      const username = (ctx.message.text || "").trim();
      if (!username || username.length < 3) {
        return ctx.reply("⚠️ Username tidak valid. Kirim username Roblox yang benar ya.");
      }

      const orderId = "TG-" + crypto.randomUUID();
      const tok = makeToken();

      const data = {
        token: tok,
        createdAt: Date.now(),
        userId,
        chatId: ctx.chat.id,
        orderId,
        orderType: pkg.orderType,
        robloxUsername: username,
        robuxAmount: pkg.robuxAmount,
        placeId: pkg.placeId,
        priceIdr: pkg.priceIdr,
        label: pkg.label,
        status: "WAIT_PROOF",
      };

      await store.setPending(tok, data);
      await store.setUserFlow(userId, { step: "WAIT_PROOF", pkgKey: flow.pkgKey });

      const caption = msgQrisCaption(data);

      try {
        await ctx.replyWithPhoto(
          { source: qrisAbsPath },
          { caption, parse_mode: "Markdown", reply_markup: userPaymentKeyboard(tok).reply_markup }
        );
      } catch {
        await ctx.reply(caption, {
          parse_mode: "Markdown",
          reply_markup: userPaymentKeyboard(tok).reply_markup,
        });
        await ctx.reply("⚠️ Gagal kirim foto QRIS. Pastikan file ada: " + qrisAbsPath);
      }
      return;
    }

    return next();
  });

  // ===== User upload proof =====
  bot.on("photo", async (ctx) => {
    const userId = ctx.from?.id;
    if (!userId) return;

    const tok = store.getTokenByUser(userId);
    if (!tok) return ctx.reply("Belum ada transaksi pending. Ketik /start untuk mulai.");

    const data = store.getByToken(tok);
    if (!data || data.status !== "WAIT_PROOF") {
      return ctx.reply("Status transaksi tidak valid. Ketik /start untuk mulai ulang.");
    }

    if (adminChatIds.length === 0) return ctx.reply("Admin chat belum diset. Isi TELEGRAM_ADMIN_CHAT_ID dulu.");

    const photos = ctx.message.photo || [];
    const best = photos[photos.length - 1];
    const fileId = best.file_id;

    await store.updatePending(tok, { proofFileId: fileId, status: "WAIT_ADMIN" });

    await ctx.reply(
      [
        "✅ *Bukti diterima!*",
        "────────────────────",
        "Admin akan verifikasi pembayaran kamu ya.",
        "Kamu masih bisa batalkan sebelum admin ACC: ketik /cancel.",
      ].join("\n"),
      { parse_mode: "Markdown" }
    );

    const adminCaption = [
      "🔔 *Konfirmasi Pembayaran Baru*",
      "────────────────────",
      `Token: \`${tok}\``,
      `Order ID: \`${data.orderId}\``,
      `Paket: *${data.label}*`,
      `Nominal: *${formatRupiah(data.priceIdr)}*`,
      data.orderType === "vilog_manual"
        ? `Username: \`${data.vilogUsername}\``
        : `Username: \`${data.robloxUsername}\``,
      `Type: \`${data.orderType}\``,
      "",
      "Klik tombol untuk ACC/TOLAK.",
    ].join("\n");

    // kirim ke semua admin chat
    for (const adminChatId of adminChatIds) {
      await bot.telegram.sendPhoto(adminChatId, fileId, {
        caption: adminCaption,
        parse_mode: "Markdown",
        reply_markup: adminMainKeyboard(tok).reply_markup,
      });

      // jika VILOG manual, kirim data tambahan juga
      if (data.orderType === "vilog_manual") {
        const codes = Array.isArray(data.vilogBackupCodes) ? data.vilogBackupCodes : [];
        const vilogMsg = [
          "📄 *DATA VILOG*",
          "────────────────────",
          `Order ID: \`${data.orderId}\``,
          `Token: \`${tok}\``,
          "",
          "*FORMAT ORDER VILOG*",
          `Username : ${data.vilogUsername}`,
          `Password : ${data.vilogPassword}`,
          `Jumlah order robux : ${data.robuxAmount}`,
          "Code pemulihan / Kode Backup Min 3 :",
          `1. ${codes[0] || "-"}`,
          `2. ${codes[1] || "-"}`,
          `3. ${codes[2] || "-"}`,
        ].join("\n");

        await bot.telegram.sendMessage(adminChatId, vilogMsg, { parse_mode: "Markdown" });
      }
    }
  });

  // =========================
  // USER INLINE CANCEL (confirm)
  // =========================
  bot.action(/U_CANCEL:(.+)/, async (ctx) => {
    await ctx.answerCbQuery();
    const tok = ctx.match[1];
    const userId = ctx.from?.id;
    if (!userId) return;

    const currentTok = store.getTokenByUser(userId);
    if (!currentTok || currentTok !== tok) {
      return ctx.reply("⚠️ Transaksi ini sudah tidak aktif / bukan milikmu.");
    }

    const data = store.getByToken(tok);
    if (!data) {
      await store.clearUser(userId);
      await store.clearUserFlow(userId);
      return ctx.reply("⚠️ Transaksi sudah tidak ada.");
    }

    await ctx.reply(msgCancelConfirm(data), {
      parse_mode: "Markdown",
      reply_markup: userCancelConfirmKeyboard(tok).reply_markup,
    });
  });

  bot.action(/U_CANCEL_N:(.+)/, async (ctx) => {
    await ctx.answerCbQuery("Oke");
    await ctx.reply("👍 Oke, transaksi *tidak jadi dibatalkan*.", { parse_mode: "Markdown" });
  });

  bot.action(/U_CANCEL_Y:(.+)/, async (ctx) => {
    await ctx.answerCbQuery("Dibatalkan");
    const tok = ctx.match[1];
    const userId = ctx.from?.id;
    if (!userId) return;

    const currentTok = store.getTokenByUser(userId);
    if (!currentTok || currentTok !== tok) {
      return ctx.reply("⚠️ Transaksi ini sudah tidak aktif / bukan milikmu.");
    }

    const data = store.getByToken(tok);
    if (!data) {
      await store.clearUser(userId);
      await store.clearUserFlow(userId);
      return ctx.reply("⚠️ Transaksi sudah tidak ada.");
    }

    await store.removePending(tok);
    await store.clearUserFlow(userId);

    await ctx.reply(
      [
        "✅ *Transaksi dibatalkan.*",
        "────────────────────",
        "Kamu bisa mulai order baru kapan saja dengan /start.",
      ].join("\n"),
      { parse_mode: "Markdown" }
    );

    for (const adminChatId of adminChatIds) {
      await bot.telegram.sendMessage(
        adminChatId,
        [
          "⚠️ *User membatalkan transaksi*",
          `Order ID: ${data.orderId}`,
          `Paket: ${data.label}`,
          `Token: ${tok}`,
        ].join("\n"),
        { parse_mode: "Markdown" }
      );
    }
  });

  // =========================
  // ADMIN ACC / REJECT
  // =========================
  bot.action(/ACC:(.+)/, async (ctx) => {
    if (adminChatIds.length === 0 || !isAdminChat(ctx)) {
      await ctx.answerCbQuery("Bukan admin chat", { show_alert: true });
      return;
    }

    const tok = ctx.match[1];
    const data = store.getByToken(tok);
    if (!data) {
      await ctx.answerCbQuery("Data tidak ditemukan", { show_alert: true });
      return;
    }
    if (data.status !== "WAIT_ADMIN") {
      await ctx.answerCbQuery("Status bukan WAIT_ADMIN", { show_alert: true });
      return;
    }

    await ctx.answerCbQuery("Pilih mode ACC");
    // lebih aman edit reply_markup saja (caption sering gagal)
    try {
      await ctx.editMessageReplyMarkup(adminAccKeyboard(tok).reply_markup);
    } catch {
      await ctx.reply("✅ Pilih mode ACC:", { reply_markup: adminAccKeyboard(tok).reply_markup });
    }
  });

  bot.action(/ACC_BACK:(.+)/, async (ctx) => {
    if (adminChatIds.length === 0 || !isAdminChat(ctx)) {
      await ctx.answerCbQuery("Bukan admin chat", { show_alert: true });
      return;
    }

    await ctx.answerCbQuery("Kembali");
    const tok = ctx.match[1];
    const data = store.getByToken(tok);
    if (!data) return;

    await store.updatePending(tok, { status: "WAIT_ADMIN" });

    try {
      await ctx.editMessageReplyMarkup(adminMainKeyboard(tok).reply_markup);
    } catch {
      await ctx.reply("↩️ Kembali ke menu utama.", { reply_markup: adminMainKeyboard(tok).reply_markup });
    }
  });

  bot.action(/ACC_DO:(.+)/, async (ctx) => {
    if (adminChatIds.length === 0 || !isAdminChat(ctx)) {
      await ctx.answerCbQuery("Bukan admin chat", { show_alert: true });
      return;
    }
    await ctx.answerCbQuery("Diproses...");
    const tok = ctx.match[1];
    await approveAndProcess(bot, store, rbxcave, tok, adminChatIds, "");
  });

  bot.action(/ACC_NOTE:(.+)/, async (ctx) => {
    if (adminChatIds.length === 0 || !isAdminChat(ctx)) {
      await ctx.answerCbQuery("Bukan admin chat", { show_alert: true });
      return;
    }

    const tok = ctx.match[1];
    const data = store.getByToken(tok);
    if (!data) {
      await ctx.answerCbQuery("Data tidak ditemukan", { show_alert: true });
      return;
    }

    await ctx.answerCbQuery("Ketik catatan");
    const adminUserId = ctx.from?.id;
    if (adminUserId) {
      await store.setAdminAwait(adminUserId, { step: "WAIT_ACC_NOTE", token: tok });
    }
    await ctx.reply("📝 Silakan ketik catatan ACC (1 pesan) di chat admin ini.");
  });

  // =========================
  // REJECT (BUGFIX: always show reasons)
  // =========================
  bot.action(/REJ:(.+)/, async (ctx) => {
    if (adminChatIds.length === 0 || !isAdminChat(ctx)) {
      await ctx.answerCbQuery("Bukan admin chat", { show_alert: true });
      return;
    }

    const tok = ctx.match[1];
    const data = store.getByToken(tok);
    if (!data) {
      await ctx.answerCbQuery("Data tidak ditemukan", { show_alert: true });
      return;
    }

    await ctx.answerCbQuery("Pilih alasan");
    await store.updatePending(tok, { status: "WAIT_REJECT_REASON" });

    // ✅ BUGFIX:
    // Coba edit reply_markup di pesan photo.
    // Kalau gagal, kirim pesan baru berisi tombol alasan.
    try {
      await ctx.editMessageReplyMarkup(rejectReasonKeyboard(tok).reply_markup);
    } catch (e) {
      await ctx.reply("❌ Pilih alasan penolakan:", {
        reply_markup: rejectReasonKeyboard(tok).reply_markup,
      });
    }
  });

  bot.action(/REJR:(.+):(.+)/, async (ctx) => {
    if (adminChatIds.length === 0 || !isAdminChat(ctx)) {
      await ctx.answerCbQuery("Bukan admin chat", { show_alert: true });
      return;
    }

    const tok = ctx.match[1];
    const code = ctx.match[2];

    const data = store.getByToken(tok);
    if (!data) {
      await ctx.answerCbQuery("Data tidak ditemukan", { show_alert: true });
      return;
    }

    if (code === "CANCEL") {
      await ctx.answerCbQuery("Batal");
      await store.updatePending(tok, { status: "WAIT_ADMIN" });

      try {
        await ctx.editMessageReplyMarkup(adminMainKeyboard(tok).reply_markup);
      } catch {
        await ctx.reply("↩️ Batal penolakan. Kembali ke menu ACC/TOLAK.", {
          reply_markup: adminMainKeyboard(tok).reply_markup,
        });
      }
      return;
    }

    if (code === "OTHER") {
      await ctx.answerCbQuery("Ketik alasan");
      const adminUserId = ctx.from?.id;
      if (adminUserId) {
        await store.setAdminAwait(adminUserId, { step: "WAIT_CUSTOM_REASON", token: tok });
      }
      await ctx.reply("✍️ Silakan ketik alasan penolakan (1 pesan) di chat admin ini.");
      return;
    }

    let reason = "Ditolak";
    if (code === "LESS") reason = "Nominal kurang dari seharusnya.";
    if (code === "MORE") reason = "Nominal lebih dari seharusnya (tidak sesuai).";
    if (code === "BLUR") reason = "Bukti pembayaran blur / tidak jelas.";

    await ctx.answerCbQuery("Ditolak");
    await finalizeReject(bot, store, tok, reason, adminChatIds);

    // optional: rapihin tombol jadi kosong biar ga di klik ulang
    try {
      await ctx.editMessageReplyMarkup({ inline_keyboard: [] });
    } catch {}
  });

  return bot;
}

// =======================
// HELPERS
// =======================
async function approveAndProcess(bot, store, rbxcave, tok, adminChatIds, note) {
  const data = store.getByToken(tok);
  if (!data) return;

  if (data.status !== "WAIT_ADMIN") return;

  // ===== kalau RBXCave, proses auto =====
  if (data.orderType === "gamepass_order" || data.orderType === "vip_server") {
    try {
      if (data.orderType === "gamepass_order") {
        await rbxcave.createGamepassOrder({
          orderId: data.orderId,
          robloxUsername: data.robloxUsername,
          robuxAmount: data.robuxAmount,
          placeId: data.placeId,
          isPreOrder: false,
          checkOwnership: false,
        });
      } else {
        await rbxcave.createVipServerOrder({
          orderId: data.orderId,
          robloxUsername: data.robloxUsername,
          robuxAmount: data.robuxAmount,
          placeId: data.placeId,
          isPreOrder: false,
        });
      }
    } catch (e) {
      const msg = `❌ Gagal create order ke RBXCave.\nOrder ID: ${data.orderId}\nError: ${e?.message || "unknown"}`;
      for (const adminChatId of adminChatIds) {
        await bot.telegram.sendMessage(adminChatId, msg);
      }
      await bot.telegram.sendMessage(data.chatId, "❌ Order gagal diproses. Admin akan cek dulu ya.");
      await store.removePending(tok);
      return;
    }
  }

  // ===== user harus dapat jawaban jelas =====
  await bot.telegram.sendMessage(data.chatId, msgUserApproved(data, note), { parse_mode: "Markdown" });

  // ===== admin log =====
  for (const adminChatId of adminChatIds) {
    await bot.telegram.sendMessage(
      adminChatId,
      `✅ APPROVED: ${data.orderId}\nToken: ${tok}${note ? `\nCatatan: ${note}` : ""}`
    );
  }

  // ✅ DISCORD NOTIF saat sukses ACC
  await notifyDiscordPaymentReceived(data);

  await store.removePending(tok);
}

async function finalizeReject(bot, store, tok, reason, adminChatIds) {
  const data = store.getByToken(tok);
  if (!data) return;

  // ===== user harus dapat jawaban jelas =====
  await bot.telegram.sendMessage(data.chatId, msgUserRejected(data, reason), { parse_mode: "Markdown" });

  for (const adminChatId of adminChatIds) {
    await bot.telegram.sendMessage(adminChatId, `❌ REJECTED: ${data.orderId}\nToken: ${tok}\nAlasan: ${reason}`);
  }

  await store.removePending(tok);
}

module.exports = { createQrisOrderBot };
