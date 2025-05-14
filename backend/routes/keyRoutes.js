const router = require("express").Router();

const {
    getAllKeys,
    getKeyById,
    posKey,
    createKeyForUser,
    verifikasiCaptcha,
} = require("../controllers/keyController.js");
const { filterAdmin } = require("./filterAuth.js");

router.get("/", filterAdmin, getAllKeys);
router.get("/:id", getKeyById);
router.post("/", posKey);
router.post("/create-key", createKeyForUser);
router.post("/verifikasi-captcha", verifikasiCaptcha);

module.exports = router;
