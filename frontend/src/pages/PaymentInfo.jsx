import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getOrder } from "../services/checkoutService";
import useUserStore from "../../store/userStore";
import useNotifStore from "../../store/notifStore";
import {
  FaSpinner,
  FaCheck,
  FaTimesCircle,
  FaClock,
  FaMoneyBillWave,
  FaQrcode,
  FaClipboard,
} from "react-icons/fa";
import { useTranslation } from "react-i18next";
import "./PaymentInfo.scss";
import Notif from "../components/Notif";

const PaymentInfo = () => {
  const { t } = useTranslation();
  const { orderId } = useParams();
  const { token } = useUserStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timer, setTimer] = useState(null);
  const { show, teks, setNotif, showNotif } = useNotifStore();

  useEffect(() => {
    const socket = new WebSocket(import.meta.env.VITE_URL_WEBSOCKET);
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (
        message.type === "order_update" &&
        message.data.order_id === orderId
      ) {
        setNotif(
          `${t("notif.updated", "Payment status for Order ID")} ${orderId} ${t("notif.updated.to", "has been updated to")} ${message.data.status}`
        );
        showNotif();
        setTimeout(() => window.location.reload(), 3000);
      }
    };
    return () => socket.close();
  }, [orderId, setNotif, showNotif]);

  useEffect(() => {
    (async () => {
      const res = await getOrder(orderId, token);
      if (res.status === 401) {
        setNotif(t("notif.unauthorized", "You must be logged in to access this information."));
        showNotif();
        return;
      }
      setData(res.data);
      setLoading(false);

      if (res.data?.data_mid?.expiry_time) {
        const expiryTime = new Date(res.data.data_mid.expiry_time).getTime();
        const countdown = setInterval(() => {
          const remaining = expiryTime - new Date().getTime();
          if (remaining > 0) setTimer(remaining);
        }, 1000);
        return () => clearInterval(countdown);
      }
    })();
  }, [orderId, token]);

  const formattedTimeRemaining = timer
    ? `${Math.floor(timer / (1000 * 60 * 60 * 24))} ${t("time.days", "days")} ${Math.floor((timer % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))} ${t("time.hours", "hours")} ${Math.floor((timer % (1000 * 60 * 60)) / (1000 * 60))} ${t("time.minutes", "minutes")} ${Math.floor((timer % (1000 * 60)) / 1000)} ${t("time.seconds", "seconds")}`
    : t("time.expired", "Expired");

  const copyToClipboard = (text, message) => {
    navigator.clipboard.writeText(text).then(() => {
      setNotif(message);
      showNotif();
    });
  };

  if (loading)
    return (
      <div className="loading-spinner">
        <FaSpinner className="spin-icon" />
        <p>{t("loading", "Loading...")}</p>
      </div>
    );

  if (!data) return <p>{t("payment.not_found", "Payment information not found.")}</p>;

  const isVA = ["bank_transfer", "echannel"].includes(data.data_mid.payment_type);
  const isQRIS = data.data_mid.payment_type === "qris";
  const paymentStatus = data.status;
  const transactionStatus = data.data_mid.transaction_status;

  return (
    <div className="payment-info-page">
      <Notif teks={teks} show={show} />

      <header className="payment-header">
        <h1>{t("payment.title", "Payment Information")}</h1>
        <p className="order-id">{t("payment.order_id", "Order ID")}: {orderId}</p>
      </header>

      <section className="payment-status">
        <p>
          <strong>{t("payment.status", "Payment Status")}:</strong>{" "}
          {paymentStatus === "pending" ? (
            <FaClock className="icon-pending" />
          ) : paymentStatus === "success" ? (
            <FaCheck className="icon-success" />
          ) : (
            <FaTimesCircle className="icon-failed" />
          )}{" "}
          {paymentStatus}
        </p>
      </section>

      <section className="payment-summary">
        <h2>{t("payment.summary", "Order Summary")}</h2>
        <div className="item-list">
          {data.items.map((item) => (
            <div className="item" key={item.productId}>
              <img src={item.gambar} alt={item.nama} />
              <div className="info">
                <h4>{item.nama}</h4>
                <p>{t("payment.price", "Price")}: Rp {item.harga.toLocaleString()}</p>
                <p>{t("payment.qty", "Quantity")}: {item.quantity}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {paymentStatus === "pending" && (
        <section className="payment-instructions">
          <h2>{t("payment.instructions", "Please Make Payment")}</h2>
          <p>{t("payment.pending_msg", "Your payment is still pending. Please complete the payment before expiration.")}</p>
          <p><strong>{t("payment.expires", "Expires in")}:</strong> {formattedTimeRemaining}</p>
          <p><strong>{t("payment.total", "Total Amount")}:</strong> Rp {data.total_harga.toLocaleString()}</p>

          {transactionStatus === "pending" && (
            <>
              {isVA && (
                <div className="payment-method-box">
                  <h3><FaMoneyBillWave /> {t("payment.transfer_to", "Transfer to")}:</h3>
                  <p><strong>{t("payment.bank", "Bank")}:</strong> {data.data_mid.payment_type === 'echannel' ? 'Mandiri' : (data.data_mid.permata_va_number ? 'Permata' : data.data_mid.va_numbers[0].bank.toUpperCase())}</p>
                  <p><strong>{t("payment.va_number", "VA Number")}:</strong> {data.data_mid.payment_type === 'echannel' ? data.data_mid.bill_key : (data.data_mid.permata_va_number || data.data_mid.va_numbers[0].va_number)}</p>
                  <button className="copy-button" onClick={() => copyToClipboard(
                    data.data_mid.payment_type === 'echannel' ? data.data_mid.bill_key : (data.data_mid.permata_va_number || data.data_mid.va_numbers[0].va_number),
                    t("notif.copied_va", "VA number copied!")
                  )}><FaClipboard /> {t("payment.copy_va", "Copy VA Number")}</button>
                </div>
              )}

              {isQRIS && (
                <div className="payment-method-box">
                  <h3><FaQrcode /> {t("payment.qris_title", "Pay with QRIS")}</h3>
                  <img src={data.data_mid.actions.find(a => a.name === "generate-qr-code")?.url} alt="QRIS" />
                  <button className="copy-button" onClick={() => copyToClipboard(
                    data.data_mid.actions.find(a => a.name === "generate-qr-code")?.url,
                    t("notif.copied_qris", "QRIS copied!")
                  )}><FaClipboard /> {t("payment.copy_qris", "Copy QRIS")}</button>
                </div>
              )}
            </>
          )}
        </section>
      )}

      {(paymentStatus === "success" || paymentStatus === "failed") && (
        <section className={`status-message ${paymentStatus}`}>
          {paymentStatus === "success" ? (
            <><FaCheck className="icon-success" /> <p>{t("payment.success_msg", "Your transaction was successful. Thank you!")}</p></>
          ) : (
            <><FaTimesCircle className="icon-failed" /> <p>{t("payment.failed_msg", "Payment failed. Please try again.")}</p></>
          )}
        </section>
      )}

      <p className="text-center">{t("payment.footer_msg", "Please do not close this page until the payment is complete.")}</p>
    </div>
  );
};

export default PaymentInfo;
