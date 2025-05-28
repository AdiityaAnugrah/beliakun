import React from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

export default function Topbar({ title }) {
    const navigate = useNavigate();
    return (
        <div className="topbar">
            <button className="topbar-back" onClick={() => navigate(-1)}>
                <FaArrowLeft />
            </button>
            <span className="topbar-title">{title}</span>
        </div>
    );
}
