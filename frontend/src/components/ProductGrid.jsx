import React, { useEffect, useState, useCallback } from "react";
import { getProductLaris } from "../services/productService"; // Menggunakan service Anda
import { addToCart, getCart } from "../services/cartService"; // Menggunakan service Anda
import {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
} from "../services/wishlistService"; // Menggunakan service Anda
import useNotifStore from "../../store/notifStore"; // Sesuaikan path jika perlu
import useUserStore from "../../store/userStore"; // Sesuaikan path jika perlu
import useCartStore from "../../store/cartStore"; // Sesuaikan path jika perlu
import { FiHeart, FiShoppingCart } from "react-icons/fi";
import "./ProductGrid.scss"; // Pastikan file SCSS ini ada dan path-nya benar
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";

export default function ProductGrid() {
  const { token, emptyUser } = useUserStore();
  const { setCart } = useCartStore(); // cart state tidak diambil langsung, tapi diupdate via setCart
  const { setNotif, showNotif } = useNotifStore();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlistIds, setWishlistIds] = useState([]); // Menyimpan ID produk yang ada di wishlist
  const [processing, setProcessing] = useState(null); // Untuk disable tombol spesifik: 'cart-PRODUCT_ID' atau 'wishlist-PRODUCT_ID'

  const { t } = useTranslation();
  const navigate = useNavigate();

  const stableSetNotif = useCallback(setNotif, []);
  const stableShowNotif = useCallback(showNotif, []);
  const stableEmptyUser = useCallback(emptyUser, []);
  const stableSetCart = useCallback(setCart, []);

  // Fetch produk dan wishlist
  useEffect(() => {
    let unmounted = false;
    async function fetchData() {
      setLoading(true);
      try {
        const productResponse = await getProductLaris(); // Menggunakan service Anda untuk mendapatkan produk laris
        if (!productResponse || productResponse.status !== 200) {
          console.error("Gagal mengambil produk laris:", productResponse.message);
          stableSetNotif(t("error.fetchProducts", "Gagal memuat produk."));
          stableShowNotif();
        }
        let fetchedProducts = [];
        if (productResponse.status === 200 && productResponse.data) {
          // Asumsi productResponse.data adalah array produk jika id tidak diberikan
          // Jika productResponse.data adalah objek { products: [...] }, sesuaikan di bawah
          fetchedProducts = Array.isArray(productResponse.data) ? productResponse.data : (productResponse.data.products || []);
        } else {
          console.error("Gagal mengambil produk:", productResponse.message);
          stableSetNotif(t("error.fetchProducts", "Gagal memuat produk."));
          stableShowNotif();
        }

        let fetchedWishlistIds = [];
        if (token) {
          const wishlistResponse = await getWishlist(token);
          if (wishlistResponse.status === 200 && Array.isArray(wishlistResponse.data)) {
            fetchedWishlistIds = wishlistResponse.data.map(item => item.productId || item.id); // Sesuaikan dengan struktur data wishlist Anda
          } else if (wishlistResponse.status !== 401) { // Jangan notif jika hanya sesi habis
            console.error("Gagal mengambil wishlist:", wishlistResponse.message);
          }
        }

        if (!unmounted) {
          setProducts(fetchedProducts);
          setWishlistIds(fetchedWishlistIds);
        }
      } catch (error) {
        console.error("Error saat mengambil data awal:", error);
        if (!unmounted) {
          stableSetNotif(t("error.fetchData", "Terjadi kesalahan saat memuat data."));
          stableShowNotif();
        }
      } finally {
        if (!unmounted) {
          setLoading(false);
        }
      }
    }
    fetchData();
    return () => { unmounted = true; };
  }, [token, t, stableSetNotif, stableShowNotif]);

  // Fetch keranjang awal
  useEffect(() => {
    async function fetchCartInit() {
      if (!token) return;
      try {
        const cartResponse = await getCart(token);
        if (cartResponse.status === 200) {
          stableSetCart(cartResponse.data);
        } else if (cartResponse.status === 401) {
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
    if (!token) {
      stableSetNotif(t("cart.notLogin", "Anda harus login untuk menambah ke keranjang."));
      stableShowNotif();
      return;
    }
    if (processing) return; // Jika ada proses lain, jangan lakukan apa-apa

    setProcessing(`cart-${productId}`);
    try {
      const response = await addToCart(productId, 1, token); // Kuantitas 1
      if (response.status === 200 || response.status === 201) {
        stableSetNotif(t("cart.addedSuccess", "Produk berhasil ditambahkan ke keranjang!"));
        // Fetch ulang keranjang untuk update
        const updatedCartData = await getCart(token);
        if (updatedCartData.status === 200) {
          stableSetCart(updatedCartData.data);
        }
      } else if (response.status === 401) {
        stableEmptyUser();
        stableSetNotif(t("cart.sessionExpired", "Sesi login habis."));
        stableShowNotif();
      } else {
        stableSetNotif(response.message || t("cart.addError", "Gagal menambah ke keranjang."));
      }
    } catch (error) {
      console.error("Error saat menambah ke keranjang:", error);
      stableSetNotif(t("cart.addError", "Terjadi kesalahan."));
    } finally {
      setProcessing(null);
      stableShowNotif();
    }
  };

  const handleWishlist = async (event, productId) => {
    event.stopPropagation();
    if (!token) {
      stableSetNotif(t("wishlist.notLogin", "Anda harus login untuk mengubah wishlist."));
      stableShowNotif();
      return;
    }
    if (processing) return;

    setProcessing(`wishlist-${productId}`);
    const isCurrentlyWishlisted = wishlistIds.includes(productId);
    try {
      let response;
      if (isCurrentlyWishlisted) {
        response = await removeFromWishlist(productId, token);
      } else {
        response = await addToWishlist(productId, token);
      }

      if (response.status === 200 || response.status === 201) {
        // Update state wishlistIds secara manual atau fetch ulang
        if (isCurrentlyWishlisted) {
          setWishlistIds(prevIds => prevIds.filter(id => id !== productId));
        } else {
          setWishlistIds(prevIds => [...prevIds, productId]);
        }
        stableSetNotif(response.message || (isCurrentlyWishlisted ? t("wishlist.removed") : t("wishlist.added")));
      } else if (response.status === 401) {
        stableEmptyUser();
        stableSetNotif(t("wishlist.sessionExpired", "Sesi login habis."));
        stableShowNotif();
        navigate("/login");
      } else {
        stableSetNotif(response.message || t("wishlist.error", "Gagal memproses wishlist."));
      }
    } catch (error) {
      console.error("Error saat memproses wishlist:", error);
      stableSetNotif(t("wishlist.error", "Terjadi kesalahan."));
    } finally {
      setProcessing(null);
      stableShowNotif();
    }
  };

  if (loading) {
    return (
      <div className="product-grid-container"> {/* Tambahkan container jika perlu untuk styling loading */}
        <div className="loading-state">{t("product.loading", "Memuat produk...")}</div>
      </div>
    );
  } 

  if (!products.length) {
    return (
      <div className="product-grid-container">
        <div className="empty-state"></div>
      </div>
    );
  }

  return (
    <>
      {/* Komponen Notif idealnya ada di App.js atau layout utama */}
      {/* <Notif /> */}
      
      <div className="container mx-auto py-10">
        <div className="category-header">BROWSE BY BEST SELLER</div>
        <div className="product-grid">
          {products.map((p) => (
            <Link
              className="product-card"
              key={p.id}
              to={`/detail/${p.id}`}
              tabIndex={0}
            >
              <div className="product-img-wrap"> {/* Pastikan kelas ini sesuai dengan SCSS Anda */}
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
                <div className="product-category">
                  {p.kategori ? (typeof p.kategori === 'string' ? p.kategori.toLowerCase() : p.kategori.nama?.toLowerCase()) : ""}
                </div>
                <h3 className="product-title">{p.nama}</h3>
                <div className="product-price">
                  Rp {Number(p.harga).toLocaleString("id-ID")}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
