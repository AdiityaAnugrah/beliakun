const Category = require("../models/categoryModel");
const fs = require("fs");
const path = require("path");

// GET all categories
exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.findAll({ order: [["id", "DESC"]] });
        res.json({ categories });
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
        const { nama, label } = req.body;
        if (!nama || !label)
            return res
                .status(400)
                .json({ message: "Nama dan label wajib diisi" });

        let gambar = null;
        if (req.file) {
            gambar = `${req.protocol}://${req.get("host")}/uploads/${
                req.file.filename
            }`;
        }

        const category = await Category.create({
            nama,
            label,
            gambar,
        });

        res.status(201).json({ message: "Kategori berhasil dibuat", category });
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
        const { nama, label } = req.body;

        const category = await Category.findByPk(id);
        if (!category)
            return res
                .status(404)
                .json({ message: "Kategori tidak ditemukan" });

        // Hapus gambar lama jika ada file baru diupload
        let gambar = category.gambar;
        if (req.file) {
            if (gambar && gambar.startsWith(req.protocol)) {
                // extract filename
                const filename = gambar.split("/uploads/")[1];
                const filePath = path.join(
                    __dirname,
                    "..",
                    "uploads",
                    filename
                );
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            }
            gambar = `${req.protocol}://${req.get("host")}/uploads/${
                req.file.filename
            }`;
        }

        await category.update({
            nama: nama ?? category.nama,
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
            return res
                .status(404)
                .json({ message: "Kategori tidak ditemukan" });

        // Hapus file gambar dari server jika ada
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
