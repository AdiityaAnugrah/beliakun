import { useEffect, useState } from "react";
import { getOrderHistory } from "../services/orderService";
import useUserStore from "../../store/userStore";
import { useTranslation } from "react-i18next";
import "../styles/History.scss";

const History = () => {
  const { token } = useUserStore();
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      const res = await getOrderHistory(token);
      if (res.status === 200) {
        setOrders(res.data);
        setError(null);
      } else {
        setError(res.data.message || t("error"));
      }
      setLoading(false);
    };

    if (token) {
      fetchHistory();
    }
  }, [token, t]);

  return (
    <div className="history-page">
      <h1>{t("history.title", "Purchase History")}</h1>

      {loading ? (
        <p className="loading">{t("loading")}</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : orders.length === 0 ? (
        <p className="empty">{t("history.empty", "You have no past orders.")}</p>
      ) : (
        <div className="order-list">
          {orders.map((order) => (
            <div className="order-card" key={order.id}>
              <div className="order-header">
                <span>{t("history.order_id", "Order ID")}: {order.midtrans_id}</span>
                <span className={`status ${order.status}`}>{t(`status.${order.status}`, order.status)}</span>
              </div>
              <div className="order-items">
                {order.items.map((item) => (
                  <div className="order-item" key={item.productId}>
                    <img src={item.gambar} alt={item.nama} />
                    <div className="details">
                      <p className="name">{item.nama}</p>
                      <p>{t("history.price", "Price")}: Rp {item.harga.toLocaleString("id-ID")}</p>
                      <p>{t("history.qty", "Quantity")}: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="order-total">
                {t("history.total", "Total")}: <strong>Rp {order.items.reduce((total, item) => total + item.harga * item.quantity, 0)   ?.toLocaleString("id-ID") || "0"}
</strong>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;