import useNotifStore from "../../store/notifStore";
import { useEffect, useState } from "react";
import Notif from "../components/Notif";
import { getProducts } from "../services/productService";
import { useTranslation } from "react-i18next";

const Home = () => {
    const { t } = useTranslation();
    const { showNotif, teks, show } = useNotifStore();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            const result = await getProducts();
            console.log("ASASASASASA");
            console.log(result);
            if (result.status === 200) {
                setProducts(result.data.products);
            } else {
                console.log(result.message);
            }
            setLoading(false);
        };

        fetchProducts();
    }, []);

    useEffect(() => {
        if (teks) showNotif();
    }, [teks, showNotif]);

    return (
        <>
            <Notif teks={teks} show={show} />
            <div className="product-list">
                <h1>{t("Welcome to the Product List")}</h1>
                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <div className="products">
                        {products.length > 0 ? (
                            products.map((product) => (
                                <div key={product.id} className="product-item">
                                    <img
                                        src={product.gambar}
                                        alt={product.nama}
                                        className="product-image"
                                    />
                                    <h3>{product.nama}</h3>
                                    <p>{product.harga}</p>
                                    <button className="view-details">
                                        {t("View Details")}
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p>{t("No products available.")}</p>
                        )}
                    </div>
                )}
            </div>
        </>
    );
};

export default Home;
