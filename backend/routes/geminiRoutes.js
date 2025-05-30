const express = require("express");
const router = express.Router();
const { geminiChat } = require("../controllers/geminiController");

// Endpoint: POST /api/gemini-chat
router.post("/gemini-chat", geminiChat);

module.exports = router;
