import React, { useEffect, useState, useCallback } from "react";
import { getProductLaris } from "../services/productService";
import { addToCart, getCart } from "../services/cartService";
import {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
} from "../services/wishlistService";
import useNotifStore from "../../store/notifStore";
import useUserStore from "../../store/userStore";
import useCartStore from "../../store/cartStore";
import { FiHeart, FiShoppingCart } from "react-icons/fi";
import "./ProductGrid.scss";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";

export default function ProductGrid() {
  const { token, emptyUser } = useUserStore();
  const { setCart } = useCartStore();
  const { setNotif, showNotif } = useNotifStore();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [processing, setProcessing] = useState(null); // "cart-<id>" | "wishlist-<id>" | null

  const { t } = useTranslation();
  const navigate = useNavigate();

  // jaga stabilitas fungsi ke deps effect
  const stableSetNotif = useCallback(setNotif, []);
  const stableShowNotif = useCallback(showNotif, []);
  const stableEmptyUser = useCallback(emptyUser, []);
  const stableSetCart = useCallback(setCart, []);

  // Fetch produk & wishlist
  useEffect(() => {
    let unmounted = false;

    async function fetchData() {
      setLoading(true);
      try {
        const productResponse = await getProductLaris();
        let fetchedProducts = [];

        if (productResponse?.status === 200) {
          fetchedProducts = Array.isArray(productResponse.data)
            ? productResponse.data
            : productResponse.data?.products || [];
        } else {
          console.error("Gagal mengambil produk:", productResponse?.message);
          stableSetNotif(t("error.fetchProducts", "Gagal memuat produk."));
          stableShowNotif();
        }

        let fetchedWishlistIds = [];
        if (token) {
          const wishlistResponse = await getWishlist(token);
          if (wishlistResponse?.status === 200 && Array.isArray(wishlistResponse.data)) {
            fetchedWishlistIds = wishlistResponse.data.map(
              (item) => item.productId ?? item.id
            );
          } else if (wishlistResponse?.status !== 401) {
            console.error("Gagal mengambil wishlist:", wishlistResponse?.message);
          }
        }

        if (!unmounted) {
          setProducts(fetchedProducts);
          setWishlistIds(fetchedWishlistIds);
        }
      } catch (err) {
        console.error("Error saat mengambil data awal:", err);
        if (!unmounted) {
          stableSetNotif(t("error.fetchData", "Terjadi kesalahan saat memuat data."));
          stableShowNotif();
        }
      } finally {
        if (!unmounted) setLoading(false);
      }
    }

    fetchData();
    return () => {
      unmounted = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, t, stableSetNotif, stableShowNotif]);

  // Fetch keranjang awal (jika sudah login)
  useEffect(() => {
    async function fetchCartInit() {
      if (!token) return;
      try {
        const cartResponse = await getCart(token);
        if (cartResponse?.status === 200) {
          stableSetCart(cartResponse.data);
        } else if (cartResponse?.status === 401) {
          stableEmptyUser();
          stableSetNotif(t("cart.sessionExpired", "Sesi login habis. Silakan login ulang."));
          stableShowNotif();
        }
      } catch (error) {
        console.error("Gagal mengambil keranjang awal:", error);
      }
    }
    fetchCartInit();
  }, [token, stableSetCart, stableEmptyUser, stableSetNotif, stableShowNotif, t]);

  const handleAddCart = async (event, productId) => {
    event.stopPropagation();
    event.preventDefault();
    if (!token) {
      stableSetNotif(t("cart.notLogin", "Anda harus login untuk menambah ke keranjang."));
      stableShowNotif();
      return;
    }
    if (processing) return;

    setProcessing(`cart-${productId}`);
    try {
      const response = await addToCart(productId, 1, token);
      if (response?.status === 200 || response?.status === 201) {
        stableSetNotif(t("cart.addSuccess", "Produk berhasil ditambahkan ke keranjang!"));
        const updatedCartData = await getCart(token);
        if (updatedCartData?.status === 200) {
          stableSetCart(updatedCartData.data);
        }
      } else if (response?.status === 401) {
        stableEmptyUser();
        stableSetNotif(t("cart.sessionExpired", "Sesi login habis."));
      } else {
        stableSetNotif(response?.message || t("cart.addFailed", "Gagal menambah ke keranjang."));
      }
    } catch (err) {
      console.error("Error saat menambah ke keranjang:", err);
      stableSetNotif(t("cart.addFailed", "Terjadi kesalahan."));
    } finally {
      setProcessing(null);
      stableShowNotif();
    }
  };

  const handleWishlist = async (event, productId) => {
    event.stopPropagation();
    event.preventDefault();
    if (!token) {
      stableSetNotif(t("wishlist_notLogin", "Silakan login untuk mengubah wishlist."));
      stableShowNotif();
      return;
    }
    if (processing) return;

    setProcessing(`wishlist-${productId}`);
    const isWishlisted = wishlistIds.includes(productId);
    try {
      const response = isWishlisted
        ? await removeFromWishlist(productId, token)
        : await addToWishlist(productId, token);

      if (response?.status === 200 || response?.status === 201) {
        setWishlistIds((prev) =>
          isWishlisted ? prev.filter((id) => id !== productId) : [...prev, productId]
        );
        stableSetNotif(
          response?.message ||
            (isWishlisted
              ? t("wishlist_removed", "Dihapus dari wishlist!")
              : t("wishlist_added", "Ditambahkan ke wishlist!"))
        );
      } else if (response?.status === 401) {
        stableEmptyUser();
        stableSetNotif(t("wishlist_sessionExpired", "Sesi Anda telah berakhir. Silakan login kembali."));
        navigate("/login");
      } else {
        stableSetNotif(response?.message || t("wishlist.error", "Gagal memproses wishlist."));
      }
    } catch (err) {
      console.error("Error saat memproses wishlist:", err);
      stableSetNotif(t("wishlist.error", "Terjadi kesalahan."));
    } finally {
      setProcessing(null);
      stableShowNotif();
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="product-grid-container">
        <div className="category-header">
          {t("home_best_selling_products", "BROWSE BY BEST SELLER")}
        </div>
        <div className="product-grid skeleton-grid">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div className="skeleton-card" key={`sk-${idx}`}>
              <div className="skeleton-img" />
              <div className="skeleton-line short" />
              <div className="skeleton-line" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="product-grid-container">
        <div className="category-header">
          {t("home_best_selling_products", "BROWSE BY BEST SELLER")}
        </div>
        <div className="empty-state">
          {t("home_no_products", "Tidak ada produk yang ditemukan.")}
        </div>
      </div>
    );
  }

  return (
    <div className="product-grid-container">
      <div className="category-header">
        {t("home_best_selling_products", "BROWSE BY BEST SELLER")}
      </div>

      <div className="product-grid">
        {products.map((p) => {
          const pid = p.id;
          const inWishlist = wishlistIds.includes(pid);
          const price = Number(p.harga || 0);
          const kategoriText =
            p.kategori
              ? typeof p.kategori === "string"
                ? p.kategori.toLowerCase()
                : p.kategori?.nama?.toLowerCase() || ""
              : "";

          return (
            <Link
              className="product-card"
              key={pid}
              to={`/product/${p.slug}`}
              tabIndex={0}
              aria-label={`${p.nama} - Rp ${price.toLocaleString("id-ID")}`}
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
                    className={`fav-btn ${inWishlist ? "active" : ""}`}
                    onClick={(e) => handleWishlist(e, pid)}
                    aria-label={
                      inWishlist
                        ? t("wishlist_removed", "Hapus dari wishlist")
                        : t("wishlist_added", "Tambah ke wishlist")
                    }
                    aria-pressed={inWishlist ? "true" : "false"}
                    disabled={processing === `wishlist-${pid}`}
                  >
                    <FiHeart />
                  </button>

                  <button
                    className="cart-btn"
                    onClick={(e) => handleAddCart(e, pid)}
                    aria-label={t("cart.addToCart", "Tambah ke Keranjang")}
                    disabled={processing === `cart-${pid}`}
                  >
                    <FiShoppingCart />
                  </button>
                </div>
              </div>

              <div className="product-info">
                <div className="product-category">{kategoriText}</div>
                <h3 className="product-title" title={p.nama}>
                  {p.nama}
                </h3>
                <div className="product-price">
                  Rp {price.toLocaleString("id-ID")}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
