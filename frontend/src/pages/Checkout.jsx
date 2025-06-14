import { useState } from "react";
import useCartStore from "../../store/cartStore";
import useUserStore from "../../store/userStore";
import { useNavigate } from "react-router-dom";
import Notif from "../components/Notif";
import useNotifStore from "../../store/notifStore";
import { useTranslation } from "react-i18next";
import { checkoutManual } from "../services/checkoutService";
import "./Checkout.scss";

const Checkout = () => {
  const { cart, setCart } = useCartStore();
  const { token, emptyUser } = useUserStore();
  const { setNotif, showNotif } = useNotifStore();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [form, setForm] = useState({
    alamat: "",
    catatan: "",
    phone: "",
    paymentType: "bank_transfer",
    bank: "bri",
  });

  const [loading, setLoading] = useState(false);

  const total = cart.reduce(
    (sum, item) => sum + item.harga * item.quantity,
    0
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckout = async () => {
    if (!token) {
      emptyUser();
      navigate("/login");
      return;
    }

    setLoading(true);
    const res = await checkoutManual(form, token);

    if (res.status === 401) {
      emptyUser();
      navigate("/login");
      return;
    }

    if (res.status === 200) {
      setCart([]);
      navigate(`/payment-info/${res.data.order_id}`);
    } else {
      setNotif(res.data.message);
      showNotif();
    }

    setLoading(false);
  };

  return (
    <div className="checkout-page">
      <Notif />
      <h1>{t("checkout.title", "Checkout")}</h1>

      <div className="form-section">
        <input
          type="number"
          name="phone"
          placeholder={t("checkout.phone", "Phone number")}
          value={form.phone}
          onChange={handleChange}
        />

        <textarea
          name="alamat"
          placeholder={t("checkout.address", "Complete address")}
          value={form.alamat}
          onChange={handleChange}
        />
        <textarea
          name="catatan"
          placeholder={t("checkout.note", "Note (optional)")}
          value={form.catatan}
          onChange={handleChange}
        />

        {/* Kategori Pembayaran */}
        <div className="payment-methods">
          <label>{t("checkout.chooseBank", "Choose Payment Method")}</label>

          <div className="bank-category-label">Virtual Account</div>
          <div className="bank-grid">
            {["bni", "bri", "mandiri", "permata"].map((bank) => (
              <div
                key={bank}
                className={`bank-grid-item ${form.bank === bank ? "selected" : ""}`}
                onClick={() => setForm((prev) => ({ ...prev, bank }))}
              >
                <img src={`/assets/payment/${bank}.png`} alt={bank.toUpperCase()} />
              </div>
            ))}
          </div>

          <div className="bank-category-label">QRIS</div>
          <div className="bank-grid">
            <div
              className={`bank-grid-item ${form.bank === "qris" ? "selected" : ""}`}
              onClick={() => setForm((prev) => ({ ...prev, bank: "qris" }))}
            >
              <img src="/assets/payment/qris.png" alt="QRIS" />
            </div>
          </div>

          {/* <div className="bank-category-label">E-Wallet & Credit Card</div>
          <div className="bank-grid">
            {["gopay", "mastercard"].map((method) => (
              <div
                key={method}
                className={`bank-grid-item ${form.bank === method ? "selected" : ""}`}
                onClick={() => setForm((prev) => ({ ...prev, bank: method }))}
              >
                <img src={`/assets/payment/${method}.png`} alt={method.toUpperCase()} />
              </div>
            ))}
          </div> */}
        </div>
      </div>

      <div className="summary-section">
        <h3>{t("checkout.summary", "Order Summary")}</h3>
        <ul>
          {cart.map((item) => (
            <li key={item.productId}>
              <span>{item.nama} x {item.quantity}</span>
              <span>Rp {(item.harga * item.quantity).toLocaleString("id-ID")}</span>
            </li>
          ))}
        </ul>
        <p>
          {t("checkout.total", "Total")}: <strong>Rp {total.toLocaleString("id-ID")}</strong>
        </p>
      </div>

      <button disabled={loading} onClick={handleCheckout}>
        {loading ? t("checkout.processing", "Processing...") : t("checkout.payNow", "Pay Now")}
      </button>
    </div>
  );
};

export default Checkout;
