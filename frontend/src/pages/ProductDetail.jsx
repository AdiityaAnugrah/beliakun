// ProductDetail.jsx
import React, { useEffect, useState, useMemo, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getProductBySlug, getProducts } from "../services/productService";
import { addToCart, getCart } from "../services/cartService";
import {
  addToWishlist,
  removeFromWishlist,
  getWishlist as fetchUserWishlist,
} from "../services/wishlistService";
import Tombol from "../components/Tombol";
import Notif from "../components/Notif";
import {
  FaHeart,
  FaShoppingCart,
  FaArrowLeft,
  FaFacebookF,
  FaWhatsapp,
  FaTwitter,
  FaLink,
} from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams, Link } from "react-router-dom";
import useUserStore from "../../store/userStore";
import useCartStore from "../../store/cartStore";
import useNotifStore from "../../store/notifStore";
import useWishlistStore from "../../store/wishlistStore";
import "./ProductDetail.scss";

const SimilarProductItem = React.memo(({ product, formatPrice }) => {
  const { t } = useTranslation();
  if (!product?.id) return null;
  return (
    <Link
      to={`/product/${product.slug}`}
      className="similar-product-item"
      aria-label={`Lihat detail untuk ${product.nama}`}
    >
      <img
        src={
          product.gambar ||
          "https://placehold.co/300x200/e0e0e0/757575?text=Produk"
        }
        alt={product.nama || "Gambar produk sejenis"}
        className="similar-product-image"
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src =
            "https://placehold.co/300x200/e0e0e0/757575?text=" +
            t("image.loadError", "Gagal Muat");
        }}
        loading="lazy"
      />
      <div className="similar-product-info">
        <h4 className="similar-product-name">
          {product.nama || t("product.unknownName", "Nama Tidak Diketahui")}
        </h4>
        <p className="similar-product-price">{formatPrice(product.harga)}</p>
      </div>
    </Link>
  );
});

const ProductDetail = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { slug } = useParams();

  const { token, emptyUser } = useUserStore();
  const { setCart: updateCartInStore } = useCartStore();
  const { setNotif, showNotif } = useNotifStore();
  const { wishlist, setWishlist: setWishlistInStore } = useWishlistStore();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingCart, setProcessingCart] = useState(false);
  const [processingWishlist, setProcessingWishlist] = useState(false);

  const [similarProducts, setSimilarProducts] = useState([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);
  const [errorSimilar, setErrorSimilar] = useState("");

  const [descExpanded, setDescExpanded] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  // stable callbacks
  const stableSetNotif = useCallback(setNotif, [setNotif]);
  const stableShowNotif = useCallback(showNotif, [showNotif]);
  const stableEmptyUser = useCallback(emptyUser, [emptyUser]);
  const stableUpdateCartInStore = useCallback(updateCartInStore, [updateCartInStore]);
  const stableSetWishlistInStore = useCallback(setWishlistInStore, [setWishlistInStore]);

  const formatPrice = useCallback((price) => {
    if (typeof price !== "number") return "Rp -";
    return `Rp ${price.toLocaleString("id-ID", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  }, []);

  // fetch product
  useEffect(() => {
    let unmounted = false;
    (async () => {
      if (!slug) {
        setError(t("product.invalidId", "Slug Produk tidak valid."));
        setLoading(false);
        return;
      }
      try {
        const res = await getProductBySlug(slug);
        if (!unmounted) {
          if (res.status === 200 && res.data) setProduct(res.data);
          else
            setError(
              res.message || t("product.notFound", "Produk tidak ditemukan.")
            );
        }
      } catch {
        if (!unmounted) setError(t("error.fetch", "Gagal mengambil data produk."));
      } finally {
        if (!unmounted) setLoading(false);
      }
    })();
    return () => {
      unmounted = true;
    };
  }, [slug, t]);

  // fetch similar
  useEffect(() => {
    let unmounted = false;
    (async () => {
      if (!product?.kategori || !product.id) {
        setSimilarProducts([]);
        setLoadingSimilar(false);
        setErrorSimilar("");
        return;
      }
      setLoadingSimilar(true);
      try {
        const res = await getProducts({
          kategori: product.kategori,
          excludeId: product.id,
          limit: 5,
        });
        if (!unmounted) {
          if (res.status === 200 && Array.isArray(res.data.products)) {
            setSimilarProducts(res.data.products);
            setErrorSimilar("");
          } else {
            setSimilarProducts([]);
            setErrorSimilar(
              res.message ||
                t("product.similarNotFound", "Produk sejenis tidak ditemukan.")
            );
          }
        }
      } catch {
        if (!unmounted) {
          setSimilarProducts([]);
          setErrorSimilar(
            t(
              "error.fetchSimilar",
              "Terjadi kesalahan saat mengambil produk sejenis."
            )
          );
        }
      } finally {
        if (!unmounted) setLoadingSimilar(false);
      }
    })();
    return () => {
      unmounted = true;
    };
  }, [product, t]);

  // recently viewed
  useEffect(() => {
    if (product?.id) {
      const stored = JSON.parse(localStorage.getItem("recentlyViewed") || "[]");
      const filtered = stored.filter((p) => p.id !== product.id);
      const updated = [
        {
          id: product.id,
          slug: product.slug,
          nama: product.nama,
          gambar: product.gambar,
          harga: product.harga,
        },
        ...filtered,
      ].slice(0, 6);
      localStorage.setItem("recentlyViewed", JSON.stringify(updated));
      setRecentlyViewed(updated);
    }
  }, [product]);

  // wishlist status
  const isWishlisted = useMemo(() => {
    return product?.id && Array.isArray(wishlist)
      ? wishlist.some(
          (item) => item.productId === product.id || item.id === product.id
        )
      : false;
  }, [product, wishlist]);

  // add to cart
  const handleAddToCart = async () => {
    if (!product?.id || processingCart) return;
    if (!token) {
      stableSetNotif(
        t("cart.notLogin", "Anda harus login untuk menambahkan ke keranjang.")
      );
      stableShowNotif();
      return;
    }
    if (product.stock <= 0) {
      stableSetNotif(t("cart.outOfStock", "Stok produk habis."));
      stableShowNotif();
      return;
    }
    setProcessingCart(true);
    try {
      const resp = await addToCart(product.id, 1, token);
      if (resp.status === 401) {
        stableEmptyUser();
        stableSetNotif(
          t("cart.sessionExpired", "Sesi Anda berakhir, silakan login kembali.")
        );
        stableShowNotif();
        navigate("/login");
        return;
      }
      if ([200, 201].includes(resp.status)) {
        const cartRes = await getCart(token);
        if (cartRes.status === 200 && cartRes.data)
          stableUpdateCartInStore(cartRes.data);
        stableSetNotif(
          t("cart.addSuccess", "Produk berhasil ditambahkan ke keranjang!")
        );
      } else {
        stableSetNotif(
          resp.message || t("cart.addFailed", "Gagal menambahkan ke keranjang.")
        );
      }
      stableShowNotif();
    } catch {
      stableSetNotif(
        t("cart.addFailed", "Terjadi kesalahan. Gagal menambahkan ke keranjang.")
      );
      stableShowNotif();
    } finally {
      setProcessingCart(false);
    }
  };

  // toggle wishlist
  const handleToggleWishlist = async (e) => {
    e?.stopPropagation();
    if (!product?.id || processingWishlist) return;
    if (!token) {
      stableSetNotif(
        t("wishlist.notLogin", "Anda harus login untuk menggunakan wishlist.")
      );
      stableShowNotif();
      return;
    }
    setProcessingWishlist(true);
    try {
      const current = isWishlisted;
      const resp = current
        ? await removeFromWishlist(product.id, token)
        : await addToWishlist(product.id, token);
      if (resp.status === 401) {
        stableEmptyUser();
        stableSetNotif(
          t("wishlist.sessionExpired", "Sesi Anda berakhir, silakan login kembali.")
        );
        stableShowNotif();
        navigate("/login");
        return;
      }
      if ([200, 201].includes(resp.status)) {
        const wishRes = await fetchUserWishlist(token);
        if (wishRes.status === 200 && wishRes.data)
          stableSetWishlistInStore(wishRes.data);
        stableSetNotif(
          current
            ? t("wishlist.removed", "Produk dihapus dari wishlist.")
            : t("wishlist.added", "Produk ditambahkan ke wishlist.")
        );
      } else {
        stableSetNotif(
          resp.message || t("wishlist.toggleFailed", "Gagal mengubah wishlist.")
        );
      }
      stableShowNotif();
    } catch {
      stableSetNotif(
        t("wishlist.toggleFailed", "Terjadi kesalahan. Gagal mengubah wishlist.")
      );
      stableShowNotif();
    } finally {
      setProcessingWishlist(false);
    }
  };

  // social share
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const share = (platform) => {
    let url = "";
    if (platform === "facebook")
      url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        shareUrl
      )}`;
    if (platform === "whatsapp")
      url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareUrl)}`;
    if (platform === "twitter")
      url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
        shareUrl
      )}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };
  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    stableSetNotif(t("link.copied", "Link disalin!"));
    stableShowNotif();
  };

  if (loading)
    return (
      <div className="product-detail-loading">
        <p>{t("loading", "Memuat...")}</p>
      </div>
    );
  if (error)
    return (
      <div className="product-detail-error">
        <p>{error}</p>
      </div>
    );
  if (!product)
    return (
      <div className="product-detail-not-found">
        <p>{t("product.notFoundInitial", "Produk tidak ditemukan.")}</p>
      </div>
    );

  return (
    <div className="product-detail-page">
      <Notif />

      {/* HEADER: hanya mobile */}
      <header className="product-detail-header">
        <button
          onClick={() => navigate(-1)}
          className="header-action-button"
          aria-label={t("go_back", "Kembali")}
        >
          <FaArrowLeft />
        </button>
        <h2 className="header-title">{t("product_details", "Detail Produk")}</h2>
        <button
          onClick={handleToggleWishlist}
          className="header-action-button wishlist-button-header"
          disabled={processingWishlist}
          aria-label={
            isWishlisted
              ? t("wishlist.removeFrom", "Hapus dari Wishlist")
              : t("wishlist.addTo", "Tambah ke Wishlist")
          }
        >
          <FaHeart className={isWishlisted ? "wishlisted" : ""} />
        </button>
      </header>

      <main className="product-detail-main-content">
        {/* GALLERY */}
        <div className="product-gallery-column">
          <div className="product-image-container">
            <img
              src={
                product.gambar ||
                "https://placehold.co/800x600/e0e0e0/757575?text=Produk"
              }
              alt={product.nama || "Gambar Produk"}
              className="product-image-main"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src =
                  "https://placehold.co/800x600/e0e0e0/757575?text=" +
                  t("image.loadError", "Gagal Muat");
              }}
            />
          </div>
        </div>

        {/* INFO */}
        <div className="product-info-column">
          <div className="product-info-header">
            <h1 className="product-name">{product.nama}</h1>
            {product.kategori && (
              <span className="product-category-tag">
                {t(`category.${product.kategori}`, product.kategori)}
              </span>
            )}
          </div>
          <p className="product-price">{formatPrice(product.harga)}</p>
          <p className="product-stock-info">
            {t("cart.stockAvailable", { stok: product.stock ?? 0 })}
          </p>

          {/* PURCHASE CTA (pakai Tombol, tanpa ubah sistem) */}
          <div className="product-purchase-container">
            <Tombol
              style="home btn--block"
              text={
                product.stock > 0
                  ? t("cart.buyNow", "Checkout")
                  : t("cart.outOfStock", "Stok Habis")
              }
              onClick={handleAddToCart}
              disabled={product.stock === 0 || processingCart}
              icon={<FaShoppingCart />}
              type="button"
            />
            <Tombol
              style="kotak btn--block"
              text={
                isWishlisted
                  ? t("wishlist.inWishlist", "Di Wishlist")
                  : t("wishlist.addToWishlistText", "Wishlist")
              }
              onClick={handleToggleWishlist}
              disabled={processingWishlist}
              icon={<FaHeart className={isWishlisted ? "wishlisted" : ""} />}
              type="button"
            />
          </div>

          {/* DESKRIPSI */}
          <div className="product-description-container">
            <h3 className="description-title">
              {t("product.descriptionTitle", "Deskripsi Produk")}
            </h3>
            <div
              className={`description-content ${
                descExpanded ? "expanded" : "truncated"
              }`}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {product.deskripsi ||
                  t("product.noDescription", "Tidak ada deskripsi")}
              </ReactMarkdown>
            </div>
            {product.deskripsi?.split("\n").length > 5 && (
              <span
                className="read-more-link"
                onClick={() => setDescExpanded(!descExpanded)}
              >
                {descExpanded
                  ? t("product.readLess", "Lihat Lebih Sedikit")
                  : t("product.readMore", "Lihat Selengkapnya")}
              </span>
            )}
          </div>

          {/* SOCIAL */}
          <div className="social-sharing">
            <button className="share-button" onClick={() => share("facebook")}>
              <FaFacebookF /> Facebook
            </button>
            <button className="share-button" onClick={() => share("whatsapp")}>
              <FaWhatsapp /> WhatsApp
            </button>
            <button className="share-button" onClick={() => share("twitter")}>
              <FaTwitter /> Twitter
            </button>
            <button className="share-button" onClick={copyLink}>
              <FaLink /> Salin Link
            </button>
          </div>
        </div>
      </main>

      {/* SIMILAR */}
      {!loadingSimilar && !errorSimilar && similarProducts.length > 0 && (
        <section
          className="similar-products-section"
          aria-labelledby="similar-products-title"
        >
          <h3 id="similar-products-title" className="similar-products-title">
            {t("product.similarProductsTitle", "Anda Mungkin Juga Suka")}
          </h3>
          <div className="similar-products-list">
            {similarProducts.map((p) => (
              <Link
                key={p.id}
                to={`/product/${p.slug}`}
                className="similar-product-item"
                aria-label={`Lihat detail untuk ${p.nama}`}
              >
                <div className="similar-product-image-container">
                  <img
                    src={
                      p.gambar ||
                      "https://placehold.co/300x200/e0e0e0/757575?text=Produk"
                    }
                    alt={p.nama}
                    className="similar-product-image"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src =
                        "https://placehold.co/300x200/e0e0e0/757575?text=Gagal+Muat";
                    }}
                    loading="lazy"
                  />
                </div>
                <div className="similar-product-info">
                  <h4 className="similar-product-name">{p.nama}</h4>
                  <p className="similar-product-price">
                    {formatPrice(p.harga)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* RECENTLY VIEWED */}
      {recentlyViewed.length > 1 && (
        <section className="recently-viewed-section">
          <h3 className="section-title">
            {t("recentlyViewed", "Anda Juga Melihat")}
          </h3>
          <div className="recently-viewed-list">
            {recentlyViewed
              .filter((p) => p.id !== product.id)
              .map((p) => (
                <Link key={p.id} to={`/product/${p.slug}`} className="recent-item">
                  <div className="recent-image-container">
                    <img
                      src={
                        p.gambar ||
                        "https://placehold.co/100x75/e0e0e0/757575?text=Produk"
                      }
                      alt={p.nama}
                      className="item-image"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src =
                          "https://placehold.co/100x75/e0e0e0/757575?text=Gagal+Muat";
                      }}
                      loading="lazy"
                    />
                  </div>
                  <div className="item-info">
                    <p className="item-name">{p.nama}</p>
                    <p className="item-price">{formatPrice(p.harga)}</p>
                  </div>
                </Link>
              ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetail;
