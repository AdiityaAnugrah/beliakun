import useNotifStore from "../../store/notifStore";
import { useEffect, useState } from "react";
import Notif from "../components/Notif";
import { getProducts } from "../services/productService";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation

const Home = () => {
    const { t } = useTranslation();
    const { showNotif, teks, show } = useNotifStore();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate(); // Initialize useNavigate

    useEffect(() => {
        const fetchProducts = async () => {
            const result = await getProducts();
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
    const handleViewDetails = (id) => {
        navigate(`/detail/${id}`);
    };

    return (
        <>
            <Notif teks={teks} show={show} />
            <div className="product-list">
                <h1>{t("Welcome to the Product List")}</h1>
                {loading ? (
                    <div className="loading">
                        <p>{t("Loading...")}</p>
                    </div>
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
                                    <div className="product-info">
                                        <h3>{product.nama}</h3>
                                        <p className="price">{product.harga}</p>
                                        <button
                                            className="view-details"
                                            onClick={() =>
                                                handleViewDetails(product.id)
                                            } // On click, navigate to the detail page
                                        >
                                            {t("View Details")}
                                        </button>
                                    </div>
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
