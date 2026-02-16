const router = require("express").Router();
const {
    registerUser,
    loginUser,
    logout,
    verifyCode,
    updateEmail,
} = require("../controllers/authController.js");
const { filterAll } = require("./filterAuth.js");

// ✅ SECURITY: Import rate limiters
const { authLimiter, verifyLimiter } = require("../middleware/rateLimiter.js");

// ✅ SECURITY: Import input validation
const { authSchemas, validate } = require("../middleware/validator.js");

// Apply strict rate limiting AND input validation to prevent attacks
router.post("/signup", authLimiter, validate(authSchemas.register), registerUser);
router.post("/verify", verifyLimiter, validate(authSchemas.verify), verifyCode);
router.post("/update-email", authLimiter, validate(authSchemas.updateEmail), updateEmail);
router.post("/login", authLimiter, validate(authSchemas.login), loginUser);
router.post("/logout", filterAll, logout);

module.exports = router;
