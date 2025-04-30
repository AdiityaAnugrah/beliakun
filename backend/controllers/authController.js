// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";
// import { User } from "../models/index.js";
const fetch = require("node-fetch");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel.js");

const registerUser = async (req, res) => {
    const { nama, email, username, password, captchaToken } = req.body;

    if (!captchaToken) {
        return res.status(400).json({ message: "Captcha token is required" });
    }

    try {
        // ✅ Verifikasi ke Cloudflare Turnstile
        const verifyRes = await fetch(
            "https://challenges.cloudflare.com/turnstile/v0/siteverify",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({
                    secret: "0x4AAAAAABB8oWZLC_bnyE_OtR6xkzDyUpA",
                    response: captchaToken,
                }),
            }
        );

        const verifyData = await verifyRes.json();

        if (!verifyData.success) {
            return res
                .status(403)
                .json({ message: "Captcha verification failed" });
        }

        // ✅ Lanjut buat user jika belum terdaftar
        const existing = await User.findOne({ where: { email } });
        if (existing) {
            return res.status(400).json({ message: "Email already exists" });
        }

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
                role: user.role,
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
    try {
        const userCurrent = req.user;
        console.log("ini usef current");
        console.log(userCurrent);
        await User.update(
            { token: "" },
            { where: { email: userCurrent.email } }
        );
        res.status(200).json({ message: "Logout successful" });
    } catch (error) {
        console.error("Logout error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = { registerUser, loginUser, logout };
