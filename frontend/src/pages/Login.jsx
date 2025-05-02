import { useEffect, useState } from "react";
import { login } from "../services/authService";
import useUserStore from "../../store/userStore";
import { useNavigate } from "react-router-dom";
import Notif from "../components/Notif";
import useNotifStore from "../../store/notifStore";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useTranslation } from "react-i18next";

const Login = () => {
    const { t } = useTranslation();
    const [form, setForm] = useState({ email: "", password: "" });
    const [message, setMessage] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const { setNama, setEmail, setUsername, setToken, setRole } =
        useUserStore();
    const navigate = useNavigate();
    const { setNotif } = useNotifStore(); // Ambil setNotif dari store
    const { teks, show } = useNotifStore(); // Ambil teks dan show dari store

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await login(form);
            if (response.status !== 200) {
                setMessage(response.message);
                setNotif(response.message); // Menampilkan notifikasi error
                return;
            }
            setNama(response.data.username);
            setEmail(response.data.email);
            setUsername(response.data.username);
            setToken(response.data.token);
            setRole(response.data.role);
            setMessage(t("login_success"));

            setNotif(t("login_success")); // Menampilkan notifikasi sukses
            navigate("/");
        } catch (err) {
            console.error(err);
            setMessage(t("login_failed"));
            setNotif(t("login_failed")); // Menampilkan notifikasi gagal
        }
    };

    useEffect(() => {
        if (teks) {
            setTimeout(() => {
                setNotif(""); // Menghapus teks notifikasi setelah 3 detik
            }, 3000);
        }
    }, [teks, setNotif]);

    return (
        <>
            <Notif teks={teks} show={show} />
            <div className="signup-container">
                <div className="form-box">
                    <h2 className="title">{t("login")}</h2>
                    <form onSubmit={handleSubmit} className="form">
                        <input
                            type="email"
                            name="email"
                            placeholder={t("email")}
                            value={form.email}
                            onChange={handleChange}
                            required
                        />

                        <div className="input-password">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder={t("password")}
                                value={form.password}
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

                        <button className="btn kotak" type="submit">
                            {t("login")}
                        </button>
                        <p className="signup-link">
                            {t("dont_have_account")}{" "}
                            <a href="/signup">{t("sign_up")}</a>
                        </p>
                    </form>
                    {message && <p className="error-msg">{message}</p>}
                </div>
            </div>
        </>
    );
};

export default Login;
