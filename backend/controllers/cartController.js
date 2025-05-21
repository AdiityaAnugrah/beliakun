require("dotenv").config();
const Cart = require("../models/cartModel.js");
const Product = require("../models/productModel.js");
const baseUrl = process.env.BASE_URL || "http://localhost:4000";

// Menambahkan produk ke keranjang
const addToCart = async (req, res) => {
    const { productId, quantity } = req.body;

    try {
        const product = await Product.findByPk(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        const existingCartItem = await Cart.findOne({
            where: { user_id: req.user.id, product_id: productId },
        });

        // ✅ Hitung total quantity setelah penambahan
        const newQuantity = existingCartItem
            ? existingCartItem.quantity + quantity
            : quantity;

        if (newQuantity > product.stock) {
            return res.status(400).json({ message: "Stok tidak mencukupi." });
        }

        if (existingCartItem) {
            existingCartItem.quantity = newQuantity;
            await existingCartItem.save();
        } else {
            await Cart.create({
                user_id: req.user.id,
                product_id: productId,
                quantity,
            });
        }

        const cartItems = await Cart.findAll({
            where: { user_id: req.user.id },
            include: [{ model: Product }],
        });

        res.status(200).json(
            cartItems.map((c) => ({
                productId: c.Product.id,
                nama: c.Product.nama,
                harga: c.Product.harga,
                gambar: `${baseUrl}/uploads/${c.Product.gambar}`,
                quantity: c.quantity,
                stok: c.Product.stock,
            }))
        );
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

const getCart = async (req, res) => {
    try {
        const cartItems = await Cart.findAll({
            where: { user_id: req.user.id },
            include: [{ model: Product }],
        });
        res.status(200).json(
            cartItems.map((c) => ({
                productId: c.Product.id,
                nama: c.Product.nama,
                harga: c.Product.harga,
                gambar: `${baseUrl}/uploads/${c.Product.gambar}`,
                quantity: c.quantity,
                stok: c.Product.stock,
            }))
        );
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

const updateQuantity = async (req, res) => {
    const { productId, quantity } = req.body;
    try {
        const product = await Product.findByPk(productId);
        if (!product) {
            return res.status(404).json({ message: "Produk tidak ditemukan" });
        }

        if (quantity > product.stock) {
            return res
                .status(400)
                .json({ message: "Jumlah melebihi stok tersedia" });
        }

        const item = await Cart.findOne({
            where: { user_id: req.user.id, product_id: productId },
        });

        if (!item) {
            return res.status(404).json({ message: "Item tidak ditemukan" });
        }

        item.quantity = quantity;
        await item.save();

        res.status(200).json({ message: "Jumlah diperbarui" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

const deleteCartItem = async (req, res) => {
    const { productId } = req.params;
    try {
        await Cart.destroy({
            where: { user_id: req.user.id, product_id: productId },
        });
        res.status(200).json({ message: "Item deleted" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};
module.exports = { addToCart, getCart, updateQuantity, deleteCartItem };
