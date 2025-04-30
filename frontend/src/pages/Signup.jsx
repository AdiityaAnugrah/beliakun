import { useState } from "react";
import { signup } from "../services/authService";
import { useNavigate } from "react-router-dom";
import useNotifStore from "../../store/notifStore";
import Tombol from "../components/Tombol";
import Turnstile from "react-turnstile";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Signup = () => {
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
        if (!isFormValid) {
            setMessage("Please fill in all fields correctly.");
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
            setMessage("Signup failed. Please try again.");
            console.log(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="signup-container">
            <div className="form-box">
                <h2 className="title">Create an Account</h2>
                <form onSubmit={handleSubmit} className="form">
                    <input
                        type="text"
                        name="nama"
                        placeholder="Full Name"
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="text"
                        name="username"
                        placeholder="Username"
                        onChange={handleChange}
                        required
                    />

                    <div className="input-password">
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="Password (min. 6 characters)"
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
                            Security Verification
                        </label>
                        <Turnstile
                            sitekey="0x4AAAAAABB8oU7Lk-20BkvF"
                            onVerify={(token) => setCaptchaToken(token)}
                        />
                    </div>

                    <Tombol
                        text={isSubmitting ? "Registering..." : "Sign Up"}
                        style="kotak"
                        type="submit"
                        disabled={!isFormValid || isSubmitting}
                    />

                    <p className="login-link">
                        Already have an account?{" "}
                        <a href="/login">Log in here</a>
                    </p>
                </form>
                {message && <p className="error-msg">{message}</p>}
            </div>
        </div>
    );
};

export default Signup;
