import { useEffect, useState } from "react";
import Notif from "../components/Notif";
import { getProducts } from "../services/productService";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiShoppingCart } from "react-icons/fi";
import "./Product.scss";
import CategoryCarousel from "../components/CategoryCarousel";

const Product = () => {
    const { t } = useTranslation();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortedProducts, setSortedProducts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProducts = async () => {
            const result = await getProducts();
            if (result.status === 200) {
                setProducts(result.data.products);
                setSortedProducts(result.data.products);
            } else {
                console.log(result.message);
            }
            setLoading(false);
        };
        fetchProducts();
    }, []);

    useEffect(() => {
        let filtered = [...products];
        if (selectedCategory) {
            filtered = filtered.filter(
                (p) =>
                    p.kategori &&
                    p.kategori.toLowerCase() === selectedCategory.toLowerCase()
            );
        }
        setSortedProducts(filtered);
    }, [selectedCategory, products]);

    const handleSearch = (e) => {
        const query = e.target.value.toLowerCase();
        let filteredProducts = products.filter((product) =>
            product.nama.toLowerCase().includes(query)
        );
        if (selectedCategory) {
            filteredProducts = filteredProducts.filter(
                (p) =>
                    p.kategori &&
                    p.kategori.toLowerCase() === selectedCategory.toLowerCase()
            );
        }
        setSortedProducts(filteredProducts);
    };

    const handleSort = (e) => {
        const value = e.target.value;
        const sortedArray = [...sortedProducts];
        if (value === "priceLowToHigh") {
            sortedArray.sort((a, b) => a.harga - b.harga);
        } else if (value === "priceHighToLow") {
            sortedArray.sort((a, b) => b.harga - a.harga);
        }
        setSortedProducts(sortedArray);
    };

    const handleViewDetails = (id) => {
        navigate(`/detail/${id}`);
    };

    const handleAddToCart = (id) => {
        console.log("Added to cart: ", id);
    };

    return (
        <div className="product-page">
            <div className="bapak-product">
                <div className="bg-benner-product">
                    <img
                        src="https://i.pinimg.com/736x/d0/fb/6b/d0fb6bb42ee9c83632aeac8a87bba197.jpg"
                        alt="Digital Products Banner"
                    />
                </div>
                <div className="banner-overlay-card">
                    <div className="banner-content">
                        <h1>
                            <span className="emoji">🎮</span> BeliAkun
                        </h1>
                        <p className="subtitle">
                            Akun Game, Tools, & Produk Digital Paling Lengkap!
                        </p>
                        <div className="search-container">
                            <FiSearch size={20} className="search-icon" />
                            <input
                                type="text"
                                placeholder="Cari produk digital atau nama game..."
                                onChange={handleSearch}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <CategoryCarousel
                selected={selectedCategory}
                onSelect={setSelectedCategory}
            />

            <div className="product-filter-bar">
                <div className="filter-card">
                    <span className="filter-title">{t("Sort by Price")}</span>
                    <select onChange={handleSort}>
                        <option value="priceLowToHigh">
                            {t("Price: Low to High")}
                        </option>
                        <option value="priceHighToLow">
                            {t("Price: High to Low")}
                        </option>
                    </select>
                    {selectedCategory && (
                        <button
                            className="btn-reset-filter"
                            onClick={() => setSelectedCategory("")}
                        >
                            {t("Show All")}
                        </button>
                    )}
                    {selectedCategory && (
                        <span className="chip selected-cat">
                            {selectedCategory}
                        </span>
                    )}
                </div>
            </div>

            <div className="product-grid">
                {loading ? (
                    <div className="loading">
                        <p>{t("Loading...")}</p>
                    </div>
                ) : sortedProducts.length > 0 ? (
                    sortedProducts.map((product) => (
                        <div
                            key={product.id}
                            className="product-item"
                            onClick={() => handleViewDetails(product.id)}
                        >
                            <div className="product-image-container">
                                <img
                                    src={product.gambar}
                                    alt={product.nama}
                                    className="product-image"
                                />
                            </div>
                            <div className="product-info">
                                <h3>{product.nama}</h3>
                                <p className="price">
                                    {product.harga.toLocaleString("id-ID", {
                                        style: "currency",
                                        currency: "IDR",
                                        minimumFractionDigits: 0,
                                    })}
                                </p>
                                <button
                                    className="add-to-cart"
                                    title={t("Add to Cart")}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleAddToCart(product.id);
                                    }}
                                >
                                    <FiShoppingCart size={22} />
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-products">
                        <p>{t("No products available.")}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Product;
