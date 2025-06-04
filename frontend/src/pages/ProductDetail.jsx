import React, { useEffect, useState, useMemo, useCallback } from "react";
import { getProducts } from "../services/productService";
import { FaHeart, FaShoppingCart, FaArrowLeft } from "react-icons/fa";
import Tombol from "../components/Tombol"; // Pastikan path ini benar
import { useTranslation } from "react-i18next";
import { addToCart, getCart } from "../services/cartService";
import useUserStore from "../../store/userStore";
import { useNavigate, useParams } from "react-router-dom";
import useCartStore from "../../store/cartStore";
import useNotifStore from "../../store/notifStore";
import useWishlistStore from "../../store/wishlistStore";
import Notif from "../components/Notif"; // Pastikan path ini benar
import {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
} from "../services/wishlistService";
import './ProductDetail.scss'; // Impor file SCSS Anda

const ProductDetail = () => {
  const { t } = useTranslation();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingCart, setProcessingCart] = useState(false);
  const [processingWishlist, setProcessingWishlist] = useState(false);

  const { token, emptyUser } = useUserStore();
  const { setCart } = useCartStore();
  const { setNotif, showNotif } = useNotifStore();
  const navigate = useNavigate();
  const { wishlist, setWishlist } = useWishlistStore();
  const { id: productId } = useParams();

  const stableSetNotif = useCallback(setNotif, [setNotif]);
  const stableShowNotif = useCallback(showNotif, [showNotif]);
  const stableEmptyUser = useCallback(emptyUser, [emptyUser]);
  const stableSetCart = useCallback(setCart, [setCart]);
  const stableSetWishlist = useCallback(setWishlist, [setWishlist]);

  useEffect(() => {
    let unmounted = false;
    const fetchProduct = async () => {
      if (!productId) {
        setError(t("product.invalidId", "ID Produk tidak valid."));
        setLoading(false);
        return;
      }
      setLoading(true);
      setError("");
      try {
        const result = await getProducts(productId);
        if (!unmounted) {
          if (result.status === 200 && result.data) {
            setProduct(result.data);
          } else {
            setError(result.message || t("product.notFound", "Produk tidak ditemukan."));
          }
        }
      } catch (err) {
        console.error("Gagal mengambil produk:", err);
        if (!unmounted) {
          setError(t("error.fetch", "Gagal mengambil data produk."));
        }
      } finally {
        if (!unmounted) {
          setLoading(false);
        }
      }
    };
    fetchProduct();
    return () => { unmounted = true; };
  }, [productId, t, stableSetNotif, stableShowNotif]);

  const isWishlisted = useMemo(() => {
    if (!product || !wishlist) return false;
    return wishlist.some((item) => item.productId === product.id || item.id === product.id);
  }, [product, wishlist]);

  const formatPrice = (price) => {
    if (typeof price !== 'number') return "N/A";
    return `Rp ${price.toLocaleString("id-ID", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const handleAddToCart = async () => {
    console.log("handleAddToCart called", { product, processingCart, token }); // Untuk debugging
    if (!product || processingCart) return;
    if (!token) {
      stableSetNotif(t("cart.notLogin")); stableShowNotif(); return;
    }
    if (product.stock <= 0) {
      stableSetNotif(t("cart.outOfStock")); stableShowNotif(); return;
    }
    setProcessingCart(true);
    try {
      const response = await addToCart(product.id, 1, token);
      console.log("Add to cart response:", response); // Untuk debugging
      if (response.status === 401) {
        stableEmptyUser(); stableSetNotif(t("cart.sessionExpired")); stableShowNotif(); navigate("/login"); return;
      }
      if (response.status === 200 || response.status === 201) {
        const updatedCart = await getCart(token);
        if(updatedCart.status === 200){ stableSetCart(updatedCart.data); }
        else { stableSetCart(response.data); }
        stableSetNotif(t("cart.addSuccess")); stableShowNotif();
      } else {
        stableSetNotif(response.message || t("cart.addFailed")); stableShowNotif();
      }
    } catch (err) {
      console.error("Gagal menambah ke keranjang:", err);
      stableSetNotif(t("cart.addFailed")); stableShowNotif();
    } finally {
      setProcessingCart(false);
    }
  };

  const handleToggleWishlist = async (event) => {
    if (event) event.stopPropagation();
    if (!product || processingWishlist) return;
    if (!token) {
      stableSetNotif(t("wishlist_notLogin")); stableShowNotif(); return;
    }
    setProcessingWishlist(true);
    try {
      let response;
      const currentWishlistStatus = isWishlisted;
      if (currentWishlistStatus) {
        response = await removeFromWishlist(product.id, token);
      } else {
        response = await addToWishlist(product.id, token);
      }
      if (response.status === 401) {
        stableEmptyUser(); stableSetNotif(t("wishlist_sessionExpired")); stableShowNotif(); navigate("/login"); return;
      }
      if (response.status === 200 || response.status === 201) {
        const fetchRes = await getWishlist(token);
        if (fetchRes.status === 200 && fetchRes.data) { stableSetWishlist(fetchRes.data); }
        stableSetNotif(currentWishlistStatus ? t("wishlist_removed") : t("wishlist_added")); stableShowNotif();
      } else {
        stableSetNotif(response.message || t("wishlist.toggleFailed", "Gagal mengubah wishlist.")); stableShowNotif();
      }
    } catch (err) {
      console.error("Gagal memproses wishlist:", err);
      stableSetNotif(t("wishlist.toggleFailed", "Terjadi kesalahan. Gagal mengubah wishlist.")); stableShowNotif();
    } finally {
      setProcessingWishlist(false);
    }
  };

  if (loading) return (<div className="product-detail-loading"><p>{t("loading")}</p></div>);
  if (error) return (<div className="product-detail-error"><p>{error}</p></div>);
  if (!product) return (<div className="product-detail-not-found"><p>{t("product.notFoundInitial", "Data produk tidak ditemukan atau sedang dimuat...")}</p></div>);

  return (
    <div className="product-detail-page">
      <Notif />
      <header className="product-detail-header">
        <button onClick={() => navigate(-1)} aria-label={t('go_back')} className="header-action-button back-button">
          <FaArrowLeft />
        </button>
        <h2 className="header-title">{t('product_details')}</h2>
        <button onClick={() => handleToggleWishlist(null)} aria-label={isWishlisted ? t('wishlist.removeFrom', 'Hapus dari Wishlist') : t('wishlist.addTo', 'Tambah ke Wishlist')} className="header-action-button wishlist-button-header" disabled={processingWishlist}>
          <FaHeart className={isWishlisted ? "wishlisted" : ""} />
        </button>
      </header>

      <main className="product-detail-main-content">
        <div className="product-gallery-column">
          <div className="product-image-container">
            <img
              src={product.gambar || "https://placehold.co/800x600/e0e0e0/757575?text=Produk"}
              alt={product.nama}
              className="product-image-main"
              onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/800x600/e0e0e0/757575?text=" + t('image.loadError', "Gagal Muat"); }}
            />
          </div>
        </div>

        <div className="product-info-column">
            <div className="product-info-header">
                <h1 className="product-name">{product.nama}</h1>
                {product.kategori && (
                    <span className="product-category-tag">
                        {t(`category.${product.kategori}`, product.kategori.charAt(0).toUpperCase() + product.kategori.slice(1))}
                    </span>
                )}
            </div>
            <p className="product-price">{formatPrice(product.harga)}</p>
            <div className="product-stock-info">
                <p>{t("cart.stockAvailable", { stok: product.stock || 0 })}</p>
            </div>
            <div className="product-description-container">
                <h3 className="description-title">{t('product.descriptionTitle', 'Deskripsi Produk')}</h3>
                <p className="product-description">
                    {product.deskripsi || t('product.noDescription', 'Tidak ada deskripsi untuk produk ini.')}
                </p>
            </div>

            <div className="product-actions-container"> {/* Wrapper untuk tombol aksi */}
                <Tombol
                    className="add-to-cart-button main-action-button"
                    icon=""
                    onClick={handleAddToCart}
                    disabled={product.stock === 0 || processingCart}
                    >
                    <FaShoppingCart className="icon-cart" />
                    <span>
                        {product.stock === 0 ? t('cart.outOfStock') : t('cart.add_to_cart', 'Add To Cart')}
                    </span>
                </Tombol>
                <button
                    className="wishlist-button secondary-action-button"
                    onClick={() => handleToggleWishlist(null)}
                    disabled={processingWishlist}
                    aria-label={isWishlisted ? t('wishlist.removeFrom', 'Hapus dari Wishlist') : t('wishlist.addTo', 'Tambah ke Wishlist')}
                    >
                    <FaHeart className={isWishlisted ? "wishlisted" : ""} />
                    <span>{isWishlisted ? t('wishlist.inWishlist', 'Di Wishlist') : t('wishlist.addToWishlistText', 'Wishlist')}</span>
                </button>
            </div>
        </div>
      </main>

      <footer className="product-detail-footer-mobile">
        <div className="footer-price-mobile">
            <span className="price-label">{t('product.priceLabel', 'Harga:')}</span>
            <span className="price-value">{formatPrice(product.harga)}</span>
        </div>
        <Tombol
          className="buy-now-button-mobile"
          onClick={handleAddToCart}
          disabled={product.stock === 0 || processingCart}
        >
          <span>
            {product.stock === 0 ? t('cart.outOfStock') : t('cart.buyNow', 'Buy now')}
          </span>
        </Tombol>
      </footer>
    </div>
  );
};

export default ProductDetail;
