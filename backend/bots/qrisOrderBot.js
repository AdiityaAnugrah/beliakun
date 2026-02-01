// backend/bots/qrisOrderBot.js
const { Telegraf, Markup } = require("telegraf");
const crypto = require("crypto");
const path = require("path");
const { makeRBXCaveClient } = require("../utils/rbxcaveClient");
const { PendingStore } = require("../utils/pendingStore");

/**
 * =========================
 * KONFIG PAKET (EDIT DI SINI)
 * =========================
 *
 * category:
 * - "VILOG"  => manual, admin proses sendiri (VIA LOGIN)
 * - "AUTO"   => RBXCave auto (gamepass/vip)
 *
 * inputMode:
 * - "VILOG_FORM"    => user isi format Username/Password/Kode backup
 * - "USERNAME_ONLY" => user kirim username saja (untuk paket auto yang fixed)
 */
const PACKAGES = [
  // =========================
  // VILOG (MANUAL) - list harga dari kamu
  // =========================
  { key: "vilog_100", category: "VILOG", orderType: "vilog_manual", inputMode: "VILOG_FORM", label: "🔐 VILOG 100⏣", robuxAmount: 100, priceIdr: 10994 },
  { key: "vilog_200", category: "VILOG", orderType: "vilog_manual", inputMode: "VILOG_FORM", label: "🔐 VILOG 200⏣", robuxAmount: 200, priceIdr: 21987 },
  { key: "vilog_300", category: "VILOG", orderType: "vilog_manual", inputMode: "VILOG_FORM", label: "🔐 VILOG 300⏣", robuxAmount: 300, priceIdr: 32980 },
  { key: "vilog_400", category: "VILOG", orderType: "vilog_manual", inputMode: "VILOG_FORM", label: "🔐 VILOG 400⏣", robuxAmount: 400, priceIdr: 43973 },
  { key: "vilog_500", category: "VILOG", orderType: "vilog_manual", inputMode: "VILOG_FORM", label: "🔐 VILOG 500⏣", robuxAmount: 500, priceIdr: 54966 },
  { key: "vilog_600", category: "VILOG", orderType: "vilog_manual", inputMode: "VILOG_FORM", label: "🔐 VILOG 600⏣", robuxAmount: 600, priceIdr: 65959 },
  { key: "vilog_700", category: "VILOG", orderType: "vilog_manual", inputMode: "VILOG_FORM", label: "🔐 VILOG 700⏣", robuxAmount: 700, priceIdr: 76952 },
  { key: "vilog_800", category: "VILOG", orderType: "vilog_manual", inputMode: "VILOG_FORM", label: "🔐 VILOG 800⏣", robuxAmount: 800, priceIdr: 87869 },
  { key: "vilog_900", category: "VILOG", orderType: "vilog_manual", inputMode: "VILOG_FORM", label: "🔐 VILOG 900⏣", robuxAmount: 900, priceIdr: 98862 },
  { key: "vilog_1000", category: "VILOG", orderType: "vilog_manual", inputMode: "VILOG_FORM", label: "🔐 VILOG 1000⏣", robuxAmount: 1000, priceIdr: 109855 },
  { key: "vilog_2000", category: "VILOG", orderType: "vilog_manual", inputMode: "VILOG_FORM", label: "🔐 VILOG 2000⏣", robuxAmount: 2000, priceIdr: 219709 },
  { key: "vilog_3000", category: "VILOG", orderType: "vilog_manual", inputMode: "VILOG_FORM", label: "🔐 VILOG 3000⏣", robuxAmount: 3000, priceIdr: 329487 },
  { key: "vilog_4000", category: "VILOG", orderType: "vilog_manual", inputMode: "VILOG_FORM", label: "🔐 VILOG 4000⏣", robuxAmount: 4000, priceIdr: 439341 },
  { key: "vilog_5000", category: "VILOG", orderType: "vilog_manual", inputMode: "VILOG_FORM", label: "🔐 VILOG 5000⏣", robuxAmount: 5000, priceIdr: 549119 },
  { key: "vilog_6000", category: "VILOG", orderType: "vilog_manual", inputMode: "VILOG_FORM", label: "🔐 VILOG 6000⏣", robuxAmount: 6000, priceIdr: 658973 },
  { key: "vilog_7000", category: "VILOG", orderType: "vilog_manual", inputMode: "VILOG_FORM", label: "🔐 VILOG 7000⏣", robuxAmount: 7000, priceIdr: 768750 },
  { key: "vilog_8000", category: "VILOG", orderType: "vilog_manual", inputMode: "VILOG_FORM", label: "🔐 VILOG 8000⏣", robuxAmount: 8000, priceIdr: 878605 },
  { key: "vilog_9000", category: "VILOG", orderType: "vilog_manual", inputMode: "VILOG_FORM", label: "🔐 VILOG 9000⏣", robuxAmount: 9000, priceIdr: 988459 },
  { key: "vilog_10000", category: "VILOG", orderType: "vilog_manual", inputMode: "VILOG_FORM", label: "🔐 VILOG 10000⏣", robuxAmount: 10000, priceIdr: 1098237 },
  { key: "vilog_15000", category: "VILOG", orderType: "vilog_manual", inputMode: "VILOG_FORM", label: "🔐 VILOG 15000⏣", robuxAmount: 15000, priceIdr: 1647355 },
  { key: "vilog_20000", category: "VILOG", orderType: "vilog_manual", inputMode: "VILOG_FORM", label: "🔐 VILOG 20000⏣", robuxAmount: 20000, priceIdr: 2196473 },
  { key: "vilog_25000", category: "VILOG", orderType: "vilog_manual", inputMode: "VILOG_FORM", label: "🔐 VILOG 25000⏣", robuxAmount: 25000, priceIdr: 2745591 },
  { key: "vilog_40000", category: "VILOG", orderType: "vilog_manual", inputMode: "VILOG_FORM", label: "🔐 VILOG 40000⏣", robuxAmount: 40000, priceIdr: 4392869 },
  { key: "vilog_50000", category: "VILOG", orderType: "vilog_manual", inputMode: "VILOG_FORM", label: "🔐 VILOG 50000⏣", robuxAmount: 50000, priceIdr: 5491105 },

  // =========================
  // AUTO (RBXCave) - contoh, optional
  // Kalau kamu gak pakai, boleh hapus bagian ini.
  // =========================
  // { key: "gp_100", category: "AUTO", orderType: "gamepass_order", inputMode: "USERNAME_ONLY", label: "🎮 Gamepass 100 Robux (Auto)", robuxAmount: 100, placeId: 12345678, priceIdr: 20000 },
  // { key: "vip_200", category: "AUTO", orderType: "vip_server", inputMode: "USERNAME_ONLY", label: "👑 VIP Server 200 Robux (Auto)", robuxAmount: 200, placeId: 12345678, priceIdr: 35000 },
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
  return PACKAGES.find((p) => p.key === key) || null;
}

function listByCategory(category) {
  return PACKAGES.filter((p) => p.category === category);
}

function pagesCount(list) {
  return Math.max(1, Math.ceil(list.length / PAGE_SIZE));
}

function safeTrim(s) {
  return String(s || "").trim();
}

function maskPasswordLine(text) {
  // kalau user kirim "Password : xxx", kita masking di bagian buyer message (untuk keamanan)
  const lines = String(text || "").split("\n");
  return lines
    .map((ln) => {
      const low = ln.toLowerCase();
      if (low.includes("password")) {
        const idx = ln.indexOf(":");
        if (idx >= 0) return ln.slice(0, idx + 1) + " ********";
        return "Password: ********";
      }
      return ln;
    })
    .join("\n");
}

async function postJson(url, payload) {
  if (!url) return { ok: false, status: 0, text: "empty url" };

  let f = globalThis.fetch;
  if (!f) {
    // fallback kalau node belum ada fetch (harusnya Node 18+ sudah ada)
    const mod = await import("node-fetch");
    f = mod.default;
  }

  const res = await f(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const txt = await res.text().catch(() => "");
  return { ok: res.ok, status: res.status, text: txt };
}

// =========================
// DISCORD WEBHOOK (PAYMENT NOTIF)
// =========================
async function notifyDiscordPaymentReceived(data) {
  const url = process.env.DISCORD_WEBHOOK_URL || "";
  if (!url) return;

  const nominal = formatRupiah(Number(data.priceIdr || 0));
  const username = safeTrim(data.robloxUsername || data.username || "-");
  const paket = safeTrim(data.label || "-");

  const content = `Payment received: ${nominal} from ${username} [${paket}]`;

  try {
    const res = await postJson(url, { content });
    if (!res.ok) {
      console.log("[discord] webhook failed:", res.status, (res.text || "").slice(0, 200));
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
function categoryKeyboard(activeCategory) {
  const isV = activeCategory === "VILOG";
  const isA = activeCategory === "AUTO";

  return Markup.inlineKeyboard([
    [
      Markup.button.callback(isV ? "✅ 🔐 VILOG (Login)" : "🔐 VILOG (Login)", "CAT:VILOG"),
      Markup.button.callback(isA ? "✅ 🎮 AUTO (RBXCave)" : "🎮 AUTO (RBXCave)", "CAT:AUTO"),
    ],
  ]);
}

function packagesKeyboard(category, page) {
  const list = listByCategory(category);
  const totalPages = pagesCount(list);
  const p = Math.max(0, Math.min(page, totalPages - 1));

  const start = p * PAGE_SIZE;
  const items = list.slice(start, start + PAGE_SIZE);

  const rows = [];

  // 2 tombol per baris
  for (let i = 0; i < items.length; i += 2) {
    const a = items[i];
    const b = items[i + 1];
    const row = [Markup.button.callback(`${a.label}`, `PKG:${a.key}`)];
    if (b) row.push(Markup.button.callback(`${b.label}`, `PKG:${b.key}`));
    rows.push(row);
  }

  // nav
  const nav = [];
  if (p > 0) nav.push(Markup.button.callback("⬅️ Prev", `PAGE:${category}:${p - 1}`));
  nav.push(Markup.button.callback(`📄 ${p + 1}/${totalPages}`, "NOOP"));
  if (p < totalPages - 1) nav.push(Markup.button.callback("Next ➡️", `PAGE:${category}:${p + 1}`));
  rows.push(nav);

  // extra actions
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
// MESSAGES (Modern)
// =========================
function msgWelcome(category) {
  const catText =
    category === "AUTO"
      ? "🎮 Mode: *AUTO (RBXCave)*"
      : "🔐 Mode: *VILOG (Via Login / Manual)*";

  return [
    "✨ *Centra Game Order Bot*",
    "────────────────────",
    catText,
    "",
    "Pilih paket dulu ya 👇",
    "",
    "🧩 *Cara kerja:*",
    "1) Pilih paket",
    "2) Isi data sesuai format",
    "3) Bayar via QRIS (foto)",
    "4) Upload bukti pembayaran",
    "5) Admin ACC / TOLAK (jawaban pasti, tidak akan dighosting)",
    "",
    "🛑 Kamu bisa *batalkan kapan saja* sebelum admin ACC.",
  ].join("\n");
}

function msgPackagePicked(pkg) {
  const price = formatRupiah(pkg.priceIdr);
  const robux = pkg.robuxAmount ? `${pkg.robuxAmount}⏣` : "-";

  if (pkg.inputMode === "VILOG_FORM") {
    return [
      "🧾 *Detail Paket*",
      "────────────────────",
      `📦 Paket: *${pkg.label}*`,
      `💳 Harga: *${price}*`,
      `🪙 Robux: *${robux}*`,
      "",
      "✍️ Sekarang kirim data dengan format ini (1 pesan):",
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
      "~ Kode yang sudah dipakai tidak bisa dipakai lagi",
      "~ Jika pakai kode email/verif acc, wajib stanby",
      "~ Perhatikan besar kecil username & pw",
      "~ Harap matikan paskey, faceid, finger, dll",
    ].join("\n");
  }

  // USERNAME_ONLY (untuk paket AUTO fixed)
  return [
    "🧾 *Detail Paket*",
    "────────────────────",
    `📦 Paket: *${pkg.label}*`,
    `💳 Harga: *${price}*`,
    `🪙 Robux: *${robux}*`,
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
    data.robloxUsername ? `👤 Username: \`${data.robloxUsername}\`` : "",
    "",
    "✅ *Scan QRIS* lalu *upload foto bukti pembayaran* di chat ini.",
    "🔎 Admin akan verifikasi sebelum diproses.",
  ]
    .filter(Boolean)
    .join("\n");
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

function msgApprovedToUser(data, note) {
  // jangan kirim password raw ke user lagi (buat keamanan)
  const maybeMaskedForm = data?.formText ? `\n🧾 Data kamu tersimpan.\n${maskPasswordLine(data.formText)}` : "";
  return [
    "✅ *Pembayaran diterima!*",
    "────────────────────",
    `🧾 Order ID: \`${data.orderId}\``,
    `📦 Paket: *${data.label}*`,
    `💳 Nominal: *${formatRupiah(data.priceIdr)}*`,
    "",
    data.orderType === "vilog_manual"
      ? "🧑‍💼 Admin sudah *ACC*. Pesanan akan diproses manual oleh admin."
      : "⚙️ Admin sudah *ACC*. Order sedang diproses otomatis (RBXCave).",
    note ? `\n📝 Catatan admin: ${note}` : "",
    maybeMaskedForm,
    "",
    "✅ Status: *APPROVED*",
  ]
    .filter(Boolean)
    .join("\n");
}

function msgRejectedToUser(data, reason) {
  return [
    "❌ *Pembayaran ditolak*",
    "────────────────────",
    `🧾 Order ID: \`${data.orderId}\``,
    `📦 Paket: *${data.label}*`,
    `💳 Nominal: *${formatRupiah(data.priceIdr)}*`,
    "",
    `📌 Alasan: ${reason}`,
    "",
    "✅ Status: *REJECTED*",
    "Ketik /start untuk buat order baru.",
  ].join("\n");
}

// =========================
// BOT
// =========================
function createQrisOrderBot() {
  const botToken = process.env.TELEGRAM_BOT_TOKEN_RBXCAVE;
  if (!botToken) throw new Error("TELEGRAM_BOT_TOKEN_RBXCAVE missing in backend/.env");

  const adminChatId = String(process.env.TELEGRAM_ADMIN_CHAT_ID || "");
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
    if (userId) {
      await store.clearUserFlow(userId);
      // default ke VILOG biar langsung sesuai kebutuhan kamu
      await store.setUserFlow(userId, { step: "BROWSE_PACKAGES", category: "VILOG", page: 0 });
    }

    const cat = "VILOG";
    await ctx.reply(msgWelcome(cat), {
      parse_mode: "Markdown",
      reply_markup: Markup.inlineKeyboard([
        ...categoryKeyboard(cat).reply_markup.inline_keyboard,
        ...packagesKeyboard(cat, 0).reply_markup.inline_keyboard,
      ]).reply_markup,
    });
  });

  // ===== NOOP =====
  bot.action("NOOP", async (ctx) => ctx.answerCbQuery());

  // ===== Category switch =====
  bot.action(/CAT:(VILOG|AUTO)/, async (ctx) => {
    await ctx.answerCbQuery();
    const category = ctx.match[1];

    const userId = ctx.from?.id;
    if (userId) await store.setUserFlow(userId, { step: "BROWSE_PACKAGES", category, page: 0 });

    const text = msgWelcome(category);
    const kb = Markup.inlineKeyboard([
      ...categoryKeyboard(category).reply_markup.inline_keyboard,
      ...packagesKeyboard(category, 0).reply_markup.inline_keyboard,
    ]);

    try {
      await ctx.editMessageText(text, { parse_mode: "Markdown", reply_markup: kb.reply_markup });
    } catch {
      await ctx.reply(text, { parse_mode: "Markdown", reply_markup: kb.reply_markup });
    }
  });

  // ===== Pagination =====
  bot.action(/PAGE:(VILOG|AUTO):(\d+)/, async (ctx) => {
    await ctx.answerCbQuery();
    const category = ctx.match[1];
    const page = Number(ctx.match[2] || 0);

    const userId = ctx.from?.id;
    if (userId) await store.setUserFlow(userId, { step: "BROWSE_PACKAGES", category, page });

    const text = msgWelcome(category);
    const kb = Markup.inlineKeyboard([
      ...categoryKeyboard(category).reply_markup.inline_keyboard,
      ...packagesKeyboard(category, page).reply_markup.inline_keyboard,
    ]);

    try {
      await ctx.editMessageText(text, { parse_mode: "Markdown", reply_markup: kb.reply_markup });
    } catch {
      await ctx.reply(text, { parse_mode: "Markdown", reply_markup: kb.reply_markup });
    }
  });

  // ===== Reset =====
  bot.action("RESET", async (ctx) => {
    await ctx.answerCbQuery("Reset");
    const userId = ctx.from?.id;
    if (userId) {
      await store.clearUser(userId);
      await store.clearUserFlow(userId);
      await store.setUserFlow(userId, { step: "BROWSE_PACKAGES", category: "VILOG", page: 0 });
    }

    const cat = "VILOG";
    const text = "✅ Sudah di-reset. Pilih paket lagi ya.";
    const kb = Markup.inlineKeyboard([
      ...categoryKeyboard(cat).reply_markup.inline_keyboard,
      ...packagesKeyboard(cat, 0).reply_markup.inline_keyboard,
    ]);

    try {
      await ctx.editMessageText(text, { parse_mode: "Markdown", reply_markup: kb.reply_markup });
    } catch {
      await ctx.reply(text, { parse_mode: "Markdown", reply_markup: kb.reply_markup });
    }
  });

  // ===== Back to packages =====
  bot.action("BACK_TO_PACKAGES", async (ctx) => {
    await ctx.answerCbQuery();
    const userId = ctx.from?.id;

    let category = "VILOG";
    let page = 0;
    if (userId) {
      const flow = store.getUserFlow(userId);
      if (flow?.category) category = flow.category;
      if (typeof flow?.page === "number") page = flow.page;
      await store.setUserFlow(userId, { step: "BROWSE_PACKAGES", category, page });
    }

    const text = msgWelcome(category);
    const kb = Markup.inlineKeyboard([
      ...categoryKeyboard(category).reply_markup.inline_keyboard,
      ...packagesKeyboard(category, page).reply_markup.inline_keyboard,
    ]);

    await ctx.reply(text, { parse_mode: "Markdown", reply_markup: kb.reply_markup });
  });

  // ===== Pick package =====
  bot.action(/PKG:(.+)/, async (ctx) => {
    await ctx.answerCbQuery();
    const pkgKey = ctx.match[1];
    const pkg = findPackage(pkgKey);
    if (!pkg) return ctx.reply("Paket tidak ditemukan. Ketik /start untuk ulang.");

    const userId = ctx.from?.id;
    if (!userId) return;

    // limit 1 pending per user
    const existing = store.getTokenByUser(userId);
    if (existing) {
      return ctx.reply("⚠️ Kamu masih punya transaksi pending.\nKetik /cancel untuk batalkan dulu.", { parse_mode: "Markdown" });
    }

    // simpan flow untuk webhook mode (persisten)
    await store.setUserFlow(userId, { step: "WAIT_INPUT", pkgKey, category: pkg.category, page: 0 });

    const text = msgPackagePicked(pkg);
    try {
      await ctx.editMessageText(text, {
        parse_mode: "Markdown",
        reply_markup: usernamePromptKeyboard().reply_markup,
      });
    } catch {
      await ctx.reply(text, { parse_mode: "Markdown", reply_markup: usernamePromptKeyboard().reply_markup });
    }
  });

  // ===== Text handler: admin awaiting OR user input =====
  bot.on("text", async (ctx, next) => {
    const fromId = ctx.from?.id;
    const chatId = String(ctx.chat?.id || "");

    // ADMIN await flows (reject other / acc note)
    const adminChat = adminChatId && chatId === adminChatId;

    if (adminChat && fromId) {
      const awaitObj = store.getAdminAwait(fromId);
      if (awaitObj?.step === "WAIT_CUSTOM_REASON" && awaitObj.token) {
        const reason = safeTrim(ctx.message.text);
        if (!reason) return;
        await store.clearAdminAwait(fromId);
        await finalizeReject(bot, store, awaitObj.token, `Alasan admin: ${reason}`, adminChatId);
        return;
      }

      if (awaitObj?.step === "WAIT_ACC_NOTE" && awaitObj.token) {
        const note = safeTrim(ctx.message.text);
        if (!note) return;
        await store.clearAdminAwait(fromId);
        await approveAndProcess(bot, store, rbxcave, awaitObj.token, adminChatId, note);
        return;
      }
    }

    // USER input flow
    const userId = ctx.from?.id;
    if (!userId) return next();

    const flow = store.getUserFlow(userId);
    if (!flow || flow.step !== "WAIT_INPUT") return next();

    const pkg = findPackage(flow.pkgKey);
    if (!pkg) {
      await store.clearUserFlow(userId);
      return ctx.reply("Paket invalid. Ketik /start untuk mulai lagi.");
    }

    const text = safeTrim(ctx.message.text);
    if (!text || text.length < 3) {
      return ctx.reply("⚠️ Input tidak valid. Coba kirim ulang ya.");
    }

    // build order data
    const orderId = "TG-" + crypto.randomUUID();
    const tok = makeToken();

    let robloxUsername = "";
    let formText = "";

    if (pkg.inputMode === "USERNAME_ONLY") {
      robloxUsername = text;
    } else {
      // VILOG_FORM: simpan raw form
      formText = text;
      // username diambil dari baris "Username :"
      const m = text.match(/username\s*:\s*(.+)/i);
      if (m && m[1]) robloxUsername = safeTrim(m[1]);
      if (!robloxUsername) robloxUsername = "-";
    }

    const data = {
      token: tok,
      createdAt: Date.now(),
      userId,
      chatId: ctx.chat.id,
      orderId,
      orderType: pkg.orderType,
      inputMode: pkg.inputMode,
      robloxUsername,
      formText, // untuk VILOG manual
      robuxAmount: pkg.robuxAmount || 0,
      placeId: pkg.placeId || null,
      priceIdr: pkg.priceIdr || 0,
      label: pkg.label,
      status: "WAIT_PROOF",
    };

    await store.setPending(tok, data);

    // update flow user
    await store.setUserFlow(userId, { step: "WAIT_PROOF", pkgKey: flow.pkgKey, category: pkg.category, page: 0 });

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

    if (!adminChatId) return ctx.reply("Admin chat belum diset. Isi TELEGRAM_ADMIN_CHAT_ID dulu.");

    const photos = ctx.message.photo || [];
    const best = photos[photos.length - 1];
    const fileId = best.file_id;

    await store.updatePending(tok, { proofFileId: fileId, status: "WAIT_ADMIN" });

    // ✅ Jawaban jelas untuk user (tidak mengambang)
    await ctx.reply(
      [
        "✅ *Bukti diterima!*",
        "────────────────────",
        "Admin akan verifikasi pembayaran kamu.",
        "Hasilnya akan *pasti dibalas*: *APPROVED* atau *REJECTED*.",
        "",
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
      `Username: \`${data.robloxUsername || "-"}\``,
      `Type: \`${data.orderType}\``,
      "",
      "Klik tombol untuk ACC/TOLAK.",
    ].join("\n");

    // kirim foto bukti ke admin + tombol
    await bot.telegram.sendPhoto(adminChatId, fileId, {
      caption: adminCaption,
      parse_mode: "Markdown",
      reply_markup: adminMainKeyboard(tok).reply_markup,
    });

    // kalau ada formText (VILOG), kirim detail di pesan terpisah (biar gak kepotong caption limit)
    if (data.formText) {
      await bot.telegram.sendMessage(
        adminChatId,
        [
          "📄 *DATA VILOG (Manual)*",
          "────────────────────",
          `Order ID: \`${data.orderId}\``,
          `Token: \`${tok}\``,
          "",
          data.formText,
        ].join("\n"),
        { parse_mode: "Markdown" }
      );
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
        "",
        "✅ Status: *CANCELED*",
      ].join("\n"),
      { parse_mode: "Markdown" }
    );

    if (adminChatId) {
      await bot.telegram.sendMessage(
        adminChatId,
        [
          "⚠️ *User membatalkan transaksi*",
          `Order ID: ${data.orderId}`,
          `Paket: ${data.label}`,
          `Username: ${data.robloxUsername}`,
          `Token: ${tok}`,
        ].join("\n"),
        { parse_mode: "Markdown" }
      );
    }
  });

  // =========================
  // ADMIN ACC / REJECT + reason + note
  // =========================
  bot.action(/ACC:(.+)/, async (ctx) => {
    const chatId = String(ctx.chat?.id || "");
    if (!adminChatId || chatId !== adminChatId) {
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
    } catch {}
  });

  bot.action(/ACC_BACK:(.+)/, async (ctx) => {
    const chatId = String(ctx.chat?.id || "");
    if (!adminChatId || chatId !== adminChatId) {
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
    } catch {}
  });

  bot.action(/ACC_DO:(.+)/, async (ctx) => {
    const chatId = String(ctx.chat?.id || "");
    if (!adminChatId || chatId !== adminChatId) {
      await ctx.answerCbQuery("Bukan admin chat", { show_alert: true });
      return;
    }
    await ctx.answerCbQuery("Diproses...");
    const tok = ctx.match[1];
    await approveAndProcess(bot, store, rbxcave, tok, adminChatId, "");
  });

  bot.action(/ACC_NOTE:(.+)/, async (ctx) => {
    const chatId = String(ctx.chat?.id || "");
    if (!adminChatId || chatId !== adminChatId) {
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

  // REJECT
  bot.action(/REJ:(.+)/, async (ctx) => {
    const chatId = String(ctx.chat?.id || "");
    if (!adminChatId || chatId !== adminChatId) {
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

    const baseCaption = ctx.update.callback_query.message.caption || "";
    const newCaption = baseCaption + "\n\n❌ *Pilih alasan penolakan:*";
    try {
      await ctx.editMessageCaption(newCaption, {
        parse_mode: "Markdown",
        reply_markup: rejectReasonKeyboard(tok).reply_markup,
      });
    } catch {}
  });

  bot.action(/REJR:(.+):(.+)/, async (ctx) => {
    const chatId = String(ctx.chat?.id || "");
    if (!adminChatId || chatId !== adminChatId) {
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

      const caption = (ctx.update.callback_query.message.caption || "").replace(/\n\n❌ \*Pilih alasan penolakan:\*[\s\S]*$/m, "");
      try {
        await ctx.editMessageCaption(caption, {
          parse_mode: "Markdown",
          reply_markup: adminMainKeyboard(tok).reply_markup,
        });
      } catch {}
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
    await finalizeReject(bot, store, tok, reason, adminChatId);

    try {
      const baseCaption = ctx.update.callback_query.message.caption || "";
      await ctx.editMessageCaption(baseCaption + `\n\n❌ *REJECTED*\nAlasan: ${reason}`, { parse_mode: "Markdown" });
    } catch {}
  });

  return bot;
}

// =======================
// HELPERS
// =======================
async function approveAndProcess(bot, store, rbxcave, tok, adminChatId, note) {
  const data = store.getByToken(tok);
  if (!data) return;

  if (data.status !== "WAIT_ADMIN") return;

  // ======================
  // PROSES TERAKHIR:
  // - VILOG manual: cukup ACC saja (admin proses sendiri)
  // - AUTO: panggil RBXCave dan harus sukses
  // ======================
  if (data.orderType === "gamepass_order") {
    try {
      await rbxcave.createGamepassOrder({
        orderId: data.orderId,
        robloxUsername: data.robloxUsername,
        robuxAmount: data.robuxAmount,
        placeId: data.placeId,
        isPreOrder: false,
        checkOwnership: false,
      });
    } catch (e) {
      const msg = `❌ Gagal create Gamepass order ke RBXCave.\nOrder ID: ${data.orderId}\nError: ${e?.message || "unknown"}`;
      if (adminChatId) await bot.telegram.sendMessage(adminChatId, msg);
      await bot.telegram.sendMessage(data.chatId, "❌ Order gagal diproses otomatis. Admin akan cek dulu ya.");
      await store.removePending(tok);
      return;
    }
  } else if (data.orderType === "vip_server") {
    try {
      await rbxcave.createVipServerOrder({
        orderId: data.orderId,
        robloxUsername: data.robloxUsername,
        robuxAmount: data.robuxAmount,
        placeId: data.placeId,
        isPreOrder: false,
      });
    } catch (e) {
      const msg = `❌ Gagal create VIP server order ke RBXCave.\nOrder ID: ${data.orderId}\nError: ${e?.message || "unknown"}`;
      if (adminChatId) await bot.telegram.sendMessage(adminChatId, msg);
      await bot.telegram.sendMessage(data.chatId, "❌ Order gagal diproses otomatis. Admin akan cek dulu ya.");
      await store.removePending(tok);
      return;
    }
  } else if (data.orderType === "vilog_manual") {
    // ✅ manual: tidak panggil RBXCave
  }

  // ===== User message (jawaban jelas)
  await bot.telegram.sendMessage(data.chatId, msgApprovedToUser(data, note), { parse_mode: "Markdown" });

  // ===== Admin log
  if (adminChatId) {
    await bot.telegram.sendMessage(
      adminChatId,
      [
        `✅ APPROVED: ${data.orderId}`,
        `Token: ${tok}`,
        `Paket: ${data.label}`,
        `Nominal: ${formatRupiah(data.priceIdr)}`,
        `Username: ${data.robloxUsername || "-"}`,
        note ? `Catatan: ${note}` : "",
        `Type: ${data.orderType}`,
      ]
        .filter(Boolean)
        .join("\n")
    );

    // kalau VILOG manual, ulangi kirim data juga supaya admin gampang copy
    if (data.orderType === "vilog_manual" && data.formText) {
      await bot.telegram.sendMessage(
        adminChatId,
        [
          "✅ *VILOG DITERIMA — DATA UNTUK DIPROSES ADMIN*",
          "────────────────────",
          `Order ID: \`${data.orderId}\``,
          `Token: \`${tok}\``,
          "",
          data.formText,
        ].join("\n"),
        { parse_mode: "Markdown" }
      );
    }
  }

  // ✅ DISCORD NOTIF: tanda pemasukan (hanya setelah proses terakhir sukses)
  await notifyDiscordPaymentReceived(data);

  await store.removePending(tok);
}

async function finalizeReject(bot, store, tok, reason, adminChatId) {
  const data = store.getByToken(tok);
  if (!data) return;

  // ===== User message (jawaban jelas)
  await bot.telegram.sendMessage(data.chatId, msgRejectedToUser(data, reason), { parse_mode: "Markdown" });

  // ===== Admin log
  if (adminChatId) {
    await bot.telegram.sendMessage(
      adminChatId,
      `❌ REJECTED: ${data.orderId}\nToken: ${tok}\nPaket: ${data.label}\nNominal: ${formatRupiah(data.priceIdr)}\nAlasan: ${reason}`
    );
  }

  await store.removePending(tok);
}

module.exports = { createQrisOrderBot };
