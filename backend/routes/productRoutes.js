const express = require("express");
const router = express.Router();
const {
    addProduct,
    getAllProducts,
    updateProduct,
    deleteProduct,
} = require("../controllers/productController.js");
const { filterAdmin } = require("./filterAuth.js");

router.post("/", filterAdmin, addProduct);
router.get("/", getAllProducts);
router.put("/:id", filterAdmin, updateProduct);
router.delete("/:id", filterAdmin, deleteProduct);

module.exports = router;
