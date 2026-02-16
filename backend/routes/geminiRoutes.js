const express = require("express");
const router = express.Router();
const { geminiChat } = require("../controllers/geminiController");

// ✅ SECURITY: Rate limit AI endpoints to prevent API abuse
const { aiLimiter } = require("../middleware/rateLimiter");

// Endpoint: POST /api/gemini-chat
router.post("/gemini-chat", aiLimiter, geminiChat);

module.exports = router;
