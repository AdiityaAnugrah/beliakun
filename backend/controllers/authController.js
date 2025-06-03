// controllers/authController.js

require("dotenv").config(); // Pastikan memuat .env
const crypto = require("crypto");
const fetch = require("node-fetch");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../models/userModel.js");

const SECRET_KEY = "0x4AAAAAABXrkULWnDa5SdueNc1uZEGBHhk"; // Bisa diletakkan juga di .env jika diinginkan

// REGISTER: tambah verifikasiCode + kirim email
const registerUser = async (req, res) => {
    const { nama, email, username, password, captchaToken } = req.body;

    if (!captchaToken) {
        return res.status(400).json({ message: "Captcha token is required" });
    }

    try {
        // Ambil IP address pengguna (header atau connection)
        const ip =
            req.headers["x-forwarded-for"] || req.connection.remoteAddress;

        // Susun form data untuk verifikasi Turnstile
        const formData = new URLSearchParams();
        formData.append("secret", SECRET_KEY);
        formData.append("response", captchaToken);
        formData.append("remoteip", ip);
        const idempotencyKey = crypto.randomUUID();
        formData.append("idempotency_key", idempotencyKey);

        // Verifikasi Captcha ke Cloudflare Turnstile
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

        if (!verifyData.success) {
            return res
                .status(403)
                .json({ message: "Captcha verification failed" });
        }

        // Cek apakah email sudah terdaftar
        const existing = await User.findOne({ where: { email } });
        if (existing) {
            return res.status(400).json({ message: "Email already exists" });
        }

        const existingUsername = await User.findOne({ whare: { username } });
        if (existingUsername) {
            return res.status(400).json({ message: "Username already taken" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate verification code (6 digit)
        const verificationCode = Math.floor(
            100000 + Math.random() * 900000
        ).toString();

        // Simpan user baru dengan verificationCode dan isVerified = false
        await User.create({
            nama,
            email,
            username,
            password: hashedPassword,
            verificationCode,
            isVerified: false,
        });

        // Konfigurasi transporter Nodemailer (pakai kredensial .env)
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER, // misalnya: beliakunofficial@gmail.com
                pass: process.env.EMAIL_PASS, // misalnya: bbqgfdgaowvpnnjq (App Password)
            },
        });

        const mailOptions = {
            from: `"Account Verification" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Your Verification Code",
            text: `Hello ${nama},

            Thank you for registering. To activate your account, please copy the verification code below and enter it on the verification page of our application:

            ${verificationCode}

            Regards,
            Your Team
            `,
            html: `
                <div style="
                font-family: Arial, sans-serif;
                color: #333;
                line-height: 1.5;
                padding: 20px;
                ">
                <h2 style="color: #2c3e50; margin-bottom: 10px;">Account Verification</h2>
                <p>Hello <strong>${nama}</strong>,</p>
                <p>Thank you for registering. To activate your account, please copy the verification code below and paste it into the verification page of our application:</p>
                
                <div style="
                    background: #f4f4f4;
                    padding: 15px;
                    text-align: center;
                    border-radius: 6px;
                    margin: 20px 0;
                ">
                    <code style="
                    font-family: 'Courier New', Courier, monospace;
                    font-size: 24px;
                    letter-spacing: 4px;
                    display: inline-block;
                    user-select: all;
                    cursor: text;
                    ">${verificationCode}</code>
                </div>

                <p style="margin-top: 0; font-size: 14px; color: #555;">
                    How to copy:<br>
                    – Click once on the code above to highlight it in most email clients.<br>
                    – Press <strong>Ctrl + C</strong> (Windows/Linux) or <strong>Cmd + C</strong> (Mac) to copy.<br>
                    – Then paste the code into the verification field in our app.
                </p>
                
                <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">

                <p style="font-size: 14px; color: #555;">
                    If you did not request this, please ignore this email.<br>
                    Best regards,<br>
                    <em>Dev Beli Akun</em>
                </p>
                </div>
            `,
        };

        // Kirim email
        await transporter.sendMail(mailOptions);

        // Respon tetap 200, tapi user harus verifikasi
        return res.status(200).json({
            message:
                "User registered successfully. Please check your email for the verification code.",
        });
    } catch (error) {
        console.error("Register error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

// LOGIN: tambahkan pengecekan isVerified
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res
                .status(400)
                .json({ message: "User not found || Email not found" });
        }

        // Pastikan sudah diverifikasi
        if (!user.isVerified) {
            return res
                .status(403)
                .json({ message: "Please verify your email first" });
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

        return res.status(200).json({
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
        return res.status(500).json({ message: "Server error" });
    }
};

// LOGOUT: tidak berubah
const logout = async (req, res) => {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    try {
        const user = await User.findOne({ where: { token } });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }
        await User.update({ token: null }, { where: { id: user.id } });
        return res.status(200).json({ message: "Logout successful" });
    } catch (error) {
        console.error("Logout error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

// VERIFY CODE: endpoint baru
const verifyCode = async (req, res) => {
    const { email, code } = req.body;
    try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: "Email already verified" });
        }

        if (user.verificationCode !== code) {
            return res
                .status(400)
                .json({ message: "Invalid verification code" });
        }

        // Jika kode cocok, set isVerified = true, hapus verificationCode
        user.isVerified = true;
        user.verificationCode = null;
        await user.save();

        return res.status(200).json({ message: "Email verified successfully" });
    } catch (error) {
        console.error("Verification error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

module.exports = {
    registerUser,
    loginUser,
    logout,
    verifyCode,
};
