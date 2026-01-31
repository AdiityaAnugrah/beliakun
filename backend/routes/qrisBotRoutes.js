// backend/bots/qrisOrderBot.js
const { Telegraf, Markup } = require("telegraf");
const crypto = require("crypto");
const path = require("path");
const { makeRBXCaveClient } = require("../utils/rbxcaveClient");
const { PendingStore } = require("../utils/pendingStore");

// =========================
// KONFIG PAKET (EDIT DI SINI)
// =========================
const PACKAGES = [
  { key: "gp_100", orderType: "gamepass_order", label: "🎮 Gamepass 100 Robux", robuxAmount: 100, placeId: 12345678, priceIdr: 20000 },
  { key: "gp_250", orderType: "gamepass_order", label: "🎮 Gamepass 250 Robux", robuxAmount: 250, placeId: 12345678, priceIdr: 45000 },
  { key: "vip_200", orderType: "vip_server", label: "👑 VIP Server 200 Robux", robuxAmount: 200, placeId: 12345678, priceIdr: 35000 },
  // tambah paket sebanyak apapun...
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
// UI KEYBOARDS (Modern)
// =========================
function packagesKeyboard(page) {
  const totalPages = pagesCount();
  const p = Math.max(0, Math.min(page, totalPages - 1));
  const start = p * PAGE_SIZE;
  const items = PACKAGES.slice(start, start + PAGE_SIZE);

  const rows = [];

  // 2 tombol per baris
  for (let i = 0; i < items.length; i += 2) {
    const a = items[i];
    const b = items[i + 1];
    const row = [
      Markup.button.callback(`${a.label}`, `PKG:${a.key}`),
    ];
    if (b) row.push(Markup.button.callback(`${b.label}`, `PKG:${b.key}`));
    rows.push(row);
  }

  // nav
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
  // Tombol cancel untuk user (inline)
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
function msgWelcome() {
  return [
    "✨ *RBX Order Bot*",
    "────────────────────",
    "Pilih paket dulu ya 👇",
    "",
    "🧩 *Cara kerja:*",
    "1) Pilih paket",
    "2) Isi username Roblox",
    "3) Bayar via QRIS (foto)",
    "4) Upload bukti pembayaran",
    "5) Admin ACC / TOLAK",
    "",
    "🛑 Kamu bisa *batalkan kapan saja* sebelum admin ACC.",
  ].join("\n");
}

function msgPackagePicked(pkg) {
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
    `👤 Username: \`${data.robloxUsername}\``,
    "",
    "✅ *Scan QRIS* lalu *upload foto bukti pembayaran* di chat ini.",
    "🔎 Admin akan verifikasi nominal sebelum diproses.",
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

  // simple session
  bot.use((ctx, next) => {
    ctx.session = ctx.session || {};
    return next();
  });

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
    if (userId) await store.clearUser(userId);
    ctx.session = {};
    try {
      await ctx.editMessageText("✅ Sudah di-reset. Ketik /start untuk mulai lagi.");
    } catch {
      await ctx.reply("✅ Sudah di-reset. Ketik /start untuk mulai lagi.");
    }
  });

  // ===== Back to packages (sebelum create pending) =====
  bot.action("BACK_TO_PACKAGES", async (ctx) => {
    await ctx.answerCbQuery();
    ctx.session = {};
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

    // limit 1 pending per user
    const existing = store.getTokenByUser(userId);
    if (existing) {
      return ctx.reply("⚠️ Kamu masih punya transaksi pending.\nKetik /cancel untuk batalkan dulu.", { parse_mode: "Markdown" });
    }

    ctx.session.step = "WAIT_USERNAME";
    ctx.session.pkgKey = pkgKey;

    // Modern prompt
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

  // ===== Text handler: admin awaiting OR user username =====
  bot.on("text", async (ctx, next) => {
    const fromId = ctx.from?.id;
    const chatId = String(ctx.chat?.id || "");

    // ADMIN await flows (reject other / acc note)
    if (adminChatId && chatId === adminChatId && fromId) {
      const awaitObj = store.getAdminAwait(fromId);
      if (awaitObj?.step === "WAIT_CUSTOM_REASON" && awaitObj.token) {
        const reason = (ctx.message.text || "").trim();
        if (!reason) return;
        await store.clearAdminAwait(fromId);
        await finalizeReject(bot, store, awaitObj.token, `Alasan admin: ${reason}`, adminChatId);
        return;
      }
      if (awaitObj?.step === "WAIT_ACC_NOTE" && awaitObj.token) {
        const note = (ctx.message.text || "").trim();
        if (!note) return;
        await store.clearAdminAwait(fromId);
        await approveAndProcess(bot, store, rbxcave, awaitObj.token, adminChatId, note);
        return;
      }
    }

    // USER username flow
    if (ctx.session.step !== "WAIT_USERNAME") return next();

    const userId = ctx.from?.id;
    if (!userId) return;

    const pkg = findPackage(ctx.session.pkgKey);
    if (!pkg) {
      ctx.session = {};
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
      orderType: pkg.orderType,
      robloxUsername: username,
      robuxAmount: pkg.robuxAmount,
      placeId: pkg.placeId,
      priceIdr: pkg.priceIdr,
      label: pkg.label,
      status: "WAIT_PROOF",
    };

    await store.setPending(tok, data);
    ctx.session.step = "WAIT_PROOF";

    // Send QRIS + inline cancel button
    const caption = msgQrisCaption(data);

    try {
      await ctx.replyWithPhoto(
        { source: qrisAbsPath },
        {
          caption,
          parse_mode: "Markdown",
          reply_markup: userPaymentKeyboard(tok).reply_markup,
        }
      );
    } catch {
      await ctx.reply(caption, {
        parse_mode: "Markdown",
        reply_markup: userPaymentKeyboard(tok).reply_markup,
      });
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
      `Harga seharusnya: *${formatRupiah(data.priceIdr)}*`,
      `Username: \`${data.robloxUsername}\``,
      "",
      "Klik tombol untuk ACC/TOLAK.",
    ].join("\n");

    await bot.telegram.sendPhoto(adminChatId, fileId, {
      caption: adminCaption,
      parse_mode: "Markdown",
      reply_markup: adminMainKeyboard(tok).reply_markup,
    });
  });

  // =========================
  // USER INLINE CANCEL (confirm)
  // =========================
  bot.action(/U_CANCEL:(.+)/, async (ctx) => {
    await ctx.answerCbQuery();
    const tok = ctx.match[1];
    const userId = ctx.from?.id;
    if (!userId) return;

    // owner check
    const currentTok = store.getTokenByUser(userId);
    if (!currentTok || currentTok !== tok) {
      return ctx.reply("⚠️ Transaksi ini sudah tidak aktif / bukan milikmu.");
    }

    const data = store.getByToken(tok);
    if (!data) {
      await store.clearUser(userId);
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
      return ctx.reply("⚠️ Transaksi sudah tidak ada.");
    }

    await store.removePending(tok);
    ctx.session = {};

    await ctx.reply(
      [
        "✅ *Transaksi dibatalkan.*",
        "────────────────────",
        "Kamu bisa mulai order baru kapan saja dengan /start.",
      ].join("\n"),
      { parse_mode: "Markdown" }
    );

    // notif admin (kalau ada)
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

  // jika user sudah cancel sebelumnya, data akan null dan function ini tak jalan
  if (data.status !== "WAIT_ADMIN") return;

  let result;
  try {
    if (data.orderType === "gamepass_order") {
      result = await rbxcave.createGamepassOrder({
        orderId: data.orderId,
        robloxUsername: data.robloxUsername,
        robuxAmount: data.robuxAmount,
        placeId: data.placeId,
        isPreOrder: false,
        checkOwnership: false,
      });
    } else {
      result = await rbxcave.createVipServerOrder({
        orderId: data.orderId,
        robloxUsername: data.robloxUsername,
        robuxAmount: data.robuxAmount,
        placeId: data.placeId,
        isPreOrder: false,
      });
    }
  } catch (e) {
    const msg = `❌ Gagal create order ke RBXCave.\nOrder ID: ${data.orderId}\nError: ${e?.message || "unknown"}`;
    if (adminChatId) await bot.telegram.sendMessage(adminChatId, msg);
    await bot.telegram.sendMessage(data.chatId, "❌ Order gagal diproses. Admin akan cek dulu ya.");
    await store.removePending(tok);
    return;
  }

  const userMsg = [
    "✅ *Pembayaran diterima!*",
    "────────────────────",
    `🧾 Order ID: \`${data.orderId}\``,
    `📦 Paket: *${data.label}*`,
    "⚙️ Order sedang diproses.",
    note ? `\n📝 Catatan admin: ${note}` : "",
  ].join("\n");

  await bot.telegram.sendMessage(data.chatId, userMsg, { parse_mode: "Markdown" });

  if (adminChatId) {
    await bot.telegram.sendMessage(
      adminChatId,
      `✅ APPROVED: ${data.orderId}\nToken: ${tok}${note ? `\nCatatan: ${note}` : ""}`
    );
  }

  // optional: result disimpan kalau mau, tapi sekarang cukup hapus pending
  await store.removePending(tok);
}

async function finalizeReject(bot, store, tok, reason, adminChatId) {
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
      "Ketik /start untuk buat order baru.",
    ].join("\n"),
    { parse_mode: "Markdown" }
  );

  if (adminChatId) {
    await bot.telegram.sendMessage(
      adminChatId,
      `❌ REJECTED: ${data.orderId}\nToken: ${tok}\nAlasan: ${reason}`
    );
  }

  await store.removePending(tok);
}

module.exports = { createQrisOrderBot };
