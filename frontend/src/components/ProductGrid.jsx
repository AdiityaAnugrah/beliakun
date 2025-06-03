import React, { useEffect, useState } from "react";
import { getProducts } from "../services/productService";
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

export default function ProductGrid() {
    const { token, emptyUser } = useUserStore();
    const { setCart } = useCartStore();
    const { setNotif, showNotif } = useNotifStore();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [wishlistIds, setWishlistIds] = useState([]);
    const [processing, setProcessing] = useState(false);
    const { t } = useTranslation();
    useEffect(() => {
        let unmounted = false;
        async function fetchData() {
            setLoading(true);
            // Fetch products
            const resProd = await getProducts();
            let arr = [];
            if (
                resProd &&
                resProd.status === 200 &&
                resProd.data &&
                Array.isArray(resProd.data.products)
            ) {
                arr = resProd.data.products;
            }
            // Fetch wishlist (if login)
            let wishArr = [];
            if (token && typeof getWishlist === "function") {
                const resWish = await getWishlist(token);
                if (resWish && resWish.data && Array.isArray(resWish.data)) {
                    wishArr = resWish.data.map(
                        (item) => item.productId || item.id
                    );
                }
            }
            if (!unmounted) {
                setProducts(arr);
                setWishlistIds(wishArr);
                setLoading(false);
            }
        }
        fetchData();
        return () => {
            unmounted = true;
        };
    }, [token]);

    // 2. Fetch cart sekali di-mount (jika login)
    useEffect(() => {
        async function fetchCartInit() {
            if (!token) return;
            const res = await getCart(token);
            if (res.status === 401) {
                emptyUser();
                // Tidak redirect!
                setNotif("Sesi login habis. Silakan login ulang.");
                showNotif();
                return;
            }
            if (res.status === 200) {
                setCart(res.data);
            }
        }
        fetchCartInit();
        // eslint-disable-next-line
    }, [token]);

    // 3. Handler Tambah ke Cart
    const handleAddCart = async (id) => {
        if (!token) {
            setNotif(t("cart.notLogin"));
            showNotif();
            return;
        }
        if (processing) return;
        setProcessing(true);
        const res = await addToCart(id, 1, token);
        if (res.status === 200) {
            setNotif(t("cart.notLogin"));
        } else if (res.status === 401) {
            emptyUser();
            setNotif(t("cart.sessionExpired"));
        } else {
            setNotif(res.message || "Gagal menambah ke keranjang.");
        }
        setProcessing(false);
        showNotif();
    };

    // 4. Handler Wishlist
    const handleWishlist = async (id) => {
        if (!token) {
            setNotif(t("wishlist_notLogin"));
            showNotif();
            return;
        }
        if (processing) return;
        setProcessing(true);
        if (wishlistIds.includes(id)) {
            await removeFromWishlist(id, token);
            setWishlistIds((prev) => prev.filter((wid) => wid !== id));
            setNotif(t("wishlist_removed"));
        } else {
            await addToWishlist(id, token);
            setWishlistIds((prev) => [...prev, id]);
            setNotif(t("wishlist_added"));
        }
        setProcessing(false);
        showNotif();
    };

    // NOTIF
    // Pastikan Notif komponen ada di parent/page ini
    // atau bisa render di sini juga untuk demo
    // (rekomendasi: cukup render sekali di parent App/Layout/Page)

    if (loading)
        return (
            <div className="product-grid">
                <div className="loading">Loading...</div>
            </div>
        );
    if (!products.length)
        return (
            <div className="product-grid">
                <div className="empty">Belum ada produk.</div>
            </div>
        );

    return (
        <>
            {/* Tambahkan komponen Notif di sini jika belum ada */}
            {/* <Notif /> */}
            <div className="product-grid">
                {products.map((p) => (
                    <div className="product-card" key={p.id}>
                        <div className="product-img-full">
                            <img src={p.gambar} alt={p.nama} />
                            <div className="product-actions">
                                <button
                                    className={`fav-btn ${wishlistIds.includes(p.id) ? "active" : ""}`}
                                    onClick={() => handleWishlist(p.id)}
                                    aria-label="Wishlist"
                                    disabled={processing}
                                >
                                    <FiHeart />
                                </button>
                                <button
                                    className="cart-btn"
                                    onClick={() => handleAddCart(p.id)}
                                    aria-label="Tambah Keranjang"
                                    disabled={processing}
                                >
                                    <FiShoppingCart />
                                </button>
                            </div>
                        </div>
                        <div className="product-info">
                            <div className="product-category">
                                {p.kategori ? p.kategori.toLowerCase() : ""}
                            </div>
                            <div className="product-title">{p.nama}</div>
                            <div className="product-price">
                                Rp {Number(p.harga).toLocaleString("id-ID")}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}
