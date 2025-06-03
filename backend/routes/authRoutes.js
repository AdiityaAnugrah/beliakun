const router = require("express").Router();
const {
    registerUser,
    loginUser,
    logout,
    verifyCode,
    updateEmail,
} = require("../controllers/authController.js");
const { filterAll } = require("./filterAuth.js");

// const router = express.Router();

router.post("/signup", registerUser);
router.post("/verify", verifyCode);
router.post("/update-email", updateEmail);
router.post("/login", loginUser);
router.post("/logout", filterAll, logout);

module.exports = router;
