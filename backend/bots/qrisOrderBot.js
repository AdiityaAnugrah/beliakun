// backend/bots/qrisOrderBot.js
const { Telegraf, Markup } = require("telegraf");
const crypto = require("crypto");
const path = require("path");
const https = require("https");
const { URL } = require("url");
const { makeRBXCaveClient } = require("../utils/rbxcaveClient");
const { PendingStore } = require("../utils/pendingStore");

// =========================
// KONFIG PAKET
// =========================
const PACKAGES_GAMEPASS = [
  { key: "gp_100", mode: "GAMEPASS", orderType: "gamepass_order", label: "⚡ GAMEPASS 100⏣", displayRobux: 100, robuxAmount: 143, placeId: 0, priceIdr: 10994 },
  { key: "gp_200", mode: "GAMEPASS", orderType: "gamepass_order", label: "⚡ GAMEPASS 200⏣", displayRobux: 200, robuxAmount: 286, placeId: 0, priceIdr: 21987 },
  { key: "gp_300", mode: "GAMEPASS", orderType: "gamepass_order", label: "⚡ GAMEPASS 300⏣", displayRobux: 300, robuxAmount: 429, placeId: 0, priceIdr: 32980 },
  { key: "gp_400", mode: "GAMEPASS", orderType: "gamepass_order", label: "⚡ GAMEPASS 400⏣", displayRobux: 400, robuxAmount: 572, placeId: 0, priceIdr: 43973 },
  { key: "gp_500", mode: "GAMEPASS", orderType: "gamepass_order", label: "⚡ GAMEPASS 500⏣", displayRobux: 500, robuxAmount: 715, placeId: 0, priceIdr: 54966 },
  { key: "gp_600", mode: "GAMEPASS", orderType: "gamepass_order", label: "⚡ GAMEPASS 600⏣", displayRobux: 600, robuxAmount: 858, placeId: 0, priceIdr: 65959 },
  { key: "gp_700", mode: "GAMEPASS", orderType: "gamepass_order", label: "⚡ GAMEPASS 700⏣", displayRobux: 700, robuxAmount: 1001, placeId: 0, priceIdr: 76952 },
  { key: "gp_800", mode: "GAMEPASS", orderType: "gamepass_order", label: "⚡ GAMEPASS 800⏣", displayRobux: 800, robuxAmount: 1143, placeId: 0, priceIdr: 87869 },
  { key: "gp_900", mode: "GAMEPASS", orderType: "gamepass_order", label: "⚡ GAMEPASS 900⏣", displayRobux: 900, robuxAmount: 1286, placeId: 0, priceIdr: 98862 },
  { key: "gp_1000", mode: "GAMEPASS", orderType: "gamepass_order", label: "⚡ GAMEPASS 1000⏣", displayRobux: 1000, robuxAmount: 1429, placeId: 0, priceIdr: 109855 },
  { key: "gp_2000", mode: "GAMEPASS", orderType: "gamepass_order", label: "⚡ GAMEPASS 2000⏣", displayRobux: 2000, robuxAmount: 2858, placeId: 0, priceIdr: 219709 },
  { key: "gp_3000", mode: "GAMEPASS", orderType: "gamepass_order", label: "⚡ GAMEPASS 3000⏣", displayRobux: 3000, robuxAmount: 4286, placeId: 0, priceIdr: 329487 },
  { key: "gp_4000", mode: "GAMEPASS", orderType: "gamepass_order", label: "⚡ GAMEPASS 4000⏣", displayRobux: 4000, robuxAmount: 5715, placeId: 0, priceIdr: 439341 },
  { key: "gp_5000", mode: "GAMEPASS", orderType: "gamepass_order", label: "⚡ GAMEPASS 5000⏣", displayRobux: 5000, robuxAmount: 7143, placeId: 0, priceIdr: 549119 },
  { key: "gp_6000", mode: "GAMEPASS", orderType: "gamepass_order", label: "⚡ GAMEPASS 6000⏣", displayRobux: 6000, robuxAmount: 8572, placeId: 0, priceIdr: 658973 },
  { key: "gp_7000", mode: "GAMEPASS", orderType: "gamepass_order", label: "⚡ GAMEPASS 7000⏣", displayRobux: 7000, robuxAmount: 10000, placeId: 0, priceIdr: 768750 },
  { key: "gp_8000", mode: "GAMEPASS", orderType: "gamepass_order", label: "⚡ GAMEPASS 8000⏣", displayRobux: 8000, robuxAmount: 11429, placeId: 0, priceIdr: 878605 },
  { key: "gp_9000", mode: "GAMEPASS", orderType: "gamepass_order", label: "⚡ GAMEPASS 9000⏣", displayRobux: 9000, robuxAmount: 12858, placeId: 0, priceIdr: 988459 },
  { key: "gp_10000", mode: "GAMEPASS", orderType: "gamepass_order", label: "⚡ GAMEPASS 10000⏣", displayRobux: 10000, robuxAmount: 14286, placeId: 0, priceIdr: 1098237 },
  { key: "gp_15000", mode: "GAMEPASS", orderType: "gamepass_order", label: "⚡ GAMEPASS 15000⏣", displayRobux: 15000, robuxAmount: 21429, placeId: 0, priceIdr: 1647355 },
  { key: "gp_20000", mode: "GAMEPASS", orderType: "gamepass_order", label: "⚡ GAMEPASS 20000⏣", displayRobux: 20000, robuxAmount: 28572, placeId: 0, priceIdr: 2196473 },
  { key: "gp_25000", mode: "GAMEPASS", orderType: "gamepass_order", label: "⚡ GAMEPASS 25000⏣", displayRobux: 25000, robuxAmount: 35715, placeId: 0, priceIdr: 2745591 },
  { key: "gp_40000", mode: "GAMEPASS", orderType: "gamepass_order", label: "⚡ GAMEPASS 40000⏣", displayRobux: 40000, robuxAmount: 57143, placeId: 0, priceIdr: 4392869 },
  { key: "gp_50000", mode: "GAMEPASS", orderType: "gamepass_order", label: "⚡ GAMEPASS 50000⏣", displayRobux: 50000, robuxAmount: 71429, placeId: 0, priceIdr: 5491105 },
];

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
const PENDING_TTL_MS = 1000 * 60 * 60;

// =========================
// UTIL & PARSERS
// =========================
function formatRupiah(n) {
  try { return "Rp " + new Intl.NumberFormat("id-ID").format(Number(n || 0)); }
  catch { return "Rp " + String(n); }
}

function makeToken() { return crypto.randomBytes(6).toString("hex"); }

function makeSafeOrderId(userId) {
  const t = Date.now();
  const shortUid = String(userId || "0").slice(-4);
  const r = crypto.randomBytes(3).toString("hex");
  return `TG${t}${shortUid}${r}`;
}

function pagesCount(list) { return Math.max(1, Math.ceil(list.length / PAGE_SIZE)); }

function getPackagesByMode(mode) { return mode === "VILOG" ? PACKAGES_VILOG : PACKAGES_GAMEPASS; }

function findPackage(mode, key) {
  const list = getPackagesByMode(mode);
  return list.find((p) => p.key === key) || null;
}

function parseAdminChatIds(raw) {
  return String(raw || "").split(",").map((s) => s.trim()).filter((s) => s.length > 0);
}

function isAdminChatId(adminChatIds, chatId) {
  return adminChatIds.includes(String(chatId || ""));
}

function safeStringify(x) {
  try { return typeof x === "string" ? x : JSON.stringify(x, null, 2); }
  catch { return String(x); }
}

/**
 * Dukungan Link Regional: Ekstrak ID dari roblox.com/id/ atau roblox.com/en/
 */
function extractRobloxIdsFromText(input) {
  const s = String(input || "").trim();
  if (!s) return { placeId: 0, gamePassId: 0, numberOnly: 0 };

  // Regex fleksibel untuk regional (/id/, /en/, /pt-br/, dll)
  const mGames = s.match(/(?:\/games\/|placeId=)(\d+)/i);
  const mGp = s.match(/(?:\/game-pass\/|gamePassId=)(\d+)/i);
  const mPassLoose = s.match(/pass\s*id\D*(\d+)/i);

  let res = { placeId: 0, gamePassId: 0, numberOnly: 0 };
  if (mGames) res.placeId = Number(mGames[1]);
  if (mGp) res.gamePassId = Number(mGp[1]);
  if (!res.gamePassId && mPassLoose) res.gamePassId = Number(mPassLoose[1]);

  if (!res.placeId && !res.gamePassId) {
    const allNums = s.match(/\d{6,}/g);
    if (allNums) res.numberOnly = Number(allNums[0]);
  }
  return res;
}

// =========================
// ROBLOX LOOKUP & PRICE VALIDATION
// =========================
async function fetchJsonPublic(url, timeoutMs = 15000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally { clearTimeout(t); }
}

/**
 * Validasi Harga Gamepass secara otomatis
 */
async function validateGamepassPrice(gamePassId) {
  try {
    const url = `https://apis.roblox.com/game-passes/v1/game-passes/${gamePassId}/product-info`;
    const info = await fetchJsonPublic(url);
    return {
      ok: true,
      price: info?.PriceInRobux || info?.priceInRobux || 0,
      placeId: info?.PlaceId || info?.placeId || 0,
      name: info?.Name || "Gamepass",
      isForSale: info?.IsForSale ?? true
    };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

async function resolvePlaceIdFromGamePassId(gamePassId) {
  const info = await validateGamepassPrice(gamePassId);
  if (info.ok && info.placeId > 0) return { ok: true, placeId: info.placeId };
  return { ok: false };
}

// =========================
// UI KEYBOARDS
// =========================
function modeKeyboard() {
  return Markup.inlineKeyboard([
    [Markup.button.callback("🔐 VIA LOGIN (VILOG)", "MODE:VILOG")],
    [Markup.button.callback("⚡ GAMEPASS (PENDING 4 - 5 HARI)", "MODE:GAMEPASS")],
    [Markup.button.callback("🔄 Reset", "RESET")],
  ]);
}

function packagesKeyboard(mode, page) {
  const list = getPackagesByMode(mode);
  const totalPages = pagesCount(list);
  const p = Math.max(0, Math.min(Number(page || 0), totalPages - 1));
  const items = list.slice(p * PAGE_SIZE, (p * PAGE_SIZE) + PAGE_SIZE);
  const rows = [];
  for (let i = 0; i < items.length; i += 2) {
    const a = items[i]; const b = items[i + 1];
    const showA = mode === "GAMEPASS" ? a.displayRobux : a.robuxAmount;
    const row = [Markup.button.callback(`${showA}⏣ • ${formatRupiah(a.priceIdr)}`, `PKG:${mode}:${a.key}`)];
    if (b) {
      const showB = mode === "GAMEPASS" ? b.displayRobux : b.robuxAmount;
      row.push(Markup.button.callback(`${showB}⏣ • ${formatRupiah(b.priceIdr)}`, `PKG:${mode}:${b.key}`));
    }
    rows.push(row);
  }
  const nav = [];
  if (p > 0) nav.push(Markup.button.callback("⬅️ Prev", `PAGE:${mode}:${p - 1}`));
  nav.push(Markup.button.callback(`📄 ${p + 1}/${totalPages}`, "NOOP"));
  if (p < totalPages - 1) nav.push(Markup.button.callback("Next ➡️", `PAGE:${mode}:${p + 1}`));
  rows.push(nav, [Markup.button.callback("⬅️ Kembali", "BACK_TO_MODE")], [Markup.button.callback("🔄 Reset", "RESET")]);
  return Markup.inlineKeyboard(rows);
}

const userPaymentKeyboard = (token) => Markup.inlineKeyboard([
  [Markup.button.callback("✅ Saya sudah bayar", "NOOP")],
  [Markup.button.callback("❌ Batalkan Transaksi", `U_CANCEL:${token}`)],
]);

const adminMainKeyboard = (token) => Markup.inlineKeyboard([
  [Markup.button.callback("✅ ACC", `ACC:${token}`)],
  [Markup.button.callback("❌ TOLAK", `REJ:${token}`)],
]);

const adminVilogFeedbackKeyboard = (token) => Markup.inlineKeyboard([
  [Markup.button.callback("📸 Kirim foto bukti", `VFB_PHOTO:${token}`)],
  [Markup.button.callback("📝 Kirim pesan", `VFB_TEXT:${token}`)],
  [Markup.button.callback("✅ Selesai", `VFB_DONE:${token}`)],
]);

const rejectReasonKeyboard = (token) => Markup.inlineKeyboard([
  [Markup.button.callback("💸 Nominal kurang", `REJR:${token}:LESS`)],
  [Markup.button.callback("🖼️ Bukti tidak jelas", `REJR:${token}:BLUR`)],
  [Markup.button.callback("✍️ Lainnya", `REJR:${token}:OTHER`)],
  [Markup.button.callback("↩️ Batal", `REJR:${token}:CANCEL`)],
]);

// =========================
// MESSAGES & CAPTIONS
// =========================
function msgWelcome() {
  return "✨ *Centra Game Bot*\n────────────────────\nSilakan pilih metode order 👇";
}

function msgQrisCaption(data) {
  const modeText = data.mode === "VILOG" ? "🔐 VILOG" : "⚡ GAMEPASS";
  return [
    "🧾 *Pembayaran QRIS*",
    "────────────────────",
    `🧩 Mode: *${modeText}*`,
    `📦 Paket: *${data.label}*`,
    `💳 Nominal: *${formatRupiah(data.priceIdr)}*`,
    `🧾 Order ID: \`${data.orderId}\``,
    `👤 User: \`${data.robloxUsername || data.loginUsername}\``,
    data.gamePassId ? `🎫 Pass ID: \`${data.gamePassId}\`` : "",
    "",
    "✅ Scan QRIS lalu upload foto bukti pembayaran di chat ini.",
  ].filter(Boolean).join("\n");
}

// =========================
// PARSER VILOG
// =========================
function parseVilogForm(text, forcedRobux) {
  const lines = text.split("\n").map(l => l.trim());
  let u = "", p = "", codes = [];
  for (const l of lines) {
    if (l.toLowerCase().includes("username")) u = l.split(":")[1]?.trim();
    if (l.toLowerCase().includes("password")) p = l.split(":")[1]?.trim();
    const m = l.match(/^(\d+)\.\s*(.+)$/);
    if (m) codes.push(m[2].trim());
  }
  return { ok: u && p && codes.length >= 3, username: u, password: p, backupCodes: codes };
}

// =========================
// BOT CORE
// =========================
function createQrisOrderBot() {
  const botToken = process.env.TELEGRAM_BOT_TOKEN_GAMEPASS;
  const adminChatIds = parseAdminChatIds(process.env.TELEGRAM_ADMIN_CHAT_ID);
  const qrisAbsPath = path.join(__dirname, "..", process.env.QRIS_IMAGE_PATH || "assets/qris.jpg");

  const store = new PendingStore();
  const rbxcave = makeRBXCaveClient();
  const bot = new Telegraf(botToken);

  // START & NAVIGATION
  bot.start(async (ctx) => {
    await store.clearUserFlow(ctx.from.id);
    await ctx.reply(msgWelcome(), { parse_mode: "Markdown", ...modeKeyboard() });
  });

  bot.action("RESET", async (ctx) => {
    await store.clearUser(ctx.from.id);
    await ctx.editMessageText("✅ Di-reset. Ketik /start.");
  });

  bot.action("BACK_TO_MODE", async (ctx) => {
    await ctx.editMessageText(msgWelcome(), { parse_mode: "Markdown", ...modeKeyboard() });
  });

  bot.action(/MODE:(VILOG|GAMEPASS)/, async (ctx) => {
    const mode = ctx.match[1];
    await ctx.editMessageText(`Pilih paket ${mode}:`, { parse_mode: "Markdown", ...packagesKeyboard(mode, 0) });
  });

  bot.action(/PAGE:(VILOG|GAMEPASS):(\d+)/, async (ctx) => {
    const [_, mode, page] = ctx.match;
    await ctx.editMessageText(`Pilih paket ${mode}:`, { parse_mode: "Markdown", ...packagesKeyboard(mode, page) });
  });

  bot.action(/PKG:(VILOG|GAMEPASS):(.+)/, async (ctx) => {
    const [_, mode, pkgKey] = ctx.match;
    const pkg = findPackage(mode, pkgKey);
    if (mode === "VILOG") {
      await store.setUserFlow(ctx.from.id, { step: "WAIT_VILOG", pkgKey });
      await ctx.reply(`Kirim format login untuk paket ${pkg.label}...`);
    } else {
      await store.setUserFlow(ctx.from.id, { step: "WAIT_USER", pkgKey });
      await ctx.reply(`Kirim *Username Roblox* kamu:`, { parse_mode: "Markdown" });
    }
  });

  // TEXT HANDLER
  bot.on("text", async (ctx, next) => {
    const userId = ctx.from.id;
    const flow = store.getUserFlow(userId);

    // Admin handling (Reject reason & Notes)
    if (isAdminChatId(adminChatIds, ctx.chat.id)) {
      const aw = store.getAdminAwait(userId);
      if (aw?.step === "WAIT_CUSTOM_REASON") {
        await store.clearAdminAwait(userId);
        return finalizeReject(bot, store, aw.token, ctx.message.text, adminChatIds);
      }
      if (aw?.step === "WAIT_ACC_NOTE") {
        await store.clearAdminAwait(userId);
        return approveAndProcess(bot, store, rbxcave, aw.token, adminChatIds, ctx.message.text);
      }
      if (aw?.step === "WAIT_VILOG_TEXT") {
        await store.clearAdminAwait(userId);
        const d = store.getByToken(aw.token);
        await bot.telegram.sendMessage(d.chatId, `📩 *Update Admin:* ${ctx.message.text}`, { parse_mode: "Markdown" });
        return ctx.reply("✅ Pesan terkirim.");
      }
    }

    if (!flow) return next();

    // User Flow Handling
    if (flow.step === "WAIT_USER") {
      await store.setUserFlow(userId, { ...flow, step: "WAIT_ID", username: ctx.message.text });
      return ctx.reply("🔗 Kirim *Link Gamepass* atau *ID Gamepass*:");
    }

    if (flow.step === "WAIT_ID") {
      const ids = extractRobloxIdsFromText(ctx.message.text);
      const targetId = ids.gamePassId || ids.numberOnly;
      const pkg = findPackage("GAMEPASS", flow.pkgKey);

      if (!targetId) return ctx.reply("❌ ID tidak valid.");

      // Validasi Harga + Force Proceed
      const check = await validateGamepassPrice(targetId);
      
      if (!check.ok && flow.lastId !== targetId) {
        await store.setUserFlow(userId, { ...flow, lastId: targetId });
        return ctx.reply("⚠️ *API Roblox Gangguan*\nJika yakin ID benar, kirim ulang ID/Link sekali lagi untuk lanjut paksa.");
      }

      if (check.ok && check.price !== pkg.robuxAmount) {
        return ctx.reply(`❌ *Harga Salah!*\nPaket ini butuh: ${pkg.robuxAmount} Robux.\nLink kamu: ${check.price} Robux.`);
      }

      const orderId = makeSafeOrderId(userId);
      const tok = makeToken();
      const data = {
        token: tok, userId, chatId: ctx.chat.id, orderId, mode: "GAMEPASS",
        label: pkg.label, priceIdr: pkg.priceIdr, robuxAmount: pkg.robuxAmount,
        robloxUsername: flow.username, gamePassId: targetId, placeId: check.placeId || 0,
        status: "WAIT_PROOF", createdAt: Date.now()
      };
      await store.setPending(tok, data);
      await ctx.replyWithPhoto({ source: qrisAbsPath }, { caption: msgQrisCaption(data), parse_mode: "Markdown", ...userPaymentKeyboard(tok) });
    }

    if (flow.step === "WAIT_VILOG") {
      const pkg = findPackage("VILOG", flow.pkgKey);
      const p = parseVilogForm(ctx.message.text);
      if (!p.ok) return ctx.reply("❌ Format salah. Ulangi.");

      const orderId = makeSafeOrderId(userId);
      const tok = makeToken();
      const data = {
        token: tok, userId, chatId: ctx.chat.id, orderId, mode: "VILOG",
        label: pkg.label, priceIdr: pkg.priceIdr, robuxAmount: pkg.robuxAmount,
        loginUsername: p.username, loginPassword: p.password, backupCodes: p.backupCodes,
        status: "WAIT_PROOF", createdAt: Date.now()
      };
      await store.setPending(tok, data);
      await ctx.replyWithPhoto({ source: qrisAbsPath }, { caption: msgQrisCaption(data), parse_mode: "Markdown", ...userPaymentKeyboard(tok) });
    }
  });

  // PHOTO HANDLER
  bot.on("photo", async (ctx) => {
    const userId = ctx.from.id;
    if (isAdminChatId(adminChatIds, ctx.chat.id)) {
      const aw = store.getAdminAwait(userId);
      if (aw?.step === "WAIT_VFB_PHOTO") {
        await store.clearAdminAwait(userId);
        const d = store.getByToken(aw.token);
        await bot.telegram.sendPhoto(d.chatId, ctx.message.photo.pop().file_id, { caption: "✅ Bukti proses selesai dari admin." });
        return ctx.reply("✅ Foto bukti terkirim.");
      }
    }

    const tok = store.getTokenByUser(userId);
    const data = store.getByToken(tok);
    if (!data || data.status !== "WAIT_PROOF") return;

    await store.updatePending(tok, { status: "WAIT_ADMIN", proofFileId: ctx.message.photo.pop().file_id });
    await ctx.reply("✅ Bukti diterima! Admin sedang verifikasi.");

    for (const adminId of adminChatIds) {
      await ctx.telegram.sendPhoto(adminId, data.proofFileId, {
        caption: `🔔 *PESANAN BARU*\nID: ${data.orderId}\nMode: ${data.mode}\nUser: ${data.robloxUsername || data.loginUsername}\nTotal: ${formatRupiah(data.priceIdr)}`,
        parse_mode: "Markdown", ...adminMainKeyboard(tok)
      });
    }
  });

  // ADMIN ACTIONS
  bot.action(/ACC:(.+)/, async (ctx) => {
    const tok = ctx.match[1];
    await approveAndProcess(bot, store, rbxcave, tok, adminChatIds, "");
  });

  bot.action(/REJ:(.+)/, async (ctx) => {
    await ctx.editMessageReplyMarkup(rejectReasonKeyboard(ctx.match[1]).reply_markup);
  });

  bot.action(/REJR:(.+):(.+)/, async (ctx) => {
    const [_, tok, code] = ctx.match;
    if (code === "CANCEL") return ctx.editMessageReplyMarkup(adminMainKeyboard(tok).reply_markup);
    if (code === "OTHER") {
      await store.setAdminAwait(ctx.from.id, { step: "WAIT_CUSTOM_REASON", token: tok });
      return ctx.reply("Ketik alasan penolakan:");
    }
    const reasons = { LESS: "Nominal kurang", BLUR: "Bukti tidak jelas" };
    await finalizeReject(bot, store, tok, reasons[code], adminChatIds);
    await ctx.editMessageCaption("❌ REJECTED");
  });

  // VILOG FEEDBACK ACTIONS
  bot.action(/VFB_PHOTO:(.+)/, async (ctx) => {
    await store.setAdminAwait(ctx.from.id, { step: "WAIT_VFB_PHOTO", token: ctx.match[1] });
    ctx.reply("Kirim foto bukti:");
  });

  bot.action(/VFB_TEXT:(.+)/, async (ctx) => {
    await store.setAdminAwait(ctx.from.id, { step: "WAIT_VFB_TEXT", token: ctx.match[1] });
    ctx.reply("Ketik pesan progress:");
  });

  bot.action(/VFB_DONE:(.+)/, async (ctx) => {
    const d = store.getByToken(ctx.match[1]);
    await bot.telegram.sendMessage(d.chatId, "✅ Pesanan Selesai!");
    await store.removePending(ctx.match[1]);
    ctx.reply("✅ Ditandai selesai.");
  });

  return bot;
}

// HELPERS
async function approveAndProcess(bot, store, rbxcave, tok, adminChatIds, note) {
  const data = store.getByToken(tok);
  if (!data || data.status === "PROCESSING") return;

  // ATOMIC LOCKING
  await store.updatePending(tok, { status: "PROCESSING" });

  if (data.mode === "GAMEPASS") {
    try {
      // Payload RBXCave Akurat
      await rbxcave.createGamepassOrder({
        orderId: data.orderId,
        robloxUsername: data.robloxUsername,
        robuxAmount: data.robuxAmount, // Mengirim harga asli (misal 143)
        gamePassId: Number(data.gamePassId)
      });
      await bot.telegram.sendMessage(data.chatId, "✅ Pembayaran di-ACC. Order diproses API.");
      await store.removePending(tok);
    } catch (e) {
      await store.updatePending(tok, { status: "WAIT_ADMIN" });
      for (const aid of adminChatIds) bot.telegram.sendMessage(aid, `❌ API FAIL: ${e.message}`);
    }
  } else {
    // VILOG
    await bot.telegram.sendMessage(data.chatId, "✅ Pembayaran di-ACC. Admin sedang memproses.");
    for (const aid of adminChatIds) {
      bot.telegram.sendMessage(aid, `✅ VILOG APPROVED: ${data.orderId}`, { ...adminVilogFeedbackKeyboard(tok) });
    }
  }
}

async function finalizeReject(bot, store, tok, reason, adminChatIds) {
  const d = store.getByToken(tok);
  await bot.telegram.sendMessage(d.chatId, `❌ Ditolak: ${reason}`);
  await store.removePending(tok);
}

module.exports = { createQrisOrderBot };