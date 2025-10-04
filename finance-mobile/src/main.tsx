import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./context/AuthProvider";
import { TenantProvider } from "./context/TenantProvider";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <TenantProvider>
          <App />
        </TenantProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
