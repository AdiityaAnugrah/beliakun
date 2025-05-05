import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
    addProduct,
    getProducts,
    updateProduct,
} from "../../services/productService";
import useUserStore from "../../../store/userStore";

const AddProduct = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { token } = useUserStore();
    const [formData, setFormData] = useState({
        nama: "",
        harga: "",
        stock: 0,
        link_shopee: "",
        status: "dijual",
        produk_terjual: 0,
        deskripsi: "",
        kategori: "games",
    });
    const [imageSrc, setImageSrc] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const location = useLocation();
    const { id: idProduct } = useParams();
    const [error, setError] = useState("");

    useEffect(() => {
        if (location.pathname.includes("edit")) {
            (async () => {
                const response = await getProducts(idProduct);
                console.log(response);
                if (response.status !== 200) {
                    setError(response.message);
                } else {
                    const product = response.data;
                    setFormData({
                        ...formData,
                        nama: product.nama,
                        harga: product.harga,
                        stock: product.stock,
                        link_shopee: product.link_shopee,
                        status: product.status,
                        produk_terjual: product.produk_terjual,
                        deskripsi: product.deskripsi,
                        kategori: product.kategori,
                    });
                    setImageSrc(product.gambar);
                }
            })();
        }
    }, []);

    const handleChange = (e) => {
        if (e.target.name === "image") {
            const file = e.target.files[0];
            const fileSize = file.size / 1024 / 1024;

            if (fileSize > 5) {
                setMessage(t("File size is too large. Maximum is 5MB"));
                return;
            }

            setImageFile(file);
            const reader = new FileReader();
            reader.onload = () => {
                setImageSrc(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setFormData({
                ...formData,
                [e.target.name]: e.target.value,
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Simple validation
        if (
            !formData.nama ||
            !formData.harga ||
            !formData.deskripsi ||
            !formData.kategori
        ) {
            setMessage(t("Please fill out all fields"));
            setLoading(false);
            return;
        }

        console.log(formData);

        const formDataWithImage = new FormData();
        if (location.pathname.includes("edit") && imageFile)
            formDataWithImage.append("image", imageFile);
        if (location.pathname.includes("add"))
            formDataWithImage.append("image", imageFile);
        formDataWithImage.append("nama", formData.nama);
        formDataWithImage.append("harga", formData.harga);
        formDataWithImage.append("stock", formData.stock);
        formDataWithImage.append("link_shopee", formData.link_shopee);
        formDataWithImage.append("status", formData.status);
        formDataWithImage.append("produk_terjual", formData.produk_terjual);
        formDataWithImage.append("deskripsi", formData.deskripsi);
        formDataWithImage.append("kategori", formData.kategori);
        formDataWithImage.append("token", token);

        try {
            const response = location.pathname.includes("add")
                ? await addProduct(formDataWithImage, token)
                : await updateProduct(idProduct, formDataWithImage, token);
            if (response.status === 200) {
                setMessage(t("Product added successfully"));
                navigate("/admin/products");
            } else {
                setMessage(t("Error adding product"));
            }
        } catch (err) {
            console.error(err);
            setMessage(t("Error adding product"));
        }
        setLoading(false);
    };

    if (error) return <div>{error}</div>;

    return (
        <div className="add-product-container">
            <h1>
                {t(
                    location.pathname.includes("add")
                        ? "Add New Product"
                        : "Edit Product"
                )}
            </h1>
            <form onSubmit={handleSubmit} className="add-product-form">
                <div className="form-group">
                    <label>{t("Product Name")}</label>
                    <input
                        type="text"
                        name="nama"
                        value={formData.nama}
                        onChange={handleChange}
                        placeholder={t("Enter product name")}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>{t("Price")}</label>
                    <input
                        type="number"
                        name="harga"
                        value={formData.harga}
                        onChange={handleChange}
                        placeholder={t("Enter product price")}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>{t("Stock")}</label>
                    <input
                        type="number"
                        name="stock"
                        value={formData.stock}
                        onChange={handleChange}
                        placeholder={t("Enter stock quantity")}
                    />
                </div>

                <div className="form-group">
                    <label>{t("Product Image")}</label>
                    <input
                        type="file"
                        name="image"
                        onChange={handleChange}
                        accept="image/*"
                        required={
                            location.pathname.includes("add") ? true : false
                        }
                    />
                    {imageSrc && (
                        <div className="image-preview">
                            <img
                                src={imageSrc}
                                alt="Preview"
                                className="product-image-preview"
                            />
                        </div>
                    )}
                </div>

                <div className="form-group">
                    <label>{t("Shopee Link (optional)")}</label>
                    <input
                        type="text"
                        name="link_shopee"
                        value={formData.link_shopee}
                        onChange={handleChange}
                        placeholder={t("Enter Shopee link (optional)")}
                    />
                </div>

                <div className="form-group">
                    <label>{t("Product Status")}</label>
                    <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                    >
                        <option value="dijual">{t("For Sale")}</option>
                        <option value="tidak_dijual">
                            {t("Not for Sale")}
                        </option>
                    </select>
                </div>

                <div className="form-group">
                    <label>{t("Description")}</label>
                    <textarea
                        name="deskripsi"
                        value={formData.deskripsi}
                        onChange={handleChange}
                        placeholder={t("Enter product description")}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>{t("Category")}</label>
                    <select
                        name="kategori"
                        value={formData.kategori}
                        onChange={handleChange}
                    >
                        <option value="games">{t("Games")}</option>
                        <option value="tools">{t("Tools")}</option>
                    </select>
                </div>

                {message && <p className="message">{message}</p>}

                <button type="submit" disabled={loading}>
                    {loading ? t("Loading...") : t("Add Product")}
                </button>
            </form>
        </div>
    );
};

export default AddProduct;
