const { where } = require("sequelize");
const Product = require("../models/productModel.js");
const fs = require("fs");
const path = require("path");
const Category = require("../models/categoryModel.js");

const addProduct = async (req, res) => {
    const { nama, harga, stock, link_shopee, status, produk_terjual, deskripsi, categoryId } = req.body;

    if (!req.file) {
        return res.status(400).json({ message: "Product image is required" });
    }

    if (!nama || !harga || !stock || !deskripsi || !categoryId) {
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
            categoryId,
        });

        // Kembalikan response sukses
        res.status(200).json({
            message: "Product added successfully",
            product: newProduct,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error while adding product" });
    }
};

const updateProduct = async (req, res) => {
    const { id } = req.params;
    try {
        let product = await Product.findOne({ where: { id } });

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        if (req.file) {
            const imagePath = path.join(__dirname, "../uploads", product.gambar);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
            product.gambar = req.file.filename;
        }

        const updatedProductData = { ...req.body, gambar: product.gambar };

        await Product.update(updatedProductData, { where: { id } });

        res.status(200).json({
            message: "Product updated successfully",
            product,
        });
    } catch (error) {
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

        const imagePath = path.join(__dirname, "../uploads", product.gambar);
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }
        await product.destroy();

        res.status(200).json({
            message: "Product deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            message: "Server error while deleting product",
        });
    }
};

const getAllProducts = async (req, res) => {
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    const id = req.params.id;

    if (page <= 0) page = 1;
    if (limit <= 0) limit = 10;

    const offset = (page - 1) * limit;
    const baseUrl = process.env.BASE_URL || "http://localhost:4000";

    try {
        if (id) {
            const product = await Product.findByPk(id, {
                include: [
                    {
                        model: Category,
                        as: "category",
                        attributes: ["id", "label"],
                    },
                ],
            });
            return res.status(200).json({
                ...product.dataValues,
                gambar: `${baseUrl}/uploads/${product.gambar}`,
            });
        }

        const products = await Product.findAndCountAll({
            include: [
                {
                    model: Category,
                    as: "category",
                    attributes: ["id", "label"],
                },
            ],
            limit: limit,
            offset: offset,
        });
        const productsWithFullImageUrl = products.rows.map((product) => ({
            ...product.dataValues,
            gambar: `${baseUrl}/uploads/${product.gambar}`,
            kategori: product.category?.label,
        }));

        const totalPages = Math.ceil(products.count / limit);

        res.status(200).json({
            products: productsWithFullImageUrl,
            totalItems: products.count,
            totalPages: totalPages,
            currentPage: page,
        });
    } catch (error) {
        res.status(500).json({
            message: "Server error while fetching products",
            error: error.message,
        });
    }
};

const getProductLaris = async (req, res) => {
    try {
        const baseUrl = `${req.protocol}://${req.get('host')}`; // Mendapatkan base URL server
        const products = await Product.findAll({
            order: [["produk_terjual", "DESC"]],
            limit: 4,
            include: [{ model: Category, as: "category", attributes: ["label"] }]
        });
        const productsWithFullImageUrl = products.map((product) => ({
            ...product.dataValues,
            gambar: `${baseUrl}/uploads/${product.gambar}`,
            kategori: product.category?.label,
        }));
        res.status(200).json(productsWithFullImageUrl);
    } catch (error) {
        res.status(500).json({
            message: "Server error while fetching products laris",
            error: error.message,
        });
    }
};



module.exports = { addProduct, getAllProducts, updateProduct, deleteProduct, getProductLaris };
