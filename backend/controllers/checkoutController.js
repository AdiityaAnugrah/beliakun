require("dotenv").config();
const Cart = require("../models/cartModel.js");
const midtransClient = require("midtrans-client");
const Order = require("../models/orderModel.js");
const OrderItem = require("../models/orderItemModel.js");
const Product = require("../models/productModel.js");
const Category = require("../models/categoryModel.js");

const coreApi = new midtransClient.CoreApi({
    isProduction: false,
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

const checkoutManual = async (req, res) => {
    const { paymentType, bank, alamat, catatan, phone } = req.body;
    const email = req.user.email;
    const nama = req.user.nama;

    try {
        // Cek cart user
        const cartItems = await Cart.findAll({
            where: { user_id: req.user.id },
            include: [{
                model: Product,
                include: [{ model: Category, as: "category", attributes: ["label"] }]
            }],
        });

        if (!cartItems || cartItems.length === 0) {
            return res.status(400).json({ message: "cart not found" });
        }
        if (cartItems.some((item) => item.quantity <= 0)) {
            return res.status(400).json({ message: "Invalid product quantity." });
        }
        if (!alamat || !phone) {
            return res.status(400).json({
                message: "All must be filled in",
            });
        }


        // generate ID
        const order_id = "BELI" + new Date().getTime();

        // Hitung total harga
        const gross_amount = cartItems.reduce((total, item) => {
            return total + item.Product.harga * item.quantity;
        }, 0);

        // Buat transaksi ke Midtrans
        let parameter = {
            payment_type: bank == 'mandiri' ? 'echannel': paymentType,
            transaction_details: {
                gross_amount,
                order_id,
            },
            item_details: cartItems.map((item) => ({
                id: item.Product.id.toString(),
                price: item.Product.harga,
                quantity: item.quantity,
                name: item.Product.nama,
            })),
        };

        if (paymentType === "bank_transfer") {
            if (!bank)
                return res.status(400).json({ message: "Bank tidak dipilih." });
            parameter.bank_transfer = { bank };
        }
        if (bank === 'mandiri') {
            parameter.echannel = {
                bill_info1: 'BeliaKun',
                bill_info2: order_id,
            }
        }

        parameter.customer_details = {
            first_name: nama,
            email,
            phone,
            alamat,
            catatan,
        };

        // const midtransResponse = await coreApi.charge(parameter);
        const authorization = btoa(process.env.MIDTRANS_SERVER_KEY + ":");
        const midtransResponse = await fetch(
            "https://api.sandbox.midtrans.com/v2/charge",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Basic ${authorization}`,
                },
                body: JSON.stringify(parameter),
            }
        );
        const midtransJson = await midtransResponse.json();
        if (midtransJson.status_code[0] != "2") {
            return res
                .status(Number(midtransJson.status_code))
                .json({ message: midtransJson.status_message });
        }

        // Simpan Order
        const order = await Order.create({
            user_id: req.user.id,
            email: req.user.email,
            nama: req.user.nama,
            alamat,
            catatan,
            total_harga: gross_amount,
            data_mid: JSON.stringify(midtransJson),
            midtrans_id: order_id,
        });

        // Simpan setiap item ke order_items
        for (const item of cartItems) {
            await OrderItem.create({
                order_id: order.id,
                product_id: item.product_id,
                quantity: item.quantity,
            });

            // Kurangi stok produk
            item.Product.stock -= item.quantity;
            await item.Product.save();
        }

        // Kosongkan keranjang
        await Cart.destroy({ where: { user_id: req.user.id } });

        return res.status(200).json({
            message: "Checkout successful",
            order_id,
        });
    } catch (error) {
        console.error("Checkout Manual Error:", error);
        return res
            .status(500)
            .json({ message: "Gagal proses checkout", error });
    }
};

module.exports = { checkoutManual };
