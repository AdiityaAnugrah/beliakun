import { FaHome, FaShoppingCart, FaHeart, FaUserCircle } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import useUserStore from "../../store/userStore";
import useCartStore from "../../store/cartStore";
import useWishlistStore from "../../store/wishlistStore";

const NavbarMobile = () => {
    const user = useUserStore();
    const { cart } = useCartStore();
    const { wishlist } = useWishlistStore();
    const location = useLocation();

    return (
        <nav className="nav-bottom-mobile">
            <Link to="/" className={location.pathname === "/" ? "active" : ""}>
                <FaHome size={24} />
                <span>Home</span>
            </Link>
            <Link
                to="/wishlist"
                className={location.pathname === "/wishlist" ? "active" : ""}
            >
                <FaHeart size={24} />
                <span>Wishlist</span>
                {wishlist.length > 0 && (
                    <span className="badge">{wishlist.length}</span>
                )}
            </Link>
            <Link
                to="/cart"
                className={location.pathname === "/cart" ? "active" : ""}
            >
                <FaShoppingCart size={24} />
                <span>Cart</span>
                {cart.length > 0 && (
                    <span className="badge">
                        {cart.reduce((prev, curr) => prev + curr.quantity, 0)}
                    </span>
                )}
            </Link>
            {user.token ? (
                <Link
                    to="/profile"
                    className={location.pathname === "/profile" ? "active" : ""}
                >
                    <FaUserCircle size={24} />
                    <span>Profile</span>
                </Link>
            ) : (
                <Link
                    to="/login"
                    className={location.pathname === "/login" ? "active" : ""}
                >
                    <FaUserCircle size={24} />
                    <span>Login</span>
                </Link>
            )}
        </nav>
    );
};

export default NavbarMobile;
