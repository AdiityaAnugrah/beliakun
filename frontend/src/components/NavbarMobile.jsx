import React, { useMemo } from "react";
import { FaHome, FaShoppingCart, FaHeart, FaUserCircle } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import useUserStore from "../../store/userStore";
import useCartStore from "../../store/cartStore";
import useWishlistStore from "../../store/wishlistStore";

/**
 * NavbarMobile — modern bottom nav (mobile-first)
 * - Tidak mengubah flow/route yang sudah ada
 * - Aksesibel: role="navigation", aria-label, aria-current
 * - Badge jumlah wishlist & cart tetap
 */
const NavbarMobile = () => {
  const user = useUserStore();
  const { cart } = useCartStore();
  const { wishlist } = useWishlistStore();
  const location = useLocation();

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + (item.quantity || 0), 0),
    [cart]
  );
  const wishCount = wishlist.length;

  const path = location.pathname;
  const isActive = (key) => {
    if (key === "home") return path === "/";
    if (key === "wishlist") return path.startsWith("/wishlist");
    if (key === "cart") return path.startsWith("/cart");
    if (key === "profile") return path.startsWith("/profile");
    if (key === "login") return path.startsWith("/login");
    return false;
  };

  return (
    <nav
      className="nav-bottom-mobile"
      role="navigation"
      aria-label="Bottom Navigation"
    >
      {/* HOME */}
      <Link
        to="/"
        className={`nav-item ${isActive("home") ? "active" : ""}`}
        aria-current={isActive("home") ? "page" : undefined}
        title="Home"
      >
        <FaHome aria-hidden="true" />
        <span className="nav-label">Home</span>
      </Link>

      {/* WISHLIST */}
      <Link
        to="/wishlist"
        className={`nav-item ${isActive("wishlist") ? "active" : ""}`}
        aria-current={isActive("wishlist") ? "page" : undefined}
        title="Wishlist"
      >
        <FaHeart aria-hidden="true" />
        <span className="nav-label">Wishlist</span>
        {wishCount > 0 && (
          <span
            className="badge"
            aria-label={`${wishCount} items in wishlist`}
          >
            {wishCount > 99 ? "99+" : wishCount}
          </span>
        )}
      </Link>

      {/* CART */}
      <Link
        to="/cart"
        className={`nav-item ${isActive("cart") ? "active" : ""}`}
        aria-current={isActive("cart") ? "page" : undefined}
        title="Cart"
      >
        <FaShoppingCart aria-hidden="true" />
        <span className="nav-label">Cart</span>
        {cartCount > 0 && (
          <span className="badge" aria-label={`${cartCount} items in cart`}>
            {cartCount > 99 ? "99+" : cartCount}
          </span>
        )}
      </Link>

      {/* PROFILE / LOGIN */}
      {user.token ? (
        <Link
          to="/profile"
          className={`nav-item ${isActive("profile") ? "active" : ""}`}
          aria-current={isActive("profile") ? "page" : undefined}
          title="Profile"
        >
          <FaUserCircle aria-hidden="true" />
          <span className="nav-label">Profile</span>
        </Link>
      ) : (
        <Link
          to="/login"
          className={`nav-item ${isActive("login") ? "active" : ""}`}
          aria-current={isActive("login") ? "page" : undefined}
          title="Login"
        >
          <FaUserCircle aria-hidden="true" />
          <span className="nav-label">Login</span>
        </Link>
      )}
    </nav>
  );
};

export default NavbarMobile;
