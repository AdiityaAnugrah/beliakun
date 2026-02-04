// backend/bots/qrisOrderBot.js
const { Telegraf, Markup } = require("telegraf");
const crypto = require("crypto");
const path = require("path");
const https = require("https");
const { URL } = require("url");

const { makeRBXCaveClient } = require("../utils/rbxcaveClient");
const { PendingStore } = require("../utils/pendingStore");

// =========================
// GLOBAL STATE & CONFIG
// =========================
let IS_SHOP_OPEN = true; // Status Toko (Default: Buka)

// Ambil ID Topic dari .env (Konversi ke Number jika ada)
// Contoh .env: TELEGRAM_TOPIC_ORDER=123
const TOPIC_ORDER = process.env.TELEGRAM_TOPIC_ORDER ? Number(process.env.TELEGRAM_TOPIC_ORDER) : null;
const TOPIC_LOG = process.env.TELEGRAM_TOPIC_LOG ? Number(process.env.TELEGRAM_TOPIC_LOG) : null;

// =========================
// KONFIG PAKET
// =========================
// Catatan:
// - displayRobux = yang user lihat (misal 100)
// - robuxAmount  = harga Gamepass di Roblox (misal 143) -> yang dikirim ke RBXCave
// - label        = teks label yang tampil di detail/QRIS

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
  // VIP (opsional)
  // { key: "vip_200", mode: "GAMEPASS", orderType: "vip_server", label: "⚡ VIP Server 200⏣", displayRobux: 200, robuxAmount: 200, placeId: 0, priceIdr: 35000 },
];

// ====== VILOG (MANUAL VIA LOGIN) ======
const PACKAGES_VILOG = [
  // --- ROBUX FAST ---
  { key: "vilog_80", mode: "VILOG", orderType: "vilog_manual", label: "🔐 VILOG 80⏣", robuxAmount: 80, priceIdr: 15250 },
  { key: "vilog_160", mode: "VILOG", orderType: "vilog_manual", label: "🔐 VILOG 160⏣", robuxAmount: 160, priceIdr: 30500 },
  { key: "vilog_240", mode: "VILOG", orderType: "vilog_manual", label: "🔐 VILOG 240⏣", robuxAmount: 240, priceIdr: 45750 },
  { key: "vilog_320", mode: "VILOG", orderType: "vilog_manual", label: "🔐 VILOG 320⏣", robuxAmount: 320, priceIdr: 61000 },
  { key: "vilog_500", mode: "VILOG", orderType: "vilog_manual", label: "🔐 VILOG 500⏣", robuxAmount: 500, priceIdr: 73000 },

  // --- ROBUX FAST INSTANT ---
  { key: "vilog_1000", mode: "VILOG", orderType: "vilog_manual", label: "🔐 VILOG 1.000⏣", robuxAmount: 1000, priceIdr: 146000 },
  { key: "vilog_1500", mode: "VILOG", orderType: "vilog_manual", label: "🔐 VILOG 1.500⏣", robuxAmount: 1500, priceIdr: 219000 },
  { key: "vilog_2000", mode: "VILOG", orderType: "vilog_manual", label: "🔐 VILOG 2.000⏣", robuxAmount: 2000, priceIdr: 292000 },
  { key: "vilog_2500", mode: "VILOG", orderType: "vilog_manual", label: "🔐 VILOG 2.500⏣", robuxAmount: 2500, priceIdr: 365000 },
  { key: "vilog_3000", mode: "VILOG", orderType: "vilog_manual", label: "🔐 VILOG 3.000⏣", robuxAmount: 3000, priceIdr: 438000 },
  { key: "vilog_3500", mode: "VILOG", orderType: "vilog_manual", label: "🔐 VILOG 3.500⏣", robuxAmount: 3500, priceIdr: 511000 },
  { key: "vilog_4000", mode: "VILOG", orderType: "vilog_manual", label: "🔐 VILOG 4.000⏣", robuxAmount: 4000, priceIdr: 584000 },
  { key: "vilog_4500", mode: "VILOG", orderType: "vilog_manual", label: "🔐 VILOG 4.500⏣", robuxAmount: 4500, priceIdr: 657000 },
  { key: "vilog_5000", mode: "VILOG", orderType: "vilog_manual", label: "🔐 VILOG 5.000⏣", robuxAmount: 5000, priceIdr: 730000 },

  // --- ROBUX SEMI SULTAN ---
  { key: "vilog_6000", mode: "VILOG", orderType: "vilog_manual", label: "🔐 VILOG 6.000⏣", robuxAmount: 6000, priceIdr: 876000 },
  { key: "vilog_7000", mode: "VILOG", orderType: "vilog_manual", label: "🔐 VILOG 7.000⏣", robuxAmount: 7000, priceIdr: 1022000 },
  { key: "vilog_8000", mode: "VILOG", orderType: "vilog_manual", label: "🔐 VILOG 8.000⏣", robuxAmount: 8000, priceIdr: 1168000 },
  { key: "vilog_9000", mode: "VILOG", orderType: "vilog_manual", label: "🔐 VILOG 9.000⏣", robuxAmount: 9000, priceIdr: 1314000 },
  { key: "vilog_10000", mode: "VILOG", orderType: "vilog_manual", label: "🔐 VILOG 10.000⏣", robuxAmount: 10000, priceIdr: 1460000 },

  // --- ROBUX SULTAN ---
  { key: "vilog_15000", mode: "VILOG", orderType: "vilog_manual", label: "🔐 VILOG 15.000⏣", robuxAmount: 15000, priceIdr: 2190000 },
  { key: "vilog_20000", mode: "VILOG", orderType: "vilog_manual", label: "🔐 VILOG 20.000⏣", robuxAmount: 20000, priceIdr: 2920000 },
  { key: "vilog_25000", mode: "VILOG", orderType: "vilog_manual", label: "🔐 VILOG 25.000⏣", robuxAmount: 25000, priceIdr: 3650000 },
  { key: "vilog_40000", mode: "VILOG", orderType: "vilog_manual", label: "🔐 VILOG 40.000⏣", robuxAmount: 40000, priceIdr: 5840000 },
  { key: "vilog_50000", mode: "VILOG", orderType: "vilog_manual", label: "🔐 VILOG 50.000⏣", robuxAmount: 50000, priceIdr: 7300000 },
];

const PAGE_SIZE = 6;
const PENDING_TTL_MS = 1000 * 60 * 60; // 1 jam

// =========================
// ANTI SPAM (RATE LIMITER)
// =========================
const userLastChat = new Map();
const SPAM_DELAY = 1000; // Jeda 1 detik antar pesan

function checkSpam(userId) {
  const now = Date.now();
  const last = userLastChat.get(userId) || 0;
  if (now - last < SPAM_DELAY) return true; // Terdeteksi Spam
  userLastChat.set(userId, now);
  return false;
}

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
  const r = crypto.randomBytes(4).toString("hex"); // 4 bytes hex -> lebih aman dari collision
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
 * Ekstrak input user:
 * - Place ID (angka dari /games/xxxx)
 * - Game Pass ID (angka dari /game-pass/xxxx atau gamePassId=xxxx)
 * - kalau cuma angka, kita kembalikan sebagai "numberOnly"
 */
function extractRobloxIdsFromText(input) {
  const s = String(input || "").trim();
  if (!s) return { placeId: 0, gamePassId: 0, numberOnly: 0 };

  // Place URL: /games/{placeId} (Dukungan Regional /id/, /en/, dll)
  const mGames = s.match(/(?:\/games\/|placeId=)(\d+)/i);
  if (mGames && mGames[1]) {
    const n = Number(mGames[1]);
    if (Number.isFinite(n) && n > 0) return { placeId: n, gamePassId: 0, numberOnly: 0 };
  }

  // Gamepass link variants:
  // https://www.roblox.com/game-pass/8210106190/...
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
// ROBLOX LOOKUP (PlaceId <-> GamePassId)
// =========================
async function fetchJsonPublic(url, { method = "GET", headers = {}, body, timeoutMs = 15000 } = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);

  try {
    const res = await fetch(url, { method, headers, body, signal: ctrl.signal });
    const text = await res.text();

    let data;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }

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
 * Resolve GamePassId -> (universeId/placeId) -> rootPlaceId
 */
async function resolvePlaceIdFromGamePassId(gamePassId) {
  const id = Number(gamePassId || 0);
  if (!(id > 0)) return { ok: false, placeId: 0, universeId: 0, via: "invalid" };

  // 1) endpoint baru
  try {
    const url = `https://apis.roblox.com/game-passes/v1/game-passes/${id}/product-info`;
    const info = await fetchJsonPublic(url);

    const universeId = Number(info?.universeId || info?.UniverseId || info?.universeID || 0) || 0;
    const placeIdDirect = Number(info?.placeId || info?.PlaceId || info?.placeID || 0) || 0;
    const price = Number(info?.PriceInRobux || info?.priceInRobux || 0);

    if (placeIdDirect > 0) {
      return { ok: true, placeId: placeIdDirect, universeId: universeId || 0, price: price, via: "apis.placeId" };
    }

    if (universeId > 0) {
      const g = await fetchJsonPublic(`https://games.roblox.com/v1/games?universeIds=${universeId}`);
      const rootPlaceId = Number(g?.data?.[0]?.rootPlaceId || 0);
      if (rootPlaceId > 0) return { ok: true, placeId: rootPlaceId, universeId, via: "apis.universe->rootPlaceId" };
    }
  } catch (_) {
    // ignore, fallback
  }

  // 2) fallback endpoint lama (kadang masih jalan)
  try {
    const url = `https://api.roblox.com/marketplace/game-pass-product-info?gamePassId=${id}`;
    const info = await fetchJsonPublic(url);

    const placeId = Number(info?.PlaceId || info?.placeId || 0);
    const universeId = Number(info?.UniverseId || info?.universeId || 0);

    if (placeId > 0) return { ok: true, placeId, universeId: universeId || 0, via: "legacy.placeId" };

    if (universeId > 0) {
      const g = await fetchJsonPublic(`https://games.roblox.com/v1/games?universeIds=${universeId}`);
      const rootPlaceId = Number(g?.data?.[0]?.rootPlaceId || 0);
      if (rootPlaceId > 0) return { ok: true, placeId: rootPlaceId, universeId, via: "legacy.universe->rootPlaceId" };
    }
  } catch (_) {
    // ignore
  }

  return { ok: false, placeId: 0, universeId: 0, via: "not_found" };
}

/**
 * Coba validasi "angka doang" itu placeId atau passId
 */
async function resolvePlaceIdFromUnknownNumber(n) {
  const id = Number(n || 0);
  if (!(id > 0)) return { ok: false, placeId: 0, guessed: "invalid" };

  // coba placeId -> universe
  try {
    const u = await fetchJsonPublic(`https://api.roblox.com/universes/get-universe-containing-place?placeid=${id}`);
    const universeId = Number(u?.UniverseId || u?.universeId || 0);
    if (universeId > 0) {
      return { ok: true, placeId: id, guessed: "placeId" };
    }
  } catch (_) {
    // ignore
  }

  // coba gamepass
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

    // ✅ tampilkan displayRobux untuk GAMEPASS (biar user lihat 100⏣ bukan 143⏣)
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

// ✅ tombol admin untuk VILOG feedback setelah ACC
function adminVilogFeedbackKeyboard(token) {
  return Markup.inlineKeyboard([
    [Markup.button.callback("📸 Kirim foto bukti selesai", `VFB_PHOTO:${token}`)],
    [Markup.button.callback("📝 Kirim pesan/progress", `VFB_TEXT:${token}`)],
    [Markup.button.callback("✅ Tandai selesai (tanpa foto)", `VFB_DONE:${token}`)],
  ]);
}

// ✅ RATING KEYBOARD
function userRatingKeyboard() {
  return Markup.inlineKeyboard([
    [Markup.button.callback("⭐ 1", "RATE:1"), Markup.button.callback("⭐ 2", "RATE:2"), Markup.button.callback("⭐ 3", "RATE:3")],
    [Markup.button.callback("⭐ 4", "RATE:4"), Markup.button.callback("⭐ 5", "RATE:5")]
  ]);
}

// ✅ BUY AGAIN KEYBOARD
function buyAgainKeyboard() {
  return Markup.inlineKeyboard([
    [Markup.button.callback("🛍️ Beli Lagi (Menu Utama)", "RESET")]
  ]);
}

// =========================
// MESSAGES
// =========================
function msgWelcome() {
  if (!IS_SHOP_OPEN) {
    return [
        "⛔ *TOKO SEDANG TUTUP*",
        "────────────────────",
        "Maaf, saat ini admin sedang istirahat atau maintenance.",
        "Silakan kembali lagi nanti ya! 🙏"
    ].join("\n");
  }
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
    "2) Kirim *Place ID / Link Game Roblox*",
    "",
    "⚠️ Penting:",
    "",
    "- Place ID itu contohnya seperti ini : (://www.roblox.com/id/games/109579642181751/nama-game) .",
    "- [109579642181751] adalah Place ID nya.",
    "",
    "- Username itu username kamu di game Roblox.",
    "- Gamepass di dalam game harus tersedia & harganya harus sesuai paket yang dipilih.",
  ].join("\n");
}

function msgPackagePickedGAMEPASS(pkg) {
  const show = Number(pkg.displayRobux || pkg.robuxAmount || 0);
  return [
    "🧾 *Detail Paket GAMEPASS PENDING 4-5 DAY (BUKAN FAST)*",
    "────────────────────",
    `📦 Paket: *${show}⏣*`,
    `💳 Harga: *${formatRupiah(pkg.priceIdr)}*`,
    "",
    "✍️ Kirim *username Roblox* kamu (1 pesan).",
    "Contoh: `AwesomePlayer123`",
    "",
    "⚠️ Pastikan di game kamu ada *Gamepass* yang sesuai paket ini.",
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
    "✍️ Sekarang kirim :",
    "*Place ID* (angka) / Link game",
    "",
    "Contoh Place ID:",
    "- `1234567890`",
    "- `https://www.roblox.com/games/1234567890/Nama-Game`",
    "",
    "⚠️ Wajib kirim Place ID atau link game nya ya.",
  ].join("\n");
}

function msgPlaceIdHelp() {
  return [
    "📌 *Cara cari Place ID Roblox*",
    "────────────────────",
    "",
    "*Cara paling gampang:*",
    "1) Buka game Roblox yang dipakai untuk pembelian Gamepass",
    "2) Lihat link game nya",
    "3) Angka setelah `/games/` itulah *Place ID*",
    "",
    "*Contoh link:*",
    "`https://www.roblox.com/games/1234567890/Nama-Game`",
    "✅ Place ID = `1234567890`",
    "",
    "⚠️ Pastikan kamu mengirim Place ID yang benar ya.",
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
    data.mode === "VILOG" ? `👤 Username: \`${data.loginUsername}\`` : `👤 Username: \`${data.robloxUsername}\``,
    data.mode === "GAMEPASS" ? `🧱 Place ID: \`${data.placeId}\`` : "",
    data.mode === "GAMEPASS" && data.gamePassId ? `🎫 Pass ID: \`${data.gamePassId}\`` : "",
    "",
    "✅ Scan QRIS lalu upload foto bukti pembayaran di chat ini.",
    "🔎 Admin akan verifikasi, lalu ACC/TOLAK (kamu akan dapat jawaban jelas).",
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
  const lines = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

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
    ok: Boolean(username && password && cleanJumlah > 0 && codes.length >= 3),
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
  const rbxcave = makeRBXCaveClient();
  const bot = new Telegraf(botToken);

  setInterval(() => store.cleanupExpired(PENDING_TTL_MS), 60 * 1000).unref?.();

  // COMMANDS
  bot.command("close", (ctx) => { if (isAdminChatId(adminChatIds, ctx.chat.id)) { IS_SHOP_OPEN = false; ctx.reply("⛔ Toko DITUTUP."); } });
  bot.command("open", (ctx) => { if (isAdminChatId(adminChatIds, ctx.chat.id)) { IS_SHOP_OPEN = true; ctx.reply("✅ Toko DIBUKA."); } });
  
  bot.command("myid", (ctx) => {
    ctx.reply(`chat_id: ${ctx.chat?.id}\nuser_id: ${ctx.from?.id}`);
  });

  bot.start(async (ctx) => {
    const userId = ctx.from?.id;
    if (userId) {
      await store.clearUserFlow(userId);
    }
    await ctx.reply(msgWelcome(), {
      parse_mode: "Markdown",
      reply_markup: IS_SHOP_OPEN ? modeKeyboard().reply_markup : null,
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

    // ✅ setelah admin ACC, user tidak boleh cancel
    if (data.status !== "WAIT_PROOF" && data.status !== "WAIT_ADMIN") {
      return ctx.reply("⚠️ Transaksi sudah diproses admin, tidak bisa dibatalkan lagi.");
    }

    await ctx.reply(msgCancelConfirm(data), {
      parse_mode: "Markdown",
      reply_markup: userCancelConfirmKeyboard(tok).reply_markup,
    });
  });

  bot.action("NOOP", async (ctx) => ctx.answerCbQuery());

  bot.action("HELP_PLACEID", async (ctx) => {
    await ctx.answerCbQuery("Cara cari Place ID");
    try {
      await ctx.reply(msgPlaceIdHelp(), { parse_mode: "Markdown", reply_markup: gamepassPlaceIdKeyboard().reply_markup });
    } catch {
      await ctx.reply(msgPlaceIdHelp(), { parse_mode: "Markdown" });
    }
  });

  bot.action("RESET", async (ctx) => {
    await ctx.answerCbQuery("Reset");
    const userId = ctx.from?.id;
    if (userId) {
      await store.clearUser(userId);
      await store.clearUserFlow(userId);
    }
    try { await ctx.deleteMessage(); } catch {} 
    try {
      await ctx.reply("✅ Sudah di-reset. Ketik /start untuk mulai lagi.", { reply_markup: IS_SHOP_OPEN ? modeKeyboard().reply_markup : null });
    } catch {
        // ignore
    }
  });

  bot.action("BACK_TO_MODE", async (ctx) => {
    await ctx.answerCbQuery();
    const userId = ctx.from?.id;
    if (userId) await store.clearUserFlow(userId);

    try {
      await ctx.editMessageText(msgWelcome(), {
        parse_mode: "Markdown",
        reply_markup: IS_SHOP_OPEN ? modeKeyboard().reply_markup : null,
      });
    } catch {
      await ctx.reply(msgWelcome(), { parse_mode: "Markdown", reply_markup: IS_SHOP_OPEN ? modeKeyboard().reply_markup : null });
    }
  });

  bot.action(/MODE:(VILOG|GAMEPASS)/, async (ctx) => {
    if (!IS_SHOP_OPEN) return ctx.answerCbQuery("Toko sedang tutup!", { show_alert: true });
    await ctx.answerCbQuery();
    const mode = ctx.match[1];

    const userId = ctx.from?.id;
    if (userId) {
      await store.setUserFlow(userId, { step: "CHOOSE_PKG", mode, page: 0 });
    }

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
    if (userId) {
      await store.setUserFlow(userId, { step: "CHOOSE_PKG", mode, page });
    }

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
    if (userId) {
      await store.setUserFlow(userId, { step: "CHOOSE_PKG", mode, page: 0 });
    }

    const text = msgPickMode(mode);
    await ctx.reply(text, {
      parse_mode: "Markdown",
      reply_markup: packagesKeyboard(mode, 0).reply_markup,
    });
  });

  bot.action(/PKG:(VILOG|GAMEPASS):(.+)/, async (ctx) => {
    if (!IS_SHOP_OPEN) return ctx.answerCbQuery("Toko sedang tutup!");
    await ctx.answerCbQuery();
    const mode = ctx.match[1];
    const pkgKey = ctx.match[2];

    const pkg = findPackage(mode, pkgKey);
    if (!pkg) return ctx.reply("Paket tidak ditemukan. Ketik /start untuk ulang.");

    const userId = ctx.from?.id;
    if (!userId) return;

    const existing = store.getTokenByUser(userId);
    if (existing) {
      return ctx.reply("⚠️ Kamu masih punya transaksi pending.\nKetik /cancel untuk batalkan dulu.", {
        parse_mode: "Markdown",
      });
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
    const uid = ctx.from?.id;
    const fromId = ctx.from?.id;
    const chatId = String(ctx.chat?.id || "");

    // Jika terdeteksi spam, kode di bawahnya tidak akan jalan
    if (checkSpam(uid)) {
      return ctx.reply("⚠️ Kamu mengirim pesan terlalu cepat. Harap tunggu sebentar sebelum mengirim lagi.");
    }

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
        await approveAndProcess(bot, store, rbxcave, awaitObj.token, adminChatIds, note);
        return;
      }

      // ✅ admin kirim pesan/progress untuk VILOG
      if (awaitObj?.step === "WAIT_VILOG_FEEDBACK_TEXT" && awaitObj.token) {
        const text = (ctx.message.text || "").trim();
        if (!text) return;
        await store.clearAdminAwait(fromId);

        const data = store.getByToken(awaitObj.token);
        if (!data) return ctx.reply("⚠️ Data token tidak ditemukan / sudah selesai.");

        await bot.telegram.sendMessage(
          data.chatId,
          [
            "📩 *Update dari Admin*",
            "────────────────────",
            `🧾 Order ID: \`${data.orderId}\``,
            "",
            text,
          ].join("\n"),
          { parse_mode: "Markdown" }
        );

        return ctx.reply("✅ Pesan progress sudah dikirim ke user.");
      }
    }

    // USER flow
    const userId = ctx.from?.id;
    if (!userId) return next();

    const flow = store.getUserFlow(userId);
    if (!flow) return next();

    // VILOG
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

      const orderId = makeSafeOrderId();
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
        priceIdr: Number(pkg.priceIdr || 0),
        robuxAmount: Number(pkg.robuxAmount || 0),

        loginUsername: String(parsed.username || "").trim(),
        loginPassword: String(parsed.password || "").trim(),
        jumlahOrderRobux: Number(parsed.jumlahRobux || 0),
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

      await store.setUserFlow(userId, {
        step: "WAIT_GAMEPASS_PLACEID",
        mode: "GAMEPASS",
        pkgKey: flow.pkgKey,
        robloxUsername: String(username).trim(),
      });

      return ctx.reply(msgAskGamepassPlaceId(pkg, username), {
        parse_mode: "Markdown",
        reply_markup: gamepassPlaceIdKeyboard().reply_markup,
      });
    }

    // GAMEPASS placeId OR passId
    if (flow.step === "WAIT_GAMEPASS_PLACEID") {
      const pkg = findPackage("GAMEPASS", flow.pkgKey);
      if (!pkg) {
        await store.clearUserFlow(userId);
        return ctx.reply("Paket invalid. Ketik /start untuk mulai lagi.");
      }

      const username = String(flow.robloxUsername || "").trim();
      if (!username) {
        await store.clearUserFlow(userId);
        return ctx.reply("Flow invalid (username kosong). Ketik /start untuk mulai lagi.");
      }

      const ids = extractRobloxIdsFromText(ctx.message.text || "");

      let placeId = Number(ids.placeId || 0);
      let gamePassId = Number(ids.gamePassId || 0);

      // 1) kalau input jelas gamepass id -> resolve
      if (!(placeId > 0) && gamePassId > 0) {
        const r = await resolvePlaceIdFromGamePassId(gamePassId);
        if (!r.ok) {
          return ctx.reply(
            [
              "⚠️ Pass ID terdeteksi, tapi gagal menemukan Place ID otomatis.",
              `Pass ID: \`${gamePassId}\``,
              "",
              "Coba kirim link game (Place ID) atau cek Pass ID benar.",
              "",
              "Contoh Place link:",
              "`https://www.roblox.com/games/1234567890/Nama-Game`",
            ].join("\n"),
            { parse_mode: "Markdown", reply_markup: gamepassPlaceIdKeyboard().reply_markup }
          );
        }
        placeId = r.placeId;
      }

      // 2) kalau hanya angka doang -> coba tebak placeId dulu, kalau gagal treat as gamepass
      if (!(placeId > 0) && !(gamePassId > 0) && ids.numberOnly > 0) {
        const r = await resolvePlaceIdFromUnknownNumber(ids.numberOnly);
        if (!r.ok) {
          return ctx.reply(
            [
              "⚠️ Angka terdeteksi tapi tidak bisa dipastikan itu Place ID / Pass ID.",
              `Input: \`${ids.numberOnly}\``,
              "",
              "Kirim salah satu yang pasti ya:",
              "- Link game: `https://www.roblox.com/games/123.../Nama`",
              "- Link gamepass: `https://www.roblox.com/game-pass/821.../Nama`",
            ].join("\n"),
            { parse_mode: "Markdown", reply_markup: gamepassPlaceIdKeyboard().reply_markup }
          );
        }

        placeId = r.placeId;
        if (r.guessed === "gamePassId") gamePassId = ids.numberOnly;
      }

      if (!(placeId > 0)) {
        return ctx.reply(
          [
            "⚠️ Place ID / Pass ID tidak terbaca / tidak valid.",
            "",
            "Kirim ulang pakai contoh ini:",
            "Place:",
            "- `1234567890`",
            "- `https://www.roblox.com/games/1234567890/Nama-Game`",
            "",
            "Pass:",
            "- `8210106190`",
            "- `https://www.roblox.com/game-pass/8210106190/NamaPass`",
            "",
            "Kalau bingung, klik tombol: *📌 Cara cari Place ID*",
          ].join("\n"),
          { parse_mode: "Markdown", reply_markup: gamepassPlaceIdKeyboard().reply_markup }
        );
      }

      // 3) Validasi Harga (Auto Check Price)
      let priceMatch = true;
      let actualPrice = 0;
      if (gamePassId > 0) {
        const r = await resolvePlaceIdFromGamePassId(gamePassId);
        if (r.ok && r.price) {
          actualPrice = r.price;
          // Bandingkan dengan pkg.robuxAmount
          if (actualPrice !== pkg.robuxAmount) {
            priceMatch = false;
          }
        }
      }

      if (!priceMatch) {
         return ctx.reply(`❌ *Harga Tidak Sesuai!*\n\nPaket ini membutuhkan Gamepass seharga: *${pkg.robuxAmount} Robux*.\nGamepass kamu saat ini: *${actualPrice} Robux*.\n\nSilakan ubah harga Gamepass di Roblox lalu kirim ulang linknya.`, { parse_mode: "Markdown" });
      }

      const orderId = makeSafeOrderId();
      const tok = makeToken();

      const show = Number(pkg.displayRobux || pkg.robuxAmount || 0);

      const data = {
        token: tok,
        createdAt: Date.now(),
        userId,
        chatId: ctx.chat.id,
        orderId,

        mode: "GAMEPASS",
        orderType: pkg.orderType,

        robloxUsername: username,
        displayRobux: show,                 // untuk tampilan
        robuxAmount: Number(pkg.robuxAmount || 0), // harga gamepass di Roblox (misal 143)
        placeId: Number(placeId),
        gamePassId: gamePassId || 0,

        label: pkg.label || `${show}⏣`,
        priceIdr: Number(pkg.priceIdr || 0),

        status: "WAIT_PROOF",
      };

      await store.setPending(tok, data);
      await store.setUserFlow(userId, { step: "WAIT_PROOF", mode: "GAMEPASS", pkgKey: flow.pkgKey });

      const caption = msgQrisCaption(data);

      // kalau resolve passId -> placeId, kasih info singkat biar user paham
      if (gamePassId > 0) {
        await ctx.reply(`✅ Pass ID \`${gamePassId}\` berhasil di-resolve ke Place ID \`${placeId}\`.`, { parse_mode: "Markdown" });
      }

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
  // PHOTO HANDLER
  // =========================
  bot.on("photo", async (ctx) => {
    const uid = ctx.from?.id;
    if (checkSpam(uid)) return ctx.reply("⚠️ Terdeteksi Spam.");
    const fromId = ctx.from?.id;
    const chatId = String(ctx.chat?.id || "");

    // ✅ 1) ADMIN kirim foto feedback VILOG
    if (fromId && isAdminChatId(adminChatIds, chatId)) {
      const awaitObj = store.getAdminAwait(fromId);
      if (awaitObj?.step === "WAIT_VILOG_FEEDBACK_PHOTO" && awaitObj.token) {
        const tok = awaitObj.token;
        await store.clearAdminAwait(fromId);

        const data = store.getByToken(tok);
        if (!data) return ctx.reply("⚠️ Data token tidak ditemukan / sudah selesai.");
        
        const photos = ctx.message.photo || [];
        const best = photos[photos.length - 1];
        const fileId = best.file_id;

        // forward ke user + auto tandai selesai
        const captionUser = [
          "✅ *Pesanan Selesai*",
          "────────────────────",
          `🧾 Order ID: \`${data.orderId}\``,
          `📦 Paket: *${data.label}*`,
          "",
          "📸 Bukti dari admin:",
          "",
          "🙏 Terima kasih sudah berbelanja!",
        ].join("\n");

        try {
          await bot.telegram.sendPhoto(data.chatId, fileId, { caption: captionUser, parse_mode: "Markdown" });
          // ✨ Minta Rating setelah selesai
          await bot.telegram.sendMessage(data.chatId, "🌟 Bagaimana pelayanan kami? Mohon beri nilai:", { reply_markup: userRatingKeyboard().reply_markup });
        } catch {
          await bot.telegram.sendMessage(
            data.chatId,
            [
              "✅ Pesanan sudah diproses.",
              `Order ID: ${data.orderId}`,
              "⚠️ Namun foto bukti gagal dikirim (telegram error).",
            ].join("\n")
          );
        }

        // Jangan remove pending dulu, tunggu rating atau cleanup nanti. 
        // Tapi agar tidak menggantung, kita ubah status jadi COMPLETED
        await store.updatePending(tok, { status: "WAITING_RATING" });

        return ctx.reply("✅ Foto bukti sudah dikirim ke user & user diminta rating.");
      }
    }

    // ✅ 2) USER upload bukti pembayaran
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
      data.mode === "GAMEPASS" ? `Place ID: \`${data.placeId}\`` : "",
      data.mode === "GAMEPASS" && data.gamePassId ? `Pass ID: \`${data.gamePassId}\`` : "",
      "",
      "Klik tombol untuk ACC/TOLAK.",
    ]
      .filter(Boolean)
      .join("\n");

    // SIAPKAN OPSI KIRIM (TOPIC SUPPORT)
    const sendOptions = { parse_mode: "Markdown", reply_markup: adminMainKeyboard(tok).reply_markup };
    if (TOPIC_ORDER) sendOptions.message_thread_id = TOPIC_ORDER;

    for (const adminChatId of adminChatIds) {
      try {
        await bot.telegram.sendPhoto(adminChatId, fileId, { caption: adminCaption, ...sendOptions });

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

          const detailOpts = { parse_mode: "Markdown" };
          if (TOPIC_ORDER) detailOpts.message_thread_id = TOPIC_ORDER;
          
          await bot.telegram.sendMessage(adminChatId, detail, detailOpts);
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

    if (data.status !== "WAIT_PROOF" && data.status !== "WAIT_ADMIN") {
      return ctx.reply("⚠️ Transaksi sudah diproses admin, tidak bisa dibatalkan lagi.");
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

    if (data.status !== "WAIT_PROOF" && data.status !== "WAIT_ADMIN") {
      return ctx.reply("⚠️ Transaksi sudah diproses admin, tidak bisa dibatalkan lagi.");
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

    // Notif cancel ke admin topic log
    const opts = { parse_mode: "Markdown" };
    if (TOPIC_LOG) opts.message_thread_id = TOPIC_LOG;

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
          opts
        );
      } catch {}
    }
  });

  // =========================
  // ADMIN FEEDBACK BUTTONS (VILOG)
  // =========================
  bot.action(/VFB_PHOTO:(.+)/, async (ctx) => {
    const chatId = String(ctx.chat?.id || "");
    if (!isAdminChatId(adminChatIds, chatId)) {
      await ctx.answerCbQuery("Bukan admin chat", { show_alert: true });
      return;
    }
    await ctx.answerCbQuery("Kirim foto bukti");
    const tok = ctx.match[1];

    const data = store.getByToken(tok);
    if (!data) return ctx.reply("⚠️ Token tidak ditemukan / sudah selesai.");
    
    // Allow GAMEPASS mode too for manual proof
    // if (data.mode !== "VILOG") return ctx.reply("⚠️ Token ini bukan VILOG.");

    const adminUserId = ctx.from?.id;
    if (adminUserId) {
      await store.setAdminAwait(adminUserId, { step: "WAIT_VILOG_FEEDBACK_PHOTO", token: tok });
    }
    return ctx.reply("📸 Silakan *kirim 1 foto* bukti proses di chat admin ini (foto akan diteruskan ke user & order selesai).", {
      parse_mode: "Markdown",
    });
  });

  bot.action(/VFB_TEXT:(.+)/, async (ctx) => {
    const chatId = String(ctx.chat?.id || "");
    if (!isAdminChatId(adminChatIds, chatId)) {
      await ctx.answerCbQuery("Bukan admin chat", { show_alert: true });
      return;
    }
    await ctx.answerCbQuery("Kirim pesan");
    const tok = ctx.match[1];

    const data = store.getByToken(tok);
    if (!data) return ctx.reply("⚠️ Token tidak ditemukan / sudah selesai.");

    const adminUserId = ctx.from?.id;
    if (adminUserId) {
      await store.setAdminAwait(adminUserId, { step: "WAIT_VILOG_FEEDBACK_TEXT", token: tok });
    }
    return ctx.reply("📝 Silakan ketik *1 pesan* progress untuk user (misal: 'Sedang proses, mohon standby verifikasi').", {
      parse_mode: "Markdown",
    });
  });

  bot.action(/VFB_DONE:(.+)/, async (ctx) => {
    const chatId = String(ctx.chat?.id || "");
    if (!isAdminChatId(adminChatIds, chatId)) {
      await ctx.answerCbQuery("Bukan admin chat", { show_alert: true });
      return;
    }
    await ctx.answerCbQuery("Ditandai selesai");
    const tok = ctx.match[1];

    const data = store.getByToken(tok);
    if (!data) return ctx.reply("⚠️ Token tidak ditemukan / sudah selesai.");

    await bot.telegram.sendMessage(
      data.chatId,
      [
        "✅ *Pesanan sudah diproses*",
        "────────────────────",
        `🧾 Order ID: \`${data.orderId}\``,
        `📦 Paket: *${data.label}*`,
        "",
        "🙏 Terima kasih!",
      ].join("\n"),
      { parse_mode: "Markdown" }
    );
    
    // Minta Rating
    await bot.telegram.sendMessage(data.chatId, "🌟 Bagaimana pelayanan kami? Mohon beri nilai:", { reply_markup: userRatingKeyboard().reply_markup });

    await store.updatePending(tok, { status: "WAITING_RATING" });

    // Log to Admin
    const opts = {}; 
    if (TOPIC_LOG) opts.message_thread_id = TOPIC_LOG;
    for (const adminChatId of adminChatIds) {
      try {
        await bot.telegram.sendMessage(adminChatId, `✅ DONE: ${data.orderId}\nToken: ${tok}`, opts);
      } catch {}
    }

    return ctx.reply("✅ Order ditandai selesai & user sudah diberi notifikasi.");
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
    } catch {}
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
    } catch {}
  });

  bot.action(/ACC_DO:(.+)/, async (ctx) => {
    const chatId = String(ctx.chat?.id || "");
    if (!isAdminChatId(adminChatIds, chatId)) {
      await ctx.answerCbQuery("Bukan admin chat", { show_alert: true });
      return;
    }
    await ctx.answerCbQuery("Diproses...");
    const tok = ctx.match[1];
    await approveAndProcess(bot, store, rbxcave, tok, adminChatIds, "");
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
    if (adminUserId) {
      await store.setAdminAwait(adminUserId, { step: "WAIT_ACC_NOTE", token: tok });
    }
    await ctx.reply("📝 Silakan ketik catatan ACC (1 pesan) di chat admin ini.");
  });

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

    const baseCaption = ctx.update.callback_query.message.caption || "";
    const newCaption = baseCaption + "\n\n❌ *Pilih alasan penolakan:*";
    try {
      await ctx.editMessageCaption(newCaption, {
        parse_mode: "Markdown",
        reply_markup: rejectReasonKeyboard(tok).reply_markup,
      });
    } catch {
      await ctx.reply("❌ Pilih alasan penolakan:", {
        reply_markup: rejectReasonKeyboard(tok).reply_markup,
      });
    }
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
    await finalizeReject(bot, store, tok, reason, adminChatIds);

    try {
      const baseCaption = ctx.update.callback_query.message.caption || "";
      await ctx.editMessageCaption(baseCaption + `\n\n❌ *REJECTED*\nAlasan: ${reason}`, { parse_mode: "Markdown" });
    } catch {
      try {
        await bot.telegram.sendMessage(chatId, `❌ REJECTED\nToken: ${tok}\nAlasan: ${reason}`);
      } catch {}
    }
  });

  // --- RATING & BELI LAGI ---
  bot.action(/RATE:(\d)/, async (ctx) => {
    const stars = ctx.match[1];
    const uid = ctx.from.id;
    const tok = store.getTokenByUser(uid); 
    const starStr = "⭐".repeat(Number(stars));

    // Notify Admin (Ke Topic LOG)
    const opts = { parse_mode: "Markdown" };
    if (TOPIC_LOG) opts.message_thread_id = TOPIC_LOG;

    for(const aid of adminChatIds) {
        try { await bot.telegram.sendMessage(aid, `🌟 *RATING BARU:* ${starStr} (${stars}/5)\nUser: ${ctx.from.first_name}\nID: ${ctx.from.id}`, opts); } catch {}
    }

    if (tok) await store.removePending(tok);
    await store.clearUserFlow(uid);

    // Clean Chat & Offer Buy Again
    try { await ctx.deleteMessage(); } catch {} 
    await ctx.reply(
      `Terima kasih atas rating ${starStr}-nya! 🙏\nSenang bisa membantu.\n\nMau Top Up lagi?`,
      { parse_mode: "Markdown", reply_markup: buyAgainKeyboard().reply_markup }
    );
  });

  // Opsional: Tolak jika user kirim File/Dokumen
  bot.on("document", async (ctx) => {
    await ctx.reply("❌ *Format Salah!*\n\nMohon kirim bukti sebagai **FOTO (Galeri)**, jangan dikirim sebagai File/Dokumen.", { parse_mode: "Markdown" });
  });
  return bot;
}

// =======================
// HELPERS
// =======================
async function approveAndProcess(bot, store, rbxcave, tok, adminChatIds, note) {
  const data = store.getByToken(tok);
  if (!data) return;

  // ✅ lock biar gak double klik ACC (hindari 409 "already have an orderId")
  if (data.status === "PROCESSING") {
    for (const adminChatId of adminChatIds) {
      try { await bot.telegram.sendMessage(adminChatId, `⏳ Masih PROCESSING: ${data.orderId} (Token: ${tok})`); } catch {}
    }
    return;
  }

  if (data.status !== "WAIT_ADMIN") return;

  await store.updatePending(tok, { status: "PROCESSING", processingAt: Date.now() });

  // Topic Options
  const logOpts = { parse_mode: "Markdown" };
  if (TOPIC_LOG) logOpts.message_thread_id = TOPIC_LOG;

  // GAMEPASS Auto -> hit RBXCave API
  if (data.mode === "GAMEPASS") {
    const payloadBase = {
      orderId: String(data.orderId || "").trim(),
      robloxUsername: String(data.robloxUsername || "").trim(),
      robuxAmount: Number(data.robuxAmount || 0), // ✅ harga gamepass (misal 143), bukan display 100
      placeId: Number(data.placeId || 0),
      isPreOrder: false,
      checkOwnership: false,
    };

    // Auto-Recovery Place ID (Fix Place ID 0)
    if (payloadBase.placeId <= 0 && data.gamePassId) {
        const recover = await resolvePlaceIdFromGamePassId(data.gamePassId);
        if (recover.ok && recover.placeId > 0) {
            payloadBase.placeId = Number(recover.placeId);
        }
    }

    try {
      if (!payloadBase.orderId || payloadBase.orderId.length < 6) throw new Error("invalid orderId");
      if (!payloadBase.robloxUsername) throw new Error("robloxUsername empty");
      if (!(payloadBase.robuxAmount > 0)) throw new Error("robuxAmount invalid");
      if (!(payloadBase.placeId > 0)) throw new Error("placeId invalid (Gagal resolve placeId)");

      // Tambahkan gamePassId jika mode gamepass_order
      if (data.orderType === "gamepass_order") {
          payloadBase.gamePassId = Number(data.gamePassId); // Wajib kirim gamePassId
          await rbxcave.createGamepassOrder(payloadBase);
      } else {
          await rbxcave.createVipServerOrder(payloadBase);
      }

    } catch (e) {
      await store.updatePending(tok, { status: "WAIT_ADMIN" }); // Rollback status biar bisa coba lagi manual

      const status = e?.status || 500;
      const detail = e?.data ? safeStringify(e.data) : "";
      
      let msg = "";
      
      // ERROR 402: STOK HABIS
      if (status === 402 || detail.includes("do not have robux")) {
          msg = [
            "⚠️ *STOK RBXCAVE HABIS / LIMIT*",
            `Order ID: ${data.orderId}`,
            `Nominal: ${data.robuxAmount}`,
            "",
            "👉 *Harap proses manual (login akun stok).* ",
            "Bot tidak menghapus data ini, silakan klik 'Selesai' nanti jika sudah diproses manual."
          ].join("\n");
          
          // Beritahu user halus
          await bot.telegram.sendMessage(data.chatId, "⚠️ *Info:* Order sedang dalam antrean proses manual admin (karena keterlambatan server pusat). Mohon ditunggu ya.");
      } else {
          // ERROR LAIN
          msg = [
            "❌ Gagal create order GAMEPASS.",
            `Order ID: ${data.orderId}`,
            status ? `Status: HTTP ${status}` : "",
            `Error: ${e?.message || "unknown"}`,
            detail ? `Detail:\n${detail}` : "",
            "",
            "✅ Cek: placeId / gamepass id / harga / endpoint.",
          ].join("\n");
      }

      for (const adminChatId of adminChatIds) {
        try { await bot.telegram.sendMessage(adminChatId, msg, logOpts); } catch {}
      }
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

    // Jangan remove pending, ganti status biar admin bisa feedback/selesai
    await store.updatePending(tok, { status: "COMPLETED_WAITING_FEEDBACK" });

    const fbOpts = { ...logOpts, reply_markup: adminVilogFeedbackKeyboard(tok).reply_markup };

    for (const adminChatId of adminChatIds) {
      try {
        await bot.telegram.sendMessage(
          adminChatId,
          `✅ APPROVED (API SUCCESS) : ${data.orderId}\nToken: ${tok}${note ? `\nCatatan: ${note}` : ""}\n\nSilakan klik 'Selesai' untuk tutup order.`,
          fbOpts
        );
      } catch {}
    }

    await notifyDiscordPaymentReceived(data);
    return;
  }

  // VILOG -> manual (✅ sekarang ada feedback admin)
  if (data.mode === "VILOG") {
    await store.updatePending(tok, { status: "VILOG_IN_PROGRESS", approvedAt: Date.now() });

    const userMsg = [
      "✅ *Pembayaran diterima*",
      "────────────────────",
      `🧾 Order ID: \`${data.orderId}\``,
      `📦 Paket: *${data.label}*`,
      `🎟️ Jumlah Robux: *${data.robuxAmount}*`,
      "",
      "🧑‍💻 Admin sedang memproses order kamu *secara manual via login*.",
      "⏳ Mohon standby jika diminta verifikasi.",
      note ? `\n📝 Catatan admin: ${note}` : "",
      "",
      "📩 Nanti kamu akan dapat update dari admin jika proses selesai.",
    ].join("\n");

    await bot.telegram.sendMessage(data.chatId, userMsg, { parse_mode: "Markdown" });

    const fbOpts = { ...logOpts, reply_markup: adminVilogFeedbackKeyboard(tok).reply_markup };

    for (const adminChatId of adminChatIds) {
      try {
        await bot.telegram.sendMessage(
          adminChatId,
          [
            `✅ APPROVED (VILOG): ${data.orderId}`,
            `Token: ${tok}${note ? `\nCatatan: ${note}` : ""}`,
            "",
            "➡️ Setelah selesai, kirim feedback ke user:",
          ].join("\n"),
          fbOpts
        );
      } catch {}
    }

    await notifyDiscordPaymentReceived(data);
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

  const opts = {};
  if (TOPIC_LOG) opts.message_thread_id = TOPIC_LOG;

  for (const adminChatId of adminChatIds) {
    try {
      await bot.telegram.sendMessage(
        adminChatId,
        `❌ REJECTED: ${data.orderId}\nToken: ${tok}\nAlasan: ${reason}`,
        opts
      );
    } catch {}
  }

  await store.removePending(tok);
}

module.exports = { createQrisOrderBot };