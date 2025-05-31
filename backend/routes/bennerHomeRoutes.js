// routes/bennerHomeRoutes.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const bennerHomeController = require("../controllers/bennerHomeController");

// Konfigurasi multer untuk upload file
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, Date.now() + ext);
    },
});
const upload = multer({ storage });

// GET semua banner
router.get("/", bennerHomeController.getBanners);

// POST tambah banner (support upload file)
router.post(
    "/",
    upload.single("media_file"),
    bennerHomeController.createBannerWithFile
);

// PUT update banner (support upload file baru)
router.put(
    "/:id",
    upload.single("media_file"),
    bennerHomeController.updateBanner
);

// DELETE hapus banner
router.delete("/:id", bennerHomeController.deleteBanner);

module.exports = router;
