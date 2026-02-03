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
const PENDING_TTL_MS = 1000 * 60 * 60; // 1 jam

// =========================
// UTIL
// =========================
function formatRupiah(n) {
  try { return "Rp " + new Intl.NumberFormat("id-ID").format(Number(n || 0)); }
  catch { return "Rp " + String(n); }
}

function makeToken() { return crypto.randomBytes(6).toString("hex"); }

function makeSafeOrderId() {
  const t = Date.now();
  const r = crypto.randomBytes(4).toString("hex");
  return `TG${t}${r}`;
}

function pagesCount(list) { return Math.max(1, Math.ceil(list.length / PAGE_SIZE)); }

function getPackagesByMode(mode) {
  return mode === "VILOG" ? PACKAGES_VILOG : PACKAGES_GAMEPASS;
}

function findPackage(mode, key) {
  return getPackagesByMode(mode).find((p) => p.key === key) || null;
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

function parsePositiveInt(text) {
  const digits = String(text || "").replace(/[^\d]/g, "");
  const n = Number(digits);
  return (Number.isFinite(n) && n > 0) ? n : 0;
}

/**
 * Ekstrak ID dari teks secara akurat (Mendukung regional /id/ dsb)
 */
function extractRobloxIdsFromText(input) {
  const s = String(input || "").trim();
  if (!s) return { placeId: 0, gamePassId: 0, numberOnly: 0 };

  const mGpLink = s.match(/game-pass\/(\d+)/i);
  if (mGpLink && mGpLink[1]) return { placeId: 0, gamePassId: Number(mGpLink[1]), numberOnly: 0 };

  const mGames = s.match(/\/games\/(\d+)/i);
  if (mGames && mGames[1]) return { placeId: Number(mGames[1]), gamePassId: 0, numberOnly: 0 };

  const mGpQuery = s.match(/[?&]gamePassId=(\d+)/i);
  if (mGpQuery && mGpQuery[1]) return { placeId: 0, gamePassId: Number(mGpQuery[1]), numberOnly: 0 };

  const allNums = s.match(/\d{6,}/g);
  if (allNums && allNums.length) return { placeId: 0, gamePassId: 0, numberOnly: Number(allNums[0]) };

  return { placeId: 0, gamePassId: 0, numberOnly: parsePositiveInt(s) };
}

// =========================
// ROBLOX LOOKUP & PRICE CHECK
// =========================
async function fetchJsonPublic(url) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 15000);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally { clearTimeout(t); }
}

async function resolvePlaceIdFromGamePassId(gamePassId) {
  const id = Number(gamePassId || 0);
  if (!(id > 0)) return { ok: false, error: "ID tidak valid" };
  try {
    const info = await fetchJsonPublic(`https://apis.roblox.com/game-passes/v1/game-passes/${id}/product-info`);
    const universeId = Number(info?.universeId || info?.UniverseId || 0);
    const placeIdDirect = Number(info?.placeId || info?.PlaceId || 0);
    const price = Number(info?.priceInRobux || info?.PriceInRobux || 0);

    if (placeIdDirect > 0) return { ok: true, placeId: placeIdDirect, universeId, price };
    
    if (universeId > 0) {
      const g = await fetchJsonPublic(`https://games.roblox.com/v1/games?universeIds=${universeId}`);
      const rootPlaceId = Number(g?.data?.[0]?.rootPlaceId || 0);
      if (rootPlaceId > 0) return { ok: true, placeId: rootPlaceId, universeId, price };
    }
    return { ok: false, error: "Data game tidak ditemukan untuk Pass ID ini" };
  } catch (e) {
    return { ok: false, error: `Roblox API Offline/Error: ${e.message}` };
  }
}

async function resolvePlaceIdFromUnknownNumber(n) {
  const id = Number(n || 0);
  if (!(id > 0)) return { ok: false, error: "Input angka nol" };

  const r = await resolvePlaceIdFromGamePassId(id);
  if (r.ok) return { ...r, guessed: "gamePassId" };

  try {
    const u = await fetchJsonPublic(`https://api.roblox.com/universes/get-universe-containing-place?placeid=${id}`);
    if (u?.UniverseId || u?.universeId) return { ok: true, placeId: id, guessed: "placeId", price: 0 };
  } catch (_) {}

  return { ok: false, error: r.error || "ID tidak terdaftar di Roblox" };
}

// =========================
// DISCORD WEBHOOK
// =========================
async function notifyDiscordPaymentReceived(orderData) {
  const url = process.env.DISCORD_WEBHOOK_URL || "";
  if (!url) return;
  const content = `Payment received: ${formatRupiah(orderData.priceIdr)} from ${orderData.robloxUsername || orderData.loginUsername || "-"} [${orderData.label}]`;
  try {
    await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content }) });
  } catch (e) { console.log("[discord] error:", e.message); }
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
  const total = pagesCount(list);
  const p = Math.max(0, Math.min(Number(page || 0), total - 1));
  const start = p * PAGE_SIZE;
  const items = list.slice(start, start + PAGE_SIZE);
  const rows = [];
  for (let i = 0; i < items.length; i += 2) {
    const a = items[i], b = items[i + 1];
    const aShow = mode === "GAMEPASS" ? a.displayRobux : a.robuxAmount;
    const row = [Markup.button.callback(`${aShow}⏣ • ${formatRupiah(a.priceIdr)}`, `PKG:${mode}:${a.key}`)];
    if (b) {
      const bShow = mode === "GAMEPASS" ? b.displayRobux : b.robuxAmount;
      row.push(Markup.button.callback(`${bShow}⏣ • ${formatRupiah(b.priceIdr)}`, `PKG:${mode}:${b.key}`));
    }
    rows.push(row);
  }
  const nav = [];
  if (p > 0) nav.push(Markup.button.callback("⬅️", `PAGE:${mode}:${p - 1}`));
  nav.push(Markup.button.callback(`${p + 1}/${total}`, "NOOP"));
  if (p < total - 1) nav.push(Markup.button.callback("➡️", `PAGE:${mode}:${p + 1}`));
  rows.push(nav);
  rows.push([Markup.button.callback("⬅️ Kembali", "BACK_TO_MODE")]);
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
    [Markup.button.callback("✅ Saya sudah bayar (upload bukti)", "NOOP")],
    [Markup.button.callback("❌ Batal", `U_CANCEL:${token}`)],
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
    [Markup.button.callback("✅ ACC Langsung", `ACC_DO:${token}`)],
    [Markup.button.callback("📝 ACC + Note", `ACC_NOTE:${token}`)],
    [Markup.button.callback("↩️ Kembali", `ACC_BACK:${token}`)],
  ]);
}

function rejectReasonKeyboard(token) {
  return Markup.inlineKeyboard([
    [Markup.button.callback("💸 Kurang", `REJR:${token}:LESS`)],
    [Markup.button.callback("💰 Lebih", `REJR:${token}:MORE`)],
    [Markup.button.callback("🖼️ Blur", `REJR:${token}:BLUR`)],
    [Markup.button.callback("✍️ Lainnya", `REJR:${token}:OTHER`)],
    [Markup.button.callback("↩️ Batal", `REJR:${token}:CANCEL`)],
  ]);
}

function adminVilogFeedbackKeyboard(token) {
  return Markup.inlineKeyboard([
    [Markup.button.callback("📸 Foto Bukti", `VFB_PHOTO:${token}`)],
    [Markup.button.callback("📝 Pesan update", `VFB_TEXT:${token}`)],
    [Markup.button.callback("✅ Selesai", `VFB_DONE:${token}`)],
  ]);
}

// =========================
// CORE BOT
// =========================
function createQrisOrderBot() {
  const botToken = process.env.TELEGRAM_BOT_TOKEN_GAMEPASS;
  if (!botToken) throw new Error("TELEGRAM_BOT_TOKEN_GAMEPASS missing");
  const adminChatIds = parseAdminChatIds(process.env.TELEGRAM_ADMIN_CHAT_ID);
  const qrisAbsPath = path.join(__dirname, "..", process.env.QRIS_IMAGE_PATH || "assets/qris.jpg");

  const store = new PendingStore();
  const rbxcave = makeRBXCaveClient();
  const bot = new Telegraf(botToken);

  setInterval(() => store.cleanupExpired(PENDING_TTL_MS), 60000).unref?.();

  bot.start(async (ctx) => {
    if (ctx.from?.id) await store.clearUserFlow(ctx.from.id);
    await ctx.reply("✨ *Centra Game Bot*\n────────────────────\nSilakan pilih metode order 👇", { parse_mode: "Markdown", reply_markup: modeKeyboard().reply_markup });
  });

  bot.action("RESET", async (ctx) => {
    await ctx.answerCbQuery();
    if (ctx.from?.id) { await store.clearUser(ctx.from.id); await store.clearUserFlow(ctx.from.id); }
    await ctx.editMessageText("✅ Reset berhasil. Ketik /start.");
  });

  bot.action("BACK_TO_MODE", async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.editMessageText("✨ *Centra Game Bot*\nSilakan pilih metode order 👇", { parse_mode: "Markdown", reply_markup: modeKeyboard().reply_markup });
  });

  bot.action(/MODE:(VILOG|GAMEPASS)/, async (ctx) => {
    await ctx.answerCbQuery();
    const mode = ctx.match[1];
    if (ctx.from?.id) await store.setUserFlow(ctx.from.id, { step: "CHOOSE_PKG", mode, page: 0 });
    const text = mode === "VILOG" ? "🔐 *VIA LOGIN*\nPilih paket 👇" : "⚡ *VIA GAMEPASS*\nPilih paket 👇";
    await ctx.editMessageText(text, { parse_mode: "Markdown", reply_markup: packagesKeyboard(mode, 0).reply_markup });
  });

  bot.action(/PAGE:(VILOG|GAMEPASS):(\d+)/, async (ctx) => {
    await ctx.answerCbQuery();
    const [_, mode, page] = ctx.match;
    if (ctx.from?.id) await store.setUserFlow(ctx.from.id, { step: "CHOOSE_PKG", mode, page: Number(page) });
    const text = mode === "VILOG" ? "🔐 *VIA LOGIN*\nPilih paket 👇" : "⚡ *VIA GAMEPASS*\nPilih paket 👇";
    await ctx.editMessageText(text, { parse_mode: "Markdown", reply_markup: packagesKeyboard(mode, page).reply_markup });
  });

  bot.action(/PKG:(VILOG|GAMEPASS):(.+)/, async (ctx) => {
    await ctx.answerCbQuery();
    const [_, mode, pkgKey] = ctx.match;
    const pkg = findPackage(mode, pkgKey);
    const uid = ctx.from.id;
    if (store.getTokenByUser(uid)) return ctx.reply("⚠️ Selesaikan transaksi sebelumnya atau /cancel.");
    
    if (mode === "VILOG") {
      await store.setUserFlow(uid, { step: "WAIT_VILOG_FORM", mode, pkgKey });
      await ctx.reply(`🧾 *Paket VILOG:* *${pkg.label}*\n\n✍️ Kirim data login (Username, Password, 3 Backup Code).`);
    } else {
      await store.setUserFlow(uid, { step: "WAIT_GP_USER", mode, pkgKey });
      await ctx.reply(`⚡ *Paket GAMEPASS:* *${pkg.displayRobux}⏣*\n\n✍️ Kirim *username Roblox* kamu.`);
    }
  });

  bot.on("text", async (ctx, next) => {
    const fid = ctx.from?.id;
    if (isAdminChatId(adminChatIds, ctx.chat?.id)) {
      const awaitObj = store.getAdminAwait(fid);
      if (awaitObj?.token) {
        if (awaitObj.step === "WAIT_CUSTOM_REASON") {
          await store.clearAdminAwait(fid);
          return finalizeReject(bot, store, awaitObj.token, ctx.message.text, adminChatIds);
        }
        if (awaitObj.step === "WAIT_ACC_NOTE") {
          await store.clearAdminAwait(fid);
          return approveAndProcess(bot, store, rbxcave, awaitObj.token, adminChatIds, ctx.message.text);
        }
        if (awaitObj.step === "WAIT_VILOG_FEEDBACK_TEXT") {
          const data = store.getByToken(awaitObj.token);
          await store.clearAdminAwait(fid);
          if (data) await bot.telegram.sendMessage(data.chatId, `📩 *Update Admin:*\n${ctx.message.text}`, { parse_mode: "Markdown" });
          return ctx.reply("✅ Update terkirim.");
        }
      }
    }

    const flow = store.getUserFlow(fid);
    if (!flow) return next();

    if (flow.step === "WAIT_GP_USER") {
      await store.setUserFlow(fid, { ...flow, step: "WAIT_GP_ID", robloxUsername: ctx.message.text.trim() });
      return ctx.reply("🔗 Kirim *Place ID* atau *Pass ID* atau *Link Game* kamu.");
    }

    if (flow.step === "WAIT_GP_ID") {
      const pkg = findPackage("GAMEPASS", flow.pkgKey);
      const ids = extractRobloxIdsFromText(ctx.message.text);
      let pId = ids.placeId, gpId = ids.gamePassId;

      // START RESOLVE & PRICE CHECK
      await ctx.reply("⏳ Sedang memproses data ID...");
      
      let resolveResult;
      if (!pId && !gpId && ids.numberOnly > 0) {
        resolveResult = await resolvePlaceIdFromUnknownNumber(ids.numberOnly);
        if (resolveResult.ok) { pId = resolveResult.placeId; if (resolveResult.guessed === "gamePassId") gpId = ids.numberOnly; }
      } else if (!pId && gpId > 0) {
        resolveResult = await resolvePlaceIdFromGamePassId(gpId);
        if (resolveResult.ok) pId = resolveResult.placeId;
      }

      if (!resolveResult || !resolveResult.ok) {
        return ctx.reply(`❌ *ID tidak valid*\nAlasan: ${resolveResult?.error || "Format tidak dikenali"}`);
      }

      // VALIDASI HARGA OTOMATIS
      if (gpId > 0 && resolveResult.price > 0 && resolveResult.price !== pkg.robuxAmount) {
        return ctx.reply(`⚠️ *Harga Gamepass Salah!*\n────────────────────\nID: \`${gpId}\` terdeteksi seharga *${resolveResult.price} Robux*.\n\nHarusnya harganya adalah *${pkg.robuxAmount} Robux* agar paket ini bisa diproses.\n\nSilakan ganti harga di Roblox dulu lalu kirim ID-nya lagi.`);
      }

      const tok = makeToken();
      const data = {
        token: tok, createdAt: Date.now(), userId: fid, chatId: ctx.chat.id, orderId: makeSafeOrderId(),
        mode: "GAMEPASS", orderType: pkg.orderType, robloxUsername: flow.robloxUsername, robuxAmount: pkg.robuxAmount,
        placeId: Number(pId), gamePassId: Number(gpId), label: pkg.label, priceIdr: pkg.priceIdr, status: "WAIT_PROOF"
      };

      await store.setPending(tok, data);
      await store.setUserFlow(fid, { step: "WAIT_PROOF" });
      return ctx.replyWithPhoto({ source: qrisAbsPath }, { 
        caption: `🧾 *ID Order:* \`${data.orderId}\`\n💰 *Total:* ${formatRupiah(data.priceIdr)}\n\nID Roblox Valid! Silakan bayar dan upload foto bukti.`, 
        parse_mode: "Markdown", 
        reply_markup: userPaymentKeyboard(tok).reply_markup 
      });
    }
    return next();
  });

  bot.on("photo", async (ctx) => {
    const tok = store.getTokenByUser(ctx.from.id);
    const data = store.getByToken(tok);
    if (data?.status === "WAIT_PROOF") {
      await store.updatePending(tok, { status: "WAIT_ADMIN" });
      await ctx.reply("⏳ Bukti diterima. Menunggu verifikasi admin.");
      for (const aid of adminChatIds) {
        await bot.telegram.sendPhoto(aid, ctx.message.photo.pop().file_id, {
          caption: `🔔 *ORDER BARU*\nID: \`${data.orderId}\`\nUser: \`${data.robloxUsername}\`\nPaket: ${data.label}`,
          reply_markup: adminMainKeyboard(tok).reply_markup
        });
      }
    }
  });

  bot.action(/ACC:(.+)/, async (ctx) => {
    const tok = ctx.match[1];
    const data = store.getByToken(tok);
    if (data?.status === "WAIT_ADMIN") {
      await ctx.editMessageCaption(ctx.callbackQuery.message.caption + "\n\n✅ *Pilih ACC:*", { parse_mode: "Markdown", reply_markup: adminAccKeyboard(tok).reply_markup });
    }
    await ctx.answerCbQuery();
  });

  bot.action(/ACC_DO:(.+)/, async (ctx) => {
    await approveAndProcess(bot, store, rbxcave, ctx.match[1], adminChatIds, "");
    await ctx.answerCbQuery();
  });

  return bot;
}

// =======================
// HELPERS
// =======================
async function approveAndProcess(bot, store, rbxcave, token, adminChatIds, note) {
  const data = store.getByToken(token);
  if (!data || data.status === "PROCESSING") return;
  await store.updatePending(token, { status: "PROCESSING" });

  if (data.mode === "GAMEPASS") {
    const payload = {
      orderId: data.orderId, robloxUsername: data.robloxUsername, robuxAmount: data.robuxAmount,
      gamePassId: data.orderType === "gamepass_order" ? Number(data.gamePassId) : undefined,
      placeId: data.orderType === "vip_server" ? Number(data.placeId) : undefined,
      isPreOrder: false, checkOwnership: false
    };
    try {
      if (data.orderType === "gamepass_order") await rbxcave.createGamepassOrder(payload);
      else await rbxcave.createVipServerOrder(payload);
      await bot.telegram.sendMessage(data.chatId, `✅ *Pembayaran Terverifikasi*\nID: ${data.orderId}\n\n${note}`, { parse_mode: "Markdown" });
      await notifyDiscordPaymentReceived(data);
      await store.removePending(token);
    } catch (e) {
      await store.updatePending(token, { status: "WAIT_ADMIN" });
      for (const id of adminChatIds) await bot.telegram.sendMessage(id, `❌ API Gagal (RBXCave): ${e.message}`);
    }
  }
}

async function finalizeReject(bot, store, tok, reason, adminChatIds) {
  const data = store.getByToken(tok);
  if (!data) return;
  await bot.telegram.sendMessage(data.chatId, `❌ *Ditolak:* ${reason}`);
  await store.removePending(tok);
  for (const aid of adminChatIds) await bot.telegram.sendMessage(aid, `❌ Ditolak: ${data.orderId}`);
}

module.exports = { createQrisOrderBot };