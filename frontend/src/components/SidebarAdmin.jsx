import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { RiMenuFold4Fill } from "react-icons/ri";
import { useTranslation } from "react-i18next";
import useNotifStore from "../../store/notifStore";
import useUserStore from "../../store/userStore";
import { logout } from "../services/authService";
import Tombol from "./Tombol";

const SidebarAdmin = ({ isSidebarOpen }) => {
    const { t } = useTranslation();
    const { setNotif } = useNotifStore();
    const navigate = useNavigate();
    const user = useUserStore();
    const handleLogout = async () => {
        await logout(user.token);
        user.emptyUser();
        setNotif(t("logout_successful"));
        navigate("/login");
    };
    return (
        <div className={`sidebar ${isSidebarOpen ? "open" : "closed"}`}>
            <div className="logo">Admin</div>
            <ul>
                <li>
                    <Link to="/admin">Dashboard</Link>
                </li>
                <li>
                    <Link to="/admin/products">List Products</Link>
                </li>
                <li>
                    <Link to="/admin/orders">Manage Orders</Link>
                </li>
                <li>
                    <Link to="/admin/category">Categories</Link>
                </li>
                <li>
                    <Link to="/admin/settings">Settings</Link>
                </li>
            </ul>

            <div style={{ flex: 1 }}></div>
            <Tombol
                className="btn kotak"
                style="kotak"
                text={t("logout")}
                onClick={handleLogout}
            >
                Logout
            </Tombol>
        </div>
    );
};

export default SidebarAdmin;
