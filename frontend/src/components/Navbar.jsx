import { Link, useLocation, useNavigate } from "react-router-dom";
import { Img } from "react-image";
import { useState, useEffect, useRef } from "react";
import useUserStore from "../../store/userStore";
import useCartStore from "../../store/cartStore";
import useWishlistStore from "../../store/wishlistStore";
import useNotifStore from "../../store/notifStore";
import "../styles/Navbar.scss";

import {
  FaPowerOff,
  FaShoppingCart,
  FaHeart,
  FaHistory,
  FaUser,
} from "react-icons/fa";
import { FiMenu, FiX } from "react-icons/fi";

import { logout } from "../services/authService";
import { useTranslation } from "react-i18next";

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
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setDropdownOpen(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
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
    navigate("/login");
  };

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

  return (
    <nav className={`nav ${scrolled ? "scrolled" : "top"}`}>
      <div className="navbar-container">
        <Link to="/" className="logo" onClick={() => setMenuOpen(false)}>
          <Img
            className="logo-web"
            src={scrolled ? "/logo-dark.svg" : "/logo-light.svg"}
            alt="Logo"
          />
        </Link>

        <button className="menu-toggle" onClick={toggleMenu}>
          {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>

        <ul className={`menu-right ${menuOpen ? "open" : ""}`}>
          {user.token ? (
            <>
              <li>
                <Link
                  to="/history"
                  onClick={() => setMenuOpen(false)}
                  className={location.pathname === "/history" ? "active" : ""}
                >
                  <FaHistory />
                </Link>
              </li>

              <li className="relative">
                <Link to="/wishlist" onClick={() => setMenuOpen(false)}>
                  {wishlist.length > 0 && (
                    <span className="badge">{wishlist.length}</span>
                  )}
                  <FaHeart />
                </Link>
              </li>

              <li className="relative">
                <Link to="/cart" onClick={() => setMenuOpen(false)}>
                  {cart.length > 0 && (
                    <span className="badge">
                      {cart.reduce((sum, item) => sum + item.quantity, 0)}
                    </span>
                  )}
                  <FaShoppingCart />
                </Link>
              </li>
              
              <li className="relative profile-menu" ref={dropdownRef}>
                <button onClick={toggleDropdown} className="profile-button">
                  <FaUser />
                  {user.username}
                </button>
                {dropdownOpen && (
                  <div className="dropdown-menu">
                    <Link
                      to="/profile"
                      onClick={() => {
                        setDropdownOpen(false);
                        setMenuOpen(false);
                      }}
                    >
                      {t("profile")}
                    </Link>
                    <button onClick={handleLogout}>
                      <FaPowerOff />
                      {t("logout")}
                    </button>
                  </div>
                )}
              </li>
            </>
          ) : (
            <>
              <li>
                <Link
                  to="/login"
                  className={location.pathname === "/login" ? "active" : ""}
                  onClick={() => setMenuOpen(false)}
                >
                  {t("login")}
                </Link>
              </li>
              <li>
                <Link
                  to="/signup"
                  className={location.pathname === "/signup" ? "active" : ""}
                  onClick={() => setMenuOpen(false)}
                >
                  {t("signup")}
                </Link>
              </li>
            </>
          )}
          <li>
            <select
              className="language-dropdown"
              onChange={(e) => changeLanguage(e.target.value)}
              value={i18n.language}
            >
              <option value="en">EN</option>
              <option value="id">ID</option>
            </select>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
