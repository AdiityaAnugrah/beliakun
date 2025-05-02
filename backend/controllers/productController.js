const Product = require("../models/productModel.js");

const addProduct = async (req, res) => {
    const {
        nama,
        harga,
        stock,
        gambar,
        link_shopee,
        status,
        produk_terjual,
        deskripsi,
        kategori,
    } = req.body;

    if (!nama || !harga || !stock) {
        return res
            .status(400)
            .json({ message: "Nama, harga, dan stok produk diperlukan" });
    }
    try {
        const newProduct = await Product.create({
            nama,
            harga,
            stock,
            gambar,
            link_shopee,
            status,
            produk_terjual,
            deskripsi,
            kategori,
        });

        res.status(201).json({
            message: "Product added successfully",
            product: newProduct,
        });
    } catch (error) {
        console.error("Add product error:", error);
        res.status(500).json({ message: "Server error while adding product" });
    }
};

const getAllProducts = async (req, res) => {
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;

    // Pastikan page dan limit adalah angka positif
    if (page <= 0) page = 1;
    if (limit <= 0) limit = 10;

    const offset = (page - 1) * limit;

    console.log("INI GET ALL PRODUCTS");

    try {
        const products = await Product.findAndCountAll({
            limit: limit,
            offset: offset,
        });
        console.log("INI PRODUK");
        console.log(products);

        const totalPages = Math.ceil(products.count / limit);

        res.status(200).json({
            products: products.rows,
            totalItems: products.count,
            totalPages: totalPages,
            currentPage: page,
        });
    } catch (error) {
        console.error("Get products error:", error);
        res.status(500).json({
            message: "Server error while fetching products",
            error: error.message, // Menambahkan detail error untuk mempermudah debugging
        });
    }
};

const updateProduct = async (req, res) => {
    const { id } = req.params;
    try {
        const product = await Product.findOne({ where: { id } });

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        await product.update(req.body);
        res.status(200).json({
            message: "Product updated successfully",
            product,
        });
    } catch (error) {
        console.error("Update product error:", error);
        res.status(500).json({
            message: "Server error while updating product",
        });
    }
};

// Menghapus Produk
const deleteProduct = async (req, res) => {
    const { id } = req.params;

    try {
        const product = await Product.findOne({ where: { id } });

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        await product.destroy();
        res.status(200).json({
            message: "Product deleted successfully",
        });
    } catch (error) {
        console.error("Delete product error:", error);
        res.status(500).json({
            message: "Server error while deleting product",
        });
    }
};

module.exports = { addProduct, getAllProducts, updateProduct, deleteProduct };
