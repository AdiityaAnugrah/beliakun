import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import useUserStore from "../../store/userStore";
import useWishlistStore from "../../store/wishlistStore";
import { getWishlist, removeFromWishlist } from "../services/wishlistService";
import useNotifStore from "../../store/notifStore";
import Notif from "../components/Notif";
import Topbar from "../components/Topbar";

/** Util ringan untuk format IDR */
const formatIDR = (v) =>
  typeof v === "number" ? v.toLocaleString("id-ID") : "0";

const Wishlist = () => {
  const { token, emptyUser } = useUserStore();
  const { wishlist, setWishlist } = useWishlistStore();
  const { setNotif, showNotif } = useNotifStore();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  // Skeleton placeholder jumlah 6 item saat loading
  const skeletons = useMemo(() => Array.from({ length: 6 }), []);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setNotif(t("cart.notLogin"));
        showNotif();
        navigate("/login");
        return;
      }

      const res = await getWishlist(token);
      if (res.status === 401) {
        emptyUser();
        navigate("/login");
        return;
      }

      if (res.status === 200) {
        setWishlist(res.data || []);
      }
      setLoading(false);
    };

    fetchData();
  }, [token, setWishlist, navigate, t, emptyUser, showNotif, setNotif]);

  const handleRemove = async (productId) => {
    const res = await removeFromWishlist(productId, token);
    if (res.status === 401) {
      emptyUser();
      navigate("/login");
      return;
    }

    setWishlist(wishlist.filter((item) => item.productId !== productId));
    setNotif(t("wishlist_removed"));
    showNotif();
  };

  return (
    <>
      <Topbar title={t("wishlist_title")} />
      <div className="container mx-auto px-4 py-6">
        <Notif />

        {/* Header ringan */}
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h1 className="text-[1.15rem] sm:text-[1.25rem] font-semibold tracking-[-0.01em] text-slate-900">
              {t("wishlist_title")}
            </h1>
            <p className="text-sm text-slate-500">
              {t("wishlist_subtitle", "Simpan produk favoritmu untuk dibeli nanti.")}
            </p>
          </div>
          {/* Jumlah item, non-bold agar lebih santai */}
          <span className="text-sm text-slate-500">
            {t("items_count", { count: wishlist?.length || 0 })}
          </span>
        </div>

        {/* Loading state: skeleton cards */}
        {loading ? (
          <div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4"
            aria-busy="true"
          >
            {skeletons.map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
              >
                <div className="aspect-[4/3] bg-slate-100 animate-pulse" />
                <div className="p-3 sm:p-4 space-y-2">
                  <div className="h-4 w-3/4 bg-slate-100 animate-pulse rounded" />
                  <div className="h-4 w-1/3 bg-slate-100 animate-pulse rounded" />
                  <div className="flex items-center justify-between pt-2">
                    <div className="h-8 w-24 bg-slate-100 animate-pulse rounded" />
                    <div className="h-4 w-14 bg-slate-100 animate-pulse rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : wishlist.length === 0 ? (
          // Empty state: simple, elegan
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 sm:p-10 text-center">
            <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-rose-50 flex items-center justify-center">
              {/* icon heart outline minimal */}
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                className="text-rose-500"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </div>
            <h2 className="text-[1.05rem] font-semibold text-slate-900 mb-1">
              {t("empty_wishlist_title", "Daftar keinginanmu masih kosong")}
            </h2>
            <p className="text-slate-500 text-sm mb-4">
              {t(
                "empty_wishlist_desc",
                "Jelajahi katalog dan tambahkan produk yang kamu suka."
              )}
            </p>
            <button
              onClick={() => navigate("/products")}
              className="inline-flex items-center gap-2 rounded-xl bg-rose-600 text-white text-sm px-4 py-2.5 hover:bg-rose-700 transition-colors"
            >
              {t("browse_products", "Lihat Produk")}
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                className="opacity-90"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </button>
          </div>
        ) : (
          // List grid: clean & compact
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {wishlist.map((item) => (
              <article
                key={item.productId}
                className="group bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col"
              >
                {/* Gambar */}
                <div className="relative">
                  <img
                    src={item.gambar}
                    alt={item.nama}
                    loading="lazy"
                    className="w-full aspect-[4/3] object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                  />
                  {/* Badge harga di pojok, kecil dan elegan */}
                  <div className="absolute bottom-2 left-2 rounded-lg bg-white/90 backdrop-blur px-2.5 py-1 text-[12px] text-rose-600 border border-rose-100">
                    Rp {formatIDR(item.harga)}
                  </div>
                </div>

                {/* Info */}
                <div className="p-3 sm:p-4 flex flex-col gap-2 flex-1">
                  <h3 className="text-[.98rem] font-medium text-slate-900 leading-snug line-clamp-2 min-h-[2.6rem]">
                    {item.nama}
                  </h3>

                  {/* Actions */}
                  <div className="mt-auto flex items-center justify-between gap-2">
                    <button
                      className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-3 py-2 text-[13px] text-slate-700 hover:bg-slate-50 transition-colors"
                      onClick={() => navigate(`/product/${item.productId}`)}
                      aria-label={t("view_details")}
                    >
                      {t("view_details")}
                    </button>

                    <button
                      className="inline-flex items-center gap-1.5 text-[13px] text-rose-600 hover:text-rose-700"
                      onClick={() => handleRemove(item.productId)}
                      aria-label={t("cart.removeItem")}
                    >
                      {/* icon trash minimal */}
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        className="opacity-90"
                      >
                        <path d="M3 6h18" />
                        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                        <path d="M10 11v6M14 11v6" />
                      </svg>
                      {t("cart.removeItem")}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Wishlist;
