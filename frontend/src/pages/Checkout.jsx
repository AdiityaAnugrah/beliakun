import { useState } from "react";
import useCartStore from "../../store/cartStore";
import useUserStore from "../../store/userStore";
import { useNavigate } from "react-router-dom";
import Notif from "../components/Notif";
import useNotifStore from "../../store/notifStore";
import { useTranslation } from "react-i18next";
import { checkoutManual } from "../services/checkoutService";

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
        // if (!form.nama || !form.alamat) {
        //     setNotif(t("checkout.required"));
        //     showNotif();
        //     return;
        // }

        if (!token) {
            emptyUser();
            navigate("/login");
            return;
        }

        setLoading(true);

        console.log(form);

        const res = await checkoutManual(form, token);
        console.log(res);

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
            <h1>{t("checkout.title")}</h1>

            <div className="form-section">
                <input
                    type="text"
                    name="phone"
                    placeholder={t("checkout.phone")}
                    value={form.phone}
                    onChange={handleChange}
                />

                <textarea
                    name="alamat"
                    placeholder={t("checkout.address")}
                    value={form.alamat}
                    onChange={handleChange}
                />
                <textarea
                    name="catatan"
                    placeholder={t("checkout.note")}
                    value={form.catatan}
                    onChange={handleChange}
                />

                <div className="payment-methods">
                    <label>{t("checkout.chooseMethod")}</label>

                    <div className="radio-group">
                        <label>
                            <input
                                type="radio"
                                name="paymentType"
                                value="bank_transfer"
                                checked={form.paymentType === "bank_transfer"}
                                onChange={handleChange}
                            />
                            Virtual Account (VA)
                        </label>

                        <label>
                            <input
                                type="radio"
                                name="paymentType"
                                value="qris"
                                checked={form.paymentType === "qris"}
                                onChange={handleChange}
                            />
                            QRIS
                        </label>
                    </div>

                    {form.paymentType === "bank_transfer" && (
                        <div className="bank-selection">
                            <label>{t("checkout.chooseBank")}</label>
                            <select
                                name="bank"
                                value={form.bank}
                                onChange={handleChange}
                            >
                                <option value="bri">BRI</option>
                                <option value="bni">BNI</option>
                                <option value="mandiri">Mandiri</option>
                                <option value="permata">Permata</option>
                            </select>
                            <small>{t("checkout.vaNote")}</small>
                        </div>
                    )}
                </div>
            </div>

            <div className="summary-section">
                <h3>{t("checkout.summary")}</h3>
                <ul>
                    {cart.map((item) => (
                        <li key={item.productId}>
                            {item.nama} x {item.quantity} = Rp{" "}
                            {(item.harga * item.quantity).toLocaleString(
                                "id-ID"
                            )}
                        </li>
                    ))}
                </ul>
                <p>
                    {t("checkout.total")}:{" "}
                    <strong>Rp {total.toLocaleString("id-ID")}</strong>
                </p>
            </div>

            <button disabled={loading} onClick={handleCheckout}>
                {loading ? t("checkout.processing") : t("checkout.payNow")}
            </button>
        </div>
    );
};

export default Checkout;
