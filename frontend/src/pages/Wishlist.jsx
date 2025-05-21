import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import useUserStore from "../../store/userStore";
import useWishlistStore from "../../store/wishlistStore";
import { getWishlist, removeFromWishlist } from "../services/wishlistService";
import useNotifStore from "../../store/notifStore";
import Notif from "../components/Notif";

const Wishlist = () => {
    const { token, emptyUser } = useUserStore();
    const { wishlist, setWishlist } = useWishlistStore();
    const { setNotif, showNotif } = useNotifStore();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

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
                setWishlist(res.data);
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
        <div className="container mx-auto py-6">
            <Notif />
            <h1 className="text-2xl font-bold mb-4">{t("wishlist_title")}</h1>
            {loading ? (
                <p>{t("loading")}</p>
            ) : wishlist.length === 0 ? (
                <p>{t("cart.empty")}</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {wishlist.map((item) => (
                        <div
                            key={item.productId}
                            className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col"
                        >
                            <img
                                src={item.gambar}
                                alt={item.nama}
                                className="w-full h-48 object-cover"
                            />
                            <div className="p-4 flex flex-col justify-between flex-1">
                                <h3 className="text-lg font-semibold mb-1">
                                    {item.nama}
                                </h3>
                                <p className="text-red-600 font-bold mb-2">
                                    Rp {item.harga.toLocaleString("id-ID")}
                                </p>
                                <div className="flex justify-between items-center mt-auto">
                                    <button
                                        className="text-sm bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded"
                                        onClick={() =>
                                            navigate(
                                                `/product/${item.productId}`
                                            )
                                        }
                                    >
                                        {t("view_details")}
                                    </button>
                                    <button
                                        className="text-sm text-red-600 hover:underline"
                                        onClick={() =>
                                            handleRemove(item.productId)
                                        }
                                    >
                                        {t("cart.removeItem")}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Wishlist;
