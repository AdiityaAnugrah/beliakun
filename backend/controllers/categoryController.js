const Category = require("../models/categoryModel");
const fs = require("fs");
const path = require("path");

// GET all categories
exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.findAll({ order: [["id", "DESC"]] });
        res.json({ categories });
        console.log("Berhasil mendapatkan data kategori");
        console.log(categories);
    } catch (err) {
        res.status(500).json({
            message: "Gagal mendapatkan data kategori",
            error: err.message,
        });
    }
};

// GET single category
exports.getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await Category.findByPk(id);
        if (!category)
            return res
                .status(404)
                .json({ message: "Kategori tidak ditemukan" });
        res.json(category);
    } catch (err) {
        res.status(500).json({
            message: "Gagal mendapatkan kategori",
            error: err.message,
        });
    }
};

// CREATE category
exports.createCategory = async (req, res) => {
    try {
        const { label } = req.body;
        if (!label) return res.status(400).json({ message: "Label wajib diisi" });

        let gambar = null;
        if (req.file) {
            gambar = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
        }

        const category = await Category.create({
            label,
            gambar,
        });

        res.status(200).json({ message: "Kategori berhasil dibuat", category });
    } catch (err) {
        res.status(500).json({
            message: "Gagal membuat kategori",
            error: err.message,
        });
    }
};

// UPDATE category
exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { label } = req.body;

        const category = await Category.findByPk(id);
        if (!category)
            return res.status(404).json({ message: "Kategori tidak ditemukan" });

        let gambar = category.gambar;
        if (req.file) {
            if (gambar && gambar.startsWith(req.protocol)) {
                const filename = gambar.split("/uploads/")[1];
                const filePath = path.join(__dirname, "..", "uploads", filename);
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            }
            gambar = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
        }

        await category.update({
            label: label ?? category.label,
            gambar,
        });

        res.json({ message: "Kategori berhasil diupdate", category });
    } catch (err) {
        res.status(500).json({
            message: "Gagal mengupdate kategori",
            error: err.message,
        });
    }
};

// DELETE category
exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await Category.findByPk(id);
        if (!category)
            return res.status(404).json({ message: "Kategori tidak ditemukan" });

        if (category.gambar && category.gambar.includes("/uploads/")) {
            const filename = category.gambar.split("/uploads/")[1];
            const filePath = path.join(__dirname, "..", "uploads", filename);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }

        await category.destroy();
        res.json({ message: "Kategori berhasil dihapus" });
    } catch (err) {
        res.status(500).json({
            message: "Gagal menghapus kategori",
            error: err.message,
        });
    }
};

