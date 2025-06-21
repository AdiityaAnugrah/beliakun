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
    method: "",
  });

  const [loading, setLoading] = useState(false);

  const total = cart.reduce((sum, item) => sum + item.harga * item.quantity, 0);

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

    if (!form.phone || !form.alamat || !form.method) {
      setNotif("Silakan lengkapi semua input terlebih dahulu.");
      showNotif();
      return;
    }

    if (!/^\+?\d{9,15}$/.test(form.phone)) {
      setNotif("Nomor telepon tidak valid.");
      showNotif();
      return;
    }

    setLoading(true);
    const res = await checkoutManual(form, token);

    if (res.status === 401) {
      emptyUser();
      navigate("/login");
      return;
    }

    if (res.status === 200 && res.data?.checkout_url) {
      setCart([]);
      window.location.href = res.data.checkout_url;
    } else {
      setNotif(res.data?.message || "Gagal membuat transaksi");
      showNotif();
    }

    setLoading(false);
  };

  const paymentOptions = [
    { code: "BRIVA", image: "bri.png" },
    { code: "BNIVA", image: "bni.png" },
    { code: "MANDIRIVA", image: "mandiri.png" },
    { code: "PERMATAVA", image: "permata.png" },
    { code: "QRIS", image: "qris.png" },
  ];

  return (
    <div className="checkout-page">
      <Notif />
      <h1>{t("checkout.title", "Checkout")}</h1>

      <div className="form-section">
        <label>{t("checkout.phone", "Phone number")}</label>
        <div className="phone-input">
          <span className="country-code">+62</span>
          <input
            type="tel"
            name="phone"
            placeholder="81234567890"
            value={form.phone.replace(/^\+?62/, '')}
            onChange={(e) => setForm((prev) => ({ ...prev, phone: "+62" + e.target.value.replace(/^0+/, '') }))}
          />
        </div>

        <label>{t("checkout.address", "Complete address")}</label>
        <textarea
          name="alamat"
          placeholder="Jl. Contoh No. 123, Kota"
          value={form.alamat}
          onChange={handleChange}
        />

        <label>{t("checkout.note", "Note (optional)")}</label>
        <textarea
          name="catatan"
          placeholder="Contoh: Tolong kirim cepat ya..."
          value={form.catatan}
          onChange={handleChange}
        />

        <div className="payment-methods">
          <label>{t("checkout.chooseBank", "Choose Payment Method")}</label>

          <div className="bank-grid">
            {paymentOptions.map((channel) => (
              <div
                key={channel.code}
                className={`bank-grid-item ${form.method === channel.code ? "selected" : ""}`}
                onClick={() => setForm((prev) => ({ ...prev, method: channel.code }))}
              >
                <img src={`/assets/payment/${channel.image}`} alt={channel.code} />
              </div>
            ))}
          </div>
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

      <button disabled={loading || !form.method} onClick={handleCheckout}>
        {loading ? t("checkout.processing", "Processing...") : t("checkout.payNow", "Pay Now")}
      </button>
    </div>
  );
};

export default Checkout;
