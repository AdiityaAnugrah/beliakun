// routes/paymentRoutes.js
const express = require("express");
const router = express.Router();
const { filterPelanggan } = require("./filterAuth.js");
const tripayController = require("../controllers/tripayController");
const { Order, OrderItem, Product } = require("../models");

// Create Tripay transaction
router.post("/tripay/create", filterPelanggan, tripayController.createTripayTransaction);

// Tripay callback handler
router.post("/tripay-callback", tripayController.handleTripayCallback);

// List payment channels
router.get("/channels", tripayController.getTripayChannels);

// Get Tripay transaction status
router.get("/thank-you", (req, res) => {
  const { tripay_reference, tripay_merchant_ref } = req.query;

  // Jika dua-duanya kosong, arahkan ke beranda
  if (!tripay_reference && !tripay_merchant_ref) {
    return res.redirect("https://beliakun.com/");
  }

  const reference    = tripay_reference     || "";
  const merchantRef  = tripay_merchant_ref  || "";
  const target = `https://beliakun.com/thank-you` +
                 `?tripay_reference=${encodeURIComponent(reference)}` +
                 `&tripay_merchant_ref=${encodeURIComponent(merchantRef)}`;

  res.set("Cache-Control", "no-store");
  return res.redirect(target);
});


router.get("/order-detail", async (req, res) => {
  try {
    const { tripay_reference } = req.query;

    if (!tripay_reference) {
      return res
        .status(400)
        .json({ status: "fail", message: "tripay_reference wajib diisi" });
    }

    const order = await Order.findOne({
      where: { tripay_reference },
      include: [{ model: OrderItem, include: [Product] }],
    });

    if (!order) {
      return res
        .status(404)
        .json({ status: "fail", message: "Order tidak ditemukan" });
    }

    return res.json({
      status: "success",
      data: {
        tripay_reference: order.tripay_reference,
        merchant_ref: order.tripay_merchant_ref,
        total_harga: order.total_harga,
        createdAt: order.createdAt,
        items: order.OrderItems.map((oi) => ({
          nama: oi.Product.nama,
          jumlah: oi.quantity,
        })),
      },
    });
  } catch (error) {
    console.error("GET /order-detail error:", error);
    return res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan server",
    });
  }
});



module.exports = router;
