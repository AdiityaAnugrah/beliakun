import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import "./AppAdmin.scss";
import NavbarAdmin from "./components/NavbarAdmin";
import SidebarAdmin from "./components/SidebarAdmin";
import FooterAdmin from "./components/FooterAdmin";
function AppAdmin() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="admin-container">
            <SidebarAdmin isSidebarOpen={isSidebarOpen} />
            <div className="admin-content">
                <NavbarAdmin
                    isSidebarOpen={isSidebarOpen}
                    setIsSidebarOpen={setIsSidebarOpen}
                />
                <Outlet />
            </div>
        </div>
    );
}

export default AppAdmin;
