// src/components/Verify.jsx

import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { verify } from "../services/authService";
import useNotifStore from "../../store/notifStore";
import { FiX } from "react-icons/fi"; // ikon close (X)
import { useTranslation } from "react-i18next";

const Verify = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { setNotif } = useNotifStore();
    const location = useLocation();

    // Ambil email dari state (dikirimkan dari Signup)
    const emailKirim = location.state?.email || "";

    // State untuk masing‐masing digit OTP (6 digit)
    const [codes, setCodes] = useState(["", "", "", "", "", ""]);
    // State untuk error message
    const [message, setMessage] = useState("");
    // State untuk loading verifikasi
    const [isVerifying, setIsVerifying] = useState(false);

    // Timer countdown (dalam detik). Contoh: 180 detik = 3 menit.
    const [secondsLeft, setSecondsLeft] = useState(180);

    // Refs untuk setiap input (agar bisa auto‐focus pindah)
    const inputRefs = useRef([]);

    // Jika user membuka /verify tanpa mengirimkan email di location.state, redirect ke register
    useEffect(() => {
        if (!emailKirim) {
            navigate("/register");
        }
    }, [emailKirim, navigate]);

    // Jalankan countdown: kurangi setiap detik hingga 0
    useEffect(() => {
        if (secondsLeft <= 0) return;

        const timer = setInterval(() => {
            setSecondsLeft((s) => s - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [secondsLeft]);

    // Fungsi untuk “mem‐mask” tampilan email (misal: dyh*****@mailscode.com)
    const maskEmail = (email) => {
        const [localPart, domain] = email.split("@");
        if (!localPart || !domain) return email;
        const visibleChars = Math.max(1, Math.floor(localPart.length / 3));
        const masked =
            localPart.substring(0, visibleChars) +
            "*".repeat(localPart.length - visibleChars);
        return `${masked}@${domain}`;
    };

    // Ketika user mengetik di salah satu kotak:
    const handleChange = (e, idx) => {
        const val = e.target.value;
        if (!/^[0-9]?$/.test(val)) return; // hanya angka 0‐9 atau kosong

        const newCodes = [...codes];
        newCodes[idx] = val;
        setCodes(newCodes);

        if (val && idx < inputRefs.current.length - 1) {
            // jika ada input & bukan kotak terakhir, pindah otomatis ke kotak berikutnya
            inputRefs.current[idx + 1].focus();
        }

        // Jika semua kotak terisi otomatis “submit”
        if (newCodes.every((c) => c !== "")) {
            handleSubmitOTP(newCodes.join(""));
        }
    };

    // Jika user menekan backspace di kotak kosong, pindah ke kotak sebelumnya
    const handleKeyDown = (e, idx) => {
        if (e.key === "Backspace" && codes[idx] === "" && idx > 0) {
            inputRefs.current[idx - 1].focus();
        }
    };

    // Fungsi submit OTP ketika 6 digit terisi
    const handleSubmitOTP = async (otpCode) => {
        setMessage("");
        setIsVerifying(true);
        try {
            const res = await verify({ email: emailKirim, code: otpCode });
            if (res.status !== 200) {
                setMessage(
                    res.message || t("verify_failed") || "Verifikasi gagal."
                );
                setIsVerifying(false);
                // Kosongkan semua kotak
                setCodes(["", "", "", "", "", ""]);
                inputRefs.current[0].focus();
                return;
            }
            setNotif(
                res.message || t("verify_success") || "Akun terverifikasi."
            );
            setTimeout(() => {
                navigate("/login");
            }, 1500);
        } catch (err) {
            console.error(err);
            setMessage(t("verify_failed") || "Verifikasi gagal. Coba lagi.");
            setIsVerifying(false);
        }
    };

    // Fungsi untuk resend kode (jika timer = 0)
    const handleResend = () => {
        // Contoh: logika ulang memanggil backend untuk resend kode
        // Untuk sekarang kita reset timer saja
        setSecondsLeft(180);
        setMessage("");
        // Jika ada endpoint resend di backend, panggil di sini:
        // await resendCode({ email: emailKirim });
    };

    return (
        <div className="verify-container">
            {/* Button Close (X) */}
            <button
                className="close-btn"
                onClick={() => navigate("/register")}
                aria-label="Close"
            >
                <FiX size={24} />
            </button>

            <div className="form-box">
                <h2 className="title">{t("verification") || "Verification"}</h2>
                <p className="subtext">
                    {t("enter_code")} <strong>{maskEmail(emailKirim)}</strong>
                </p>

                <div className="otp-inputs">
                    {codes.map((digit, idx) => (
                        <input
                            key={idx}
                            type="text"
                            maxLength="1"
                            className="otp-input"
                            value={digit}
                            ref={(el) => (inputRefs.current[idx] = el)}
                            onChange={(e) => handleChange(e, idx)}
                            onKeyDown={(e) => handleKeyDown(e, idx)}
                            disabled={isVerifying}
                        />
                    ))}
                </div>

                {message && <p className="error-msg">{message}</p>}

                <div
                    className={`resend-text ${
                        secondsLeft > 0 ? "disabled" : "enabled"
                    }`}
                >
                    {secondsLeft > 0 ? (
                        <span>
                            {t("please_wait") || "Mohon tunggu dalam"}{" "}
                            <strong>{secondsLeft}</strong>{" "}
                            {t("seconds_to_resend") ||
                                "detik untuk kirim ulang"}
                        </span>
                    ) : (
                        <button className="resend-btn" onClick={handleResend}>
                            {t("resend_code") || "Kirim Ulang"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Verify;
