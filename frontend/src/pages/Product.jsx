import { useEffect, useState } from "react";
import Notif from "../components/Notif";
import { getProducts } from "../services/productService";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { FiSearch } from "react-icons/fi";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const Product = () => {
    const { t } = useTranslation();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortedProducts, setSortedProducts] = useState([]);
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

    const handleSearch = (e) => {
        const query = e.target.value.toLowerCase();
        const filteredProducts = products.filter((product) =>
            product.nama.toLowerCase().includes(query)
        );
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
        navigate(`/detail/${id}`); // Navigate to the detail page of the product
    };

    const handleAddToCart = (id) => {
        // Handle add to cart logic
        console.log("Added to cart: ", id);
    };

    return (
        <>
            <div className="bapak-product">
                <div className="bg-benner-product">
                    <img
                        src="https://i.pinimg.com/736x/d0/fb/6b/d0fb6bb42ee9c83632aeac8a87bba197.jpg"
                        alt="Product Banner"
                    />
                </div>
                <div className="search-product">
                    <h1>Groceries Delivered in 90 Minutes</h1>
                    <div className="search-container">
                        <input
                            type="text"
                            placeholder="Search product"
                            onChange={handleSearch}
                        />
                        <button>
                            <FiSearch size={18} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="category-product">
                <h2>Product Categories</h2>
                <div className="category-nav">
                    <div className="category-list">
                        <div className="category-card">
                            <img
                                src="https://i.pinimg.com/736x/d0/fb/6b/d0fb6bb42ee9c83632aeac8a87bba197.jpg"
                                alt="Category Image"
                                className="category-image"
                            />
                            <div className="content">
                                <h3>Fruits</h3>
                            </div>
                        </div>
                        <div className="category-card">
                            <img
                                src="https://i.pinimg.com/736x/d0/fb/6b/d0fb6bb42ee9c83632aeac8a87bba197.jpg"
                                alt="Category Image"
                                className="category-image"
                            />
                            <div className="content">
                                <h3>Fruits</h3>
                            </div>
                        </div>
                        <div className="category-card">
                            <img
                                src="https://i.pinimg.com/736x/d0/fb/6b/d0fb6bb42ee9c83632aeac8a87bba197.jpg"
                                alt="Category Image"
                                className="category-image"
                            />
                            <div className="content">
                                <h3>Fruits</h3>
                            </div>
                        </div>
                        <div className="category-card">
                            <img
                                src="https://i.pinimg.com/736x/d0/fb/6b/d0fb6bb42ee9c83632aeac8a87bba197.jpg"
                                alt="Category Image"
                                className="category-image"
                            />
                            <div className="content">
                                <h3>Fruits</h3>
                            </div>
                        </div>
                        <div className="category-card">
                            <img
                                src="https://i.pinimg.com/736x/d0/fb/6b/d0fb6bb42ee9c83632aeac8a87bba197.jpg"
                                alt="Category Image"
                                className="category-image"
                            />
                            <div className="content">
                                <h3>Fruits</h3>
                            </div>
                        </div>
                        <div className="category-card">
                            <img
                                src="https://i.pinimg.com/736x/d0/fb/6b/d0fb6bb42ee9c83632aeac8a87bba197.jpg"
                                alt="Category Image"
                                className="category-image"
                            />
                            <div className="content">
                                <h3>Fruits</h3>
                            </div>
                        </div>
                    </div>
                    <div className="button-kanan-kiri">
                        <button>
                            <FaChevronLeft size={18} />
                        </button>
                        <button>
                            <FaChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Filter and Products */}
            <div className="w-full h-full flex">
                <div className="fitur-harga">
                    <h3>{t("Sort by Price")}</h3>
                    <select onChange={handleSort}>
                        <option value="priceLowToHigh">
                            {t("Price: Low to High")}
                        </option>
                        <option value="priceHighToLow">
                            {t("Price: High to Low")}
                        </option>
                    </select>
                </div>

                <div className="card-product">
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
                                <img
                                    src={product.gambar}
                                    alt={product.nama}
                                    className="product-image"
                                />
                                <div className="product-info">
                                    <h3>{product.nama}</h3>
                                    <p className="price">{product.harga}</p>
                                    <button
                                        className="add-to-cart"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleAddToCart(product.id);
                                        }}
                                    >
                                        {t("Add to Cart")}
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>{t("No products available.")}</p>
                    )}
                </div>
            </div>
        </>
    );
};

export default Product;
