import { useEffect, useState } from "react";
import { login } from "../services/authService";
import useUserStore from "../../store/userStore";
import { useNavigate } from "react-router-dom";
import Notif from "../components/Notif";
import useNotifStore from "../../store/notifStore";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Login = () => {
    const [form, setForm] = useState({ email: "", password: "" });
    const [message, setMessage] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const { setNama, setEmail, setUsername, setToken, setRole } =
        useUserStore();
    const navigate = useNavigate();
    const { teks, show, showNotif } = useNotifStore();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await login(form);
            if (response.status !== 200) {
                setMessage(response.message);
                return;
            }
            setNama(response.data.username);
            setEmail(response.data.email);
            setUsername(response.data.username);
            setToken(response.data.token);
            setRole(response.data.role);
            setMessage("Login success!");
            navigate("/");
        } catch (err) {
            console.error(err);
            setMessage("Login failed. Please try again.");
        }
    };

    useEffect(() => {
        if (teks) showNotif();
    }, []);

    return (
        <>
            <Notif teks={teks} show={show} />
            <div className="signup-container">
                <div className="form-box">
                    <h2 className="title">Login to Your Account</h2>
                    <form onSubmit={handleSubmit} className="form">
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={form.email}
                            onChange={handleChange}
                            required
                        />

                        <div className="input-password">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="Password"
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
                            Login
                        </button>
                        <p className="signup-link">
                            Don’t have an account? <a href="/signup">Sign up</a>
                        </p>
                    </form>
                    {message && <p className="error-msg">{message}</p>}
                </div>
            </div>
        </>
    );
};

export default Login;
