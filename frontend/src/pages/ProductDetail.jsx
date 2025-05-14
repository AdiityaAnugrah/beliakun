import { useEffect, useState } from "react";
import { getProducts } from "../services/productService";
import { FaHeart, FaShoppingCart } from "react-icons/fa";
import Tombol from "../components/Tombol";
import { useTranslation } from "react-i18next";
import { addToCart } from "../services/cartService";
import useUserStore from "../../store/userStore";
import { useNavigate } from "react-router-dom";
import useCartStore from "../../store/cartStore";

const ProductDetail = ({ productId }) => {
    const { i18n } = useTranslation();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [exchangeRate, setExchangeRate] = useState(null);
    const { token, emptyUser } = useUserStore();
    const { setCart } = useCartStore();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProduct = async () => {
            const result = await getProducts(productId);
            if (result.status === 200) {
                setProduct(result.data.products[0]);
            } else {
                setError(result.message || "Something went wrong");
            }
            setLoading(false);
        };

        fetchProduct();
    }, [productId]);

    useEffect(() => {
        const fetchExchangeRate = async () => {
            try {
                const response = await fetch(
                    "https://v6.exchangerate-api.com/v6/1cbf975a5b2991cec212bf52/latest/USD"
                );
                const data = await response.json();
                if (data.result === "success") {
                    setExchangeRate(data.conversion_rates.IDR);
                } else {
                    console.error("Error fetching exchange rate:", data.error);
                }
            } catch (error) {
                console.error("Failed to fetch exchange rate", error);
            }
        };

        fetchExchangeRate();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center align-center">Loading...</div>
        );
    }

    if (error) {
        return <div>{error}</div>;
    }
    const formatPrice = (price) => {
        if (i18n.language === "id" && exchangeRate) {
            const priceInIDR = price * exchangeRate;
            return `Rp ${priceInIDR.toLocaleString("id-ID")}`;
        } else {
            return `$ ${price.toLocaleString("en-US")}`;
        }
    };

    const handleAddToCart = async () => {
        if (!token) {
            navigate("/login");
            return;
        }
        try {
            const fetchAddCart = await addToCart(product.id, 1, token);
            if (fetchAddCart.status == 401) {
                emptyUser();
                navigate("/login");
                return;
            }
            if (fetchAddCart.status !== 200) {
                alert(fetchAddCart.message);
                return;
            }
            setCart(fetchAddCart.data);
            alert("Success add to cart");
        } catch (error) {
            console.error("Failed to add to cart", error);
        }
    };

    return (
        <div className="container-product container mx-auto">
            <img src={product.gambar} alt={product.nama} />
            <div className="product-info">
                <div className="flex justify-between">
                    <h3 className="product-title">{product.nama}</h3>
                    <p>{product.kategori}</p>
                </div>
                <div className="product">
                    <div style={{ flex: 1 }} className="flex flex-col">
                        <h4
                            style={{
                                fontSize: "1.5rem",
                                fontWeight: "bold",
                            }}
                        >
                            {formatPrice(product.harga)}
                        </h4>
                        <p>Stock: {product.stock}</p>

                        <div>
                            <h6>Deskripsi:</h6>
                            <p>{product.deskripsi}</p>
                        </div>
                    </div>
                    <div className="product-actions">
                        <Tombol
                            style="buy"
                            text=""
                            icon={<FaHeart />}
                            onClick={() => {}}
                        />
                        <Tombol
                            style="cart"
                            text=""
                            icon={<FaShoppingCart />}
                            onClick={() => {
                                handleAddToCart();
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
