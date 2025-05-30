import { Outlet } from "react-router-dom";
import "./App.scss";
import Navbar from "./components/Navbar";
import NavbarMobile from "./components/NavbarMobile";
import Footer from "./components/Footer";
import ChatbotPopup from "./components/ChatbotPopup";

function App() {
    return (
        <div style={{ minHeight: "100svh" }} className="flex flex-col">
            <Navbar />
            <div
                className="main-content"
                style={{
                    flex: 1,
                    backgroundColor: "#f8f9fa",
                }}
            >
                <Outlet />
            </div>
            <NavbarMobile />
            <ChatbotPopup />
            <div className="footer-desktop">
                <Footer />
            </div>
        </div>
    );
}

export default App;
