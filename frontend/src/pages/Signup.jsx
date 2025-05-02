import { useState } from "react";
import { signup } from "../services/authService";
import { useNavigate } from "react-router-dom";
import useNotifStore from "../../store/notifStore";
import Tombol from "../components/Tombol";
import Turnstile from "react-turnstile";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useTranslation } from "react-i18next"; // Import hook useTranslation

const Signup = () => {
    const { t } = useTranslation(); // Menggunakan hook useTranslation untuk akses teks yang diterjemahkan
    const { setNotif } = useNotifStore();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        nama: "",
        email: "",
        username: "",
        password: "",
    });
    const [message, setMessage] = useState("");
    const [captchaToken, setCaptchaToken] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Validasi form dan captchaToken
    const isFormValid =
        form.nama.trim() &&
        form.email.trim() &&
        form.username.trim() &&
        form.password.length >= 6 &&
        captchaToken;

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validasi dan pengecekan kesalahan
        if (!form.nama.trim()) {
            setMessage(t("name_required"));
            return;
        }
        if (!form.email.trim()) {
            setMessage(t("email_required"));
            return;
        }
        if (!form.username.trim()) {
            setMessage(t("username_required"));
            return;
        }
        if (form.password.length < 6) {
            setMessage(t("password_required"));
            return;
        }
        if (!captchaToken) {
            setMessage(t("captcha_required"));
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await signup({
                nama: form.nama,
                email: form.email,
                username: form.username,
                password: form.password,
                captchaToken,
            });

            if (res.status !== 200) {
                setMessage(res.message);
                setIsSubmitting(false);
                return;
            }

            setNotif(res.message);
            navigate("/login");
        } catch (err) {
            setMessage(t("signup_failed"));
            console.log(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="signup-container">
            <div className="form-box">
                <h2 className="title">{t("create_account")}</h2>
                <form onSubmit={handleSubmit} className="form">
                    <input
                        type="text"
                        name="nama"
                        placeholder={t("full_name")}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="email"
                        name="email"
                        placeholder={t("email")}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="text"
                        name="username"
                        placeholder={t("username")}
                        onChange={handleChange}
                        required
                    />

                    <div className="input-password">
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder={t("password")}
                            onChange={handleChange}
                            required
                        />
                        <span
                            className="toggle-password"
                            onClick={() => setShowPassword((prev) => !prev)}
                        >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </span>
                    </div>

                    <div className="mb-4 text-left">
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            {t("security_verification")}
                        </label>
                        <Turnstile
                            sitekey="0x4AAAAAABXrkQIeIGbuJene"
                            onVerify={(token) => setCaptchaToken(token)}
                        />
                    </div>

                    <Tombol
                        text={
                            isSubmitting
                                ? "Registering..."
                                : t("create_account")
                        }
                        style="kotak"
                        type="submit"
                        disabled={!isFormValid || isSubmitting}
                    />

                    <p className="login-link">
                        {t("already_have_account")}{" "}
                        <a href="/login">{t("login_here")}</a>
                    </p>
                </form>
                {message && <p className="error-msg">{message}</p>}
            </div>
        </div>
    );
};

export default Signup;
