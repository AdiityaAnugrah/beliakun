// controllers/tripayController.js
require("dotenv").config();
const crypto = require("crypto");
const fetch = require("node-fetch");

const { Order, OrderItem, Product, Cart, Category } = require("../models");
const { takeKeyForDurasi } = require("../utils/keyService");
const { tgSendMessage } = require("../utils/telegram");
const { notifyOrderStatus } = require("../utils/discord");

const TRIPAY_API = "https://tripay.co.id/api";

// ===== Helpers =====
function mapTripayStatus(status) {
  const map = {
    PAID: "success",
    FAILED: "failed",
    EXPIRED: "failed",
    UNPAID: "pending",
  };
  return map[String(status || "").toUpperCase()] || "pending";
}

// X-Callback-Signature = HMAC_SHA256(JSON.stringify(body), privateKey)
function verifyTripayCallbackSignature(req) {
  const headerSig = req.get("X-Callback-Signature") || "";
  const expected = crypto
    .createHmac("sha256", process.env.TRIPAY_PRIVATE_KEY)
    .update(JSON.stringify(req.body))
    .digest("hex");

  return headerSig === expected;
}

// =======================================================
// GET CHANNELS
// =======================================================
const getTripayChannels = async (req, res) => {
  try {
    const response = await fetch(`${TRIPAY_API}/merchant/payment-channel`, {
      headers: { Authorization: `Bearer ${process.env.TRIPAY_API_KEY}` },
    });
    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    console.error("Channel fetch error:", err);
    return res.status(500).json({ message: "Gagal mengambil metode pembayaran" });
  }
};

// =======================================================
// CREATE TRANSACTION (WEB CHECKOUT)
// =======================================================
const createTripayTransaction = async (req, res) => {
  const { method, alamat, catatan, phone } = req.body;

  try {
    const cartItems = await Cart.findAll({
      where: { user_id: req.user.id },
      include: [{ model: Product, include: [{ model: Category, as: "category" }] }],
    });

    if (!cartItems.length) {
      return res.status(400).json({ message: "Keranjang kosong" });
    }

    const merchantRef = "ORDER-" + Date.now();
    const amount = cartItems.reduce((total, item) => total + item.Product.harga * item.quantity, 0);
    const expiredTime = Math.floor(Date.now() / 1000) + 3600;

    // signature create: merchant_code + merchant_ref + amount
    const signature = crypto
      .createHmac("sha256", process.env.TRIPAY_PRIVATE_KEY)
      .update(process.env.TRIPAY_MERCHANT_CODE + merchantRef + amount)
      .digest("hex");

    const payload = {
      method,
      merchant_ref: merchantRef,
      amount,
      customer_name: req.user.nama,
      customer_email: req.user.email,
      customer_phone: phone,
      order_items: cartItems.map((item) => ({
        sku: `SKU-${item.Product.id}`,
        name: item.Product.nama,
        price: item.Product.harga,
        quantity: item.quantity,
      })),
      callback_url: `${process.env.BASE_URL}/payment/tripay-callback`,
      return_url: `${process.env.FRONTEND_URL}/thank-you`,
      expired_time: expiredTime,
      signature,
    };

    const response = await fetch(`${TRIPAY_API}/transaction/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.TRIPAY_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!result?.success) {
      return res
        .status(500)
        .json({ message: result?.message || "Gagal membuat transaksi Tripay" });
    }

    // create order
    const order = await Order.create({
      user_id: req.user.id,
      email: req.user.email,
      nama: req.user.nama,
      alamat,
      catatan,
      total_harga: amount,

      tripay_merchant_ref: merchantRef,
      tripay_reference: result.data.reference,
      data_tripay: result.data,
    });

    // create order items + kurangi stok
    for (const item of cartItems) {
      await OrderItem.create({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
      });

      item.Product.stock -= item.quantity;
      await item.Product.save();
    }

    // hapus cart
    await Cart.destroy({ where: { user_id: req.user.id } });

    return res.status(200).json({
      message: "Berhasil membuat transaksi",
      checkout_url: result.data.checkout_url,
    });
  } catch (err) {
    console.error("Tripay Error:", err);
    return res.status(500).json({ message: "Gagal membuat transaksi Tripay" });
  }
};

// =======================================================
// CALLBACK (WEB + TELEGRAM BOT)
// =======================================================
const handleTripayCallback = async (req, res) => {
  try {
    // 1) Validasi signature callback
    if (!verifyTripayCallbackSignature(req)) {
      return res.status(403).json({ message: "Signature tidak valid" });
    }

    const { reference, status } = req.body || {};
    if (!reference) return res.status(200).json({ message: "Callback OK" });

    // 2) Ambil order + include orderitems dengan ALIAS yang benar
    const order = await Order.findOne({
      where: { tripay_reference: reference },
      include: [
        {
          model: OrderItem,
          as: "OrderItems", // ✅ FIX alias
          required: false, // ✅ order telegram bisa tidak punya OrderItems
        },
      ],
    });

    // Tripay kadang retry callback, lebih aman balas 200 walau tidak ketemu
    if (!order) return res.status(200).json({ message: "Order tidak ditemukan" });

    const oldStatus = order.status;
    const newStatus = mapTripayStatus(status);

    order.status = newStatus;
    order.data_tripay = req.body;

    // 3) Rollback stok kalau gagal (khusus order web)
    if (newStatus === "failed" && Array.isArray(order.OrderItems) && order.OrderItems.length) {
      for (const item of order.OrderItems) {
        const product = await Product.findByPk(item.product_id);
        if (product) {
          product.stock += item.quantity;
          await product.save();
        }
      }
    }

    await order.save();

    // 4) Auto delivery key (khusus order telegram)
    const shouldDeliverKey =
      oldStatus !== "success" &&
      newStatus === "success" &&
      order.telegram_chat_id &&
      order.key_durasi &&
      !order.key_delivered_at;

    if (shouldDeliverKey) {
      const chatId = order.telegram_chat_id;
      const durasi = order.key_durasi;

      const keyRow = await takeKeyForDurasi(durasi);

      if (!keyRow) {
        await tgSendMessage(
          chatId,
          `✅ Pembayaran sukses.\n⚠️ Tapi stok key "${durasi}" habis.\nAdmin akan proses manual.`
        );
        return res.status(200).json({ message: "Callback OK" });
      }

      order.key_id = keyRow.id;
      order.key_text = keyRow.key;
      order.key_delivered_at = new Date();
      await order.save();

      const tutorialUrl = process.env.KEY_TUTORIAL_URL || `${process.env.FRONTEND_URL}/cara-pakai`;

      await tgSendMessage(
        chatId,
        `✅ PEMBAYARAN BERHASIL\n\n` +
          `🔑 KEY KAMU:\n${keyRow.key}\n\n` +
          `⏳ Durasi: ${durasi}\n` +
          `📘 Cara pakai:\n${tutorialUrl}\n\n` +
          `Terima kasih 🙏`
      );
    }

    // ✅ kirim Discord 1x ketika status berubah jadi success
    if (oldStatus !== "success" && newStatus === "success") {
      await notifyOrderStatus({
        order,
        reference,
        status,
        source: "Tripay",
      });
    }


    return res.status(200).json({ message: "Callback OK" });
  } catch (err) {
    console.error("Callback error:", err);
    return res.status(500).json({ message: "Internal error" });
  }
};

module.exports = {
  getTripayChannels,
  createTripayTransaction,
  handleTripayCallback,
};
