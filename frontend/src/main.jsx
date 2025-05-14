import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter, Route, Routes } from "react-router-dom";

// User
import Home from "./pages/Home.jsx";
import About from "./pages/About.jsx";
import NotFond from "./pages/NotFond.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import ProductDetail from "./pages/ProductDetail.jsx";

// Admin
import HomeAdmin from "./pages/admin/HomeAdmin.jsx";
import Products from "./pages/admin/Products.jsx";
import "./i18n";
import AppAdmin from "./AppAdmin.jsx";
import AddProduct from "./pages/admin/AddProduct.jsx";
import FilterRoutes from "./components/FilterRoutes.jsx";

createRoot(document.getElementById("root")).render(
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<App />}>
                <Route index element={<Home />} />
                <Route path="about" element={<About />} />
                <Route
                    path="login"
                    element={
                        <FilterRoutes>
                            <Login />
                        </FilterRoutes>
                    }
                />
                <Route path="signup" element={<Signup />} />
                <Route path="detail/:id" element={<ProductDetail />} />
                <Route path="*" element={<NotFond />} />
            </Route>
            <Route
                path="/admin"
                element={
                    <FilterRoutes users={["admin"]}>
                        <AppAdmin />
                    </FilterRoutes>
                }
            >
                <Route index element={<HomeAdmin />} />
                <Route path="products" element={<Products />} />
                <Route path="add" element={<AddProduct />} />
                <Route path="edit/:id" element={<AddProduct />} />
            </Route>
        </Routes>
    </BrowserRouter>
);
