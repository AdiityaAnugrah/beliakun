import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getOrder } from "../services/checkoutService";
import useUserStore from "../../store/userStore";
import useNotifStore from "../../store/notifStore"; // Importing notifikasi store
import {
    FaSpinner,
    FaCheck,
    FaTimesCircle,
    FaClock,
    FaMoneyBillWave,
    FaQrcode,
    FaClipboard,
} from "react-icons/fa"; // Import icons
import "./PaymentInfo.scss"; // Importing SCSS for styling
import { useRef } from "react";
import Notif from "../components/Notif";

const PaymentInfo = () => {
    const { orderId } = useParams();
    const { token } = useUserStore();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timer, setTimer] = useState(null);
    // const setNotif = useNotifStore((state) => state.setNotif); // Set notifikasi
    // const showNotif = useNotifStore((state) => state.showNotif); // Show notifikasi
    const { show, teks, setNotif, showNotif } = useNotifStore();
    const socket = useRef(new WebSocket("ws://localhost:8000"));

    socket.current.onopen = () => {
        console.log("WebSocket connection established");
    };
    socket.current.onmessage = (event) => {
        // const message = {
        //     type: "order_update",
        //     data: {
        //         order_id,
        //         status,
        //     },
        // };

        const message = JSON.parse(event.data);
        console.log("Received message:");
        console.log(message);
        if (
            message.type === "order_update" &&
            message.data.order_id === orderId
        ) {
            setNotif(
                `Status pembayaran untuk Order ID ${orderId} telah diperbarui menjadi ${message.data.status}`
            );
            showNotif();
            setTimeout(() => {
                window.location.reload();
            }, 3000);
        }
    };

    useEffect(() => {
        (async () => {
            const res = await getOrder(orderId, token);
            setData(res.data);
            setLoading(false);

            if (res.data && res.data.data_mid.expiry_time) {
                const expiryTime = new Date(
                    res.data.data_mid.expiry_time
                ).getTime();
                const now = new Date().getTime();
                const timeRemaining = expiryTime - now;

                if (timeRemaining > 0) {
                    const countdown = setInterval(() => {
                        const remaining = expiryTime - new Date().getTime();
                        if (remaining <= 0) {
                            clearInterval(countdown);
                        }
                        setTimer(remaining);
                    }, 1000);
                }
            }
        })();
    }, [orderId, token]);

    // Calculate formatted time remaining
    const formattedTimeRemaining = timer
        ? `${Math.floor(timer / (1000 * 60 * 60 * 24))} hari ${Math.floor(
              (timer % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
          )} jam ${Math.floor(
              (timer % (1000 * 60 * 60)) / (1000 * 60)
          )} menit ${Math.floor((timer % (1000 * 60)) / 1000)} detik`
        : "Expired";

    // Function to copy text to clipboard
    const copyToClipboard = (text, message) => {
        navigator.clipboard.writeText(text).then(() => {
            setNotif(message); // Set the notification message
            showNotif(); // Show the notification
        });
    };

    if (loading) {
        return (
            <div className="loading-spinner">
                <FaSpinner className="spin-icon" />
                <p>Loading...</p>
            </div>
        );
    }

    if (!data) {
        return <p>Data pembayaran tidak ditemukan.</p>;
    }

    const isVA = data.data_mid.payment_type === "bank_transfer";
    const isQRIS = data.data_mid.payment_type === "qris";
    const paymentStatus = data.status;
    const transactionStatus = data.data_mid.transaction_status;

    return (
        <>
            <Notif teks={teks} show={show} />
            <div className="payment-info-page flex flex-col">
                <h1 className="text-center mb-8">Informasi Pembayaran</h1>
                <p className="order-id text-center mb-4">Order ID: {orderId}</p>

                <div className="order-details flex flex-col gap-8">
                    {/* Menampilkan Status Pembayaran */}
                    <div className="status">
                        <p>
                            <strong>Status Pembayaran: </strong>
                            {paymentStatus === "pending" ? (
                                <FaClock className="icon-pending" />
                            ) : paymentStatus === "success" ? (
                                <FaCheck className="icon-success" />
                            ) : (
                                <FaTimesCircle className="icon-failed" />
                            )}
                            {paymentStatus}
                        </p>
                    </div>

                    {/* Menampilkan Harga yang Harus Dibayar */}
                    <div className="order-summary">
                        <h3>Rincian Pemesanan</h3>
                        <div className="item-list">
                            {data.items.map((item) => (
                                <div
                                    className="item flex items-center gap-5 p-4 bg-gray-100 rounded-lg shadow-md"
                                    key={item.productId}
                                >
                                    <img
                                        src={item.gambar}
                                        alt={item.nama}
                                        className="item-image w-20 h-20 object-cover rounded-md"
                                    />
                                    <div className="item-info flex flex-col">
                                        <h4>{item.nama}</h4>
                                        <p>
                                            Harga: Rp{" "}
                                            {item.harga.toLocaleString()}
                                        </p>
                                        <p>Quantity: {item.quantity}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Menampilkan VA atau QRIS untuk status pending */}
                    {paymentStatus === "pending" && (
                        <>
                            <div className="payment-method">
                                <h3>Segera Lakukan Pembayaran</h3>
                                <p>
                                    Pembayaran Anda masih dalam status pending.
                                    Silakan segera lakukan pembayaran untuk
                                    mengonfirmasi transaksi.
                                </p>
                                <p>
                                    <strong>Waktu Expired: </strong>
                                    {formattedTimeRemaining}
                                </p>
                                <p>
                                    <strong>
                                        Total Harga yang Harus Dibayar:{" "}
                                    </strong>
                                    Rp {data.total_harga.toLocaleString()}
                                </p>
                            </div>

                            {transactionStatus === "pending" && (
                                <>
                                    {isVA &&
                                        data.data_mid.va_numbers?.length >
                                            0 && (
                                            <div className="payment-method flex flex-col gap-3 p-4 bg-white shadow-lg rounded-md">
                                                <h3>
                                                    <FaMoneyBillWave /> Transfer
                                                    ke:
                                                </h3>
                                                <p>
                                                    <strong>Bank:</strong>{" "}
                                                    {data.data_mid.va_numbers[0].bank.toUpperCase()}
                                                </p>
                                                <p>
                                                    <strong>Nomor VA:</strong>{" "}
                                                    {
                                                        data.data_mid
                                                            .va_numbers[0]
                                                            .va_number
                                                    }
                                                </p>
                                                <button
                                                    className="copy-button"
                                                    onClick={() =>
                                                        copyToClipboard(
                                                            data.data_mid
                                                                .va_numbers[0]
                                                                .va_number,
                                                            "Nomor VA berhasil disalin!"
                                                        )
                                                    }
                                                >
                                                    <FaClipboard /> Salin Nomor
                                                    VA
                                                </button>
                                            </div>
                                        )}

                                    {isQRIS && data.actions?.length > 0 && (
                                        <div className="payment-method">
                                            <h3>
                                                <FaQrcode /> QRIS
                                            </h3>
                                            <img
                                                src={
                                                    data.actions.find(
                                                        (a) =>
                                                            a.name ===
                                                            "generate-qr-code"
                                                    )?.url
                                                }
                                                alt="QRIS"
                                                width={250}
                                            />
                                            <button
                                                className="copy-button"
                                                onClick={() =>
                                                    copyToClipboard(
                                                        data.actions.find(
                                                            (a) =>
                                                                a.name ===
                                                                "generate-qr-code"
                                                        )?.url,
                                                        "QRIS berhasil disalin!"
                                                    )
                                                }
                                            >
                                                <FaClipboard /> Salin QRIS
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </>
                    )}

                    {/* Menampilkan Pesan untuk status pembayaran success */}
                    {paymentStatus === "success" && (
                        <div className="status-message success flex items-center justify-center bg-green-100 p-4 rounded-lg">
                            <FaCheck className="icon-success mr-4" />
                            <p>
                                Transaksi Anda berhasil! Terima kasih atas
                                pembayaran Anda.
                            </p>
                        </div>
                    )}

                    {/* Menampilkan Pesan untuk status pembayaran failed */}
                    {paymentStatus === "failed" && (
                        <div className="status-message failed flex items-center justify-center bg-red-100 p-4 rounded-lg">
                            <FaTimesCircle className="icon-failed mr-4" />
                            <p>
                                Maaf, pembayaran Anda gagal. Silakan coba lagi
                                atau hubungi customer support.
                            </p>
                        </div>
                    )}

                    <p className="text-center">
                        Silakan lakukan pembayaran dan jangan tutup halaman ini
                        sebelum selesai.
                    </p>
                </div>
            </div>
        </>
    );
};

export default PaymentInfo;
