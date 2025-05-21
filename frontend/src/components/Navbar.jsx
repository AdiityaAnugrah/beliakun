import { Link, useLocation, useNavigate } from "react-router-dom";
import { Img } from "react-image";
import { useState, useEffect } from "react";
import useUserStore from "../../store/userStore";
import useCartStore from "../../store/cartStore";
import useWishlistStore from "../../store/wishlistStore";
import useNotifStore from "../../store/notifStore";

import { FaPowerOff, FaShoppingCart, FaHeart } from "react-icons/fa";
import { FiMenu, FiX } from "react-icons/fi";

import { logout } from "../services/authService";
import { useTranslation } from "react-i18next";
import Tombol from "./Tombol";

const Navbar = () => {
    const { t, i18n } = useTranslation();
    const user = useUserStore();
    const { cart, setCart } = useCartStore();
    const { wishlist } = useWishlistStore();
    const { setNotif } = useNotifStore();
    const navigate = useNavigate();
    const location = useLocation();

    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const handleScroll = () => {
            if (isMounted) {
                setScrolled(window.scrollY > 50);
            }
        };

        window.addEventListener("scroll", handleScroll);

        return () => {
            isMounted = false;
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    const toggleMenu = () => setMenuOpen((prev) => !prev);
    const toggleDropdown = () => setDropdownOpen((prev) => !prev);

    const handleLogout = async () => {
        await logout(user.token);
        user.emptyUser();
        setCart([]);
        setNotif(t("logout_successful"));
        setMenuOpen(false);

        // Hindari state update setelah unmount
        setTimeout(() => {
            navigate("/login");
        }, 50);
    };

    const changeLanguage = (lang) => {
        i18n.changeLanguage(lang);
    };

    return (
        <nav className={`nav ${scrolled ? "scrolled" : "top"}`}>
            <div className="container mx-auto flex justify-between items-center px-4 py-3">
                <Link
                    to="/"
                    className="logo"
                    onClick={() => setMenuOpen(false)}
                >
                    <Img
                        className="logo-web"
                        src={scrolled ? "/logo-dark.svg" : "/logo-light.svg"}
                        alt="Logo"
                    />
                </Link>

                <button className="menu-toggle md:hidden" onClick={toggleMenu}>
                    {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                </button>

                <div className={`menu-container ${menuOpen ? "open" : ""}`}>
                    <ul className="menu-right">
                        {user.token ? (
                            <>
                                <li
                                    className="username"
                                    onClick={toggleDropdown}
                                >
                                    <span>
                                        {t("welcome")}, {user.username}
                                    </span>
                                    <div
                                        className={`dropdown-menu ${
                                            dropdownOpen ? "open" : ""
                                        }`}
                                    >
                                        <button
                                            className="btn-auth"
                                            onClick={handleLogout}
                                        >
                                            <FaPowerOff size={18} />
                                            {t("logout")}
                                        </button>
                                    </div>
                                </li>

                                {/* Wishlist Icon */}
                                <li>
                                    <Link
                                        to="/wishlist"
                                        className={
                                            location.pathname === "/wishlist"
                                                ? "active"
                                                : ""
                                        }
                                        style={{ position: "relative" }}
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        {wishlist.length > 0 && (
                                            <div
                                                style={{
                                                    right: "0",
                                                    top: "0",
                                                    fontSize: "12px",
                                                    position: "absolute",
                                                    backgroundColor: "#f7374f",
                                                    width: "20px",
                                                    height: "20px",
                                                    display: "flex",
                                                    justifyContent: "center",
                                                    alignItems: "center",
                                                    borderRadius: "50%",
                                                }}
                                            >
                                                {wishlist.length}
                                            </div>
                                        )}
                                        <Tombol
                                            style="polos"
                                            text=""
                                            icon={<FaHeart size={18} />}
                                        />
                                    </Link>
                                </li>

                                {/* Cart Icon */}
                                <li>
                                    <Link
                                        to="/cart"
                                        className={
                                            location.pathname === "/cart"
                                                ? "active"
                                                : ""
                                        }
                                        style={{ position: "relative" }}
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        {cart.length > 0 && (
                                            <div
                                                style={{
                                                    right: "0",
                                                    top: "0",
                                                    fontSize: "12px",
                                                    position: "absolute",
                                                    backgroundColor: "red",
                                                    width: "20px",
                                                    height: "20px",
                                                    display: "flex",
                                                    justifyContent: "center",
                                                    alignItems: "center",
                                                    borderRadius: "50%",
                                                }}
                                            >
                                                {cart.reduce(
                                                    (prev, curr) =>
                                                        prev + curr.quantity,
                                                    0
                                                )}
                                            </div>
                                        )}
                                        <Tombol
                                            style="polos"
                                            text=""
                                            icon={<FaShoppingCart size={18} />}
                                        />
                                    </Link>
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
                                        {t("login")}
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
                                        {t("signup")}
                                    </Link>
                                </li>
                            </>
                        )}
                        <li className="language-switcher">
                            <select
                                className="language-dropdown"
                                onChange={(e) => changeLanguage(e.target.value)}
                                value={i18n.language}
                            >
                                <option value="en">English</option>
                                <option value="id">Bahasa Indonesia</option>
                            </select>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
