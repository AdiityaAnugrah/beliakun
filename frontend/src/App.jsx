import { Outlet } from "react-router-dom";
import "./App.scss";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

function App() {
    return (
        <div style={{ minHeight: "100svh" }} className="flex flex-col">
            <Navbar />
            <div style={{ flex: 1, position: "relative" }}>
                <div
                    style={{
                        // position: "absolute",
                        top: "0",
                        left: "0",
                        width: "100%",
                        height: "100%",
                    }}
                >
                    <Outlet />
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default App;
