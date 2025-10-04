import { Outlet } from "react-router-dom";
import "./App.scss";  // memuat seluruh SCSS modular
import "./App.css";   // reset & util ringan
import Navbar from "./components/Navbar";
import NavbarMobile from "./components/NavbarMobile";
import Footer from "./components/Footer";
import ChatbotPopup from "./components/ChatbotPopup";

function App() {
  return (
    <div className="app flex flex-col">
      <Navbar />

      {/* Main content */}
      <main
        className="main-content"
        role="main"
        aria-live="polite"
        aria-atomic="true"
      >
        <Outlet />
      </main>

      {/* Bottom nav (mobile) */}
      <NavbarMobile />

      {/* Chatbot */}
      <ChatbotPopup />

      {/* Footer (desktop only; hidden di mobile via CSS modular) */}
      <div className="footer-desktop">
        <Footer />
      </div>
    </div>
  );
}

export default App;
