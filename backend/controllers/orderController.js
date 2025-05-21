require("dotenv").config();
const Order = require("../models/orderModel.js");
const Product = require("../models/productModel.js");
const OrderItem = require("../models/orderItemModel.js");
const key = require("../models/keyModel.js");
const { where } = require("sequelize");
const baseUrl = process.env.BASE_URL || "http://localhost:4000";

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
        // Ambil order items untuk detail pesanan
        const orderItems = await OrderItem.findAll({
            where: { order_id: orderCur.id },
            include: [{ model: Product }],
        });

        let orderInfo = orderItems
            .map((item) => {
                return `${item.dataValues.Product.nama} x ${item.dataValues.quantity} - ${item.dataValues.Product.harga}`;
            })
            .join("\n");

        // Cek apakah ada produk dengan nama "PUBG" dan ambil key dari database berdasarkan produk
        const isPUBG = orderItems.some((item) =>
            item.dataValues.Product.nama.toLowerCase().includes("pubg")
        );

        let keyInfo = "";
        if (isPUBG) {
            // Cari key berdasarkan nama produk di tabel Product dan durasi 1 bulan
            const productName = "PUBG"; // Nama produk yang dicari
            const product = await Product.findOne({
                where: {
                    nama: productName, // Cari produk berdasarkan nama
                },
            });

            if (product) {
                // Jika produk ditemukan, ambil key berdasarkan durasi 1 bulan
                const keyData = await keyModel.findOne({
                    where: {
                        product_id: product.id, // Cari berdasarkan ID produk
                        duration: "1 bulan", // Durasi 1 bulan
                    },
                    attributes: ["key"], // Ambil hanya kolom key
                });

                if (keyData) {
                    keyInfo = `Bonus Key untuk ${productName}: ${keyData.key}`; // Jika key ditemukan
                } else {
                    keyInfo = `Pada produk ${productName} belum tersedia Key.`; // Jika key tidak ditemukan
                }
            }
        }

        // Kirim email
        const mailOptions = {
            from: process.env.EMAIL_USER, // Pengirim email
            to: userEmail, // Penerima email
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
                                                const [name, quantity, price] =
                                                    item.split(" x ");
                                                return `
                                                    <tr>
                                                        <td>${name}</td>
                                                        <td>${quantity}</td>
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
                                    ? `<p><strong>${keyInfo}</strong></p>`
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
    const { status_code, transaction_status, order_id, status_message } =
        req.body;
    try {
        const orderCur = await Order.findOne({
            where: { midtrans_id: order_id },
        });
        if (!orderCur) {
            return res.status(400).json({
                message: "Order tidak ditemukan",
            });
        }
        if (status_code[0] != "2") {
            return res.status(Number(status_code)).json({
                message: status_message,
            });
        }
        let status = "";
        if (
            transaction_status == "capture" ||
            transaction_status == "settlement"
        ) {
            status = "success";
            const orderItems = await OrderItem.findAll({
                where: { order_id: orderCur.id },
                include: [{ model: Product }],
            });

            let orderDetails = orderItems
                .map((item) => {
                    return `${item.dataValues.Product.nama} x ${item.dataValues.quantity} - ${item.dataValues.Product.harga}`;
                })
                .join("\n");

            // Kirim email ke pembeli
            sendEmail(orderCur.user_email, orderDetails, orderCur);
        } else if (transaction_status == "pending") {
            status = "pending";
        } else {
            status = "failed";
        }
        await Order.update({ status }, { where: { midtrans_id: order_id } });
        res.status(200).json({
            message: status_message,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = { getOrder, updateOrder };
