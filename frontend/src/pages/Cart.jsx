import { useEffect, useState } from "react";
import {
  getCart,
  updateCartQuantity,
  deleteCartItem,
} from "../services/cartService";
import useUserStore from "../../store/userStore";
import useCartStore from "../../store/cartStore";
import useNotifStore from "../../store/notifStore";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import Topbar from "../components/Topbar";
import Notif from "../components/Notif";

import { Plus, Minus, Trash2 } from "lucide-react";   // ⬅️ ikon
import "./cart.scss";

const Cart = () => {
  const [loading, setLoading] = useState(true);
  const { token, emptyUser } = useUserStore();
  const { cart, setCart } = useCartStore();
  const { showNotif, setNotif } = useNotifStore();
  const { t } = useTranslation();
  const navigate = useNavigate();

  /* ---------- fetch ---------- */
  const fetchCart = async () => {
    if (!token) {
      setNotif(t("cart.notLogin")); showNotif();
      return navigate("/login");
    }
    const res = await getCart(token);
    if (res.status === 401) { emptyUser(); return navigate("/login"); }
    res.status === 200
      ? setCart(res.data)
      : (setNotif(t("cart.errorFetch")), showNotif());
    setLoading(false);
  };
  useEffect(() => { fetchCart(); /* eslint-disable-next-line */ }, []);

  /* ---------- helpers ---------- */
  const changeQty = async (id, qty, stok) => {
    if (qty < 1 || qty > stok) return;
    const res = await updateCartQuantity(id, qty, token);
    if (res.status === 401) { emptyUser(); return navigate("/login"); }
    fetchCart();
  };
  const remove = async (id) => {
    const res = await deleteCartItem(id, token);
    if (res.status === 401) { emptyUser(); return navigate("/login"); }
    fetchCart();
  };

  const subtotal = cart.reduce((s, i) => s + i.harga * i.quantity, 0);

  /* ---------- render ---------- */
  return (
    <>
      <Topbar title={t("cart.title")} />
      <section className="cart">
        <Notif />

        {loading ? (
          <p className="cart__msg">{t("cart.loading")}</p>
        ) : cart.length === 0 ? (
          <p className="cart__msg">{t("cart.empty")}</p>
        ) : (
          <>
            {/* ================= LIST ================= */}
            <div className="cart__list">
              {/* header desktop */}
              <div className="cart__header">
                <span>{t("cart.product")}</span>
                <span>{t("cart.price")}</span>
                <span>{t("cart.quantity")}</span>
                <span>{t("cart.totalItem")}</span>
                <span />
              </div>

              {cart.map((it) => (
                <article className="cart__item" key={it.productId}>
                  <img src={it.gambar} alt={it.nama} className="cart__img" />

                  <div className="cart__info">
                    <h3>{it.nama}</h3>
                    <small>{t("cart.stockAvailable", { stok: it.stok })}</small>
                  </div>

                  <div className="cart__price">
                    Rp {it.harga.toLocaleString("id-ID")}
                  </div>

                  <div className="cart__qty">
                    <button onClick={() => changeQty(it.productId, it.quantity - 1, it.stok)}>
                      <Minus size={16} strokeWidth={2.2} />
                    </button>
                    <span>{it.quantity}</span>
                    <button onClick={() => changeQty(it.productId, it.quantity + 1, it.stok)}>
                      <Plus size={16} strokeWidth={2.2} />
                    </button>
                  </div>

                  <div className="cart__total">
                    Rp {(it.harga * it.quantity).toLocaleString("id-ID")}
                  </div>

                  <button className="cart__del" onClick={() => remove(it.productId)}>
                    <Trash2 size={18} />
                    <span className="sr-only">{t("cart.removeItem")}</span>
                  </button>
                </article>
              ))}
            </div>

            {/* ================= SUMMARY ================= */}
            <aside className="cart__summary">
              <div className="sum__line">
                {t("cart.total")}: <strong>Rp {subtotal.toLocaleString("id-ID")}</strong>
              </div>
              <button className="sum__checkout" onClick={() => navigate("/checkout")}>
                {t("cart.checkout")}
              </button>
            </aside>
          </>
        )}
      </section>
    </>
  );
};

export default Cart;
