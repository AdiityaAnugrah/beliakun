// src/components/Verify.jsx

import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { verify, updateEmail } from "../services/authService";
import useNotifStore from "../../store/notifStore";
import { FiX, FiEdit2 } from "react-icons/fi";
import { useTranslation } from "react-i18next";

const Verify = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { setNotif } = useNotifStore();
    const location = useLocation();

    // Ambil email awal dari state (dikirim dari Signup)
    const initialEmail = location.state?.email || "";
    const [emailKirim, setEmailKirim] = useState(initialEmail);

    // State OTP dan verifikasi
    const [codes, setCodes] = useState(["", "", "", "", "", ""]);
    const [message, setMessage] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);

    // State untuk edit email
    const [isEditing, setIsEditing] = useState(false);
    const [emailInput, setEmailInput] = useState(emailKirim);
    const [editError, setEditError] = useState("");

    // Countdown timer (dalam detik)
    const [secondsLeft, setSecondsLeft] = useState(180);

    // Refs untuk masing-masing kotak OTP
    const inputRefs = useRef([]);

    // Jika user membuka /verify tanpa email di state, redirect ke /register
    useEffect(() => {
        if (!initialEmail) {
            navigate("/register");
        }
    }, [initialEmail, navigate]);

    // Jalankan countdown timer
    useEffect(() => {
        if (secondsLeft <= 0) return;
        const timer = setInterval(() => {
            setSecondsLeft((s) => s - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [secondsLeft]);

    // Masking email (misal: jo*****@mail.com)
    const maskEmail = (email) => {
        const [local, domain] = email.split("@");
        if (!local || !domain) return email;
        const keep = Math.max(1, Math.floor(local.length / 3));
        const masked =
            local.substring(0, keep) + "*".repeat(local.length - keep);
        return `${masked}@${domain}`;
    };

    // Handle perubahan karakter di kotak OTP
    const handleChange = (e, idx) => {
        const val = e.target.value;
        if (!/^[0-9]?$/.test(val)) return;
        const newCodes = [...codes];
        newCodes[idx] = val;
        setCodes(newCodes);
        if (val && idx < 5) {
            inputRefs.current[idx + 1].focus();
        }
        if (newCodes.every((c) => c !== "")) {
            handleSubmitOTP(newCodes.join(""));
        }
    };

    // Handle backspace agar pindah ke kotak sebelumnya jika kosong
    const handleKeyDown = (e, idx) => {
        if (e.key === "Backspace" && codes[idx] === "" && idx > 0) {
            inputRefs.current[idx - 1].focus();
        }
    };

    // Submit OTP untuk verifikasi
    const handleSubmitOTP = async (otpCode) => {
        setMessage("");
        setIsVerifying(true);
        try {
            const res = await verify({ email: emailKirim, code: otpCode });
            if (res.status !== 200) {
                setMessage(
                    res.message || t("verify_failed") || "Verification failed."
                );
                setIsVerifying(false);
                setCodes(["", "", "", "", "", ""]);
                inputRefs.current[0].focus();
                return;
            }
            setNotif(
                res.message ||
                    t("verify_success") ||
                    "Email verified successfully."
            );
            setTimeout(() => navigate("/login"), 1500);
        } catch (err) {
            console.error(err);
            setMessage(t("verify_failed") || "Verification failed. Try again.");
            setIsVerifying(false);
        }
    };

    // Resend kode (reset timer)
    const handleResend = () => {
        setSecondsLeft(180);
        setMessage("");
        // Jika backend menyediakan endpoint resend, panggil di sini:
        // await resendCode({ email: emailKirim });
    };

    // Simpan perubahan email baru
    const handleSaveEmail = async () => {
        setEditError("");
        if (!emailInput.trim()) {
            setEditError("Email cannot be empty.");
            return;
        }
        if (emailInput === emailKirim) {
            setIsEditing(false);
            return;
        }
        try {
            const res = await updateEmail({
                oldEmail: emailKirim,
                newEmail: emailInput,
            });
            if (res.status !== 200) {
                setEditError(res.message || "Failed to update email.");
                return;
            }
            // Berhasil: perbarui emailKirim, reset OTP + timer
            setEmailKirim(res.newEmail);
            setCodes(["", "", "", "", "", ""]);
            inputRefs.current[0].focus();
            setSecondsLeft(180);
            setIsEditing(false);
            setNotif(res.message);
        } catch (err) {
            console.error(err);
            setEditError("Server error. Try again.");
        }
    };

    return (
        <div className="verify-container">
            {/* Tombol Close */}
            <button
                className="close-btn"
                onClick={() => navigate("/register")}
                aria-label="Close"
            >
                <FiX size={24} />
            </button>

            <div className="form-box">
                <h2 className="title">{t("verification") || "Verification"}</h2>

                {/* Baris email dengan tombol edit */}
                <div className="email-row">
                    <span>
                        {t("enter_otp_sent_to") ||
                            "Please enter the code sent to"}{" "}
                        <strong>{maskEmail(emailKirim)}</strong>
                    </span>
                    <button
                        className="edit-email-btn"
                        onClick={() => {
                            setIsEditing(true);
                            setEmailInput(emailKirim);
                            setEditError("");
                        }}
                        title="Edit Email"
                    >
                        <FiEdit2 />
                    </button>
                </div>

                {/* Form Edit Email */}
                {isEditing && (
                    <div className="edit-email-container">
                        <input
                            type="email"
                            value={emailInput}
                            onChange={(e) => setEmailInput(e.target.value)}
                            placeholder={t("email") || "Email"}
                        />
                        <button onClick={handleSaveEmail}>
                            {t("save") || "Save"}
                        </button>
                        {editError && <p className="error-msg">{editError}</p>}
                    </div>
                )}

                {/* Input OTP 6 digit */}
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

                {/* Resend / Countdown */}
                <div
                    className={`resend-text ${
                        secondsLeft > 0 ? "disabled" : "enabled"
                    }`}
                >
                    {secondsLeft > 0 ? (
                        <span>
                            {t("please_wait") || "Please wait"}{" "}
                            <strong>{secondsLeft}</strong>{" "}
                            {t("seconds_to_resend") || "seconds to resend"}
                        </span>
                    ) : (
                        <button className="resend-btn" onClick={handleResend}>
                            {t("resend_code") || "Resend Code"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Verify;
