// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";
// import { User } from "../models/index.js";
const crypto = require("crypto");
const fetch = require("node-fetch");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel.js");

const SECRET_KEY = "0x4AAAAAABXrkULWnDa5SdueNc1uZEGBHhk";

const registerUser = async (req, res) => {
    const { nama, email, username, password, captchaToken } = req.body;

    if (!captchaToken) {
        return res.status(400).json({ message: "Captcha token is required" });
    }

    try {
        // Ambil IP address pengguna dari header
        const ip =
            req.headers["x-forwarded-for"] || req.connection.remoteAddress;

        const formData = new URLSearchParams();
        formData.append("secret", SECRET_KEY);
        formData.append("response", captchaToken);
        formData.append("remoteip", ip);
        const idempotencyKey = crypto.randomUUID();
        formData.append("idempotency_key", idempotencyKey);

        // Verifikasi Captcha dengan Cloudflare Turnstile
        const verifyRes = await fetch(
            "https://challenges.cloudflare.com/turnstile/v0/siteverify",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: formData,
            }
        );

        const verifyData = await verifyRes.json();
        console.log("Cloudflare Verification Data:", verifyData); // Debugging

        // Jika verifikasi gagal
        if (!verifyData.success) {
            return res
                .status(403)
                .json({ message: "Captcha verification failed" });
        }

        // Cek apakah user sudah ada
        const existing = await User.findOne({ where: { email } });
        if (existing) {
            return res.status(400).json({ message: "Email already exists" });
        }

        // Hash password dan simpan user baru
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({
            nama,
            email,
            username,
            password: hashedPassword,
        });

        return res
            .status(200)
            .json({ message: "User registered successfully" });
    } catch (error) {
        console.error("Register error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;
    console.log(req.body);
    try {
        const user = await User.findOne({
            where: { email: email },
        });
        console.log(user);
        if (!user) {
            return res
                .status(400)
                .json({ message: "User not found || Email not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid password" });
        }

        const token = jwt.sign(
            {
                nama: user.nama,
                username: user.username,
                email: user.email,
            },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        await User.update({ token }, { where: { id: user.id } });

        res.status(200).json({
            message: "Login successful",
            data: {
                token,
                nama: user.nama,
                username: user.username,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

const logout = async (req, res) => {
    const token = req.header("Authorization").replace("Bearer ", "");
    const user = await User.findOne({ where: { token: token } });
    try {
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }
        await User.update({ token: null }, { where: { id: user.id } });
        res.status(200).json({ message: "Logout successful" });
    } catch (error) {
        console.error("Logout error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = { registerUser, loginUser, logout };
