import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import './thankyou.scss';

const ThankYou = () => {
  const [searchParams] = useSearchParams();
  const tripayRef = searchParams.get('tripay_reference');
  

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tripayRef) {
      fetch(`${import.meta.env.VITE_URL_BACKEND}/api/payment/order-detail?tripay_reference=${tripayRef}`)
        .then(res => res.json())
        .then(data => {
          if (data.status === 'success') {
            setOrder(data.data);
          }
        })
        .catch(err => console.error('Fetch error:', err))
        .finally(() => setLoading(false));
    }
  }, [tripayRef]);

  return (
    <section className="thankyou-wrapper">
      <div className="thankyou-container">
        <div className="thankyou-icon">🎮</div>
        <h1>Pembayaran Berhasil!</h1>

        <p className="thankyou-text">
          Terima kasih telah berbelanja di <strong>Beli Akun</strong>.<br />
          Transaksi kamu berhasil dan sedang diproses.
        </p>

        {loading && <p className="thankyou-loading">Memuat detail transaksi...</p>}

        {!loading && order && (
          <div className="thankyou-meta">
            <p><strong>Ref:</strong> <code>{order.tripay_reference}</code></p>
            <p><strong>Order ID:</strong> <code>{order.merchant_ref}</code></p>
            <p><strong>Tanggal:</strong> {new Date(order.createdAt).toLocaleString("id-ID")}</p>
            <p><strong>Total:</strong> Rp {order.total_harga.toLocaleString("id-ID")}</p>
            <p><strong>Produk:</strong></p>
            <ul>
              {order.items.map((item, idx) => (
                <li key={idx}>
                  {item.nama} {item.jumlah > 1 && `x${item.jumlah}`}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="thankyou-actions">
          <a href="/" className="btn-home">🏠 Kembali ke Beranda</a>
          <a href="/riwayat" className="btn-orders">📦 Lihat Riwayat Pembelian</a>
        </div>
      </div>
    </section>
  );
};

export default ThankYou;
