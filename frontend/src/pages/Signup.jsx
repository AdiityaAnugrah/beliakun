import { useState } from "react";
import { signup } from "../services/authService";

const Signup = () => {
    const [form, setForm] = useState({
        nama: "",
        email: "",
        username: "",
        password: "",
    });
    const [message, setMessage] = useState("");

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await signup(form);
            setMessage("Signup successful! Please login.");
        } catch (err) {
            setMessage(err.message);
        }
    };

    return (
        <div>
            <h2>Signup</h2>
            <form onSubmit={handleSubmit}>
                <input
                    name="nama"
                    placeholder="Nama"
                    onChange={handleChange}
                    required
                />
                <input
                    name="email"
                    placeholder="Email"
                    onChange={handleChange}
                    required
                />
                <input
                    name="username"
                    placeholder="Username"
                    onChange={handleChange}
                    required
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    onChange={handleChange}
                    required
                />
                <button type="submit">Signup</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default Signup;
