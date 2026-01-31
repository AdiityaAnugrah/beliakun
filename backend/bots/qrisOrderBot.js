// backend/bots/qrisOrderBot.js
const { Telegraf, Markup } = require("telegraf");
const crypto = require("crypto");
const path = require("path");
const { makeRBXCaveClient } = require("../utils/rbxcaveClient");
const { PendingStore } = require("../utils/pendingStore");

// =========================
// KONFIG PAKET (EDIT DI SINI)
// =========================
// Tambah paket sebanyak apapun, pagination akan handle otomatis
const PACKAGES = [
  // contoh:
  { key: "gp_100", orderType: "gamepass_order", label: "🎮 Gamepass 100 Robux", robuxAmount: 100, placeId: 12345678, priceIdr: 20000 },
  { key: "gp_250", orderType: "gamepass_order", label: "🎮 Gamepass 250 Robux", robuxAmount: 250, placeId: 12345678, priceIdr: 45000 },
  { key: "vip_200", orderType: "vip_server", label: "👑 VIP Server 200 Robux", robuxAmount: 200, placeId: 12345678, priceIdr: 35000 },

  // kamu bisa tambah puluhan paket di bawah ini...
];

const PAGE_SIZE = 6; // jumlah tombol paket per halaman
const PENDING_TTL_MS = 1000 * 60 * 60; // 1 jam

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
      Markup.button.callback(`${a.label} — ${formatRupiah(a.priceIdr)}`, `PKG:${a.key}`),
    ];
    if (b) row.push(Markup.button.callback(`${b.label} — ${formatRupiah(b.priceIdr)}`, `PKG:${b.key}`));
    rows.push(row);
  }

  // pagination row
  const nav = [];
  if (p > 0) nav.push(Markup.button.callback("⬅️ Prev", `PAGE:${p - 1}`));
  nav.push(Markup.button.callback(`📄 ${p + 1}/${totalPages}`, "NOOP"));
  if (p < totalPages - 1) nav.push(Markup.button.callback("Next ➡️", `PAGE:${p + 1}`));
  rows.push(nav);

  rows.push([Markup.button.callback("❌ Batalkan (reset)", "RESET")]);
  return Markup.inlineKeyboard(rows);
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

function createQrisOrderBot() {
  const botToken = process.env.TELEGRAM_BOT_TOKEN_RBXCAVE;
  if (!botToken) throw new Error("TELEGRAM_BOT_TOKEN_RBXCAVE missing in backend/.env");

  const adminChatId = String(process.env.TELEGRAM_ADMIN_CHAT_ID || "");
  const qrisRelPath = process.env.QRIS_IMAGE_PATH || "assets/qris.jpg";
  const qrisAbsPath = path.join(__dirname, "..", qrisRelPath);

  const store = new PendingStore();
  const rbxcave = makeRBXCaveClient();
  const bot = new Telegraf(botToken);

  // cleanup expired setiap 1 menit
  setInterval(() => store.cleanupExpired(PENDING_TTL_MS), 60 * 1000).unref?.();

  // session sederhana
  bot.use((ctx, next) => {
    ctx.session = ctx.session || {};
    return next();
  });

  bot.command("myid", (ctx) => {
    ctx.reply(
      `chat_id: ${ctx.chat?.id}\nuser_id: ${ctx.from?.id}\n\nTaruh chat_id group admin ke TELEGRAM_ADMIN_CHAT_ID`
    );
  });

  bot.start(async (ctx) => {
    await ctx.reply(
      "Halo! Pilih paket dulu ya 👇\n(Harga & nominal jelas biar mudah)",
      packagesKeyboard(0)
    );
  });

  bot.action("NOOP", async (ctx) => {
    await ctx.answerCbQuery();
  });

  bot.action(/PAGE:(\d+)/, async (ctx) => {
    await ctx.answerCbQuery();
    const page = Number(ctx.match[1] || 0);
    const text = "Halo! Pilih paket dulu ya 👇\n(Harga & nominal jelas biar mudah)";
    // edit message agar tidak spam
    try {
      await ctx.editMessageText(text, packagesKeyboard(page));
    } catch {
      await ctx.reply(text, packagesKeyboard(page));
    }
  });

  bot.action("RESET", async (ctx) => {
    await ctx.answerCbQuery("Di-reset");
    const userId = ctx.from?.id;
    if (userId) await store.clearUser(userId);
    ctx.session = {};
    try {
      await ctx.editMessageText("Sudah di-reset. Ketik /start untuk mulai lagi.");
    } catch {
      await ctx.reply("Sudah di-reset. Ketik /start untuk mulai lagi.");
    }
  });

  // pilih paket
  bot.action(/PKG:(.+)/, async (ctx) => {
    await ctx.answerCbQuery();
    const pkgKey = ctx.match[1];
    const pkg = findPackage(pkgKey);
    if (!pkg) {
      return ctx.reply("Paket tidak ditemukan. Ketik /start untuk ulang.");
    }

    const userId = ctx.from?.id;
    if (!userId) return;

    // jika masih pending
    const existing = store.getTokenByUser(userId);
    if (existing) {
      return ctx.reply("Kamu masih punya transaksi pending. Klik ❌ Batalkan (reset) lalu mulai lagi.");
    }

    ctx.session.step = "WAIT_USERNAME";
    ctx.session.pkgKey = pkgKey;

    // edit menu jadi prompt username
    const msg = [
      `✅ Kamu pilih: *${pkg.label}*`,
      `Harga: *${formatRupiah(pkg.priceIdr)}*`,
      `Robux: *${pkg.robuxAmount}*`,
      "",
      "Sekarang kirim *username Roblox* kamu saja.",
      "Contoh: `AdiityaAnugrah`",
    ].join("\n");

    try {
      await ctx.editMessageText(msg, { parse_mode: "Markdown" });
    } catch {
      await ctx.reply(msg, { parse_mode: "Markdown" });
    }
  });

  // user kirim username
  bot.on("text", async (ctx, next) => {
    // 1) cek apakah admin sedang ngetik alasan custom
    const adminUserId = ctx.from?.id;
    const chatId = String(ctx.chat?.id || "");
    if (adminChatId && chatId === adminChatId && adminUserId) {
      const awaitObj = store.getAdminAwait(adminUserId);
      if (awaitObj?.step === "WAIT_CUSTOM_REASON" && awaitObj.token) {
        const reason = (ctx.message.text || "").trim();
        if (!reason) return; // ignore kosong

        await store.clearAdminAwait(adminUserId);
        await finalizeReject(bot, store, awaitObj.token, `Alasan admin: ${reason}`, adminChatId);
        return;
      }
    }

    // 2) normal flow user
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
      return ctx.reply("Username tidak valid. Kirim username Roblox yang benar ya.");
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

    const caption = [
      "🧾 *Pembayaran QRIS*",
      "",
      `Paket: *${data.label}*`,
      `Harga: *${formatRupiah(data.priceIdr)}*`,
      `Order ID: \`${data.orderId}\``,
      `Username: \`${data.robloxUsername}\``,
      "",
      "✅ Silakan scan QRIS, lalu *upload foto bukti pembayaran* di chat ini.",
      "_Admin akan verifikasi nominal. Setelah ACC, order diproses._",
    ].join("\n");

    try {
      await ctx.replyWithPhoto({ source: qrisAbsPath }, { caption, parse_mode: "Markdown" });
    } catch {
      await ctx.reply(caption, { parse_mode: "Markdown" });
      await ctx.reply("⚠️ Gagal kirim foto QRIS. Pastikan file ada: " + qrisAbsPath);
    }
  });

  // user upload bukti
  bot.on("photo", async (ctx) => {
    const userId = ctx.from?.id;
    if (!userId) return;

    const tok = store.getTokenByUser(userId);
    if (!tok) return ctx.reply("Belum ada transaksi pending. Ketik /start untuk mulai.");

    const data = store.getByToken(tok);
    if (!data || data.status !== "WAIT_PROOF") {
      return ctx.reply("Status transaksi tidak valid. Ketik /start untuk mulai ulang.");
    }

    if (!adminChatId) {
      return ctx.reply("Admin chat belum diset. Isi TELEGRAM_ADMIN_CHAT_ID dulu.");
    }

    const photos = ctx.message.photo || [];
    const best = photos[photos.length - 1];
    const fileId = best.file_id;

    await store.updatePending(tok, { proofFileId: fileId, status: "WAIT_ADMIN" });

    await ctx.reply("✅ Bukti pembayaran diterima. Menunggu verifikasi admin...");

    const adminCaption = [
      "🔔 *Konfirmasi Pembayaran Baru*",
      "",
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
      reply_markup: Markup.inlineKeyboard([
        [Markup.button.callback("✅ ACC", `ACC:${tok}`)],
        [Markup.button.callback("❌ TOLAK", `REJ:${tok}`)],
      ]).reply_markup,
    });
  });

  // admin acc
  bot.action(/ACC:(.+)/, async (ctx) => {
    try {
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

      await ctx.answerCbQuery("Diproses...");

      let result;
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

      await bot.telegram.sendMessage(
        data.chatId,
        [
          "✅ *Pembayaran diterima!*",
          `Order ID: \`${data.orderId}\``,
          `Paket: *${data.label}*`,
          "Order sedang diproses.",
        ].join("\n"),
        { parse_mode: "Markdown" }
      );

      await ctx.editMessageCaption(
        (ctx.update.callback_query.message.caption || "") +
          "\n\n✅ *APPROVED*\n" +
          "```" +
          "\n" +
          JSON.stringify(result, null, 2).slice(0, 1200) +
          "\n```",
        { parse_mode: "Markdown" }
      );

      await store.removePending(tok);
    } catch (e) {
      console.error("[ACC] error:", e);
      await ctx.answerCbQuery("Gagal proses", { show_alert: true });
    }
  });

  // admin klik tolak -> tampilkan pilihan alasan
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

    // edit message: minta alasan
    const baseCaption = ctx.update.callback_query.message.caption || "";
    const newCaption = baseCaption + "\n\n❌ *Pilih alasan penolakan:*";
    try {
      await ctx.editMessageCaption(newCaption, {
        parse_mode: "Markdown",
        reply_markup: rejectReasonKeyboard(tok).reply_markup,
      });
    } catch {
      // ignore
    }
  });

  // admin pilih alasan reject
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
      // balikkan tombol ACC/TOLAK
      const caption = (ctx.update.callback_query.message.caption || "").replace(/\n\n❌ \*Pilih alasan penolakan:\*[\s\S]*$/m, "");
      try {
        await ctx.editMessageCaption(caption, {
          parse_mode: "Markdown",
          reply_markup: Markup.inlineKeyboard([
            [Markup.button.callback("✅ ACC", `ACC:${tok}`)],
            [Markup.button.callback("❌ TOLAK", `REJ:${tok}`)],
          ]).reply_markup,
        });
      } catch {}
      await store.updatePending(tok, { status: "WAIT_ADMIN" });
      return;
    }

    if (code === "OTHER") {
      await ctx.answerCbQuery("Ketik alasan");
      // simpan admin await
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

    // update caption admin
    try {
      const baseCaption = ctx.update.callback_query.message.caption || "";
      await ctx.editMessageCaption(baseCaption + `\n\n❌ *REJECTED*\nAlasan: ${reason}`, { parse_mode: "Markdown" });
    } catch {}
  });

  return bot;
}

async function finalizeReject(bot, store, tok, reason, adminChatId) {
  const data = store.getByToken(tok);
  if (!data) return;

  // notify user
  await bot.telegram.sendMessage(
    data.chatId,
    [
      "❌ *Pembayaran ditolak*",
      `Order ID: \`${data.orderId}\``,
      `Paket: *${data.label}*`,
      "",
      `Alasan: ${reason}`,
      "",
      "Silakan /start untuk ulangi transaksi.",
    ].join("\n"),
    { parse_mode: "Markdown" }
  );

  // (optional) notify admin chat juga
  if (adminChatId) {
    await bot.telegram.sendMessage(adminChatId, `Order ${data.orderId} ditolak. Token: ${tok}.`);
  }

  await store.removePending(tok);
}

module.exports = { createQrisOrderBot };
