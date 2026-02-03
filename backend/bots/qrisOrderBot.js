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
// ====== GAMEPASS (AUTO) ======
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

function makeSafeOrderId() {
  const t = Date.now();
  const r = crypto.randomBytes(4).toString("hex");
  return `TG${t}${r}`;
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

function safeStringify(x) {
  try {
    if (typeof x === "string") return x;
    return JSON.stringify(x, null, 2);
  } catch {
    return String(x);
  }
}

function parsePositiveInt(text) {
  const raw = String(text || "").trim();
  const digits = raw.replace(/[^\d]/g, "");
  const n = Number(digits);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return n;
}

/**
 * Ekstrak input user (Update regex untuk support regional /id/, /en/, dll)
 */
function extractRobloxIdsFromText(input) {
  const s = String(input || "").trim();
  if (!s) return { placeId: 0, gamePassId: 0, numberOnly: 0 };

  // Place URL: /games/{placeId} (ignore regional)
  const mGames = s.match(/(?:\/games\/|placeId=)(\d+)/i);
  if (mGames && mGames[1]) {
    const n = Number(mGames[1]);
    if (Number.isFinite(n) && n > 0) return { placeId: n, gamePassId: 0, numberOnly: 0 };
  }

  // Gamepass link variants (ignore regional)
  const mGp1 = s.match(/(?:\/game-pass\/|gamePassId=)(\d+)/i);
  if (mGp1 && mGp1[1]) {
    const n = Number(mGp1[1]);
    if (Number.isFinite(n) && n > 0) return { placeId: 0, gamePassId: n, numberOnly: 0 };
  }

  // loose "pass id 8210..."
  const mLooseGp = s.match(/pass\s*id\D*(\d+)/i);
  if (mLooseGp && mLooseGp[1]) {
    const n = Number(mLooseGp[1]);
    if (Number.isFinite(n) && n > 0) return { placeId: 0, gamePassId: n, numberOnly: 0 };
  }

  // any big number
  const allNums = s.match(/\d{6,}/g);
  if (allNums && allNums.length) {
    const n = Number(allNums[0]);
    if (Number.isFinite(n) && n > 0) return { placeId: 0, gamePassId: 0, numberOnly: n };
  }

  return { placeId: 0, gamePassId: 0, numberOnly: parsePositiveInt(s) };
}

// =========================
// ROBLOX LOOKUP
// =========================
async function fetchJsonPublic(url, { method = "GET", headers = {}, body, timeoutMs = 15000 } = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);

  try {
    const res = await fetch(url, { method, headers, body, signal: ctrl.signal });
    const text = await res.text();
    let data;
    try { data = text ? JSON.parse(text) : null; } catch { data = text; }

    if (!res.ok) {
      const err = new Error(`HTTP ${res.status}`);
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  } finally {
    clearTimeout(t);
  }
}

/**
 * Resolve GamePassId -> PlaceId
 */
async function resolvePlaceIdFromGamePassId(gamePassId) {
  const id = Number(gamePassId || 0);
  if (!(id > 0)) return { ok: false, placeId: 0, via: "invalid" };

  try {
    const url = `https://apis.roblox.com/game-passes/v1/game-passes/${id}/product-info`;
    const info = await fetchJsonPublic(url);

    const placeIdDirect = Number(info?.placeId || info?.PlaceId || 0) || 0;
    const price = Number(info?.PriceInRobux || info?.priceInRobux || 0);
    
    if (placeIdDirect > 0) {
      return { ok: true, placeId: placeIdDirect, price: price, via: "apis.placeId" };
    }
  } catch (_) {}

  // Fallback ke legacy jika perlu (seperti kode lama)
  try {
    const url = `https://api.roblox.com/marketplace/game-pass-product-info?gamePassId=${id}`;
    const info = await fetchJsonPublic(url);
    const placeId = Number(info?.PlaceId || info?.placeId || 0);
    if (placeId > 0) return { ok: true, placeId, via: "legacy.placeId" };
  } catch (_) {}

  return { ok: false, placeId: 0, via: "not_found" };
}

async function resolvePlaceIdFromUnknownNumber(n) {
  const id = Number(n || 0);
  if (!(id > 0)) return { ok: false, placeId: 0 };

  // coba anggap placeId
  try {
    const u = await fetchJsonPublic(`https://api.roblox.com/universes/get-universe-containing-place?placeid=${id}`);
    if (u?.UniverseId) return { ok: true, placeId: id, guessed: "placeId" };
  } catch (_) {}

  // coba anggap gamePassId
  const r = await resolvePlaceIdFromGamePassId(id);
  if (r.ok) return { ok: true, placeId: r.placeId, guessed: "gamePassId" };

  return { ok: false, placeId: 0, guessed: "unknown" };
}

// =========================
// DISCORD WEBHOOK
// =========================
function postDiscordWebhook(webhookUrl, content) {
  return new Promise((resolve) => {
    try {
      if (!webhookUrl) return resolve({ ok: false, status: 0 });
      const u = new URL(webhookUrl);
      const body = JSON.stringify({ content });
      const req = https.request(
        { method: "POST", hostname: u.hostname, path: u.pathname + (u.search || ""), headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) } },
        (res) => resolve({ ok: res.statusCode >= 200 && res.statusCode < 300 })
      );
      req.on("error", () => resolve({ ok: false }));
      req.write(body);
      req.end();
    } catch (e) {
      resolve({ ok: false });
    }
  });
}

async function notifyDiscordPaymentReceived(orderData) {
  const url = process.env.DISCORD_WEBHOOK_URL || "";
  if (!url) return;

  const nominal = formatRupiah(orderData.priceIdr || 0);
  const username = String(orderData.robloxUsername || orderData.loginUsername || "-").trim() || "-";
  const paket = String(orderData.label || "-").trim() || "-";
  const content = `Payment received: ${nominal} from ${username} [${paket}]`;

  await postDiscordWebhook(url, content);
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
  const start = p * PAGE_SIZE;
  const items = list.slice(start, start + PAGE_SIZE);
  const rows = [];

  for (let i = 0; i < items.length; i += 2) {
    const a = items[i];
    const b = items[i + 1];
    const aShow = mode === "GAMEPASS" ? Number(a.displayRobux || a.robuxAmount || 0) : Number(a.robuxAmount || 0);
    const bShow = b ? (mode === "GAMEPASS" ? Number(b.displayRobux || b.robuxAmount || 0) : Number(b.robuxAmount || 0)) : 0;
    
    const textA = `${aShow}⏣ • ${formatRupiah(a.priceIdr)}`;
    const row = [Markup.button.callback(textA, `PKG:${mode}:${a.key}`)];
    if (b) {
      const textB = `${bShow}⏣ • ${formatRupiah(b.priceIdr)}`;
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

function gamepassPlaceIdKeyboard() {
  return Markup.inlineKeyboard([
    [Markup.button.callback("📌 Cara cari Place ID", "HELP_PLACEID")],
    [Markup.button.callback("⬅️ Ganti Paket", "BACK_TO_PACKAGES:GAMEPASS")],
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

function adminVilogFeedbackKeyboard(token) {
  return Markup.inlineKeyboard([
    [Markup.button.callback("📸 Kirim foto bukti selesai", `VFB_PHOTO:${token}`)],
    [Markup.button.callback("📝 Kirim pesan/progress", `VFB_TEXT:${token}`)],
    [Markup.button.callback("✅ Tandai selesai", `VFB_DONE:${token}`)],
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
    "5) Admin verifikasi, lalu ACC / TOLAK",
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
      "ℹ️ Setelah pilih paket, kamu akan diminta kirim format data login + kode backup (min 3).",
    ].join("\n");
  }
  return [
    "⚡ *VIA GAMEPASS*",
    "────────────────────",
    "Pilih jumlah Robux yang kamu mau 👇",
    "",
    "ℹ️ Setelah pilih paket:",
    "1) Kirim *username Roblox*",
    "2) Kirim *Place ID / Link Game / Pass ID / Link Gamepass*",
    "",
    "⚠️ Penting:",
    "- Place ID itu ID game (angka di link setelah /games/).",
    "- Kalau kamu cuma punya Pass ID, bot akan coba cari Place ID otomatis.",
  ].join("\n");
}

function msgPackagePickedGAMEPASS(pkg) {
  const show = Number(pkg.displayRobux || pkg.robuxAmount || 0);
  return [
    "🧾 *Detail Paket GAMEPASS*",
    "────────────────────",
    `📦 Paket: *${show}⏣*`,
    `💳 Harga: *${formatRupiah(pkg.priceIdr)}*`,
    "",
    "✍️ Kirim *username Roblox* kamu (1 pesan).",
    "Contoh: `CoolPlayer123`",
  ].join("\n");
}

function msgAskGamepassPlaceId(pkg, username) {
  const show = Number(pkg.displayRobux || pkg.robuxAmount || 0);
  return [
    "✅ Username diterima.",
    "────────────────────",
    `👤 Username: \`${String(username || "").trim()}\``,
    `📦 Paket: *${show}⏣*`,
    `💳 Harga: *${formatRupiah(pkg.priceIdr)}*`,
    "",
    "✍️ Sekarang kirim salah satu:",
    "1) *Place ID* (angka) / Link game",
    "2) *Pass ID* (angka) / Link gamepass",
    "",
    "Contoh:",
    "- `1234567890`",
    "- `https://www.roblox.com/games/1234567890`",
    "- `https://www.roblox.com/game-pass/8210106190`",
  ].join("\n");
}

function msgPlaceIdHelp() {
  return [
    "📌 *Cara cari Place ID Roblox*",
    "────────────────────",
    "Angka setelah `/games/` di link game adalah Place ID.",
    "Contoh: `roblox.com/games/123456/Nama` -> Place ID: `123456`",
  ].join("\n");
}

function msgVilogTemplate(pkg) {
  return [
    "🧾 *Detail Paket (VIA LOGIN)*",
    "────────────────────",
    `📦 Paket: *${pkg.label}*`,
    `💳 Harga: *${formatRupiah(pkg.priceIdr)}*`,
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
    data.mode === "VILOG" ? `👤 Username: \`${data.loginUsername}\`` : `👤 Username: \`${data.robloxUsername}\``,
    data.mode === "GAMEPASS" ? `🧱 Place ID: \`${data.placeId}\`` : "",
    data.mode === "GAMEPASS" && data.gamePassId ? `🎫 Pass ID: \`${data.gamePassId}\`` : "",
    "",
    "✅ Scan QRIS lalu upload foto bukti pembayaran di chat ini.",
  ].filter(Boolean).join("\n");
}

function msgCancelConfirm(data) {
  return [
    "⚠️ *Konfirmasi Pembatalan*",
    "────────────────────",
    `🧾 Order ID: \`${data.orderId}\``,
    "Kamu yakin mau batalkan transaksi ini?",
  ].join("\n");
}

// =========================
// PARSER VILOG
// =========================
function pickAfterColon(line) {
  const idx = line.indexOf(":");
  if (idx === -1) return "";
  return line.slice(idx + 1).trim();
}

function parseVilogForm(text, forcedRobuxAmount) {
  const raw = String(text || "").trim();
  const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
  let username = "", password = "", jumlah = "", codes = [];

  for (const l of lines) {
    const low = l.toLowerCase();
    if (!username && (low.startsWith("username") || low.startsWith("user"))) { username = pickAfterColon(l) || ""; continue; }
    if (!password && (low.startsWith("password") || low.startsWith("pass"))) { password = pickAfterColon(l) || ""; continue; }
    if (!jumlah && (low.includes("jumlah") && low.includes("robux"))) { jumlah = pickAfterColon(l) || ""; continue; }
    
    const m = l.match(/^(\d+)\.\s*(.+)$/);
    if (m && m[2]) { codes.push(String(m[2]).trim()); continue; }
    const m2 = l.match(/^-+\s*(.+)$/);
    if (m2 && m2[1]) { codes.push(String(m2[1]).trim()); continue; }
  }

  const jumlahNum = forcedRobuxAmount ? Number(forcedRobuxAmount) : Number(String(jumlah).replace(/[^\d]/g, ""));
  const cleanJumlah = Number.isFinite(jumlahNum) && jumlahNum > 0 ? jumlahNum : 0;

  return {
    ok: Boolean(username && password && cleanJumlah > 0 && codes.length >= 3),
    username, password, jumlahRobux: cleanJumlah, backupCodes: codes.slice(0, 10),
    error: !username ? "Username kosong" : !password ? "Password kosong" : !(cleanJumlah > 0) ? "Jumlah order robux tidak valid" : (codes.length < 3) ? "Kode backup minimal 3" : "",
  };
}

// =========================
// BOT
// =========================
function createQrisOrderBot() {
  const botToken = process.env.TELEGRAM_BOT_TOKEN_GAMEPASS;
  if (!botToken) throw new Error("TELEGRAM_BOT_TOKEN_GAMEPASS missing in backend/.env");
  
  const adminChatIds = parseAdminChatIds(process.env.TELEGRAM_ADMIN_CHAT_ID || "");
  const qrisAbsPath = path.join(__dirname, "..", process.env.QRIS_IMAGE_PATH || "assets/qris.jpg");
  const store = new PendingStore();
  const rbxcave = makeRBXCaveClient();
  const bot = new Telegraf(botToken);

  setInterval(() => store.cleanupExpired(PENDING_TTL_MS), 60 * 1000).unref?.();

  bot.command("myid", (ctx) => ctx.reply(`chat_id: ${ctx.chat?.id}\nuser_id: ${ctx.from?.id}`));

  bot.start(async (ctx) => {
    if (ctx.from?.id) await store.clearUserFlow(ctx.from.id);
    await ctx.reply(msgWelcome(), { parse_mode: "Markdown", reply_markup: modeKeyboard().reply_markup });
  });

  bot.command("cancel", async (ctx) => {
    const userId = ctx.from?.id;
    if (!userId) return;
    const tok = store.getTokenByUser(userId);
    if (!tok) return ctx.reply("Tidak ada transaksi pending.");
    const data = store.getByToken(tok);
    if (!data) { await store.clearUser(userId); return ctx.reply("Tidak ada transaksi."); }
    if (data.status !== "WAIT_PROOF" && data.status !== "WAIT_ADMIN") return ctx.reply("⚠️ Sudah diproses, tidak bisa cancel.");
    await ctx.reply(msgCancelConfirm(data), { parse_mode: "Markdown", reply_markup: userCancelConfirmKeyboard(tok).reply_markup });
  });

  bot.action("NOOP", async (ctx) => ctx.answerCbQuery());

  bot.action("HELP_PLACEID", async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.reply(msgPlaceIdHelp(), { parse_mode: "Markdown" });
  });

  bot.action("RESET", async (ctx) => {
    await ctx.answerCbQuery("Reset");
    if (ctx.from?.id) { await store.clearUser(ctx.from.id); await store.clearUserFlow(ctx.from.id); }
    await ctx.editMessageText("✅ Sudah di-reset. Ketik /start untuk mulai lagi.");
  });

  bot.action("BACK_TO_MODE", async (ctx) => {
    await ctx.answerCbQuery();
    if (ctx.from?.id) await store.clearUserFlow(ctx.from.id);
    await ctx.editMessageText(msgWelcome(), { parse_mode: "Markdown", reply_markup: modeKeyboard().reply_markup });
  });

  bot.action(/MODE:(VILOG|GAMEPASS)/, async (ctx) => {
    await ctx.answerCbQuery();
    const mode = ctx.match[1];
    if (ctx.from?.id) await store.setUserFlow(ctx.from.id, { step: "CHOOSE_PKG", mode, page: 0 });
    await ctx.editMessageText(msgPickMode(mode), { parse_mode: "Markdown", reply_markup: packagesKeyboard(mode, 0).reply_markup });
  });

  bot.action(/PAGE:(VILOG|GAMEPASS):(\d+)/, async (ctx) => {
    await ctx.answerCbQuery();
    const [_, mode, page] = ctx.match;
    if (ctx.from?.id) await store.setUserFlow(ctx.from.id, { step: "CHOOSE_PKG", mode, page: Number(page) });
    await ctx.editMessageText(msgPickMode(mode), { parse_mode: "Markdown", reply_markup: packagesKeyboard(mode, Number(page)).reply_markup });
  });

  bot.action(/BACK_TO_PACKAGES:(VILOG|GAMEPASS)/, async (ctx) => {
    await ctx.answerCbQuery();
    const mode = ctx.match[1];
    if (ctx.from?.id) await store.setUserFlow(ctx.from.id, { step: "CHOOSE_PKG", mode, page: 0 });
    await ctx.reply(msgPickMode(mode), { parse_mode: "Markdown", reply_markup: packagesKeyboard(mode, 0).reply_markup });
  });

  bot.action(/PKG:(VILOG|GAMEPASS):(.+)/, async (ctx) => {
    await ctx.answerCbQuery();
    const [_, mode, pkgKey] = ctx.match;
    const pkg = findPackage(mode, pkgKey);
    if (!pkg) return ctx.reply("Paket tidak ditemukan.");
    
    const userId = ctx.from?.id;
    if (!userId) return;
    if (store.getTokenByUser(userId)) return ctx.reply("⚠️ Ada transaksi pending. Ketik /cancel dulu.");

    if (mode === "VILOG") {
      await store.setUserFlow(userId, { step: "WAIT_VILOG_FORM", mode, pkgKey });
      await ctx.editMessageText(msgVilogTemplate(pkg), { parse_mode: "Markdown", reply_markup: backToPackagesKeyboard(mode).reply_markup });
    } else {
      await store.setUserFlow(userId, { step: "WAIT_GAMEPASS_USERNAME", mode, pkgKey });
      await ctx.editMessageText(msgPackagePickedGAMEPASS(pkg), { parse_mode: "Markdown", reply_markup: backToPackagesKeyboard(mode).reply_markup });
    }
  });

  // =========================
  // TEXT HANDLER
  // =========================
  bot.on("text", async (ctx, next) => {
    const fromId = ctx.from?.id;
    const chatId = String(ctx.chat?.id || "");

    // ADMIN FLOW
    if (fromId && isAdminChatId(adminChatIds, chatId)) {
      const awaitObj = store.getAdminAwait(fromId);
      if (awaitObj?.step === "WAIT_CUSTOM_REASON") {
        await store.clearAdminAwait(fromId);
        await finalizeReject(bot, store, awaitObj.token, `Alasan admin: ${ctx.message.text}`, adminChatIds);
        return;
      }
      if (awaitObj?.step === "WAIT_ACC_NOTE") {
        await store.clearAdminAwait(fromId);
        await approveAndProcess(bot, store, rbxcave, awaitObj.token, adminChatIds, ctx.message.text);
        return;
      }
      if (awaitObj?.step === "WAIT_VILOG_FEEDBACK_TEXT") {
        await store.clearAdminAwait(fromId);
        const data = store.getByToken(awaitObj.token);
        if (data) {
          await bot.telegram.sendMessage(data.chatId, `📩 *Update dari Admin*\n\n${ctx.message.text}`, { parse_mode: "Markdown" });
          ctx.reply("✅ Pesan progress terkirim.");
        }
        return;
      }
    }

    // USER FLOW
    const userId = ctx.from?.id;
    if (!userId) return next();
    const flow = store.getUserFlow(userId);
    if (!flow) return next();

    // VILOG
    if (flow.step === "WAIT_VILOG_FORM") {
      const pkg = findPackage("VILOG", flow.pkgKey);
      const parsed = parseVilogForm(ctx.message.text || "", pkg?.robuxAmount);
      if (!parsed.ok) return ctx.reply(`⚠️ Format salah: ${parsed.error}\n\nKirim ulang sesuai format.`, { reply_markup: backToPackagesKeyboard("VILOG").reply_markup });

      const tok = makeToken();
      const data = {
        token: tok, userId, chatId: ctx.chat.id, orderId: makeSafeOrderId(),
        mode: "VILOG", orderType: "vilog_manual", label: pkg.label,
        priceIdr: Number(pkg.priceIdr), robuxAmount: Number(pkg.robuxAmount),
        loginUsername: parsed.username, loginPassword: parsed.password,
        jumlahOrderRobux: parsed.jumlahRobux, backupCodes: parsed.backupCodes,
        status: "WAIT_PROOF", createdAt: Date.now()
      };
      await store.setPending(tok, data);
      await store.setUserFlow(userId, { step: "WAIT_PROOF", mode: "VILOG" });
      await ctx.replyWithPhoto({ source: qrisAbsPath }, { caption: msgQrisCaption(data), parse_mode: "Markdown", reply_markup: userPaymentKeyboard(tok).reply_markup });
      return;
    }

    // GAMEPASS USERNAME
    if (flow.step === "WAIT_GAMEPASS_USERNAME") {
      const username = (ctx.message.text || "").trim();
      if (username.length < 3) return ctx.reply("⚠️ Username tidak valid.");
      await store.setUserFlow(userId, { step: "WAIT_GAMEPASS_PLACEID", pkgKey: flow.pkgKey, robloxUsername: username });
      const pkg = findPackage("GAMEPASS", flow.pkgKey);
      return ctx.reply(msgAskGamepassPlaceId(pkg, username), { parse_mode: "Markdown", reply_markup: gamepassPlaceIdKeyboard().reply_markup });
    }

    // GAMEPASS ID
    if (flow.step === "WAIT_GAMEPASS_PLACEID") {
      const pkg = findPackage("GAMEPASS", flow.pkgKey);
      const ids = extractRobloxIdsFromText(ctx.message.text);
      let placeId = ids.placeId;
      let gamePassId = ids.gamePassId;

      // Logic Resolving
      if (!placeId && gamePassId) {
        const r = await resolvePlaceIdFromGamePassId(gamePassId);
        if (r.ok) { placeId = r.placeId; }
      }
      if (!placeId && !gamePassId && ids.numberOnly) {
        const r = await resolvePlaceIdFromUnknownNumber(ids.numberOnly);
        if (r.ok) { placeId = r.placeId; if (r.guessed === "gamePassId") gamePassId = ids.numberOnly; }
      }

      if (!placeId && !gamePassId) return ctx.reply("⚠️ Place ID / Pass ID tidak ditemukan. Pastikan link benar.");

      // Validasi Harga (Auto Check)
      let priceMatch = true;
      let actualPrice = 0;
      if (gamePassId > 0) {
        const r = await resolvePlaceIdFromGamePassId(gamePassId); // Cek harga
        if (r.ok && r.price) {
          actualPrice = r.price;
          if (actualPrice !== pkg.robuxAmount) priceMatch = false;
        }
      }

      if (!priceMatch) {
         return ctx.reply(`❌ *Harga Salah!*\nPaket ini butuh: ${pkg.robuxAmount} Robux\nGamepass kamu: ${actualPrice} Robux\n\nSilakan ubah harga dan kirim link ulang.`);
      }

      const tok = makeToken();
      const data = {
        token: tok, userId, chatId: ctx.chat.id, orderId: makeSafeOrderId(),
        mode: "GAMEPASS", orderType: pkg.orderType, robloxUsername: flow.robloxUsername,
        displayRobux: pkg.displayRobux, robuxAmount: pkg.robuxAmount,
        placeId: placeId, gamePassId: gamePassId,
        label: pkg.label, priceIdr: pkg.priceIdr,
        status: "WAIT_PROOF", createdAt: Date.now()
      };
      
      await store.setPending(tok, data);
      await store.setUserFlow(userId, { step: "WAIT_PROOF", mode: "GAMEPASS" });
      await ctx.replyWithPhoto({ source: qrisAbsPath }, { caption: msgQrisCaption(data), parse_mode: "Markdown", reply_markup: userPaymentKeyboard(tok).reply_markup });
      return;
    }

    return next();
  });

  // =========================
  // PHOTO HANDLER (FIXED 400 ERROR)
  // =========================
  bot.on("photo", async (ctx) => {
    const fromId = ctx.from?.id;
    const chatId = String(ctx.chat?.id || "");

    // ADMIN Feedback
    if (fromId && isAdminChatId(adminChatIds, chatId)) {
      const awaitObj = store.getAdminAwait(fromId);
      if (awaitObj?.step === "WAIT_VILOG_FEEDBACK_PHOTO") {
        const data = store.getByToken(awaitObj.token);
        const fileId = ctx.message.photo.pop()?.file_id; // Safe access
        if (data && fileId) {
          await store.clearAdminAwait(fromId);
          await bot.telegram.sendPhoto(data.chatId, fileId, { caption: "✅ Bukti pesanan selesai dari admin." });
          await store.removePending(awaitObj.token);
          return ctx.reply("✅ Foto bukti terkirim.");
        }
      }
    }

    // USER Payment Proof
    const userId = ctx.from?.id;
    if (!userId) return;
    const tok = store.getTokenByUser(userId);
    if (!tok) return ctx.reply("Belum ada transaksi.");
    const data = store.getByToken(tok);
    if (!data || data.status !== "WAIT_PROOF") return;

    const fileId = ctx.message.photo.pop()?.file_id; // FIX ERROR 400
    if (!fileId) return ctx.reply("❌ Gagal membaca foto.");

    await store.updatePending(tok, { proofFileId: fileId, status: "WAIT_ADMIN" });
    await ctx.reply("✅ Bukti diterima! Menunggu admin.", { reply_markup: userCancelConfirmKeyboard(tok).reply_markup });

    for (const adminId of adminChatIds) {
      try {
        await bot.telegram.sendPhoto(adminId, fileId, {
          caption: `🔔 *PESANAN BARU*\nID: \`${data.orderId}\`\nUser: ${data.robloxUsername || data.loginUsername}\nTotal: ${formatRupiah(data.priceIdr)}\nPlace: ${data.placeId}`,
          parse_mode: "Markdown",
          reply_markup: adminMainKeyboard(tok).reply_markup
        });
      } catch (e) { console.log(e); }
    }
  });

  // =========================
  // ADMIN ACTIONS
  // =========================
  bot.action(/ACC:(.+)/, async (ctx) => {
    const [_, tok] = ctx.match;
    await ctx.answerCbQuery("Pilih ACC");
    try { await ctx.editMessageCaption(ctx.update.callback_query.message.caption + "\n\n✅ *Pilih Mode ACC:*", { parse_mode: "Markdown", reply_markup: adminAccKeyboard(tok).reply_markup }); } catch {}
  });

  bot.action(/ACC_DO:(.+)/, async (ctx) => {
    await ctx.answerCbQuery("Memproses...");
    await approveAndProcess(bot, store, rbxcave, ctx.match[1], adminChatIds, "");
  });

  bot.action(/ACC_NOTE:(.+)/, async (ctx) => {
    await ctx.answerCbQuery("Ketik catatan");
    await store.setAdminAwait(ctx.from.id, { step: "WAIT_ACC_NOTE", token: ctx.match[1] });
    ctx.reply("Ketik catatan ACC:");
  });

  bot.action(/REJ:(.+)/, async (ctx) => {
    await ctx.answerCbQuery("Pilih alasan");
    await ctx.editMessageReplyMarkup(rejectReasonKeyboard(ctx.match[1]).reply_markup);
  });

  bot.action(/REJR:(.+):(.+)/, async (ctx) => {
    const [_, tok, code] = ctx.match;
    if (code === "CANCEL") return ctx.editMessageReplyMarkup(adminMainKeyboard(tok).reply_markup);
    if (code === "OTHER") {
      await store.setAdminAwait(ctx.from.id, { step: "WAIT_CUSTOM_REASON", token: tok });
      return ctx.reply("Ketik alasan reject:");
    }
    const reasons = { LESS: "Nominal kurang", MORE: "Nominal lebih", BLUR: "Bukti tidak jelas" };
    await finalizeReject(bot, store, tok, reasons[code] || "Ditolak", adminChatIds);
    await ctx.editMessageCaption("❌ REJECTED");
  });

  // User Cancel Actions
  bot.action(/U_CANCEL_Y:(.+)/, async (ctx) => {
    const tok = ctx.match[1];
    const data = store.getByToken(tok);
    if (data) {
       await store.removePending(tok);
       await ctx.editMessageText("✅ Transaksi dibatalkan.");
       for (const aid of adminChatIds) bot.telegram.sendMessage(aid, `⚠️ User cancel: ${data.orderId}`);
    }
  });
  bot.action(/U_CANCEL_N:(.+)/, async (ctx) => ctx.editMessageText("👍 Transaksi dilanjutkan."));

  return bot;
}

// =======================
// HELPERS (FIXED RBXCAVE PAYLOAD)
// =======================
async function approveAndProcess(bot, store, rbxcave, tok, adminChatIds, note) {
  const data = store.getByToken(tok);
  if (!data || data.status === "PROCESSING") return;

  await store.updatePending(tok, { status: "PROCESSING" });

  if (data.mode === "GAMEPASS") {
    try {
      let finalPlaceId = Number(data.placeId || 0);

      // 1. RE-RESOLVE jika PlaceID masih 0 (Fix Error RBXCave)
      if (finalPlaceId <= 0 && data.gamePassId) {
        const r = await resolvePlaceIdFromGamePassId(data.gamePassId);
        if (r.ok) finalPlaceId = r.placeId;
      }

      if (finalPlaceId <= 0) throw new Error("Gagal mendapatkan Place ID. Pastikan link benar.");

      // 2. Kirim Payload ke RBXCave (PlaceId wajib ada)
      await rbxcave.createGamepassOrder({
        orderId: String(data.orderId),
        robloxUsername: String(data.robloxUsername),
        robuxAmount: Number(data.robuxAmount), 
        gamePassId: Number(data.gamePassId),
        placeId: finalPlaceId // Wajib Number > 0
      });

      const msg = `✅ *Pembayaran Diterima!*\nOrder ID: \`${data.orderId}\` berhasil diproses API.\nRobux masuk 4-5 hari.`;
      await bot.telegram.sendMessage(data.chatId, msg, { parse_mode: "Markdown" });
      await store.removePending(tok);
      await notifyDiscordPaymentReceived(data);

    } catch (e) {
      // Rollback jika gagal
      await store.updatePending(tok, { status: "WAIT_ADMIN" });
      const detail = e.data ? JSON.stringify(e.data) : e.message;
      for (const aid of adminChatIds) {
        await bot.telegram.sendMessage(aid, `❌ *API FAIL: ${data.orderId}*\nErr: ${e.message}\nDetail: \`${detail}\``, { parse_mode: "Markdown" });
      }
    }
  } else {
    // VILOG Logic
    await bot.telegram.sendMessage(data.chatId, "✅ *Pembayaran Diterima!*\nAdmin sedang memproses manual.");
    for (const aid of adminChatIds) {
       await bot.telegram.sendMessage(aid, `✅ VILOG APPROVED: ${data.orderId}`, { ...adminVilogFeedbackKeyboard(tok) });
    }
    await store.updatePending(tok, { status: "VILOG_IN_PROGRESS" });
    await notifyDiscordPaymentReceived(data);
  }
}

async function finalizeReject(bot, store, tok, reason, adminChatIds) {
  const data = store.getByToken(tok);
  if (data) {
    await bot.telegram.sendMessage(data.chatId, `❌ *Ditolak*\nAlasan: ${reason}`, { parse_mode: "Markdown" });
    await store.removePending(tok);
    for (const aid of adminChatIds) bot.telegram.sendMessage(aid, `❌ REJECTED: ${data.orderId}\nReason: ${reason}`);
  }
}

module.exports = { createQrisOrderBot };