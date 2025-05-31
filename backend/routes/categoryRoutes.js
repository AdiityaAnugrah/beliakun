const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const multer = require("multer");

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"),
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, ""));
    },
});
const upload = multer({ storage });

router.get("/", categoryController.getCategories);
router.get("/:id", categoryController.getCategoryById);
router.post("/", upload.single("image"), categoryController.createCategory);
router.put("/:id", upload.single("image"), categoryController.updateCategory);
router.delete("/:id", categoryController.deleteCategory);

module.exports = router;
