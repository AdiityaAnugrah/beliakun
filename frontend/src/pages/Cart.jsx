import { useEffect, useState } from "react";
import {
    getCart,
    updateCartQuantity,
    deleteCartItem,
} from "../services/cartService";
import useUserStore from "../../store/userStore";
import useCartStore from "../../store/cartStore";
import Notif from "../components/Notif";
import useNotifStore from "../../store/notifStore";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const Cart = () => {
    const [loading, setLoading] = useState(true);
    const { token, emptyUser } = useUserStore();
    const { showNotif, setNotif } = useNotifStore();
    const { t } = useTranslation();
    const navigate = useNavigate();
    // Menggunakan Zustand store untuk cart
    const { cart, setCart } = useCartStore();

    const fetchCart = async () => {
        if (!token) {
            setNotif(t("cart.notLogin"));
            showNotif();
            navigate("/login");
            return;
        }

        const res = await getCart(token);
        if (res.status === 401) {
            emptyUser();
            navigate("/login");
            return;
        }

        if (res.status === 200) {
            setCart(res.data); // ✅ otomatis trigger setCart() di Zustand
        } else {
            setNotif(t("cart.errorFetch"));
            showNotif();
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchCart();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleAdd = async (productId, currentQty, maxStok) => {
        if (currentQty >= maxStok) {
            setNotif(t("cart.maxStok"));
            showNotif();
            return;
        }
        const res = await updateCartQuantity(productId, currentQty + 1, token);
        if (res.status === 401) {
            emptyUser();
            navigate("/login");
            return;
        }
        fetchCart();
    };

    const handleReduce = async (productId, currentQty) => {
        if (currentQty <= 1) return;
        const res = await updateCartQuantity(productId, currentQty - 1, token);
        if (res.status === 401) {
            emptyUser();
            navigate("/login");
            return;
        }
        fetchCart();
    };

    const handleDelete = async (productId) => {
        const res = await deleteCartItem(productId, token);
        if (res.status === 401) {
            emptyUser();
            navigate("/login");
            return;
        }
        fetchCart(); // ✅ otomatis trigger setCart()
    };

    const total = cart.reduce(
        (acc, item) => acc + item.harga * item.quantity,
        0
    );

    return (
        <div className="cart-container">
            <Notif />
            <h1>{t("cart.title")}</h1>
            {loading ? (
                <p>{t("cart.loading")}</p>
            ) : cart.length === 0 ? (
                <p>{t("cart.empty")}</p>
            ) : (
                <>
                    <div className="cart-list">
                        {cart.map((item) => (
                            <div className="cart-item" key={item.productId}>
                                <img src={item.gambar} alt={item.nama} />
                                <div className="item-info">
                                    <h3>{item.nama}</h3>
                                    <p>
                                        Rp {item.harga.toLocaleString("id-ID")}
                                    </p>
                                    <p>
                                        {t("cart.stockAvailable", {
                                            stok: item.stok,
                                        })}
                                    </p>
                                </div>
                                <div className="quantity-control">
                                    <button
                                        onClick={() =>
                                            handleReduce(
                                                item.productId,
                                                item.quantity
                                            )
                                        }
                                    >
                                        -
                                    </button>
                                    <span>{item.quantity}</span>
                                    <button
                                        onClick={() =>
                                            handleAdd(
                                                item.productId,
                                                item.quantity,
                                                item.stok
                                            )
                                        }
                                    >
                                        +
                                    </button>
                                </div>
                                <button
                                    className="delete-btn"
                                    onClick={() => handleDelete(item.productId)}
                                >
                                    {t("cart.removeItem")}
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="cart-summary">
                        <div className="total-price">
                            {t("cart.total")}: Rp{" "}
                            {total.toLocaleString("id-ID")}
                        </div>
                        <button
                            className="checkout-btn"
                            onClick={() => navigate("/checkout")}
                        >
                            {t("cart.checkout")}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default Cart;
