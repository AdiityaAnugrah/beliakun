// ProductDetail.jsx
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { getProductBySlug, getProducts } from "../services/productService";
import { FaHeart, FaShoppingCart, FaArrowLeft } from "react-icons/fa";
import Tombol from "../components/Tombol"; // Pastikan path ini benar
import { useTranslation } from "react-i18next";
import { addToCart, getCart } from "../services/cartService";
import useUserStore from "../../store/userStore";
import { useNavigate, useParams, Link } from "react-router-dom"; // Tambahkan Link
import useCartStore from "../../store/cartStore";
import useNotifStore from "../../store/notifStore";
import useWishlistStore from "../../store/wishlistStore";
import Notif from "../components/Notif"; // Pastikan path ini benar
import {
  addToWishlist,
  removeFromWishlist,
  getWishlist as fetchUserWishlist, // Rename untuk menghindari konflik jika ada
} from "../services/wishlistService";
import './ProductDetail.scss'; // Impor file SCSS Anda

// Komponen kecil untuk item produk sejenis
const SimilarProductItem = React.memo(({ product, formatPrice }) => {
  const { t } = useTranslation();
  if (!product || !product.id) return null;

  return (
    <Link to={`/product/${product.slug}`} className="similar-product-item" aria-label={`Lihat detail untuk ${product.nama}`}>
      <img
        src={product.gambar || "https://placehold.co/300x200/e0e0e0/757575?text=Produk"}
        alt={product.nama || "Gambar produk sejenis"}
        className="similar-product-image"
        onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/300x200/e0e0e0/757575?text=" + t('image.loadError', "Gagal Muat"); }}
        loading="lazy" // Lazy load images for similar products
      />
      <div className="similar-product-info">
        <h4 className="similar-product-name">{product.nama || t('product.unknownName', 'Nama Tidak Diketahui')}</h4>
        <p className="similar-product-price">{formatPrice(product.harga)}</p>
      </div>
    </Link>
  );
});


const ProductDetail = () => {
  const { t } = useTranslation();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingCart, setProcessingCart] = useState(false);
  const [processingWishlist, setProcessingWishlist] = useState(false);

  const [similarProducts, setSimilarProducts] = useState([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);
  const [errorSimilar, setErrorSimilar] = useState("");

  const { token, emptyUser } = useUserStore();
  const { setCart: updateCartInStore } = useCartStore(); // Rename untuk kejelasan
  const { setNotif, showNotif } = useNotifStore();
  const navigate = useNavigate();
  const { wishlist, setWishlist: setWishlistInStore } = useWishlistStore();
  const { slug } = useParams();
  // const { id: productId } = useParams();

  // Menggunakan useCallback untuk fungsi yang di-pass ke dependency array atau sebagai props
  const stableSetNotif = useCallback(setNotif, [setNotif]);
  const stableShowNotif = useCallback(showNotif, [showNotif]);
  const stableEmptyUser = useCallback(emptyUser, [emptyUser]);
  const stableUpdateCartInStore = useCallback(updateCartInStore, [updateCartInStore]);
  const stableSetWishlistInStore = useCallback(setWishlistInStore, [setWishlistInStore]);

  const formatPrice = useCallback((price) => {
    if (price === undefined || price === null || typeof price !== 'number') return "N/A";
    return `Rp ${price.toLocaleString("id-ID", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  },[]);

  useEffect(() => {
    let unmounted = false;
    const fetchProductData = async () => {
      if (!slug) {
        if (!unmounted) {
          setError(t("product.invalidId", "Slug Produk tidak valid."));
          setLoading(false);
        }
        return;
      }

      try {
        const result = await getProductBySlug(slug);
        if (!unmounted) {
          if (result.status === 200 && result.data) {
            setProduct(result.data);
          } else {
            setError(result.message || t("product.notFound", "Produk tidak ditemukan."));
          }
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        if (!unmounted) {
          setError(t("error.fetch", "Gagal mengambil data produk."));
        }
      } finally {
        if (!unmounted) setLoading(false);
      }
    };
    fetchProductData();
    return () => { unmounted = true; };
  }, [slug, t]);

  useEffect(() => {
    let unmounted = false;
    const fetchSimilarProductsData = async () => {
      if (!product || !product.kategori || !product.id) {
        if (!unmounted) {
          setSimilarProducts([]);
          setLoadingSimilar(false);
          setErrorSimilar(""); 
        }
        return;
      }

      if (!unmounted) {
        setLoadingSimilar(true);
        setErrorSimilar("");
      }

      try {
        const result = await getProducts({
          kategori: product.kategori,
          excludeId: product.id,
          limit: 5
        });

        if (result.status === 200 && Array.isArray(result.data.products)) {
          const filtered = result.data.products;
          setSimilarProducts(filtered);
        } else {
          setSimilarProducts([]);
        }


        if (!unmounted) {
          if (result.status !== 200) {
            console.warn("Gagal mengambil produk sejenis:", result.message);
            setErrorSimilar(result.message || t("product.similarNotFound", "Produk sejenis tidak ditemukan."));
            setSimilarProducts([]);
          }
        }

      } catch (err) {
        console.error("Error fetching similar products:", err);
        if (!unmounted) {
          setErrorSimilar(t("error.fetchSimilar", "Terjadi kesalahan saat mengambil produk sejenis."));
          setSimilarProducts([]);
        }
      } finally {
        if (!unmounted) {
          setLoadingSimilar(false);
        }
      }
    };

    if (product && product.id && product.kategori) {
      fetchSimilarProductsData();
    } else {
        // Jika produk utama tidak ada, pastikan similar products juga kosong dan tidak loading
        if (!unmounted) {
            setSimilarProducts([]);
            setLoadingSimilar(false);
        }
    }

    return () => { unmounted = true; };
  }, [product, t]);

  const isWishlisted = useMemo(() => {
    if (!product || !wishlist || !wishlist.length) return false;
    // Pastikan product.id ada sebelum membandingkan
    return product.id ? wishlist.some((item) => item.productId === product.id || item.id === product.id) : false;
  }, [product, wishlist]);

  const handleAddToCart = async () => {
    if (!product || !product.id || processingCart) return;
    if (!token) {
      stableSetNotif(t("cart.notLogin", "Anda harus login untuk menambahkan ke keranjang.")); stableShowNotif(); return;
    }
    if (product.stock <= 0) {
      stableSetNotif(t("cart.outOfStock", "Stok produk habis.")); stableShowNotif(); return;
    }
    setProcessingCart(true);
    try {
      const response = await addToCart(product.id, 1, token);
      if (response.status === 401) {
        stableEmptyUser(); stableSetNotif(t("cart.sessionExpired", "Sesi Anda berakhir, silakan login kembali.")); stableShowNotif(); navigate("/login"); return;
      }
      if (response.status === 200 || response.status === 201) {
        const updatedCart = await getCart(token); // Ambil keranjang terbaru
        if(updatedCart.status === 200 && updatedCart.data){ stableUpdateCartInStore(updatedCart.data); }
        else { console.warn("Failed to fetch updated cart or cart data is invalid", updatedCart); }
        stableSetNotif(t("cart.addSuccess", "Produk berhasil ditambahkan ke keranjang!")); stableShowNotif();
      } else {
        stableSetNotif(response.message || t("cart.addFailed", "Gagal menambahkan ke keranjang.")); stableShowNotif();
      }
    } catch (err) {
      console.error("Gagal menambah ke keranjang:", err);
      stableSetNotif(t("cart.addFailed", "Terjadi kesalahan. Gagal menambahkan ke keranjang.")); stableShowNotif();
    } finally {
      setProcessingCart(false);
    }
  };

  const handleToggleWishlist = async (event) => {
    if (event) event.stopPropagation();
    if (!product || !product.id || processingWishlist) return;
    if (!token) {
      stableSetNotif(t("wishlist.notLogin", "Anda harus login untuk menggunakan wishlist.")); stableShowNotif(); return;
    }
    setProcessingWishlist(true);
    try {
      let response;
      const currentWishlistStatus = isWishlisted; // Gunakan status yang sudah di-memoize
      if (currentWishlistStatus) {
        response = await removeFromWishlist(product.id, token);
      } else {
        response = await addToWishlist(product.id, token);
      }

      if (response.status === 401) {
        stableEmptyUser(); stableSetNotif(t("wishlist.sessionExpired", "Sesi Anda berakhir, silakan login kembali.")); stableShowNotif(); navigate("/login"); return;
      }

      if (response.status === 200 || response.status === 201) {
        const fetchRes = await fetchUserWishlist(token); // Ambil wishlist terbaru
        if (fetchRes.status === 200 && fetchRes.data) { stableSetWishlistInStore(fetchRes.data); }
        else { console.warn("Failed to fetch updated wishlist or wishlist data is invalid", fetchRes); }
        stableSetNotif(currentWishlistStatus ? t("wishlist.removed", "Produk dihapus dari wishlist.") : t("wishlist.added", "Produk ditambahkan ke wishlist.")); stableShowNotif();
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

  if (loading) return (<div className="product-detail-loading"><p>{t("loading", "Memuat...")}</p></div>);
  if (error) return (<div className="product-detail-error"><p>{error}</p></div>);
  if (!product) return (<div className="product-detail-not-found"><p>{t("product.notFoundInitial", "Produk tidak ditemukan.")}</p></div>);

  return (
    <div className="product-detail-page">
      <Notif />
      <header className="product-detail-header">
        <button onClick={() => navigate(-1)} aria-label={t('go_back', "Kembali")} className="header-action-button back-button">
          <FaArrowLeft />
        </button>
        <h2 className="header-title">{t('product_details', "Detail Produk")}</h2>
        <button onClick={handleToggleWishlist} aria-label={isWishlisted ? t('wishlist.removeFrom', 'Hapus dari Wishlist') : t('wishlist.addTo', 'Tambah ke Wishlist')} className="header-action-button wishlist-button-header" disabled={processingWishlist}>
          <FaHeart className={isWishlisted ? "wishlisted" : ""} />
        </button>
      </header>

      <main className="product-detail-main-content">
        <div className="product-gallery-column">
          <div className="product-image-container">
            <img
              src={product.gambar || "https://placehold.co/800x600/e0e0e0/757575?text=Produk"}
              alt={product.nama || "Gambar Produk"}
              className="product-image-main"
              onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/800x600/e0e0e0/757575?text=" + t('image.loadError', "Gagal Muat"); }}
            />
          </div>
        </div>

        <div className="product-info-column">
            <div className="product-info-header">
                <h1 className="product-name">{product.nama || t('product.unknownName', 'Nama Tidak Diketahui')}</h1>
                {product.kategori && (
                    <span className="product-category-tag">
                        {t(`category.${product.kategori}`, product.kategori.charAt(0).toUpperCase() + product.kategori.slice(1))}
                    </span>
                )}
            </div>
            <p className="product-price">{formatPrice(product.harga)}</p>
            <div className="product-stock-info">
                <p>{t("cart.stockAvailable", { stok: product.stock !== undefined ? product.stock : 0 })}</p>
            </div>
            <div className="product-description-container">
                <h3 className="description-title">{t('product.descriptionTitle', 'Deskripsi Produk')}</h3>
                <p className="product-description">
                    {product.deskripsi || t('product.noDescription', 'Tidak ada deskripsi untuk produk ini.')}
                </p>
            </div>

            <div className="product-actions-container">
                <div className="product-actions-desktop">
                    <Tombol
                        style="merah"
                        text=""
                        icon={<FaShoppingCart className="icon-cart" />}
                        onClick={handleAddToCart}
                        disabled={product.stock === 0 || processingCart}
                        className="add-to-cart-button main-action-button"
                        aria-label={t('cart.add_to_cart', 'Tambah ke Keranjang')}
                    >
                        <FaShoppingCart className="icon-cart" />
                        <span>
                            {product.stock === 0 ? t('cart.outOfStock', "Stok Habis") : t('cart.add_to_cart', 'Tambah Keranjang')}
                        </span>
                    </Tombol>
                    <Tombol
                        text=""
                        style="merah"
                        icon={<FaHeart className={isWishlisted ? "wishlisted" : ""} />}
                        className="wishlist-button secondary-action-button"
                        onClick={handleToggleWishlist} // Langsung panggil handleToggleWishlist
                        disabled={processingWishlist}
                        aria-label={isWishlisted ? t('wishlist.removeFrom', 'Hapus dari Wishlist') : t('wishlist.addTo', 'Tambah ke Wishlist')}
                        >
                        <span>{isWishlisted ? t('wishlist.inWishlist', 'Di Wishlist') : t('wishlist.addToWishlistText', 'Wishlist')}</span>
                    </Tombol>
                </div>
            </div>
        </div>
      </main>

      {/* Bagian Produk Sejenis */}
      {loadingSimilar && (
        <div className="similar-products-loading">
          <p>{t("product.loadingSimilar", "Memuat produk sejenis...")}</p>
        </div>
      )}
      {!loadingSimilar && errorSimilar && (
        <div className="similar-products-error">
          <p>{errorSimilar}</p>
        </div>
      )}
      {!loadingSimilar && !errorSimilar && similarProducts.length > 0 && (
        <section className="similar-products-section" aria-labelledby="similar-products-title">
          <h3 id="similar-products-title" className="similar-products-title">
            {t("product.similarProductsTitle", "Anda Mungkin Juga Suka")}
          </h3>
          <div className="similar-products-list">
            {similarProducts.map((p) => (
              <SimilarProductItem key={p.id} product={p} formatPrice={formatPrice} />
            ))}
          </div>
        </section>
      )}
       {!loadingSimilar && !errorSimilar && similarProducts.length === 0 && product && product.kategori && (
        <div className="similar-products-empty">
          {/* Opsional: Pesan jika tidak ada produk sejenis yang ditemukan */}
          {/* <p>{t("product.noSimilarFound", "Tidak ada produk sejenis lainnya.")}</p> */}
        </div>
      )}


      {product && (
        <div className="floating-action-mobile">
          {token ? (
            <Tombol
              style="cart w-full"
              text={product.stock === 0 ? t("cart.outOfStock", "Stok Habis") : t("cart.buyNow", "Checkout")}
              disabled={product.stock === 0 || processingCart}
              onClick={async () => {
                if (!token) {
                  stableSetNotif(t("cart.notLogin", "Anda harus login untuk menambahkan ke keranjang."));
                  stableShowNotif();
                  return navigate("/login");
                }

                setProcessingCart(true);
                try {
                  const response = await addToCart(product.id, 1, token);
                  if (response.status === 200 || response.status === 201) {
                    const updatedCart = await getCart(token);
                    if (updatedCart.status === 200 && updatedCart.data) {
                      stableUpdateCartInStore(updatedCart.data);
                    }
                    navigate("/cart"); // ✅ langsung ke halaman keranjang
                  } else {
                    stableSetNotif(response.message || t("cart.addFailed", "Gagal menambahkan ke keranjang."));
                    stableShowNotif();
                  }
                } catch (err) {
                  console.error("Error saat checkout langsung:", err);
                  stableSetNotif(t("cart.addFailed", "Terjadi kesalahan. Gagal menambahkan ke keranjang."));
                  stableShowNotif();
                } finally {
                  setProcessingCart(false);
                }
              }}
            />
          ) : (
            <Tombol
              style="cart w-full"
              text={t("cart.loginToBuy", "Login untuk Checkout")}
              onClick={() => navigate("/login")}
              
            />
          )}
        </div>
      )}





    </div>
  );
};

export default ProductDetail;
