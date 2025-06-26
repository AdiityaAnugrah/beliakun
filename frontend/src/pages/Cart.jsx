import { useEffect, useState } from "react";
import {
  getCart,
  updateCartQuantity,
  deleteCartItem,
} from "../services/cartService";
import useUserStore from "../../store/userStore";
import useCartStore from "../../store/cartStore";
import useNotifStore from "../../store/notifStore";
import Notif from "../components/Notif";
import Topbar from "../components/Topbar";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import "./cart.scss";

const Cart = () => {
  const [loading, setLoading] = useState(true);
  const { token, emptyUser } = useUserStore();
  const { cart, setCart } = useCartStore();
  const { showNotif, setNotif } = useNotifStore();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const fetchCart = async () => {
    if (!token) {
      setNotif(t("cart.notLogin"));
      showNotif();
      return navigate("/login");
    }

    const res = await getCart(token);
    if (res.status === 401) {
      emptyUser();
      return navigate("/login");
    }

    res.status === 200
      ? setCart(res.data)
      : (setNotif(t("cart.errorFetch")), showNotif());

    setLoading(false);
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleQtyChange = async (productId, quantity, stok) => {
    if (quantity < 1 || quantity > stok) return;
    const res = await updateCartQuantity(productId, quantity, token);
    if (res.status === 401) {
      emptyUser();
      return navigate("/login");
    }
    fetchCart();
  };

  const handleDelete = async (productId) => {
    const res = await deleteCartItem(productId, token);
    if (res.status === 401) {
      emptyUser();
      return navigate("/login");
    }
    fetchCart();
  };

  const total = cart.reduce((acc, item) => acc + item.harga * item.quantity, 0);

  return (
    <>
      <Topbar title={t("cart.title")} />
      <Notif />

      <section className="cart">
        {loading ? (
          <p className="cart__empty">{t("cart.loading")}</p>
        ) : cart.length === 0 ? (
          <p className="cart__empty">{t("cart.empty")}</p>
        ) : (
          <>
            <div className="cart__list">
              {cart.map((item) => (
                <div className="cart__item" key={item.productId}>
                  <img src={item.gambar} alt={item.nama} className="cart__image" />

                  <div className="cart__detail">
                    <h3>{item.nama}</h3>
                    <span className="cart__harga">
                      Rp {item.harga.toLocaleString("id-ID")}
                    </span>
                    <small className="cart__stok">
                      {t("cart.stockAvailable", { stok: item.stok })}
                    </small>

                    <div className="cart__qty">
                      <button onClick={() => handleQtyChange(item.productId, item.quantity - 1, item.stok)}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => handleQtyChange(item.productId, item.quantity + 1, item.stok)}>+</button>
                    </div>
                  </div>

                  <button className="cart__remove" onClick={() => handleDelete(item.productId)}>
                    &times;
                  </button>
                </div>
              ))}
            </div>

            <div className="cart__checkout-bar">
              <div className="cart__total">
                {t("cart.total")}: <strong>Rp {total.toLocaleString("id-ID")}</strong>
              </div>
              <button className="cart__checkout" onClick={() => navigate("/checkout")}>
                {t("cart.checkout")}
              </button>
            </div>
          </>
        )}
      </section>
    </>
  );
};

export default Cart;
