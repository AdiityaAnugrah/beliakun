const express = require("express");
const router = express.Router();
const {
    addProduct,
    getAllProducts,
    updateProduct,
    deleteProduct,
    getProductLaris,
} = require("../controllers/productController.js");
const { filterAdmin } = require("./filterAuth.js");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, Date.now() + ext);
    },
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
}).single("image");

router.post("/", filterAdmin, upload, addProduct);
router.get("/", getAllProducts);
router.get("/laris", getProductLaris);
router.get("/:id", getAllProducts);
router.put("/:id", filterAdmin, upload, updateProduct);
router.delete("/:id", filterAdmin, deleteProduct);

module.exports = router;
