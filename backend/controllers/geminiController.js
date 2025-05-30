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

        const { message, history = [] } = req.body;
        if (!message || message.trim() === "") {
            return res.status(400).json({ reply: "Pesan tidak boleh kosong." });
        }

        // Limit produk, misal 7
        const LIMIT_PRODUK = 5;

        // 1. Query produk berdasarkan kata kunci di pesan user
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

        // 2. Ringkasan produk (deskripsi diringkas max 100 karakter)
        let productListText =
            "Berikut adalah produk digital/tools yang tersedia di BeliAkun:\n";
        if (!products || products.length === 0) {
            productListText +=
                "Saat ini belum ada produk yang sesuai dengan pencarianmu.\n";
        } else {
            products.forEach((p, idx) => {
                productListText += `${idx + 1}. ${
                    p.nama
                } - Rp${p.harga.toLocaleString("id-ID")}\n`;
                productListText += `Stok: ${p.stock}\n`;
                productListText += `Deskripsi: ${ringkas(p.deskripsi)}\n\n`;
            });
        }

        // 3. Context website (TANPA PROMO)
        const initialContext = `
Kamu adalah asisten untuk website BeliAkun, toko digital yang menjual berbagai produk digital & tools gamers, seperti akun premium, cheat, dsb.
Jawab semua pertanyaan user SEAKURAT mungkin berdasarkan info dan daftar produk berikut.
Jika user bertanya produk spesifik, jawab berdasarkan daftar produk.
Jika user tanya tentang website, cara order, pembayaran, dsb, jawab dengan ramah dan jelas.
Jika user tanya produk yang tidak ada di daftar, jawab tidak tersedia & sarankan ke WhatsApp https://wa.me/+254776837641.

${productListText}
`;

        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

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

        const result = await model.generateContent({ contents });
        const response = await result.response;
        const text = response.text();

        res.json({ reply: text });
    } catch (err) {
        console.error("Error Gemini:", err);
        res.status(500).json({ reply: "Error di server Gemini!" });
    }
};
