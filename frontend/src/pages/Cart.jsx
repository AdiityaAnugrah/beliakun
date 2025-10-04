import { useEffect, useMemo, useState } from "react";
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
import "./cart.scss";

const Cart = () => {
  const [loading, setLoading] = useState(true);
  const [updatingIds, setUpdatingIds] = useState(new Set());
  const { token, emptyUser } = useUserStore();
  const { showNotif, setNotif } = useNotifStore();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { cart, setCart } = useCartStore();

  const formatIDR = (n) =>
    (Number(n) || 0).toLocaleString("id-ID", { maximumFractionDigits: 0 });

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
    if (res.status === 200) setCart(res.data);
    else {
      setNotif(t("cart.errorFetch"));
      showNotif();
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const lock = (id) => setUpdatingIds((s) => new Set(s).add(id));
  const unlock = (id) =>
    setUpdatingIds((s) => {
      const n = new Set(s);
      n.delete(id);
      return n;
    });

  const handleAdd = async (productId, currentQty, maxStok) => {
    if (currentQty >= maxStok) {
      setNotif(t("cart.maxStok"));
      showNotif();
      return;
    }
    lock(productId);
    const res = await updateCartQuantity(productId, currentQty + 1, token);
    if (res.status === 401) {
      emptyUser();
      navigate("/login");
      return;
    }
    await fetchCart();
    unlock(productId);
  };

  const handleReduce = async (productId, currentQty) => {
    if (currentQty <= 1) return;
    lock(productId);
    const res = await updateCartQuantity(productId, currentQty - 1, token);
    if (res.status === 401) {
      emptyUser();
      navigate("/login");
      return;
    }
    await fetchCart();
    unlock(productId);
  };

  const handleDelete = async (productId) => {
    lock(productId);
    const res = await deleteCartItem(productId, token);
    if (res.status === 401) {
      emptyUser();
      navigate("/login");
      return;
    }
    await fetchCart();
    unlock(productId);
  };

  const total = useMemo(
    () => cart.reduce((acc, it) => acc + it.harga * it.quantity, 0),
    [cart]
  );

  return (
    <>
      <Topbar title={t("cart.title")} />
      <div className="cart-container">
        <Notif />

        {/* Loading minimal */}
        {loading && (
          <div className="skeleton">
            {[...Array(3)].map((_, i) => (
              <div className="sk-row" key={i}>
                <div className="sk-img" />
                <div className="sk-lines">
                  <span />
                  <span className="short" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && cart.length === 0 && (
          <div className="empty">
            <div className="emoji" aria-hidden>🛍️</div>
            <p className="title">{t("cart.empty")}</p>
            <p className="hint">{t("cart.emptyHint") || "Mulai belanja sekarang."}</p>
            <button className="btn-ghost" onClick={() => navigate("/")}>
              {t("cart.backToShop") || "Lihat Produk"}
            </button>
          </div>
        )}

        {!loading && cart.length > 0 && (
          <>
            <div className="cart-list" role="list">
              {cart.map((item) => {
                const disabled = updatingIds.has(item.productId);
                return (
                  <div className="row" role="listitem" key={item.productId}>
                    <img
                      className="thumb"
                      src={item.gambar}
                      alt={item.nama}
                      onError={(e) => {
                        e.currentTarget.src =
                          "data:image/svg+xml;utf8," +
                          encodeURIComponent(
                            `<svg xmlns='http://www.w3.org/2000/svg' width='54' height='54'><rect width='100%' height='100%' fill='#f3f4f6'/></svg>`
                          );
                      }}
                    />

                    <div className="meta">
                      <div className="name" title={item.nama}>
                        {item.nama}
                      </div>
                      <div className="price">Rp {formatIDR(item.harga)}</div>
                      <div className="stock">
                        {t("cart.stockAvailable", { stok: item.stok })}
                      </div>
                    </div>

                    <div className="controls">
                      <button
                        className="seg"
                        aria-label={t("cart.decrease") || "Kurangi"}
                        onClick={() => handleReduce(item.productId, item.quantity)}
                        disabled={disabled || item.quantity <= 1}
                      >
                        −
                      </button>
                      <span className="qty" aria-live="polite">
                        {item.quantity}
                      </span>
                      <button
                        className="seg"
                        aria-label={t("cart.increase") || "Tambah"}
                        onClick={() =>
                          handleAdd(item.productId, item.quantity, item.stok)
                        }
                        disabled={disabled || item.quantity >= item.stok}
                      >
                        +
                      </button>
                    </div>

                    <button
                      className="remove"
                      onClick={() => handleDelete(item.productId)}
                      disabled={disabled}
                      aria-label={t("cart.removeItem") || "Hapus item"}
                    >
                      {t("cart.removeItem")}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="footer">
              <div className="sum">
                <span>{t("cart.total")}</span>
                <strong>Rp {formatIDR(total)}</strong>
              </div>
              <button
                className="cta"
                onClick={() => navigate("/checkout")}
                aria-label="Lanjut ke pembayaran"
              >
                {t("cart.checkout")}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Cart;
