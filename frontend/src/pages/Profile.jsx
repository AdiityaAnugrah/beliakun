import React from "react";
import useUserStore from "../../store/userStore";
import { useNavigate } from "react-router-dom";
import Notif from "../components/Notif";

const menuList = [
    { label: "Setting", icon: "⚙️", route: "/setting" },
    { label: "About", icon: "ℹ️", route: "/about" },
];

const Profile = () => {
    const { nama, username, emptyUser } = useUserStore();
    const navigate = useNavigate();

    React.useEffect(() => {
        if (!username) {
            navigate("/login");
        }
    }, [username, navigate]);

    const handleLogout = () => {
        emptyUser();
        navigate("/login");
    };

    // const handleEditProfile = () => {
    //     // Gunakan Notif sebagai toast (atau bisa pakai alert jika ingin tes)
    //     Notif("Fitur edit profile coming soon...");
    // };

    return (
        <div className="profile-container">
            <Notif />
            <div className="profile-header">
                <img
                    src="https://ui-avatars.com/api/?name=User&background=random"
                    alt="avatar"
                    className="profile-avatar"
                />
                <div className="profile-user">
                    <h3>{nama || "Nama User"}</h3>
                    <span className="username">@{username}</span>
                    {/* <button className="edit-btn" onClick={handleEditProfile}>
                        Edit Profile
                    </button> */}
                </div>
            </div>
            <ul className="profile-menu">
                {menuList.map((item, i) => (
                    <li
                        key={i}
                        onClick={() => navigate(item.route)}
                        style={{ cursor: "pointer" }}
                    >
                        <span className="icon">{item.icon}</span> {item.label}
                    </li>
                ))}
            </ul>

            <button className="logout-btn" onClick={handleLogout}>
                Log out
            </button>
        </div>
    );
};

export default Profile;
