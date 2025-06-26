// controllers/tripayController.js
require("dotenv").config();
const crypto = require("crypto");
const fetch = require("node-fetch");
const { Order, OrderItem, Product, Cart, Category } = require("../models");

const TRIPAY_API = "https://tripay.co.id/api";

const getTripayChannels = async (req, res) => {
  try {
    const response = await fetch(`${TRIPAY_API}/merchant/payment-channel`, {
      headers: {
        Authorization: `Bearer ${process.env.TRIPAY_API_KEY}`
      }
    });
    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    console.error("Channel fetch error:", err);
    res.status(500).json({ message: "Gagal mengambil metode pembayaran" });
  }
};

const createTripayTransaction = async (req, res) => {
  const { method, alamat, catatan, phone } = req.body;
  try {
    const cartItems = await Cart.findAll({
      where: { user_id: req.user.id },
      include: [{ model: Product, include: [{ model: Category, as: "category" }] }]
    });

    if (!cartItems.length) return res.status(400).json({ message: "Keranjang kosong" });

    const merchantRef = "ORDER-" + Date.now();
    const amount = cartItems.reduce((total, item) => total + item.Product.harga * item.quantity, 0);

    const expiredTime = Math.floor(Date.now() / 1000) + 3600; // 1 jam dari sekarang

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
      order_items: cartItems.map(item => ({
        sku: `SKU-${item.Product.id}`,
        name: item.Product.nama,
        price: item.Product.harga,
        quantity: item.quantity
      })),
      callback_url: `${process.env.BASE_URL}/api/payment/tripay-callback`,
      return_url: `${process.env.FRONTEND_URL}/thank-you`,
      expired_time: expiredTime,
      signature
    };

    const response = await fetch(`${TRIPAY_API}/transaction/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.TRIPAY_API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    if (!result.success) {
      return res.status(500).json({ message: result.message || "Gagal membuat transaksi Tripay" });
    }

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


    for (const item of cartItems) {
      await OrderItem.create({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity
      });
      item.Product.stock -= item.quantity;
      await item.Product.save();
    }

    await Cart.destroy({ where: { user_id: req.user.id } });

    return res.status(200).json({
      message: "Berhasil membuat transaksi",
      checkout_url: result.data.checkout_url
    });
  } catch (err) {
    console.error("Tripay Error:", err);
    return res.status(500).json({ message: "Gagal membuat transaksi Tripay" });
  }
};

const handleTripayCallback = async (req, res) => {
  const { reference, status, signature } = req.body;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.TRIPAY_PRIVATE_KEY)
    .update(reference + status)
    .digest("hex");

  if (signature !== expectedSignature) {
    return res.status(403).json({ message: "Signature tidak valid" });
  }

  try {
    const order = await Order.findOne({ where: { tripay_reference: reference } });
    if (!order) return res.status(404).end();

    const statusMap = {
      PAID: "success",
      FAILED: "failed",
      EXPIRED: "failed"
    };
    await order.update({ status: statusMap[status] || "pending" });

    return res.status(200).json({ message: "Callback processed" });
  } catch (error) {
    return res.status(500).json({ message: "Callback error" });
  }
};

module.exports = {
  getTripayChannels,
  createTripayTransaction,
  handleTripayCallback
 };
