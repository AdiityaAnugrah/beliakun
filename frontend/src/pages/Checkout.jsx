import { useMemo, useState } from "react";
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
  const [inlineErr, setInlineErr] = useState({ phone: "", alamat: "", method: "" });

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.harga * item.quantity, 0),
    [cart]
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === "alamat") {
      setInlineErr((p) => ({
        ...p,
        alamat: value.length < 10 ? t("checkout.addrHint", "Alamat terlalu singkat") : ""
      }));
    }
  };

  const handleCheckout = async () => {
    if (!token) {
      emptyUser();
      navigate("/login");
      return;
    }

    if (!form.phone || !form.alamat || !form.method) {
      setNotif(t("checkout.fillAll", "Silakan lengkapi semua input terlebih dahulu."));
      showNotif();
      setInlineErr({
        phone: !form.phone ? t("checkout.phoneReq", "Nomor telepon wajib diisi") : "",
        alamat: !form.alamat ? t("checkout.addrReq", "Alamat wajib diisi") : "",
        method: !form.method ? t("checkout.methodReq", "Pilih metode pembayaran") : "",
      });
      return;
    }

    if (!/^\+?\d{9,15}$/.test(form.phone)) {
      setNotif(t("checkout.invalidPhone", "Nomor telepon tidak valid."));
      showNotif();
      setInlineErr((p) => ({ ...p, phone: t("checkout.invalidPhone", "Nomor telepon tidak valid.") }));
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
      setNotif(res.data?.message || t("checkout.failed", "Gagal membuat transaksi"));
      showNotif();
    }

    setLoading(false);
  };

  const paymentOptions = [
    { code: "BRIVA", image: "bri.png", label: "BRI Virtual Account" },
    { code: "BNIVA", image: "bni.png", label: "BNI Virtual Account" },
    { code: "MANDIRIVA", image: "mandiri.png", label: "Mandiri Virtual Account" },
    { code: "PERMATAVA", image: "permata.png", label: "Permata Virtual Account" },
    { code: "QRIS", image: "qris.png", label: "QRIS" },
  ];

  const isCartEmpty = cart.length === 0;

  return (
    <div className="checkout-page" aria-live="polite">
      <Notif />
      <h1>{t("checkout.title", "Checkout")}</h1>
      <div className="page-sub">
        {t("checkout.subtitle", "Lengkapi data dan pilih metode pembayaran.")}
      </div>

      <div className="progress-mini" aria-hidden="true">
        <span className="dot active" />
        <span className="line" />
        <span className="dot" />
        <span className="line" />
        <span className="dot" />
      </div>

      <div className="checkout-grid">
        {/* LEFT */}
        <section className="card" aria-label={t("checkout.formSection", "Form Pemesanan")}>
          <div className="card-section">
            <div className="card-title">{t("checkout.yourDetails", "Data Pemesan")}</div>

            <div className="form-section">
              {/* PHONE */}
              <div>
                <label htmlFor="phone" style={{ display: "none" }}>
                  {t("checkout.phone", "Nomor HP")}
                </label>
                <div className="phone-input" aria-invalid={!!inlineErr.phone}>
                  <span className="country-code" aria-hidden="true" title="+62 (Indonesia)">
                    <img className="flag" src="/assets/flags/id.svg" alt="" loading="lazy" />
                    +62
                  </span>
                  <input
                    id="phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    name="phone"
                    placeholder="81234567890"
                    value={form.phone.replace(/^\+?62/, "")}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        phone: "+62" + e.target.value.replace(/^0+/, "").replace(/[^\d]/g, ""),
                      }))
                    }
                    aria-describedby="phone-hint"
                    aria-label={t("checkout.phone", "Nomor HP")}
                  />
                </div>
                {inlineErr.phone ? (
                  <div id="phone-hint" className="input-error">{inlineErr.phone}</div>
                ) : (
                  <div id="phone-hint" className="input-hint">
                    {t("checkout.phoneHint", "Masukkan nomor tanpa 0 di depan, contoh: 81234567890")}
                  </div>
                )}
              </div>

              {/* ADDRESS */}
              <div className="floating">
                <textarea
                  id="alamat"
                  name="alamat"
                  placeholder="Alamat lengkap"
                  value={form.alamat}
                  onChange={handleChange}
                  aria-invalid={!!inlineErr.alamat}
                />
                <label htmlFor="alamat">{t("checkout.address", "Alamat lengkap")}</label>
                {inlineErr.alamat && <div className="input-error">{inlineErr.alamat}</div>}
              </div>

              {/* NOTE */}
              <div className="floating">
                <textarea
                  id="catatan"
                  name="catatan"
                  placeholder="Catatan (opsional)"
                  value={form.catatan}
                  onChange={handleChange}
                />
                <label htmlFor="catatan">{t("checkout.note", "Catatan (opsional)")}</label>
              </div>

              {/* PAYMENT */}
              <div className="payment-methods">
                <label className="mb-1">
                  {t("checkout.chooseBank", "Pilih Metode Pembayaran")}
                </label>

                <div className="bank-grid" role="list">
                  {paymentOptions.map((channel) => {
                    const isSelected = form.method === channel.code;
                    return (
                      <div
                        key={channel.code}
                        role="button"
                        tabIndex={0}
                        className={`bank-grid-item ${isSelected ? "selected" : ""}`}
                        onClick={() => {
                          setForm((prev) => ({ ...prev, method: channel.code }));
                          setInlineErr((p) => ({ ...p, method: "" }));
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setForm((prev) => ({ ...prev, method: channel.code }));
                            setInlineErr((p) => ({ ...p, method: "" }));
                          }
                        }}
                        aria-pressed={isSelected}
                        aria-label={channel.label}
                      >
                        <img
                          src={`/assets/payment/${channel.image}`}
                          alt={channel.label}
                          loading="lazy"
                          width="92"
                          height="34"
                        />
                        <span className="check-badge" aria-hidden={!isSelected}>✓</span>
                      </div>
                    );
                  })}
                </div>

                {inlineErr.method && (
                  <div className="input-error" style={{ marginTop: 8 }}>
                    {inlineErr.method}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT */}
        <aside className="card summary-sticky" aria-label={t("checkout.summary", "Ringkasan Pesanan")}>
          <div className="card-section">
            <div className="card-title">{t("checkout.summary", "Ringkasan Pesanan")}</div>

            {isCartEmpty ? (
              <>
                <div className="summary-item" aria-live="polite">
                  {t("checkout.emptyCart", "Keranjang masih kosong. Silakan pilih produk terlebih dahulu.")}
                </div>
                <div className="checkout-actions">
                  <button type="button" onClick={() => navigate("/products")}>
                    {t("checkout.shopNow", "Belanja Sekarang")}
                  </button>
                  <div className="sec-hint">{t("checkout.secure", "Pembayaran aman & terenkripsi.")}</div>
                </div>
              </>
            ) : (
              <>
                <ul className="summary-list">
                  {cart.map((item) => (
                    <li key={item.productId} className="summary-item">
                      <span>{item.nama} × {item.quantity}</span>
                      <span>Rp {(item.harga * item.quantity).toLocaleString("id-ID")}</span>
                    </li>
                  ))}
                </ul>

                <div className="hr" />

                <div className="summary-total">
                  <span>{t("checkout.total", "Total")}</span>
                  <strong>Rp {total.toLocaleString("id-ID")}</strong>
                </div>

                <div className="checkout-actions">
                  <button
                    disabled={loading || !form.method || isCartEmpty}
                    onClick={handleCheckout}
                    aria-busy={loading ? "true" : "false"}
                  >
                    {loading ? t("checkout.processing", "Memproses...") : t("checkout.payNow", "Bayar Sekarang")}
                  </button>
                  <div className="sec-hint">{t("checkout.secure", "Pembayaran aman & terenkripsi.")}</div>
                </div>
              </>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Checkout;
