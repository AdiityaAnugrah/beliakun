const Product = require("../models/productModel.js");

const addProduct = async (req, res) => {
    const {
        nama,
        harga,
        stock,
        link_shopee,
        status,
        produk_terjual,
        deskripsi,
        kategori,
    } = req.body;

    console.log("Uploaded file:", req.file);

    if (!req.file) {
        return res.status(400).json({ message: "Product image is required" });
    }

    if (!nama || !harga || !stock || !deskripsi || !kategori) {
        return res.status(400).json({
            message: "Nama, harga, stok, deskripsi, dan kategori diperlukan",
        });
    }

    try {
        const newProduct = await Product.create({
            nama,
            harga,
            stock,
            gambar: req.file.filename,
            link_shopee,
            status,
            produk_terjual,
            deskripsi,
            kategori,
        });

        res.status(200).json({
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

    if (page <= 0) page = 1;
    if (limit <= 0) limit = 10;

    const offset = (page - 1) * limit;

    try {
        const products = await Product.findAndCountAll({
            limit: limit,
            offset: offset,
        });

        const baseUrl = process.env.BASE_URL || "http://localhost:4000";

        const productsWithFullImageUrl = products.rows.map((product) => ({
            ...product.dataValues,
            gambar: `${baseUrl}/uploads/${product.gambar}`,
        }));

        const totalPages = Math.ceil(products.count / limit);

        res.status(200).json({
            products: productsWithFullImageUrl,
            totalItems: products.count,
            totalPages: totalPages,
            currentPage: page,
        });
    } catch (error) {
        console.error("Get products error:", error);
        res.status(500).json({
            message: "Server error while fetching products",
            error: error.message,
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
        if (req.file) {
            product.gambar = req.file.filename;
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

const deleteProduct = async (req, res) => {
    const { id } = req.params;

    try {
        const product = await Product.findOne({ where: { id } });

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        const fs = require("fs");
        const path = require("path");
        const imagePath = path.join(__dirname, "../uploads", product.gambar); // Assuming images are in 'uploads' folder

        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
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
