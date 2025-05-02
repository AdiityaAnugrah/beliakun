const Cart = require("../models/cartModel.js");
const Product = require("../models/productModel.js");

// Menambahkan produk ke keranjang
const addToCart = async (req, res) => {
    const { productId, quantity } = req.body;

    try {
        const product = await Product.findByPk(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        const existingCartItem = await Cart.findOne({
            where: { userId: req.user.id, productId },
        });

        if (existingCartItem) {
            existingCartItem.quantity += quantity;
            await existingCartItem.save();
            return res.status(200).json({ message: "Cart updated" });
        }

        await Cart.create({ userId: req.user.id, productId, quantity });
        res.status(201).json({ message: "Product added to cart" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

const getCart = async (req, res) => {
    try {
        const cartItems = await Cart.findAll({
            where: { userId: req.user.id },
            include: [{ model: Product }],
        });
        res.status(200).json(cartItems);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = { addToCart, getCart };
