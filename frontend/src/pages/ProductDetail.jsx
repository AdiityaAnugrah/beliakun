import { useEffect, useState } from "react";
import { getProducts } from "../services/productService";
import { FaHeart, FaShoppingCart } from "react-icons/fa";
import Tombol from "../components/Tombol";
import { useTranslation } from "react-i18next";
import { addToCart } from "../services/cartService";
import useUserStore from "../../store/userStore";
import { useNavigate, useParams } from "react-router-dom";
import useCartStore from "../../store/cartStore";
import useNotifStore from "../../store/notifStore";
import useWishlistStore from "../../store/wishlistStore";
import Notif from "../components/Notif";
import {
    addToWishlist,
    removeFromWishlist,
    getWishlist,
} from "../services/wishlistService";

const ProductDetail = () => {
    const { t, i18n } = useTranslation();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [exchangeRate, setExchangeRate] = useState(null);
    const { token, emptyUser } = useUserStore();
    const { setCart } = useCartStore();
    const { setNotif, showNotif } = useNotifStore();
    const navigate = useNavigate();
    const { wishlist, setWishlist } = useWishlistStore();
    const { id: productId } = useParams();
    const isWishlisted = wishlist.some((item) => item.productId === product.id);

    useEffect(() => {
        const fetchProduct = async () => {
            const result = await getProducts(productId);
            if (result.status === 200) {
                setProduct(result.data);
            } else {
                setError(result.message || t("error"));
            }
            setLoading(false);
        };

        fetchProduct();
    }, [productId, t]);

    useEffect(() => {
        const fetchExchangeRate = async () => {
            try {
                const response = await fetch(
                    "https://v6.exchangerate-api.com/v6/1cbf975a5b2991cec212bf52/latest/USD"
                );
                const data = await response.json();
                if (data.result === "success") {
                    setExchangeRate(data.conversion_rates.IDR);
                } else {
                    console.error("Error fetching exchange rate:", data.error);
                }
            } catch (error) {
                console.error("Failed to fetch exchange rate", error);
            }
        };

        fetchExchangeRate();
    }, []);

    const formatPrice = (price) => {
        if (i18n.language === "id" && exchangeRate) {
            const priceInIDR = price * exchangeRate;
            return `Rp ${priceInIDR.toLocaleString("id-ID")}`;
        } else {
            return `$ ${price.toLocaleString("en-US")}`;
        }
    };

    const handleAddToCart = async () => {
        if (!token) {
            setNotif(t("cart.notLogin"));
            showNotif();
            navigate("/login");
            return;
        }

        if (product.stock <= 0) {
            setNotif(t("cart.outOfStock"));
            showNotif();
            return;
        }

        try {
            const fetchAddCart = await addToCart(product.id, 1, token);

            if (fetchAddCart.status === 401) {
                emptyUser();
                navigate("/login");
                return;
            }

            if (fetchAddCart.status !== 200) {
                setNotif(fetchAddCart.message || t("cart.addFailed"));
                showNotif();
                return;
            }

            setCart(fetchAddCart.data);
            setNotif(t("cart.addSuccess"));
            showNotif();
        } catch (error) {
            console.error("Failed to add to cart", error);
            setNotif(t("cart.addFailed"));
            showNotif();
        }
    };

    const handleToggleWishlist = async () => {
        if (!token) {
            setNotif(t("cart.notLogin"));
            showNotif();
            navigate("/login");
            return;
        }

        if (isWishlisted) {
            const res = await removeFromWishlist(product.id, token);
            if (res.status === 401) {
                emptyUser();
                navigate("/login");
                return;
            }

            setWishlist(
                wishlist.filter((item) => item.productId !== product.id)
            );
            setNotif(t("wishlist_removed") || "Dihapus dari wishlist");
            showNotif();
        } else {
            const res = await addToWishlist(product.id, token);
            if (res.status === 401) {
                emptyUser();
                navigate("/login");
                return;
            }

            // Tambah ulang list dari server (biar sinkron)
            const fetchRes = await getWishlist(token);
            if (fetchRes.status === 200) {
                setWishlist(fetchRes.data);
            }

            setNotif(t("wishlist_added") || "Ditambahkan ke wishlist");
            showNotif();
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center align-center">
                {t("loading")}
            </div>
        );
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="container-product container mx-auto">
            <Notif />
            <img
                src={product.gambar || "/images/default-product.png"}
                alt={product.nama}
            />
            <div className="product-info">
                <div className="flex justify-between">
                    <h3 className="product-title">{product.nama}</h3>
                    <p>{product.kategori}</p>
                </div>
                <div className="product">
                    <div style={{ flex: 1 }} className="flex flex-col">
                        <h4 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
                            {formatPrice(product.harga)}
                        </h4>
                        <p>
                            {t("cart.stockAvailable", { stok: product.stock })}
                        </p>

                        <div>
                            <h6>{t("product_details")}:</h6>
                            <p>{product.deskripsi}</p>
                        </div>
                    </div>
                    <div className="product-actions">
                        <Tombol
                            style="buy"
                            text=""
                            icon={
                                <FaHeart
                                    color={isWishlisted ? "red" : "gray"}
                                />
                            }
                            onClick={handleToggleWishlist}
                        />
                        <Tombol
                            style="cart"
                            text=""
                            icon={<FaShoppingCart />}
                            onClick={handleAddToCart}
                            disabled={product.stock === 0}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
