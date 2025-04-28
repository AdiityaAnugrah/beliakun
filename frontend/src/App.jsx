import { Outlet } from "react-router-dom";
import "./App.scss";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

function App() {
    return (
        <>
            <Navbar />
            <div className="flex flex-col" style={{ minHeight: "100svh" }}>
                <div style={{ flex: 1 }}>
                    <Outlet />
                </div>
                <Footer />
            </div>
        </>
    );
}

export default App;
