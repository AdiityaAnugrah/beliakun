import React from "react";
import useNotifStore from "../../store/notifStore"; // pastikan path benar

/**
 * 🔔 Notif.jsx — Modern Toast Notification (top center)
 * - Tidak mengubah store/flow existing
 * - Responsif & ringan
 * - Gunakan _notif.scss untuk styling
 */
const Notif = () => {
  const { teks, show } = useNotifStore((s) => s);
  if (!teks) return null;

  return (
    <div
      className={`notif ${show ? "show" : ""}`}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="notif__inner" data-variant="neutral">
        <span className="notif__icon" aria-hidden="true">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </span>
        <p className="notif__text">{teks}</p>
      </div>
    </div>
  );
};

export default Notif;
