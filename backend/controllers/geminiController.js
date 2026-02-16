const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const Product = require("../models/productModel.js");
const { Op } = require("sequelize");

// Fungsi ringkas deskripsi
const ringkas = (teks, max = 100) =>
    !teks ? "" : teks.length > max ? teks.substring(0, max) + "..." : teks;

exports.geminiChat = async (req, res) => {
    try {
        if (!GEMINI_API_KEY) {
            return res
                .status(500)
                .json({ reply: "API Key Gemini tidak ditemukan." });
        }

        const { message, history = [], language = "en" } = req.body;
        if (!message || message.trim() === "") {
            return res.status(400).json({ reply: "Pesan tidak boleh kosong." });
        }
        const LIMIT_PRODUK = 5;
        let products = [];
        let where = { status: "dijual" };
        const keywords = [
            "mobile legends",
            "steam",
            "pubg",
            "mlbb",
            "game",
            "akun",
            "akun premium",
            "akun game",
            "cheat",
        ];

        for (const key of keywords) {
            if (message.toLowerCase().includes(key)) {
                where.nama = { [Op.like]: `%${key}%` };
                break;
            }
        }

        if (!where.nama) {
            products = await Product.findAll({
                where,
                order: [["createdAt", "DESC"]],
                limit: LIMIT_PRODUK,
            });
        } else {
            products = await Product.findAll({
                where,
                limit: LIMIT_PRODUK,
            });
        }
        let productListText =
            language === "en"
                ? "Here are the digital products/tools currently available at BeliAkun:\n"
                : "Berikut adalah produk digital/tools yang tersedia di BeliAkun:\n";

        if (!products || products.length === 0) {
            productListText +=
                language === "en"
                    ? "Currently, there are no products matching your search.\n"
                    : "Saat ini belum ada produk yang sesuai dengan pencarianmu.\n";
        } else {
            products.forEach((p, idx) => {
                productListText += `${idx + 1}. ${
                    p.nama
                } - Rp${p.harga.toLocaleString("id-ID")}\n`;
                productListText +=
                    language === "en"
                        ? `Stock: ${p.stock}\n`
                        : `Stok: ${p.stock}\n`;
                productListText +=
                    language === "en"
                        ? `Description: ${ringkas(p.deskripsi)}\n\n`
                        : `Deskripsi: ${ringkas(p.deskripsi)}\n\n`;
            });
        }
        let bahasaInfo = "";
        if (language === "en") {
            bahasaInfo =
                "ALWAYS answer ONLY in English. Use clear, simple English. NEVER use Indonesian, even if the user's message is in Indonesian.";
        } else {
            bahasaInfo =
                "Jawab SELALU dalam Bahasa Indonesia yang sopan dan jelas. Jangan gunakan bahasa Inggris, meskipun pesan user menggunakan bahasa Inggris.";
        }

        const initialContext = `
${bahasaInfo}

Kamu adalah asisten untuk website BeliAkun, toko digital yang menjual berbagai produk digital & tools gamers, seperti akun premium, cheat, dsb.
Jawab semua pertanyaan user SEAKURAT mungkin berdasarkan info dan daftar produk berikut.
Jika user bertanya produk spesifik, jawab berdasarkan daftar produk.
Jika user tanya tentang website, cara order, pembayaran, dsb, jawab dengan ramah dan jelas.
Jika user tanya produk yang tidak ada di daftar, jawab tidak tersedia & sarankan ke WhatsApp https://wa.me/+254776837641.

${productListText}
`;

        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        
        // Helper function to generate content with fallback
        const generateWithFallback = async (modelName, contents) => {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent({ contents });
                return await result.response;
            } catch (error) {
                // If 429 or 503, try fallback model
                if ((error.status === 429 || error.status === 503) && modelName !== "gemini-1.5-flash") {
                    console.warn(`⚠️ Gemini ${modelName} hit rate limit/error. Switching to fallback (gemini-1.5-flash)...`);
                    return await generateWithFallback("gemini-1.5-flash", contents);
                }
                throw error;
            }
        };

        const contents = [
            { role: "user", parts: [{ text: initialContext }] },
            ...history.map((msg) => ({
                role:
                    msg.role === "gemini" || msg.role === "bot"
                        ? "model"
                        : "user",
                parts: [{ text: msg.text }],
            })),
            { role: "user", parts: [{ text: message }] },
        ];

        // Try with primary model (gemini-2.0-flash), fallback to 1.5-flash if needed
        const response = await generateWithFallback("gemini-2.0-flash", contents);
        const text = response.text();

        res.json({ reply: text });
    } catch (err) {
        console.error("Error Gemini:", err);
        // User-friendly error message for rate limits
        if (err.status === 429) {
            return res.status(429).json({ reply: "Maaf, server AI sedang sibuk. Silakan coba lagi nanti." });
        }
        res.status(500).json({ reply: "Error di server Gemini!" });
    }
};
