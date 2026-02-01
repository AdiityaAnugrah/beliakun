// backend/bots/qrisOrderBot.js
const { Telegraf, Markup } = require("telegraf");
const crypto = require("crypto");
const path = require("path");
const https = require("https");
const { URL } = require("url");

const { makeGAMEPASSClient } = require("../utils/GAMEPASSClient");
const { PendingStore } = require("../utils/pendingStore");

// =========================
// KONFIG PAKET
// =========================

// ====== GAMEPASS (AUTO) ======
const PACKAGES_GAMEPASS = [
  {
    key: "gp_100",
    mode: "GAMEPASS",
    orderType: "gamepass_order",
    label: "⚡ GAMEPASS Gamepass 100 Robux",
    robuxAmount: 100,
    placeId: 12345678,
    priceIdr: 20000,
  },
  {
    key: "gp_250",
    mode: "GAMEPASS",
    orderType: "gamepass_order",
    label: "⚡ GAMEPASS Gamepass 250 Robux",
    robuxAmount: 250,
    placeId: 12345678,
    priceIdr: 45000,
  },
  {
    key: "vip_200",
    mode: "GAMEPASS",
    orderType: "vip_server",
    label: "⚡ GAMEPASS VIP Server 200 Robux",
    robuxAmount: 200,
    placeId: 12345678,
    priceIdr: 35000,
  },
];

// ====== VILOG (MANUAL VIA LOGIN) ======
const PACKAGES_VILOG = [
  { key: "vilog_100", mode: "VILOG", orderType: "vilog_manual", label: "🔐 VILOG 100⏣", robuxAmount: 100, priceIdr: 10994 },
  { key: "vilog_200", mode: "VILOG", orderType: "vilog_manual", label: "🔐 VILOG 200⏣", robuxAmount: 200, priceIdr: 21987 },
  { key: "vilog_300", mode: "VILOG", orderType: "vilog_manual", label: "🔐 VILOG 300⏣", robuxAmount: 300, priceIdr: 32980 },
  { key: "vilog_400", mode: "VILOG", orderType: "vilog_manual", label: "🔐 VILOG 400⏣", robuxAmount: 400, priceIdr: 43973 },
  { key: "vilog_500", mode: "VILOG", orderType: "vilog_manual", label: "🔐 VILOG 500⏣", robuxAmount: 500, priceIdr: 54966 },
  { key: "vilog_600", mode: "VILOG", orderType: "vilog_manual", label: "🔐 VILOG 600⏣", robuxAmount: 600, priceIdr: 65959 },
  { key: "vilog_700", mode: "VILOG", orderType: "vilog_manual", label: "🔐 VILOG 700⏣", robuxAmount: 700, priceIdr: 76952 },
  { key: "vilog_800", mode: "VILOG", orderType: "vilog_manual", label: "🔐 VILOG 800⏣", robuxAmount: 800, priceIdr: 87869 },
  { key: "vilog_900", mode: "VILOG", orderType: "vilog_manual", label: "🔐 VILOG 900⏣", robuxAmount: 900, priceIdr: 98862 },
  { key: "vilog_1000", mode: "VILOG", orderType: "vilog_manual", label: "🔐 VILOG 1000⏣", robuxAmount: 1000, priceIdr: 109855 },
  { key: "vilog_2000", mode: "VILOG", orderType: "vilog_manual", label: "🔐 VILOG 2000⏣", robuxAmount: 2000, priceIdr: 219709 },
  { key: "vilog_3000", mode: "VILOG", orderType: "vilog_manual", label: "🔐 VILOG 3000⏣", robuxAmount: 3000, priceIdr: 329487 },
  { key: "vilog_4000", mode: "VILOG", orderType: "vilog_manual", label: "🔐 VILOG 4000⏣", robuxAmount: 4000, priceIdr: 439341 },
  { key: "vilog_5000", mode: "VILOG", orderType: "vilog_manual", label: "🔐 VILOG 5000⏣", robuxAmount: 5000, priceIdr: 549119 },
  { key: "vilog_6000", mode: "VILOG", orderType: "vilog_manual", label: "🔐 VILOG 6000⏣", robuxAmount: 6000, priceIdr: 658973 },
  { key: "vilog_7000", mode: "VILOG", orderType: "vilog_manual", label: "🔐 VILOG 7000⏣", robuxAmount: 7000, priceIdr: 768750 },
  { key: "vilog_8000", mode: "VILOG", orderType: "vilog_manual", label: "🔐 VILOG 8000⏣", robuxAmount: 8000, priceIdr: 878605 },
  { key: "vilog_9000", mode: "VILOG", orderType: "vilog_manual", label: "🔐 VILOG 9000⏣", robuxAmount: 9000, priceIdr: 988459 },
  { key: "vilog_10000", mode: "VILOG", orderType: "vilog_manual", label: "🔐 VILOG 10000⏣", robuxAmount: 10000, priceIdr: 1098237 },
  { key: "vilog_15000", mode: "VILOG", orderType: "vilog_manual", label: "🔐 VILOG 15000⏣", robuxAmount: 15000, priceIdr: 1647355 },
  { key: "vilog_20000", mode: "VILOG", orderType: "vilog_manual", label: "🔐 VILOG 20000⏣", robuxAmount: 20000, priceIdr: 2196473 },
  { key: "vilog_25000", mode: "VILOG", orderType: "vilog_manual", label: "🔐 VILOG 25000⏣", robuxAmount: 25000, priceIdr: 2745591 },
  { key: "vilog_40000", mode: "VILOG", orderType: "vilog_manual", label: "🔐 VILOG 40000⏣", robuxAmount: 40000, priceIdr: 4392869 },
  { key: "vilog_50000", mode: "VILOG", orderType: "vilog_manual", label: "🔐 VILOG 50000⏣", robuxAmount: 50000, priceIdr: 5491105 },
];

const PAGE_SIZE = 6;
const PENDING_TTL_MS = 1000 * 60 * 60; // 1 jam

// =========================
// UTIL
// =========================
function formatRupiah(n) {
  try {
    return "Rp " + new Intl.NumberFormat("id-ID").format(Number(n || 0));
  } catch {
    return "Rp " + String(n);
  }
}

function makeToken() {
  return crypto.randomBytes(6).toString("hex");
}

function pagesCount(list) {
  return Math.max(1, Math.ceil(list.length / PAGE_SIZE));
}

function getPackagesByMode(mode) {
  if (mode === "VILOG") return PACKAGES_VILOG;
  return PACKAGES_GAMEPASS;
}

function findPackage(mode, key) {
  const list = getPackagesByMode(mode);
  return list.find((p) => p.key === key) || null;
}

function parseAdminChatIds(raw) {
  return String(raw || "")
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function isAdminChatId(adminChatIds, chatId) {
  const cid = String(chatId || "");
  return adminChatIds.includes(cid);
}

// =========================
// DISCORD WEBHOOK (PAYMENT NOTIF)
// =========================
function postDiscordWebhook(webhookUrl, content) {
  return new Promise((resolve) => {
    try {
      if (!webhookUrl) return resolve({ ok: false, status: 0, error: "empty_url" });

      const u = new URL(webhookUrl);
      const body = JSON.stringify({ content });

      const req = https.request(
        {
          method: "POST",
          hostname: u.hostname,
          path: u.pathname + (u.search || ""),
          headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(body),
          },
        },
        (res) => {
          let data = "";
          res.on("data", (chunk) => (data += chunk));
          res.on("end", () => {
            resolve({ ok: res.statusCode >= 200 && res.statusCode < 300, status: res.statusCode, text: data });
          });
        }
      );

      req.on("error", (e) => resolve({ ok: false, status: 0, error: e?.message || String(e) }));
      req.write(body);
      req.end();
    } catch (e) {
      resolve({ ok: false, status: 0, error: e?.message || String(e) });
    }
  });
}

async function notifyDiscordPaymentReceived(orderData) {
  const url = process.env.DISCORD_WEBHOOK_URL || "";
  if (!url) return;

  const nominal = formatRupiah(orderData.priceIdr || 0);
  const username = String(orderData.robloxUsername || orderData.loginUsername || orderData.username || "-").trim() || "-";
  const paket = String(orderData.label || "-").trim() || "-";

  const content = `Payment received: ${nominal} from ${username} [${paket}]`;

  const res = await postDiscordWebhook(url, content);
  if (!res.ok) {
    const preview = String(res.text || "").slice(0, 200);
    console.log("[discord] webhook failed:", res.status, preview || res.error || "");
  } else {
    console.log("[discord] webhook sent:", content);
  }
}

// =========================
// UI KEYBOARDS (Modern)
// =========================
function modeKeyboard() {
  return Markup.inlineKeyboard([
    [Markup.button.callback("🔐 VIA LOGIN (VILOG)", "MODE:VILOG")],
    [Markup.button.callback("⚡ GAMEPASS Auto", "MODE:GAMEPASS")],
    [Markup.button.callback("🔄 Reset", "RESET")],
  ]);
}

function packagesKeyboard(mode, page) {
  const list = getPackagesByMode(mode);
  const totalPages = pagesCount(list);
  const p = Math.max(0, Math.min(Number(page || 0), totalPages - 1));

  const start = p * PAGE_SIZE;
  const items = list.slice(start, start + PAGE_SIZE);

  const rows = [];

  for (let i = 0; i < items.length; i += 2) {
    const a = items[i];
    const b = items[i + 1];

    const textA =
      mode === "VILOG"
        ? `${a.robuxAmount}⏣ • ${formatRupiah(a.priceIdr)}`
        : `${a.label} • ${formatRupiah(a.priceIdr)}`;

    const row = [Markup.button.callback(textA, `PKG:${mode}:${a.key}`)];

    if (b) {
      const textB =
        mode === "VILOG"
          ? `${b.robuxAmount}⏣ • ${formatRupiah(b.priceIdr)}`
          : `${b.label} • ${formatRupiah(b.priceIdr)}`;
      row.push(Markup.button.callback(textB, `PKG:${mode}:${b.key}`));
    }

    rows.push(row);
  }

  const nav = [];
  if (p > 0) nav.push(Markup.button.callback("⬅️ Prev", `PAGE:${mode}:${p - 1}`));
  nav.push(Markup.button.callback(`📄 ${p + 1}/${totalPages}`, "NOOP"));
  if (p < totalPages - 1) nav.push(Markup.button.callback("Next ➡️", `PAGE:${mode}:${p + 1}`));
  rows.push(nav);

  rows.push([Markup.button.callback("⬅️ Kembali (Pilih Mode)", "BACK_TO_MODE")]);
  rows.push([Markup.button.callback("🔄 Reset", "RESET")]);

  return Markup.inlineKeyboard(rows);
}

function backToPackagesKeyboard(mode) {
  return Markup.inlineKeyboard([
    [Markup.button.callback("⬅️ Ganti Paket", `BACK_TO_PACKAGES:${mode}`)],
    [Markup.button.callback("⬅️ Kembali (Pilih Mode)", "BACK_TO_MODE")],
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
    "✨ *Centra Game Bot*",
    "────────────────────",
    "Silakan pilih metode order 👇",
    "",
    "🧩 *Cara kerja singkat:*",
    "1) Pilih metode (VIA LOGIN / VIA GAMEPASS)",
    "2) Pilih paket",
    "3) Isi data",
    "4) Bayar via QRIS (upload bukti)",
    "5) Admin verifikasi lalu ACC / TOLAK (kamu dapat jawaban jelas)",
    "",
    "🛑 Kamu bisa batalkan sebelum admin ACC: ketik /cancel",
  ].join("\n");
}

function msgPickMode(mode) {
  if (mode === "VILOG") {
    return [
      "🔐 *VIA LOGIN*",
      "────────────────────",
      "Pilih jumlah Robux yang kamu mau 👇",
      "",
      "ℹ️ Setelah pilih paket, kamu diminta kirim format data login + kode backup (min 3).",
    ].join("\n");
  }
  return [
    "⚡ *VIA GAMEPASS*",
    "────────────────────",
    "Pilih paket GAMEPASS yang kamu mau 👇",
    "",
    "ℹ️ Setelah pilih paket, kamu cukup kirim username Roblox.",
  ].join("\n");
}

function msgPackagePickedGAMEPASS(pkg) {
  return [
    "🧾 *Detail Paket (GAMEPASS Auto)*",
    "────────────────────",
    `📦 Paket: *${pkg.label}*`,
    `💳 Harga: *${formatRupiah(pkg.priceIdr)}*`,
    `🎟️ Robux: *${pkg.robuxAmount}*`,
    "",
    "✍️ Sekarang kirim *username Roblox* kamu (1 pesan).",
    "Contoh: `AdiityaAnugrah`",
  ].join("\n");
}

function msgVilogTemplate(pkg) {
  return [
    "🧾 *Detail Paket (VIA LOGIN)*",
    "────────────────────",
    `📦 Paket: *${pkg.label}*`,
    `💳 Harga: *${formatRupiah(pkg.priceIdr)}*`,
    `🎟️ Jumlah Robux: *${pkg.robuxAmount}*`,
    "",
    "✍️ Sekarang kirim data dengan format ini (copy-paste):",
    "",
    "*FORMAT ORDER VIA LOGIN*",
    "Username :",
    "Password :",
    "Jumlah order robux :",
    "Code pemulihan / Kode Backup Min 3 :",
    "1.",
    "2.",
    "3.",
    "",
    "~ Kode yang sudah dipakai tidak bisa dipakai lagi",
    "~ Jika pakai kode email/verif acc, wajib stanby",
    "~ Perhatikan besar kecil username & pw",
    "~ Harap matikan passkey / faceid / finger, dll",
  ].join("\n");
}

function msgQrisCaption(data) {
  const mode = data.mode === "VILOG" ? "🔐 VILOG" : "⚡ GAMEPASS";
  return [
    "🧾 *Pembayaran QRIS*",
    "────────────────────",
    `🧩 Mode: *${mode}*`,
    `📦 Paket: *${data.label}*`,
    `💳 Nominal: *${formatRupiah(data.priceIdr)}*`,
    `🧾 Order ID: \`${data.orderId}\``,
    data.mode === "VILOG"
      ? `👤 Username: \`${data.loginUsername}\``
      : `👤 Username: \`${data.robloxUsername}\``,
    "",
    "✅ Scan QRIS lalu upload foto bukti pembayaran di chat ini.",
    "🔎 Admin akan verifikasi, lalu ACC/TOLAK (kamu akan dapat jawaban jelas).",
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

// =========================
// PARSER VILOG (tolerant)
// =========================
function pickAfterColon(line) {
  const idx = line.indexOf(":");
  if (idx === -1) return "";
  return line.slice(idx + 1).trim();
}

function parseVilogForm(text, forcedRobuxAmount) {
  const raw = String(text || "").trim();
  const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);

  let username = "";
  let password = "";
  let jumlah = "";
  const codes = [];

  for (const l of lines) {
    const low = l.toLowerCase();

    if (!username && (low.startsWith("username") || low.startsWith("user"))) {
      username = pickAfterColon(l) || "";
      continue;
    }
    if (!password && (low.startsWith("password") || low.startsWith("pass"))) {
      password = pickAfterColon(l) || "";
      continue;
    }
    if (!jumlah && (low.includes("jumlah") && low.includes("robux"))) {
      jumlah = pickAfterColon(l) || "";
      continue;
    }

    const m = l.match(/^(\d+)\.\s*(.+)$/);
    if (m && m[2]) {
      const c = String(m[2]).trim();
      if (c) codes.push(c);
      continue;
    }
    const m2 = l.match(/^-+\s*(.+)$/);
    if (m2 && m2[1]) {
      const c = String(m2[1]).trim();
      if (c) codes.push(c);
      continue;
    }
  }

  const jumlahNum = forcedRobuxAmount ? Number(forcedRobuxAmount) : Number(String(jumlah).replace(/[^\d]/g, ""));
  const cleanJumlah = Number.isFinite(jumlahNum) && jumlahNum > 0 ? jumlahNum : 0;

  return {
    ok: Boolean(username && password && (cleanJumlah > 0) && codes.length >= 3),
    username,
    password,
    jumlahRobux: cleanJumlah,
    backupCodes: codes.slice(0, 10),
    error:
      !username ? "Username kosong" :
      !password ? "Password kosong" :
      !(cleanJumlah > 0) ? "Jumlah order robux tidak valid" :
      (codes.length < 3) ? "Kode backup minimal 3" :
      "",
  };
}

// =========================
// BOT
// =========================
function createQrisOrderBot() {
  const botToken = process.env.TELEGRAM_BOT_TOKEN_GAMEPASS;
  if (!botToken) throw new Error("TELEGRAM_BOT_TOKEN_GAMEPASS missing in backend/.env");

  const adminChatIds = parseAdminChatIds(process.env.TELEGRAM_ADMIN_CHAT_ID || "");
  if (!adminChatIds.length) {
    console.log("[qris-bot] WARNING: TELEGRAM_ADMIN_CHAT_ID kosong. Admin approval tidak akan jalan.");
  }

  const qrisRelPath = process.env.QRIS_IMAGE_PATH || "assets/qris.jpg";
  const qrisAbsPath = path.join(__dirname, "..", qrisRelPath);

  const store = new PendingStore();
  const GAMEPASS = makeGAMEPASSClient();
  const bot = new Telegraf(botToken);

  // cleanup expired pending
  setInterval(() => store.cleanupExpired(PENDING_TTL_MS), 60 * 1000).unref?.();

  bot.command("myid", (ctx) => {
    ctx.reply(`chat_id: ${ctx.chat?.id}\nuser_id: ${ctx.from?.id}`);
  });

  bot.start(async (ctx) => {
    const userId = ctx.from?.id;
    if (userId) await store.clearUserFlow(userId);

    await ctx.reply(msgWelcome(), {
      parse_mode: "Markdown",
      reply_markup: modeKeyboard().reply_markup,
    });
  });

  bot.command("cancel", async (ctx) => {
    const userId = ctx.from?.id;
    if (!userId) return;

    const tok = store.getTokenByUser(userId);
    if (!tok) return ctx.reply("Tidak ada transaksi pending untuk dibatalkan.");

    const data = store.getByToken(tok);
    if (!data) {
      await store.clearUser(userId);
      return ctx.reply("Tidak ada transaksi pending untuk dibatalkan.");
    }

    await ctx.reply(msgCancelConfirm(data), {
      parse_mode: "Markdown",
      reply_markup: userCancelConfirmKeyboard(tok).reply_markup,
    });
  });

  bot.action("NOOP", async (ctx) => ctx.answerCbQuery());

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

  bot.action("BACK_TO_MODE", async (ctx) => {
    await ctx.answerCbQuery();
    const userId = ctx.from?.id;
    if (userId) await store.clearUserFlow(userId);

    try {
      await ctx.editMessageText(msgWelcome(), {
        parse_mode: "Markdown",
        reply_markup: modeKeyboard().reply_markup,
      });
    } catch {
      await ctx.reply(msgWelcome(), {
        parse_mode: "Markdown",
        reply_markup: modeKeyboard().reply_markup,
      });
    }
  });

  bot.action(/MODE:(VILOG|GAMEPASS)/, async (ctx) => {
    await ctx.answerCbQuery();
    const mode = ctx.match[1];

    const userId = ctx.from?.id;
    if (userId) await store.setUserFlow(userId, { step: "CHOOSE_PKG", mode, page: 0 });

    const text = msgPickMode(mode);
    try {
      await ctx.editMessageText(text, {
        parse_mode: "Markdown",
        reply_markup: packagesKeyboard(mode, 0).reply_markup,
      });
    } catch {
      await ctx.reply(text, {
        parse_mode: "Markdown",
        reply_markup: packagesKeyboard(mode, 0).reply_markup,
      });
    }
  });

  bot.action(/PAGE:(VILOG|GAMEPASS):(\d+)/, async (ctx) => {
    await ctx.answerCbQuery();
    const mode = ctx.match[1];
    const page = Number(ctx.match[2] || 0);

    const userId = ctx.from?.id;
    if (userId) await store.setUserFlow(userId, { step: "CHOOSE_PKG", mode, page });

    const text = msgPickMode(mode);
    try {
      await ctx.editMessageText(text, {
        parse_mode: "Markdown",
        reply_markup: packagesKeyboard(mode, page).reply_markup,
      });
    } catch {
      await ctx.reply(text, {
        parse_mode: "Markdown",
        reply_markup: packagesKeyboard(mode, page).reply_markup,
      });
    }
  });

  bot.action(/BACK_TO_PACKAGES:(VILOG|GAMEPASS)/, async (ctx) => {
    await ctx.answerCbQuery();
    const mode = ctx.match[1];

    const userId = ctx.from?.id;
    if (userId) await store.setUserFlow(userId, { step: "CHOOSE_PKG", mode, page: 0 });

    const text = msgPickMode(mode);
    try {
      await ctx.editMessageText(text, {
        parse_mode: "Markdown",
        reply_markup: packagesKeyboard(mode, 0).reply_markup,
      });
    } catch {
      await ctx.reply(text, {
        parse_mode: "Markdown",
        reply_markup: packagesKeyboard(mode, 0).reply_markup,
      });
    }
  });

  bot.action(/PKG:(VILOG|GAMEPASS):(.+)/, async (ctx) => {
    await ctx.answerCbQuery();
    const mode = ctx.match[1];
    const pkgKey = ctx.match[2];

    const pkg = findPackage(mode, pkgKey);
    if (!pkg) return ctx.reply("Paket tidak ditemukan. Ketik /start untuk ulang.");

    const userId = ctx.from?.id;
    if (!userId) return;

    const existing = store.getTokenByUser(userId);
    if (existing) {
      return ctx.reply("⚠️ Kamu masih punya transaksi pending.\nKetik /cancel untuk batalkan dulu.", { parse_mode: "Markdown" });
    }

    if (mode === "VILOG") {
      await store.setUserFlow(userId, { step: "WAIT_VILOG_FORM", mode, pkgKey });
      const prompt = msgVilogTemplate(pkg);

      try {
        await ctx.editMessageText(prompt, {
          parse_mode: "Markdown",
          reply_markup: backToPackagesKeyboard(mode).reply_markup,
        });
      } catch {
        await ctx.reply(prompt, { parse_mode: "Markdown", reply_markup: backToPackagesKeyboard(mode).reply_markup });
      }
    } else {
      await store.setUserFlow(userId, { step: "WAIT_GAMEPASS_USERNAME", mode, pkgKey });
      const prompt = msgPackagePickedGAMEPASS(pkg);

      try {
        await ctx.editMessageText(prompt, {
          parse_mode: "Markdown",
          reply_markup: backToPackagesKeyboard(mode).reply_markup,
        });
      } catch {
        await ctx.reply(prompt, { parse_mode: "Markdown", reply_markup: backToPackagesKeyboard(mode).reply_markup });
      }
    }
  });

  // =========================
  // TEXT HANDLER
  // =========================
  bot.on("text", async (ctx, next) => {
    const fromId = ctx.from?.id;
    const chatId = String(ctx.chat?.id || "");

    // ADMIN await flows
    if (fromId && isAdminChatId(adminChatIds, chatId)) {
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
        await approveAndProcess(bot, store, GAMEPASS, awaitObj.token, adminChatIds, note);
        return;
      }
    }

    // USER flow
    const userId = ctx.from?.id;
    if (!userId) return next();

    const flow = store.getUserFlow(userId);
    if (!flow) return next();

    // VILOG form
    if (flow.step === "WAIT_VILOG_FORM") {
      const pkg = findPackage("VILOG", flow.pkgKey);
      if (!pkg) {
        await store.clearUserFlow(userId);
        return ctx.reply("Paket invalid. Ketik /start untuk mulai lagi.");
      }

      const parsed = parseVilogForm(ctx.message.text || "", pkg.robuxAmount);
      if (!parsed.ok) {
        return ctx.reply(
          [
            "⚠️ Format ORDER VIA LOGIN belum lengkap.",
            `Alasan: *${parsed.error || "Tidak valid"}*`,
            "",
            "Silakan kirim ulang dengan format berikut:",
            "",
            msgVilogTemplate(pkg),
          ].join("\n"),
          { parse_mode: "Markdown", reply_markup: backToPackagesKeyboard("VILOG").reply_markup }
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

        mode: "VILOG",
        orderType: "vilog_manual",

        label: pkg.label,
        priceIdr: pkg.priceIdr,
        robuxAmount: pkg.robuxAmount,

        loginUsername: parsed.username,
        loginPassword: parsed.password,
        jumlahOrderRobux: parsed.jumlahRobux,
        backupCodes: parsed.backupCodes,

        status: "WAIT_PROOF",
      };

      await store.setPending(tok, data);
      await store.setUserFlow(userId, { step: "WAIT_PROOF", mode: "VILOG", pkgKey: flow.pkgKey });

      const caption = msgQrisCaption(data);

      try {
        await ctx.replyWithPhoto(
          { source: qrisAbsPath },
          { caption, parse_mode: "Markdown", reply_markup: userPaymentKeyboard(tok).reply_markup }
        );
      } catch {
        await ctx.reply(caption, { parse_mode: "Markdown", reply_markup: userPaymentKeyboard(tok).reply_markup });
        await ctx.reply("⚠️ Gagal kirim foto QRIS. Pastikan file ada: " + qrisAbsPath);
      }
      return;
    }

    // GAMEPASS username
    if (flow.step === "WAIT_GAMEPASS_USERNAME") {
      const pkg = findPackage("GAMEPASS", flow.pkgKey);
      if (!pkg) {
        await store.clearUserFlow(userId);
        return ctx.reply("Paket invalid. Ketik /start untuk mulai lagi.");
      }

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

        mode: "GAMEPASS",
        orderType: pkg.orderType,
        robloxUsername: username,
        robuxAmount: pkg.robuxAmount,
        placeId: pkg.placeId,

        label: pkg.label,
        priceIdr: pkg.priceIdr,

        status: "WAIT_PROOF",
      };

      await store.setPending(tok, data);
      await store.setUserFlow(userId, { step: "WAIT_PROOF", mode: "GAMEPASS", pkgKey: flow.pkgKey });

      const caption = msgQrisCaption(data);

      try {
        await ctx.replyWithPhoto(
          { source: qrisAbsPath },
          { caption, parse_mode: "Markdown", reply_markup: userPaymentKeyboard(tok).reply_markup }
        );
      } catch {
        await ctx.reply(caption, { parse_mode: "Markdown", reply_markup: userPaymentKeyboard(tok).reply_markup });
        await ctx.reply("⚠️ Gagal kirim foto QRIS. Pastikan file ada: " + qrisAbsPath);
      }
      return;
    }

    return next();
  });

  // =========================
  // USER UPLOAD PROOF
  // =========================
  bot.on("photo", async (ctx) => {
    const userId = ctx.from?.id;
    if (!userId) return;

    const tok = store.getTokenByUser(userId);
    if (!tok) return ctx.reply("Belum ada transaksi pending. Ketik /start untuk mulai.");

    const data = store.getByToken(tok);
    if (!data || data.status !== "WAIT_PROOF") {
      return ctx.reply("Status transaksi tidak valid. Ketik /start untuk mulai ulang.");
    }

    if (!adminChatIds.length) return ctx.reply("Admin chat belum diset. Isi TELEGRAM_ADMIN_CHAT_ID dulu.");

    const photos = ctx.message.photo || [];
    const best = photos[photos.length - 1];
    const fileId = best.file_id;

    await store.updatePending(tok, { proofFileId: fileId, status: "WAIT_ADMIN" });

    await ctx.reply(
      [
        "✅ *Bukti diterima!*",
        "────────────────────",
        "Admin akan verifikasi pembayaran kamu.",
        "Kamu akan dapat jawaban jelas: *ACC / TOLAK*.",
        "Kamu masih bisa batalkan sebelum admin ACC: ketik /cancel.",
      ].join("\n"),
      { parse_mode: "Markdown" }
    );

    const who = data.mode === "VILOG" ? data.loginUsername : data.robloxUsername;
    const modeText = data.mode === "VILOG" ? "🔐 VILOG (manual)" : "⚡ GAMEPASS (auto)";

    const adminCaption = [
      "🔔 *Konfirmasi Pembayaran Baru*",
      "────────────────────",
      `Token: \`${tok}\``,
      `Mode: *${modeText}*`,
      `Order ID: \`${data.orderId}\``,
      `Paket: *${data.label}*`,
      `Nominal seharusnya: *${formatRupiah(data.priceIdr)}*`,
      `User: \`${who}\``,
      "",
      "Klik tombol untuk ACC/TOLAK.",
    ].join("\n");

    for (const adminChatId of adminChatIds) {
      try {
        await bot.telegram.sendPhoto(adminChatId, fileId, {
          caption: adminCaption,
          parse_mode: "Markdown",
          reply_markup: adminMainKeyboard(tok).reply_markup,
        });

        if (data.mode === "VILOG") {
          const detail = [
            "🔐 *DETAIL ORDER VIA LOGIN*",
            "────────────────────",
            `Token: \`${tok}\``,
            `Order ID: \`${data.orderId}\``,
            `Paket: *${data.label}*`,
            "",
            `Username: \`${data.loginUsername}\``,
            `Password: \`${data.loginPassword}\``,
            `Jumlah order robux: *${data.jumlahOrderRobux}*`,
            "",
            "*Backup Codes:*",
            ...(Array.isArray(data.backupCodes) ? data.backupCodes.map((c, i) => `${i + 1}. \`${c}\``) : []),
            "",
            "⚠️ Pastikan kode belum pernah dipakai.",
          ].join("\n");

          await bot.telegram.sendMessage(adminChatId, detail, { parse_mode: "Markdown" });
        }
      } catch (e) {
        console.log("[qris-bot] failed send to admin:", adminChatId, e?.message || e);
      }
    }
  });

  // =========================
  // USER INLINE CANCEL
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
      try {
        await bot.telegram.sendMessage(
          adminChatId,
          [
            "⚠️ *User membatalkan transaksi*",
            `Order ID: ${data.orderId}`,
            `Paket: ${data.label}`,
            `User: ${data.mode === "VILOG" ? data.loginUsername : data.robloxUsername}`,
            `Token: ${tok}`,
          ].join("\n"),
          { parse_mode: "Markdown" }
        );
      } catch {}
    }
  });

  // =========================
  // ADMIN ACC / REJECT
  // =========================
  bot.action(/ACC:(.+)/, async (ctx) => {
    const chatId = String(ctx.chat?.id || "");
    if (!isAdminChatId(adminChatIds, chatId)) {
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
    const baseCaption = ctx.update.callback_query.message.caption || "";
    const newCaption = baseCaption + "\n\n✅ *Pilih ACC:*";
    try {
      await ctx.editMessageCaption(newCaption, {
        parse_mode: "Markdown",
        reply_markup: adminAccKeyboard(tok).reply_markup,
      });
    } catch {
      // fallback: kirim message baru agar tidak ngambang
      await ctx.reply("✅ Pilih ACC:", { reply_markup: adminAccKeyboard(tok).reply_markup });
    }
  });

  bot.action(/ACC_BACK:(.+)/, async (ctx) => {
    const chatId = String(ctx.chat?.id || "");
    if (!isAdminChatId(adminChatIds, chatId)) {
      await ctx.answerCbQuery("Bukan admin chat", { show_alert: true });
      return;
    }
    await ctx.answerCbQuery("Kembali");

    const tok = ctx.match[1];
    const data = store.getByToken(tok);
    if (!data) return;

    await store.updatePending(tok, { status: "WAIT_ADMIN" });

    const caption = (ctx.update.callback_query.message.caption || "").replace(/\n\n✅ \*Pilih ACC:\*[\s\S]*$/m, "");
    try {
      await ctx.editMessageCaption(caption, {
        parse_mode: "Markdown",
        reply_markup: adminMainKeyboard(tok).reply_markup,
      });
    } catch {
      await ctx.reply("✅ Kembali ke menu:", { reply_markup: adminMainKeyboard(tok).reply_markup });
    }
  });

  bot.action(/ACC_DO:(.+)/, async (ctx) => {
    const chatId = String(ctx.chat?.id || "");
    if (!isAdminChatId(adminChatIds, chatId)) {
      await ctx.answerCbQuery("Bukan admin chat", { show_alert: true });
      return;
    }
    await ctx.answerCbQuery("Diproses...");
    const tok = ctx.match[1];
    await approveAndProcess(bot, store, GAMEPASS, tok, adminChatIds, "");
  });

  bot.action(/ACC_NOTE:(.+)/, async (ctx) => {
    const chatId = String(ctx.chat?.id || "");
    if (!isAdminChatId(adminChatIds, chatId)) {
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
    if (adminUserId) await store.setAdminAwait(adminUserId, { step: "WAIT_ACC_NOTE", token: tok });

    await ctx.reply("📝 Silakan ketik catatan ACC (1 pesan) di chat admin ini.");
  });

  // ✅ REJECT (FIX BUG: selalu kirim pesan alasan, bukan cuma edit caption)
  bot.action(/REJ:(.+)/, async (ctx) => {
    const chatId = String(ctx.chat?.id || "");
    if (!isAdminChatId(adminChatIds, chatId)) {
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

    // 1) coba edit caption (opsional)
    try {
      const baseCaption = ctx.update.callback_query.message.caption || "";
      const newCaption = baseCaption + "\n\n❌ *Pilih alasan penolakan:*";
      await ctx.editMessageCaption(newCaption, {
        parse_mode: "Markdown",
        reply_markup: rejectReasonKeyboard(tok).reply_markup,
      });
    } catch {}

    // 2) selalu kirim pesan baru (anti bug)
    await ctx.reply("❌ Pilih alasan penolakan:", {
      reply_markup: rejectReasonKeyboard(tok).reply_markup,
    });
  });

  bot.action(/REJR:(.+):(.+)/, async (ctx) => {
    const chatId = String(ctx.chat?.id || "");
    if (!isAdminChatId(adminChatIds, chatId)) {
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
        const caption = (ctx.update.callback_query.message.caption || "").replace(/\n\n❌ \*Pilih alasan penolakan:\*[\s\S]*$/m, "");
        await ctx.editMessageCaption(caption, {
          parse_mode: "Markdown",
          reply_markup: adminMainKeyboard(tok).reply_markup,
        });
      } catch {
        await ctx.reply("✅ Kembali ke menu:", { reply_markup: adminMainKeyboard(tok).reply_markup });
      }
      return;
    }

    if (code === "OTHER") {
      await ctx.answerCbQuery("Ketik alasan");
      const adminUserId = ctx.from?.id;
      if (adminUserId) await store.setAdminAwait(adminUserId, { step: "WAIT_CUSTOM_REASON", token: tok });
      await ctx.reply("✍️ Silakan ketik alasan penolakan (1 pesan) di chat admin ini.");
      return;
    }

    let reason = "Ditolak";
    if (code === "LESS") reason = "Nominal kurang dari seharusnya.";
    if (code === "MORE") reason = "Nominal lebih dari seharusnya (tidak sesuai).";
    if (code === "BLUR") reason = "Bukti pembayaran blur / tidak jelas.";

    await ctx.answerCbQuery("Ditolak");
    await finalizeReject(bot, store, tok, reason, adminChatIds);

    // feedback ke admin (biar jelas walau edit gagal)
    try {
      const baseCaption = ctx.update.callback_query.message.caption || "";
      await ctx.editMessageCaption(baseCaption + `\n\n❌ *REJECTED*\nAlasan: ${reason}`, { parse_mode: "Markdown" });
    } catch {
      try {
        await bot.telegram.sendMessage(chatId, `❌ REJECTED\nToken: ${tok}\nAlasan: ${reason}`);
      } catch {}
    }
  });

  return bot;
}

// =======================
// HELPERS
// =======================
async function approveAndProcess(bot, store, GAMEPASS, tok, adminChatIds, note) {
  const data = store.getByToken(tok);
  if (!data) return;

  if (data.status !== "WAIT_ADMIN") return;

  // GAMEPASS Auto -> hit API
  if (data.mode === "GAMEPASS") {
    try {
      if (data.orderType === "gamepass_order") {
        await GAMEPASS.createGamepassOrder({
          orderId: data.orderId,
          robloxUsername: data.robloxUsername,
          robuxAmount: data.robuxAmount,
          placeId: data.placeId,
          isPreOrder: false,
          checkOwnership: false,
        });
      } else {
        await GAMEPASS.createVipServerOrder({
          orderId: data.orderId,
          robloxUsername: data.robloxUsername,
          robuxAmount: data.robuxAmount,
          placeId: data.placeId,
          isPreOrder: false,
        });
      }
    } catch (e) {
      const msg = `❌ Gagal create order.\nOrder ID: ${data.orderId}\nError: ${e?.message || "unknown"}`;
      for (const adminChatId of adminChatIds) {
        try { await bot.telegram.sendMessage(adminChatId, msg); } catch {}
      }
      await bot.telegram.sendMessage(data.chatId, "❌ Order gagal diproses. Admin akan cek dulu ya.");
      await store.removePending(tok);
      return;
    }

    const userMsg = [
      "✅ *Pembayaran diterima*",
      "────────────────────",
      `🧾 Order ID: \`${data.orderId}\``,
      `📦 Paket: *${data.label}*`,
      "⚙️ Order GAMEPASS sedang diproses otomatis.",
      note ? `\n📝 Catatan admin: ${note}` : "",
      "",
      "🙏 Jika ada kendala, admin akan menghubungi kamu di chat ini.",
    ].join("\n");

    await bot.telegram.sendMessage(data.chatId, userMsg, { parse_mode: "Markdown" });

    for (const adminChatId of adminChatIds) {
      try {
        await bot.telegram.sendMessage(
          adminChatId,
          `✅ APPROVED : ${data.orderId}\nToken: ${tok}${note ? `\nCatatan: ${note}` : ""}`
        );
      } catch {}
    }

    await notifyDiscordPaymentReceived(data);
    await store.removePending(tok);
    return;
  }

  // VILOG -> admin proses manual
  if (data.mode === "VILOG") {
    const userMsg = [
      "✅ *Pembayaran diterima*",
      "────────────────────",
      `🧾 Order ID: \`${data.orderId}\``,
      `📦 Paket: *${data.label}*`,
      `🎟️ Jumlah Robux: *${data.robuxAmount}*`,
      "",
      "🧑‍💻 Admin akan memproses order kamu *secara manual via login*.",
      "⏳ Mohon standby jika diminta verifikasi.",
      note ? `\n📝 Catatan admin: ${note}` : "",
      "",
      "🙏 Terima kasih!",
    ].join("\n");

    await bot.telegram.sendMessage(data.chatId, userMsg, { parse_mode: "Markdown" });

    for (const adminChatId of adminChatIds) {
      try {
        await bot.telegram.sendMessage(
          adminChatId,
          `✅ APPROVED (VILOG): ${data.orderId}\nToken: ${tok}${note ? `\nCatatan: ${note}` : ""}`
        );
      } catch {}
    }

    await notifyDiscordPaymentReceived(data);
    await store.removePending(tok);
    return;
  }
}

async function finalizeReject(bot, store, tok, reason, adminChatIds) {
  const data = store.getByToken(tok);
  if (!data) return;

  await bot.telegram.sendMessage(
    data.chatId,
    [
      "❌ *Pembayaran ditolak*",
      "────────────────────",
      `🧾 Order ID: \`${data.orderId}\``,
      `📦 Paket: *${data.label}*`,
      "",
      `📌 Alasan: ${reason}`,
      "",
      "✅ Kamu bisa buat order baru dengan /start.",
    ].join("\n"),
    { parse_mode: "Markdown" }
  );

  for (const adminChatId of adminChatIds) {
    try {
      await bot.telegram.sendMessage(
        adminChatId,
        `❌ REJECTED: ${data.orderId}\nToken: ${tok}\nAlasan: ${reason}`
      );
    } catch {}
  }

  await store.removePending(tok);
}

module.exports = { createQrisOrderBot };
