const router = require("express").Router();
const {
    registerUser,
    loginUser,
    logout,
} = require("../controllers/authController.js");
const filterAuth = require("../routes/filterAuth.js");

// const router = express.Router();

router.post("/signup", registerUser);
router.post("/login", loginUser);
router.post("/logout", filterAuth, logout);

module.exports = router;
