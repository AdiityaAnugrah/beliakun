// controllers/bennerHomeController.js
const db = require("../models");
const BennerHome = db.BennerHome;

// GET semua banner
exports.getBanners = async (req, res) => {
    try {
        const banners = await BennerHome.findAll({
            order: [["urutan", "ASC"]],
        });
        res.json(banners);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// POST tambah banner, support upload file atau url
exports.createBannerWithFile = async (req, res) => {
    try {
        const { nama, tipe_media, deskripsi, urutan, active } = req.body;
        let media_url = req.body.media_url;
        if (req.file) {
            media_url = `/uploads/${req.file.filename}`;
        }
        const banner = await BennerHome.create({
            nama,
            tipe_media,
            media_url,
            deskripsi,
            urutan,
            active,
        });
        res.json(banner);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// PUT update banner, support ganti data/link/file
exports.updateBanner = async (req, res) => {
    try {
        const banner = await BennerHome.findByPk(req.params.id);
        if (!banner) return res.status(404).json({ error: "Not found" });

        let media_url = req.body.media_url;
        if (req.file) {
            media_url = `/uploads/${req.file.filename}`;
        }

        await banner.update({
            nama: req.body.nama || banner.nama,
            tipe_media: req.body.tipe_media || banner.tipe_media,
            media_url: media_url || banner.media_url,
            deskripsi: req.body.deskripsi || banner.deskripsi,
            urutan: req.body.urutan ?? banner.urutan,
            active: req.body.active ?? banner.active,
        });
        res.json(banner);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// DELETE hapus banner
exports.deleteBanner = async (req, res) => {
    try {
        const banner = await BennerHome.findByPk(req.params.id);
        if (!banner) return res.status(404).json({ error: "Not found" });
        await banner.destroy();
        res.json({ message: "Deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
