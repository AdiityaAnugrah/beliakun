require("dotenv").config();
const Key = require("../models/keyModel.js");
const crypto = require("crypto");

const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY;

const getAllKeys = async (req, res) => {
    const keys = await Key.findAll();
    res.status(200).json(keys);
};

const getKeyById = async (req, res) => {
    const { id } = req.params;
    const key = await Key.findByPk(id);
    if (!key) {
        return res.status(404).json({ message: "Key not found" });
    }
    res.status(200).json(key);
};

const posKey = async (req, res) => {
    let { keys, durasi } = req.body;
    try {
        // Menyimpan hasil
        const skippedKeys = []; // Untuk mencatat key yang sudah ada (yang di-skip)
        const addedKeys = []; // Untuk mencatat key yang berhasil ditambahkan

        for (let i = 0; i < keys.length; i++) {
            const k = keys[i];

            // Cek apakah key sudah ada di database
            const existingKey = await Key.findOne({
                where: {
                    key: k, // Mencari key yang sama
                },
            });

            if (!existingKey) {
                // Jika key belum ada, maka buat key baru
                await Key.create({ key: k, durasi });
                addedKeys.push(k); // Tambahkan ke list key yang berhasil ditambahkan
            } else {
                // Jika key sudah ada, skip
                skippedKeys.push(k); // Tambahkan ke list key yang sudah ada
                console.log(`Key ${k} sudah ada di database. Skipping...`);
            }
        }

        // Mengirimkan response dengan informasi key yang berhasil ditambahkan dan yang di-skip
        res.status(200).json({
            message: "Sukses menambahkan key yang baru.",
            addedKeys,
            skippedKeys,
        });
    } catch (error) {
        console.error(error);
        // Jika terjadi kesalahan pada server
        res.status(500).json({
            message: "Gagal menambahkan key. Terjadi kesalahan di server.",
        });
    }
};

// Endpoint untuk membuat satu key baru dengan durasi 1 jam
const { Op } = require("sequelize");

const createKeyForUser = async (req, res) => {
    try {
        // Cek apakah ada key yang statusnya "aktif" dengan durasi 1 jam yang belum digunakan
        const availableKey = await Key.findOne({
            where: {
                status: "nonaktif",
                durasi: "1 jam",
            },
        });

        if (!availableKey) {
            return res.status(404).json({
                message: "Tidak ada key yang tersedia untuk diberikan.",
            });
        }
        availableKey.status = "aktif";
        await availableKey.save();

        return res.status(200).json({
            message: "Key berhasil diberikan",
            key: availableKey.key,
            durasi: availableKey.durasi,
        });
    } catch (error) {
        console.error("Error saat membuat key:", error);
        return res.status(500).json({ message: "Terjadi kesalahan" });
    }
};

const verifikasiCaptcha = async (req, res) => {
    const { token } = req.body;
    const ip = req.headers["cf-connecting-ip"];

    if (!token) {
        return res.status(400).json({ message: "Token tidak ditemukan." });
    }

    try {
        const formData = new URLSearchParams();
        formData.append("secret", TURNSTILE_SECRET_KEY);
        formData.append("response", token);
        formData.append("remoteip", ip);
        const idempotencyKey = crypto.randomUUID();
        formData.append("idempotency_key", idempotencyKey);

        const response = await fetch(
            "https://challenges.cloudflare.com/turnstile/v0/siteverify",
            {
                method: "POST",
                body: formData,
            }
        );

        const data = await response.json();
        console.log("ini hasil fetch verifikasi");
        console.log(data);

        if (response.status === 200 && data.success) {
            return res.status(200).json({ message: "Verifikasi berhasil!" });
        } else {
            return res.status(400).json({ message: "Verifikasi gagal." });
        }
    } catch (error) {
        console.error("Error verifying captcha:", error);
        return res
            .status(500)
            .json({ message: "Terjadi kesalahan pada server." });
    }
};

module.exports = {
    getAllKeys,
    getKeyById,
    posKey,
    createKeyForUser,
    verifikasiCaptcha,
};
