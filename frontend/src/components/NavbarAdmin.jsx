import { Link, useNavigate } from "react-router-dom";
import { FaBars, FaPowerOff } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { logout } from "../services/authService";
import useNotifStore from "../../store/notifStore";
import useUserStore from "../../store/userStore";

const NavbarAdmin = ({ isSidebarOpen, setIsSidebarOpen }) => {
    const { t } = useTranslation();
    const { setNotif } = useNotifStore();
    const navigate = useNavigate();
    const user = useUserStore();

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };
    const handleLogout = async () => {
        await logout(user.token);
        user.emptyUser();
        setNotif(t("logout_successful"));
        navigate("/login");
    };

    return (
        <nav className="admin-navbar">
            <button className="menu-toggle" onClick={toggleSidebar}>
                <FaBars size={24} />
            </button>
            <div className="logo">
                <Link to="/admin" className="logo-link">
                    Beliakun
                </Link>
            </div>
            {!isSidebarOpen && (
                <button className="btn-auth" onClick={handleLogout}>
                    <FaPowerOff size={18} />
                </button>
            )}
        </nav>
    );
};

export default NavbarAdmin;
