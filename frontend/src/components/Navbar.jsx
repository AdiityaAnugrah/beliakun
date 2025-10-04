import { Link, useLocation, useNavigate } from "react-router-dom";
import { Img } from "react-image";
import { useState, useEffect, useRef } from "react";
import useUserStore from "../../store/userStore";
import useCartStore from "../../store/cartStore";
import useWishlistStore from "../../store/wishlistStore";
import useNotifStore from "../../store/notifStore";
import "../styles/Navbar.scss";

import { FaPowerOff, FaShoppingCart, FaHeart, FaHistory, FaUser } from "react-icons/fa";
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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // theme on scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = () => setDropdownOpen((p) => !p);

  const handleLogout = async () => {
    await logout(user.token);
    user.emptyUser();
    setCart([]);
    setNotif(t("logout_successful"));
    navigate("/login");
  };

  const changeLanguage = (lang) => i18n.changeLanguage(lang);

  const cartCount = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const wishCount = wishlist.length;

  return (
    <nav className={`nav ${scrolled ? "scrolled" : "top"}`}>
      <div className="navbar-container">
        <Link to="/" className="logo">
          <Img
            className="logo-web"
            src={scrolled ? "/logo-dark.svg?v=2" : "/logo-light.svg?v=2"}
            alt="Logo"
          />
        </Link>

        {/* DESKTOP MENU */}
        <ul className="menu-right">
          {user.token ? (
            <>
              <li>
                <Link
                  to="/history"
                  className={location.pathname === "/history" ? "active" : ""}
                  title="History"
                >
                  <FaHistory />
                </Link>
              </li>

              <li className="relative">
                <Link to="/wishlist" title="Wishlist">
                  {wishCount > 0 && <span className="badge">{wishCount}</span>}
                  <FaHeart />
                </Link>
              </li>

              <li className="relative">
                <Link to="/cart" title="Cart">
                  {cartCount > 0 && <span className="badge">{cartCount}</span>}
                  <FaShoppingCart />
                </Link>
              </li>

              <li className="relative profile-menu" ref={dropdownRef}>
                <button
                  onClick={toggleDropdown}
                  className="profile-button"
                  aria-expanded={dropdownOpen ? "true" : "false"}
                  title={t("profile")}
                >
                  <FaUser />
                  {user.username}
                </button>
                {dropdownOpen && (
                  <div className="dropdown-menu">
                    <Link to="/profile" onClick={() => setDropdownOpen(false)}>
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
                >
                  {t("login")}
                </Link>
              </li>
              <li>
                <Link
                  to="/signup"
                  className={location.pathname === "/signup" ? "active" : ""}
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
              aria-label="Change language"
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
