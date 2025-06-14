require("dotenv").config();
const Order = require("../models/orderModel.js");
const Product = require("../models/productModel.js");
const OrderItem = require("../models/orderItemModel.js");
const key = require("../models/keyModel.js");
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
    const midtrans_id = req.params.midtrans_id;
    try {
        if (!midtrans_id) {
            const order = await Order.findAll({
                attributes: { exclude: ["data_mid"] },
                where: { user_id: req.user.id },
            });
            return res.status(200).json(order);
        }
        const order = await Order.findOne({
            where: { midtrans_id },
        });
        console.log(JSON.parse(JSON.parse(order.dataValues.data_mid)));
        const orderItems = await OrderItem.findAll({
            where: { order_id: order.dataValues.id },
            include: [{ model: Product }],
        });
        res.status(200).json({
            ...order.dataValues,
            data_mid: JSON.parse(JSON.parse(order.dataValues.data_mid)),
            items: orderItems.map((c) => ({
                productId: c.dataValues.Product.id,
                nama: c.dataValues.Product.nama,
                harga: c.dataValues.Product.harga,
                gambar: `${baseUrl}/uploads/${c.dataValues.Product.gambar}`,
                quantity: c.dataValues.quantity,
                stok: c.dataValues.Product.stock,
            })),
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

const sendEmail = async (userEmail, orderDetails, orderCur) => {
    try {
        // Ambil semua item dalam pesanan
        const orderItems = await OrderItem.findAll({
            where: { order_id: orderCur.id },
            include: [{ model: Product }],
        });

        // Format detail order ke dalam string
        let orderInfo = orderItems
            .map((item) => {
                return `${item.dataValues.Product.nama} x ${item.dataValues.quantity} - ${item.dataValues.Product.harga}`;
            })
            .join("\n");

        // Deteksi apakah ada produk yang namanya mengandung "pubg"
        const allowedNames = ["bypass pubg", "bypass pubg mobile"];
        const pubgItem = orderItems.find((item) =>
            allowedNames.includes(item.dataValues.Product.nama.toLowerCase())
        );


        let keyInfo = "";

        if (pubgItem) {
            const productId = pubgItem.dataValues.Product.id;

            // Ambil key untuk produk tersebut dengan durasi "1 bulan"
            const keyData = await keyModel.findOne({
                where: {
                    product_id: productId,
                    duration: "1 bulan",
                    is_used: false, // jika ada kolom is_used
                },
                attributes: ["id", "key"],
            });

            if (keyData) {
                keyInfo = `Bonus Key untuk ${pubgItem.dataValues.Product.nama}: ${keyData.key}`;

                // Tandai key sebagai sudah digunakan (jika ada kolom is_used)
                await keyModel.update({ is_used: true }, { where: { id: keyData.id } });
            } else {
                keyInfo = `Key untuk ${pubgItem.dataValues.Product.nama} sedang habis. Silakan hubungi admin.`;
            }
        }

        // Email template HTML
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

                            ${
                                keyInfo
                                    ? `<p style="margin-top:20px"><strong>${keyInfo}</strong></p>`
                                    : ""
                            }

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


const updateOrder = async (req, res) => {
    const { status_code, transaction_status, order_id, status_message } = req.body;

    try {
        // CARI order-nya dulu
        const orderCur = await Order.findOne({
            where: { midtrans_id: order_id },
        });

        // CEK jika order tidak ditemukan, langsung balikan response
        if (!orderCur) {
            return res.status(400).json({
                message: "Order tidak ditemukan",
            });
        }

        // Lalu cari item-item dalam order setelah dipastikan order-nya ada
        const orderItemsCur = await OrderItem.findAll({
            where: { order_id: orderCur.id },
            include: [{ model: Product }],
        });

        // Cek apakah status dari Midtrans bukan 2xx (berhasil)
        if (status_code[0] != "2") {
            return res.status(Number(status_code)).json({
                message: status_message,
            });
        }

        let status = "";

        if (
            transaction_status === "capture" ||
            transaction_status === "settlement"
        ) {
            status = "success";

            const orderItems = await OrderItem.findAll({
                where: { order_id: orderCur.id },
                include: [{ model: Product }],
            });

            // Update jumlah produk terjual
            for (const item of orderItemsCur) {
                const product = await Product.findByPk(item.Product.id);
                product.produk_terjual += item.quantity;
                await product.save();
            }

            // Buat deskripsi order untuk email
            let orderDetails = orderItems
                .map((item) => {
                    return `${item.dataValues.Product.nama} x ${item.dataValues.quantity} - ${item.dataValues.Product.harga}`;
                })
                .join("\n");

            // Kirim email ke pembeli
            sendEmail(orderCur.user_email, orderDetails, orderCur);

        } else if (transaction_status === "pending") {
            status = "pending";

        } else {
            status = "failed";

            // Jika gagal bayar, kembalikan stok
            for (const item of orderItemsCur) {
                await Product.update(
                    {
                        stock: item.dataValues.Product.stock + item.dataValues.quantity,
                    },
                    {
                        where: { id: item.dataValues.Product.id },
                    }
                );
            }
        }

        // Update status order
        await Order.update({ status }, { where: { midtrans_id: order_id } });

        // Kirim update ke WebSocket jika bukan pending
        if (status !== "pending") {
            const socket = new WebSocket(process.env.URL_WEBSOCKET);
            socket.on("open", () => {
                const message = {
                    type: "order_update",
                    data: {
                        order_id,
                        status,
                    },
                };
                socket.send(JSON.stringify(message));
            });
        }

        res.status(200).json({
            message: status_message,
        });

    } catch (error) {
        console.error("updateOrder error:", error);
        res.status(500).json({ message: "Server error" });
    }
};


module.exports = { getOrder, updateOrder };
