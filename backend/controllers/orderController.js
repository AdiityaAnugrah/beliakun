require("dotenv").config();
const Order = require("../models/orderModel.js");
const Product = require("../models/productModel.js");
const OrderItem = require("../models/orderItemModel.js");
const KeyModel = require("../models/keyModel.js");
const Category = require("../models/categoryModel.js");
const { where } = require("sequelize");
const baseUrl = process.env.BASE_URL || "http://localhost:4000";
const WebSocket = require("ws");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});


// Menambahkan produk ke keranjang

const getOrder = async (req, res) => {
  const { midtrans_id } = req.params;
  try {
    if (!midtrans_id) {
      const order = await Order.findAll({
        attributes: { exclude: ["data_mid"] },
        where: { user_id: req.user.id },
      });
      return res.status(200).json(order);
    }
    const order = await Order.findOne({ where: { midtrans_id } });
    const orderItems = await OrderItem.findAll({
      where: { order_id: order.id },
      include: [{ model: Product, include: [{ model: Category, as: "category" }] }],
    });
    res.status(200).json({
      ...order.dataValues,
      data_mid: order.dataValues.data_mid,
      items: orderItems.map((c) => ({
        productId: c.Product.id,
        nama: c.Product.nama,
        harga: c.Product.harga,
        gambar: `${baseUrl}/uploads/${c.Product.gambar}`,
        quantity: c.quantity,
        stok: c.Product.stock,
        kategori: c.Product.category?.label,
      })),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const updateOrder = async (req, res) => {
  const { reference, status } = req.body;
  try {
    const orderCur = await Order.findOne({ where: { midtrans_id: reference } });
    if (!orderCur) return res.status(400).json({ message: "Order tidak ditemukan" });

    const orderItems = await OrderItem.findAll({
      where: { order_id: orderCur.id },
      include: [Product],
    });

    if (status === "PAID") {
      await Promise.all(orderItems.map(async (item) => {
        const product = await Product.findByPk(item.Product.id);
        product.produk_terjual += item.quantity;
        await product.save();
      }));

      sendEmail(orderCur.email, orderItems, orderCur);
      await orderCur.update({ status: "success" });
    } else if (["FAILED", "EXPIRED"].includes(status)) {
      await Promise.all(orderItems.map(async (item) => {
        const product = await Product.findByPk(item.Product.id);
        product.stock += item.quantity;
        await product.save();
      }));
      await orderCur.update({ status: "failed" });
    }

    const socket = new WebSocket(process.env.URL_WEBSOCKET);
    socket.on("open", () => {
      socket.send(JSON.stringify({
        type: "order_update",
        data: { order_id: reference, status },
      }));
    });

    res.status(200).json({ message: "Status order diperbarui" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Update order gagal" });
  }
};

const sendEmail = async (userEmail, orderDetails, orderCur) => {
    try {
        const orderItems = await OrderItem.findAll({
            where: { order_id: orderCur.id },
            include: [{ model: Product }],
        });

        let orderInfo = orderItems
            .map((item) => {
                return `${item.dataValues.Product.nama} x ${item.dataValues.quantity} - ${item.dataValues.Product.harga}`;
            })
            .join("\n");

        // Cari produk dengan nama persis "Bypass Pubg"
        const pubgItem = orderItems.find((item) =>
            item.dataValues.Product.nama.toLowerCase() === "bypass pubg"
        );

        let keyInfo = "";

        if (pubgItem) {
            // Ambil key dari KeyModel berdasarkan durasi & status
            const keyData = await KeyModel.findOne({
                where: {
                    durasi: "1 bulan",
                    status: "nonaktif",
                },
                attributes: ["key"],
            });

            if (keyData) {
                keyInfo = `Bonus Key untuk ${pubgItem.dataValues.Product.nama}: ${keyData.key}`;

                // Update status key menjadi aktif
                await KeyModel.update(
                    { status: "aktif" },
                    { where: { key: keyData.key } }
                );
            } else {
                keyInfo = `Key untuk ${pubgItem.dataValues.Product.nama} sedang habis. Silakan hubungi admin.`;
            }
        }

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: "Pesanan Anda Berhasil Diproses",
            html: `
                <html>
                    <head>
                        <style>
                            body {
                                font-family: Arial, sans-serif;
                                background-color: #f8f9fa;
                                color: #333;
                                margin: 0;
                                padding: 0;
                            }
                            .container {
                                width: 80%;
                                margin: auto;
                                background-color: #fff;
                                padding: 20px;
                                border-radius: 8px;
                                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                            }
                            h1 {
                                color: #007bff;
                            }
                            .order-details {
                                margin-top: 20px;
                            }
                            .order-details table {
                                width: 100%;
                                border-collapse: collapse;
                            }
                            .order-details th, .order-details td {
                                padding: 12px;
                                text-align: left;
                                border-bottom: 1px solid #ddd;
                            }
                            .order-details th {
                                background-color: #f1f1f1;
                            }
                            .footer {
                                margin-top: 40px;
                                text-align: center;
                                color: #777;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <h1>Terima kasih telah melakukan pembelian!</h1>
                            <p>Pesanan Anda telah berhasil diproses. Berikut adalah detail pesanan Anda:</p>
                            
                            <div class="order-details">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Nama Produk</th>
                                            <th>Kuantitas</th>
                                            <th>Harga</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${orderInfo
                                            .split("\n")
                                            .map((item) => {
                                                const [nameQty, price] = item.split(" - ");
                                                const [name, qty] = nameQty.split(" x ");
                                                return `
                                                    <tr>
                                                        <td>${name}</td>
                                                        <td>${qty}</td>
                                                        <td>${price}</td>
                                                    </tr>
                                                `;
                                            })
                                            .join("")}
                                    </tbody>
                                </table>
                            </div>

                            ${keyInfo ? `<p style="margin-top:20px"><strong>${keyInfo}</strong></p>` : ""}

                            <p>Terima kasih atas kepercayaan Anda. Kami akan segera memproses pengiriman barang Anda!</p>
                            
                            <div class="footer">
                                <p>Jika Anda memiliki pertanyaan, silakan hubungi kami di email ini.</p>
                            </div>
                        </div>
                    </body>
                </html>
            `,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log("Error sending email:", error);
            } else {
                console.log("Email sent:", info.response);
            }
        });
    } catch (error) {
        console.error("Error preparing email:", error);
    }
};





const getOrderHistory = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { user_id: req.user.id },
      order: [["createdAt", "DESC"]],
      include: [{ model: OrderItem, include: [{ model: Product }] }],
    });

    const formattedOrders = orders.map((order) => ({
      id: order.id,
      midtrans_id: order.midtrans_id,
      total: order.total_harga,
      status: order.status,
      createdAt: order.createdAt,
      items: order.OrderItems.map((item) => ({
        id: item.id,
        productId: item.Product.id,
        nama: item.Product.nama,
        harga: item.Product.harga,
        gambar: `${baseUrl}/uploads/${item.Product.gambar}`,
        quantity: item.quantity,
      }))
    }));

    res.status(200).json(formattedOrders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal ambil riwayat order" });
  }
};



module.exports = { getOrder, updateOrder, getOrderHistory };
