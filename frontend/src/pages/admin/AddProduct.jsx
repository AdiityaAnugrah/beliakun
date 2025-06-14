import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
    addProduct,
    getProducts,
    updateProduct,
} from "../../services/productService";
import useUserStore from "../../../store/userStore";
import "./adminProduct.scss";
import Swal from "sweetalert2";
import { getCategories } from "../../services/categoryService";

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
        categoryId: "",
    });
    const [imageSrc, setImageSrc] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const location = useLocation();
    const { id: idProduct } = useParams();
    const [error, setError] = useState("");
    const [categories, setCategories] = useState([]);
    const user = useUserStore();

    useEffect(() => {
        if (location.pathname.includes("edit")) {
            (async () => {
                const response = await getProducts(idProduct);
                if (response.status !== 200) {
                    setError(response.message || t("Failed to load product details."));
                    Swal.fire({
                        icon: 'error',
                        title: t('Error!'),
                        text: response.message || t("Failed to load product details."),
                    });
                } else {
                    const product = response.data;
                    setFormData({
                        ...formData,
                        nama: product.nama,
                        harga: product.harga?.toLocaleString() ?? "",
                        stock: product.stock,
                        link_shopee: product.link_shopee,
                        status: product.status,
                        produk_terjual: product.produk_terjual,
                        deskripsi: product.deskripsi,
                        categoryId: product.categoryId, // Ensure the correct category ID
                    });
                    setImageSrc(product.gambar);
                }
            })();
        }

        const fetchCategories = async () => {
            try {
                const categoriesResponse = await getCategories();
                console.log("Fetched categories:", categoriesResponse);
                setCategories(categoriesResponse);  // Ensure categories are set correctly
            } catch (error) {
                console.error("Failed to fetch categories:", error);
                Swal.fire({
                    icon: 'error',
                    title: t('Error!'),
                    text: t("Failed to load categories. Please try again later."),
                });
            }
        };
        fetchCategories();
    }, []);  // This effect should run once on component mount

    const handleChange = (e) => {
        if (e.target.name === "image") {
            const file = e.target.files[0];

            if (file) { // Check if a file was actually selected
                const fileSize = file.size / 1024 / 1024; // size in MB

                if (fileSize > 5) {
                    Swal.fire({
                        icon: 'error',
                        title: t('File Too Large!'),
                        text: t("File size is too large. Maximum is 5MB"),
                    });
                    // Clear the file input if too large
                    e.target.value = '';
                    setImageFile(null);
                    setImageSrc(null);
                    return;
                }

                setImageFile(file);
                const reader = new FileReader();
                reader.onload = () => {
                    setImageSrc(reader.result);
                };
                reader.readAsDataURL(file);
            } else { // If user clears the file input
                setImageFile(null);
                setImageSrc(null);
            }
        } else {
            // Ensure the categoryId is updated correctly
            setFormData({
                ...formData,
                [e.target.name]: e.target.value,
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Submitting form data:", formData);
        console.log("Selected image file:", imageFile);

        // Validasi form
        if (
            !formData.nama ||
            !formData.harga ||
            !formData.deskripsi ||
            !formData.categoryId
        ) {
            Swal.fire({
                icon: 'warning',
                title: t('Missing Fields!'),
                text: t("Please fill out all required fields."),
            });
            setLoading(false);
            return;
        }

        if (location.pathname.includes("add") && !imageFile && !imageSrc) { // Check if image is missing for new product
            Swal.fire({
                icon: 'warning',
                title: t('Image Required!'),
                text: t("Please select an image for the new product."),
            });
            setLoading(false);
            return;
        }

        const formDataWithImage = new FormData();
        // Only append image if a new file is selected (imageFile exists)
        // or if it's an add operation and an image was initially present (imageSrc exists)
        if (imageFile) {
            formDataWithImage.append("image", imageFile);
        }

        // Append other form data
        formDataWithImage.append("nama", formData.nama);
        formDataWithImage.append("harga", Number(formData.harga?.toString().replaceAll(",", "")));
        formDataWithImage.append("stock", formData.stock);
        formDataWithImage.append("link_shopee", formData.link_shopee);
        formDataWithImage.append("status", formData.status);
        formDataWithImage.append("produk_terjual", formData.produk_terjual);
        formDataWithImage.append("deskripsi", formData.deskripsi);
        formDataWithImage.append("categoryId", formData.categoryId); // Use categoryId
        formDataWithImage.append("token", token); // Assuming token is always needed

        try {
            const response = location.pathname.includes("add")
                ? await addProduct(formDataWithImage, token)
                : await updateProduct(idProduct, formDataWithImage, token);

            if (response.status === 401) {
                user.emptyUser();
                navigate("/login");
                Swal.fire({
                    icon: 'error',
                    title: t('Authentication Error!'),
                    text: t('Your session has expired. Please log in again.'),
                    confirmButtonText: t('OK')
                });
                return;
            }
            if (response.status === 200) {
                Swal.fire({
                    icon: 'success',
                    title: t('Success!'),
                    text: t('Product saved successfully!'),
                    timer: 1500, // Close after 1.5 seconds
                    showConfirmButton: false
                }).then(() => {
                    navigate("/admin/products");
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: t('Error!'),
                    text: response.message || t("Error saving product."),
                });
            }
        } catch (err) {
            console.error(err);
            Swal.fire({
                icon: 'error',
                title: t('Oops...'),
                text: t("An unexpected error occurred. Please try again."),
            });
        } finally {
            setLoading(false);
        }
    };


    const handlePriceChange = (e) => {
        let value = e.target.value.replace(/[^\d]/g, ''); // Remove non-numeric characters
        if (value) {
            value = parseInt(value, 10).toLocaleString(); // Format as number with commas
        }
        setFormData({
            ...formData,
            harga: value, // Update formData with formatted price
        });
    };

    if (error) return <div className="error-display">{t("Error loading product details:")} {error}</div>;

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
                <div className="form-grid">
                    <div className="form-left">
                        <div className="form-group form-group--image">
                            <label htmlFor="product-image">{t("Product Image")}{location.pathname.includes("add") && <span className="required-star">*</span>}</label>
                            <input
                                id="product-image"
                                type="file"
                                name="image"
                                onChange={handleChange}
                                accept="image/*"
                                required={location.pathname.includes("add") && !imageSrc} // Require if adding and no image exists
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

                        <div className="form-group form-group--name">
                            <label htmlFor="product-name">{t("Product Name")}<span className="required-star">*</span></label>
                            <input
                                id="product-name"
                                type="text"
                                name="nama"
                                value={formData.nama}
                                onChange={handleChange}
                                placeholder={t("Enter product name")}
                                required
                            />
                        </div>

                        <div className="form-group form-group--stock">
                            <label htmlFor="product-stock">{t("Stock")}</label>
                            <input
                                id="product-stock"
                                type="number"
                                name="stock"
                                value={formData.stock}
                                onChange={handleChange}
                                placeholder={t("Enter stock quantity")}
                                min="0"
                            />
                        </div>

                        <div className="form-group form-group--category">
                            <label htmlFor="product-category">{t("Category")}<span className="required-star">*</span></label>
                            <select
                                id="product-category"
                                name="categoryId"
                                value={formData.categoryId}
                                onChange={handleChange}
                                required
                            >
                                <option value="" disabled>{t("Select Category")}</option>
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                    </div>
                    
                    <div className="form-right">
                        <div className="form-group form-group--price">
                            <label htmlFor="product-price">{t("Price")}<span className="required-star">*</span></label>
                            <input
                                id="product-price"
                                type="text"
                                name="harga"
                                value={formData.harga} // Display formatted price
                                onChange={handlePriceChange} // Format price on change
                                placeholder={t("Enter product price")}
                                required
                            />
                        </div>

                        <div className="form-group form-group--description">
                            <label htmlFor="product-description">{t("Description")}<span className="required-star">*</span></label>
                            <textarea
                                id="product-description"
                                name="deskripsi"
                                value={formData.deskripsi}
                                onChange={handleChange}
                                placeholder={t("Enter product description")}
                                required
                            />
                        </div>

                        <div className="form-group form-group--shopee">
                            <label htmlFor="product-shopee">{t("Shopee Link (optional)")}</label>
                            <input
                                id="product-shopee"
                                type="text"
                                name="link_shopee"
                                value={formData.link_shopee}
                                onChange={handleChange}
                                placeholder={t("Enter Shopee link (optional)")}
                            />
                        </div>

                        <div className="form-group form-group--status">
                            <label htmlFor="product-status">{t("Product Status")}</label>
                            <select
                                id="product-status"
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
                    </div>
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? t("Saving...") : t("Save Product")}
                </button>
            </form>
        </div>
    );
};

export default AddProduct;
