const fetch = require("node-fetch");
const dotenv = require("dotenv");
dotenv.config();

exports.chatGptChat = async (req, res) => {
    try {
        const OPENAI_API_KEY = process.env.BOT_API_KEY;
        if (!OPENAI_API_KEY) {
            return res
                .status(500)
                .json({ reply: "API Key OpenAI tidak ditemukan." });
        }

        const { message, history = [] } = req.body;
        if (!message || message.trim() === "") {
            return res.status(400).json({ reply: "Pesan tidak boleh kosong." });
        }

        // Format history untuk OpenAI: "bot" jadi "assistant"
        const messages = [
            ...history.map((turn) => ({
                role: turn.role === "bot" ? "assistant" : turn.role, // Hati2, frontend kirim "bot", OpenAI perlu "assistant"
                content: turn.text,
            })),
            { role: "user", content: message },
        ];

        const openaiRes = await fetch(
            "https://api.openai.com/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${OPENAI_API_KEY}`,
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo", // Ganti "gpt-4o" kalau punya akses
                    messages,
                    max_tokens: 1000,
                    temperature: 0.7,
                }),
            }
        );

        const data = await openaiRes.json();

        if (data.error) {
            return res.status(500).json({ reply: data.error.message });
        }

        const reply = data?.choices?.[0]?.message?.content;
        if (!reply) {
            return res.status(200).json({
                reply: "Maaf, Sistem kami sedang sibuk,coba sesaat lagi...",
            });
        }

        res.json({ reply });
    } catch (err) {
        console.error("Error ChatGPT:", err);
        res.status(500).json({ reply: "Error di server!" });
    }
};
