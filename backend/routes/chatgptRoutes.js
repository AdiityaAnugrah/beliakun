const express = require("express");
const router = express.Router();
const { chatGptChat } = require("../controllers/chatgptController");

// ✅ SECURITY: Rate limit AI endpoints to prevent API abuse
const { aiLimiter } = require("../middleware/rateLimiter");

router.post("/chatgpt-chat", aiLimiter, chatGptChat);

module.exports = router;
