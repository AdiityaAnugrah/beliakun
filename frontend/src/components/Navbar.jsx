import { Link, useLocation, useNavigate } from "react-router-dom";
import { Img } from "react-image";
import { useState, useEffect } from "react";
import useUserStore from "../../store/userStore";
import { FaPowerOff } from "react-icons/fa";
import { FiMenu, FiX } from "react-icons/fi";
import { logout } from "../services/authService";

const Navbar = () => {
    const user = useUserStore();
    const navigate = useNavigate();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const toggleMenu = () => setMenuOpen((prev) => !prev);

    const handleLogout = async () => {
        await logout(user.token);
        user.emptyUser();
        setMenuOpen(false);
        navigate("/login");
    };

    return (
        <nav className={`nav ${scrolled ? "scrolled" : "top"}`}>
            <div className="container mx-auto flex justify-between items-center px-4 py-3">
                {/* Logo */}
                <Link
                    to="/"
                    className="logo"
                    onClick={() => setMenuOpen(false)}
                >
                    <Img
                        src={scrolled ? "/logo-dark.svg" : "/logo-light.svg"}
                        alt="Logo"
                        width={150}
                        height={200}
                    />
                </Link>

                {/* Toggle */}
                <button className="menu-toggle md:hidden" onClick={toggleMenu}>
                    {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                </button>

                {/* Menu */}
                <div className={`menu-container ${menuOpen ? "open" : ""}`}>
                    <ul className="menu-right">
                        <li>
                            <Link
                                to="/about"
                                className={
                                    location.pathname === "/about"
                                        ? "active"
                                        : ""
                                }
                                onClick={() => setMenuOpen(false)}
                            >
                                About Us
                            </Link>
                        </li>

                        {user.token ? (
                            <>
                                <li className="username">
                                    <span>Welcome, {user.username}</span>
                                </li>
                                <li>
                                    <button
                                        className="btn-auth"
                                        onClick={handleLogout}
                                    >
                                        <FaPowerOff size={18} />
                                    </button>
                                </li>
                            </>
                        ) : (
                            <>
                                <li>
                                    <Link
                                        to="/login"
                                        className={
                                            location.pathname === "/login"
                                                ? "active"
                                                : ""
                                        }
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        Login
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/signup"
                                        className={
                                            location.pathname === "/signup"
                                                ? "active"
                                                : ""
                                        }
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        Signup
                                    </Link>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
