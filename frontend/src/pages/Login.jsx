import { useState } from "react";
import { login } from "../services/authService";
import useUserStore from "../../store/userStore";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const [form, setForm] = useState({ email: "", password: "" });
    const [message, setMessage] = useState("");
    const { setNama, setEmail, setUsername, setToken, setRole } =
        useUserStore();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await login(form);
            console.log(response);
            console.log(response.status);
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
            setMessage(err.message);
        }
    };

    return (
        <div>
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <input
                    name="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={handleChange}
                    required
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={handleChange}
                    required
                />
                <button type="submit">Login</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default Login;
