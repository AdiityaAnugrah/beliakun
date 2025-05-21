const Wishlist = require("../models/wishlistModel");
const Product = require("../models/productModel");
const baseUrl = process.env.BASE_URL || "http://localhost:4000";

// Tambah ke wishlist
const addToWishlist = async (req, res) => {
    const { productId } = req.body;

    try {
        const exists = await Wishlist.findOne({
            where: { user_id: req.user.id, product_id: productId },
        });

        if (exists) {
            return res.status(400).json({ message: "Sudah ada di wishlist" });
        }

        await Wishlist.create({
            user_id: req.user.id,
            product_id: productId,
        });

        res.status(200).json({ message: "Berhasil ditambahkan ke wishlist" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// Ambil semua wishlist user
const getWishlist = async (req, res) => {
    try {
        const items = await Wishlist.findAll({
            where: { user_id: req.user.id },
            include: [{ model: Product }],
        });

        const data = items.map((item) => ({
            id: item.id,
            productId: item.Product.id,
            nama: item.Product.nama,
            harga: item.Product.harga,
            gambar: `${baseUrl}/uploads/${item.Product.gambar}`,
        }));

        res.status(200).json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// Hapus dari wishlist
const removeFromWishlist = async (req, res) => {
    const { productId } = req.params;
    try {
        await Wishlist.destroy({
            where: { user_id: req.user.id, product_id: productId },
        });

        res.status(200).json({ message: "Dihapus dari wishlist" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = {
    addToWishlist,
    getWishlist,
    removeFromWishlist,
};
