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
import Topbar from "../components/Topbar";

import "./cart.scss";             // ⬅️ impor SCSS baru

const Cart = () => {
  const [loading, setLoading] = useState(true);
  const { token, emptyUser } = useUserStore();
  const { showNotif, setNotif } = useNotifStore();
  const { cart, setCart } = useCartStore();
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateQty = async (productId, newQty) => {
    const res = await updateCartQuantity(productId, newQty, token);
    if (res.status === 401) {
      emptyUser();
      return navigate("/login");
    }
    fetchCart();
  };

  const removeItem = async (productId) => {
    const res = await deleteCartItem(productId, token);
    if (res.status === 401) {
      emptyUser();
      return navigate("/login");
    }
    fetchCart();
  };

  const subtotal = cart.reduce((acc, item) => acc + item.harga * item.quantity, 0);

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
            {/* list items */}
            <div className="cart__list">
              {cart.map((item) => (
                <article className="cart__item" key={item.productId}>
                  <img src={item.gambar} alt={item.nama} className="cart__thumb" />

                  <div className="cart__info">
                    <h3>{item.nama}</h3>
                    <span className="cart__price">
                      Rp {item.harga.toLocaleString("id-ID")}
                    </span>
                    <small>
                      {t("cart.stockAvailable", { stok: item.stok })}
                    </small>
                  </div>

                  <div className="cart__qty">
                    <button
                      onClick={() =>
                        item.quantity > 1 && updateQty(item.productId, item.quantity - 1)
                      }
                    >
                      &minus;
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() =>
                        item.quantity < item.stok &&
                        updateQty(item.productId, item.quantity + 1)
                      }
                    >
                      &#43;
                    </button>
                  </div>

                  <button
                    className="cart__delete"
                    onClick={() => removeItem(item.productId)}
                  >
                    &times;
                  </button>
                </article>
              ))}
            </div>

            {/* summary */}
            <div className="cart__summary">
              <p>
                {t("cart.total")}:{" "}
                <strong>Rp {subtotal.toLocaleString("id-ID")}</strong>
              </p>
              <button
                className="cart__checkout"
                onClick={() => navigate("/checkout")}
              >
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
