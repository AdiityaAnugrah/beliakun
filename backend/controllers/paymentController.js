const coreApi = require("../config/midtransConfig.js");
const Product = require("../models/productModel.js");

const createMidtransTransaction = async (req, res) => {
    const { productIds } = req.body;

    try {
        const products = await Product.findAll({ where: { id: productIds } });

        const item_details = products.map((product) => ({
            id: product.id.toString(),
            name: product.nama,
            price: product.harga,
            quantity: 1,
        }));

        // Detail transaksi
        const transactionDetails = {
            order_id: "ORDER" + new Date().getTime(),
            gross_amount: products.reduce(
                (total, product) => total + product.harga,
                0
            ),
        };

        const customer_details = {
            first_name: req.user.nama,
            email: req.user.email,
            phone: req.user.phone || "N/A",
        };
        const chargeParams = {
            payment_type: "credit_card",
            transaction_details: transactionDetails,
            item_details: item_details,
            customer_details: customer_details,
        };
        const chargeResponse = await coreApi.charge(chargeParams);
        res.status(200).json({ redirect_url: chargeResponse.redirect_url });
    } catch (error) {
        console.error("Midtrans transaction creation error:", error);
        res.status(500).json({
            message: "Server error while creating Midtrans transaction",
        });
    }
};

module.exports = { createMidtransTransaction };
