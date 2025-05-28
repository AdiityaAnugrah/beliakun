const express = require("express");
const router = express.Router();
const { chatGptChat } = require("../controllers/chatgptController");

router.post("/chatgpt-chat", chatGptChat);

module.exports = router;
