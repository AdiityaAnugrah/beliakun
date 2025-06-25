import { useEffect, useState } from "react";
import Notif from "../components/Notif"; 
import { getProducts } from "../services/productService";
import { useTranslation } from "react-i18next";
import { FiSearch, FiShoppingCart, FiHeart } from "react-icons/fi"; 
import "./Product.scss";
import CategoryCarousel from "../components/CategoryCarousel";
import { Link } from "react-router-dom";

const Product = () => {
    const { t } = useTranslation();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortedProducts, setSortedProducts] = useState([]); 
    const [selectedCategory, setSelectedCategory] = useState(""); 
    const [wishlistIds, setWishlistIds] = useState([]);
    const [processing, setProcessing] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            const result = await getProducts(); 
            if (result.status === 200) {
                setProducts(result.data.products);
                setSortedProducts(result.data.products);
                setWishlistIds([]);
            } else {
                Notif.error(t("Failed to fetch products"));
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
                    p.category &&
                    p.category.label &&
                    p.category.label.toLowerCase() === selectedCategory.toLowerCase()
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
                    p.category &&
                    p.category.label &&
                    p.category.label.toLowerCase() === selectedCategory.toLowerCase()
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

    const handleWishlist = (e, productId) => {
        e.stopPropagation(); 
        setProcessing(`wishlist-${productId}`);
        setTimeout(() => {
            if (wishlistIds.includes(productId)) {
                setWishlistIds(wishlistIds.filter((id) => id !== productId));
                console.log(`Removed product ${productId} from wishlist`);
            } else {
                setWishlistIds([...wishlistIds, productId]);
                console.log(`Added product ${productId} to wishlist`);
            }
            setProcessing(null);
        }, 500); 
    };

    // Handler for adding items to the cart
    const handleAddCart = (e, productId) => {
        e.stopPropagation(); 
        setProcessing(`cart-${productId}`); 
        setTimeout(() => {
            console.log(`Added product ${productId} to cart`);
            setProcessing(null);
        }, 500); 
    };

    return (
        <div className="product-page">
            <div className="bapak-product">
                <div className="bg-benner-product">
                    <img
                        src="https://placehold.co/1200x400/e0e0e0/757575?backgroundColor=000000&text=BeliAkun"
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
                                placeholder="Find products and name games..."
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

            <div className="container mx-auto py-10">
                <div className="product-grid">
                    {loading ? (
                        <div className="loading">
                            <p>{t("Loading...")}</p>
                        </div>
                    ) : sortedProducts.length > 0 ? (
                        sortedProducts.map((p) => (
                            <Link
                                className="product-card"
                                key={p.id}
                                to={`/product/${p.slug}`}
                                tabIndex={0} 
                            >
                                <div className="product-img-wrap">
                                    <img
                                        src={p.gambar || `https://placehold.co/300x200/e0e0e0/757575?text=${encodeURIComponent(p.nama)}`}
                                        alt={p.nama}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src=`https://placehold.co/300x200/e0e0e0/757575?text=Error+Loading+Image`;
                                        }}
                                    />
                                    <div className="product-actions">
                                        <button
                                            className={`fav-btn ${wishlistIds.includes(p.id) ? "active" : ""}`}
                                            onClick={(e) => handleWishlist(e, p.id)}
                                            aria-label={wishlistIds.includes(p.id) ? t('wishlist.removeFromWishlist') : t('wishlist.addToWishlist')}
                                            disabled={processing === `wishlist-${p.id}`}
                                        >
                                            <FiHeart />
                                        </button>
                                        <button
                                            className="cart-btn"
                                            onClick={(e) => handleAddCart(e, p.id)}
                                            aria-label={t('cart.addToCart', 'Tambah ke Keranjang')}
                                            disabled={processing === `cart-${p.id}`}
                                        >
                                            <FiShoppingCart />
                                        </button>
                                    </div>
                                </div>
                                <div className="product-info">
                                    {p.category && p.category.label && (
                                        <div className="product-category">
                                            {p.category.label.toUpperCase()}
                                        </div>
                                    )}
                                    <h3 className="product-title">{p.nama}</h3>
                                    <div className="product-price">
                                        Rp {Number(p.harga).toLocaleString("id-ID")}
                                    </div>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="no-products">
                            <p>{t("No products available.")}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Product;
