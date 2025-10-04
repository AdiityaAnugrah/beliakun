import { useEffect, useState } from "react";
import { getProducts } from "../services/productService";
import { useTranslation } from "react-i18next";
import { FiSearch, FiShoppingCart, FiHeart } from "react-icons/fi";
import "./Product.scss";
import CategoryCarousel from "../components/CategoryCarousel";
import { Link } from "react-router-dom";
import useNotifStore from "../../store/notifStore"; // pakai store notif (sesuai pola existing)

const Product = () => {
  const { t } = useTranslation();
  const { setNotif, showNotif } = useNotifStore();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [sortedProducts, setSortedProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  const [wishlistIds, setWishlistIds] = useState([]);
  const [processing, setProcessing] = useState(null); // "wishlist-<id>" | "cart-<id>"

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const result = await getProducts();
      if (result?.status === 200) {
        const list = Array.isArray(result.data?.products)
          ? result.data.products
          : [];
        setProducts(list);
        setSortedProducts(list);
        setWishlistIds([]); // reset state lokal
      } else {
        // Notif.error bukan method; pakai store notif yang sudah ada
        setNotif(t("error.fetchProducts", "Failed to fetch products"));
        showNotif();
      }
      setLoading(false);
    };
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let filtered = [...products];
    if (selectedCategory) {
      filtered = filtered.filter(
        (p) =>
          p?.category?.label &&
          p.category.label.toLowerCase() === selectedCategory.toLowerCase()
      );
    }
    setSortedProducts(filtered);
  }, [selectedCategory, products]);

  const handleSearch = (e) => {
    const q = (e.target.value || "").toLowerCase();
    let filtered = products.filter((p) =>
      (p?.nama || "").toLowerCase().includes(q)
    );
    if (selectedCategory) {
      filtered = filtered.filter(
        (p) =>
          p?.category?.label &&
          p.category.label.toLowerCase() === selectedCategory.toLowerCase()
      );
    }
    setSortedProducts(filtered);
  };

  const handleSort = (e) => {
    const value = e.target.value;
    const arr = [...sortedProducts];
    if (value === "priceLowToHigh") arr.sort((a, b) => a.harga - b.harga);
    if (value === "priceHighToLow") arr.sort((a, b) => b.harga - a.harga);
    setSortedProducts(arr);
  };

  const handleWishlist = (e, productId) => {
    e.preventDefault();
    e.stopPropagation();
    if (processing) return;
    setProcessing(`wishlist-${productId}`);
    // simulasi — biarkan sistem tetap sama seperti kode asli
    setTimeout(() => {
      setWishlistIds((prev) =>
        prev.includes(productId)
          ? prev.filter((id) => id !== productId)
          : [...prev, productId]
      );
      setProcessing(null);
    }, 400);
  };

  const handleAddCart = (e, productId) => {
    e.preventDefault();
    e.stopPropagation();
    if (processing) return;
    setProcessing(`cart-${productId}`);
    // simulasi — biarkan sistem tetap sama seperti kode asli
    setTimeout(() => {
      setProcessing(null);
      setNotif(t("cart.addSuccess", "Produk berhasil ditambahkan ke keranjang!"));
      showNotif();
    }, 400);
  };

  return (
    <div className="product-page">
      <div className="bapak-product">
        <div className="bg-benner-product">
          <img
            src="https://placehold.co/1200x400/e0e0e0/757575?backgroundColor=000000&text=BeliAkun"
            alt="Digital Products Banner"
            loading="lazy"
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
              <FiSearch size={18} className="search-icon" aria-hidden="true" />
              <input
                type="text"
                placeholder="Find products and name games..."
                onChange={handleSearch}
                aria-label={t("product_search", "Search Products")}
              />
            </div>
          </div>
        </div>
      </div>

      <CategoryCarousel selected={selectedCategory} onSelect={setSelectedCategory} />

      <div className="product-filter-bar">
        <div className="filter-card" role="group" aria-label="Product filters">
          <span className="filter-title">{t("product_sort_by", "Sort by")}</span>
          <select onChange={handleSort} aria-label="Sort by price">
            <option value="priceLowToHigh">
              {t("product_sort_options.price_asc", "Price (Low to High)")}
            </option>
            <option value="priceHighToLow">
              {t("product_sort_options.price_desc", "Price (High to Low)")}
            </option>
          </select>
          {selectedCategory && (
            <>
              <button
                className="btn-reset-filter"
                onClick={() => setSelectedCategory("")}
              >
                {t("Show All", "Show All")}
              </button>
              <span className="chip selected-cat">{selectedCategory}</span>
            </>
          )}
        </div>
      </div>

      <div className="container mx-auto py-10">
        {/* Skeleton saat loading */}
        {loading ? (
          <div className="product-grid skeleton-grid">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div className="skeleton-card" key={`sk-${idx}`}>
                <div className="skeleton-img" />
                <div className="skeleton-line short" />
                <div className="skeleton-line" />
              </div>
            ))}
          </div>
        ) : (
          <div className="product-grid">
            {sortedProducts.length > 0 ? (
              sortedProducts.map((p) => (
                <Link
                  className="product-card"
                  key={p.id}
                  to={`/product/${p.slug}`}
                  tabIndex={0}
                  aria-label={`${p.nama} - Rp ${Number(p.harga || 0).toLocaleString("id-ID")}`}
                >
                  <div className="product-img-wrap">
                    <img
                      src={
                        p.gambar ||
                        `https://placehold.co/600x400/e0e0e0/757575?text=${encodeURIComponent(
                          p.nama || "Product"
                        )}`
                      }
                      alt={p.nama}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src =
                          "https://placehold.co/600x400/e0e0e0/757575?text=Image+Not+Available";
                      }}
                    />
                    <div className="product-actions">
                      <button
                        className={`fav-btn ${wishlistIds.includes(p.id) ? "active" : ""}`}
                        onClick={(e) => handleWishlist(e, p.id)}
                        aria-label={
                          wishlistIds.includes(p.id)
                            ? t("wishlist_removed", "Hapus dari wishlist")
                            : t("wishlist_added", "Tambah ke wishlist")
                        }
                        aria-pressed={wishlistIds.includes(p.id) ? "true" : "false"}
                        disabled={processing === `wishlist-${p.id}`}
                      >
                        <FiHeart />
                      </button>
                      <button
                        className="cart-btn"
                        onClick={(e) => handleAddCart(e, p.id)}
                        aria-label={t("cart.addToCart", "Tambah ke Keranjang")}
                        disabled={processing === `cart-${p.id}`}
                      >
                        <FiShoppingCart />
                      </button>
                    </div>
                  </div>

                  <div className="product-info">
                    {p?.category?.label && (
                      <div className="product-category">
                        {String(p.category.label || "").toUpperCase()}
                      </div>
                    )}
                    <h3 className="product-title" title={p.nama}>
                      {p.nama}
                    </h3>
                    <div className="product-price">
                      Rp {Number(p.harga || 0).toLocaleString("id-ID")}
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="no-products">
                <p>{t("home_no_products", "No products available.")}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Product;
