import { useEffect, useState, useCallback } from "react"; 
import { getProducts, deleteProduct } from "../../services/productService"; 
import { useTranslation } from "react-i18next"; 
import { useNavigate } from "react-router-dom"; 
import Swal from "sweetalert2"; 
import useUserStore from "../../../store/userStore"; 
import "./adminProduct.scss"; 

const Products = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { token, emptyUser } = useUserStore(); // Get token and emptyUser from store
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [productsPerPage] = useState(10);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [categories, setCategories] = useState([]);

    // useCallback to memoize fetchProducts to avoid unnecessary re-renders
    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const result = await getProducts();
            if (result.status === 200) {
                setProducts(result.data.products);
                setFilteredProducts(result.data.products);
                const uniqueCategories = [
                    "All",
                    ...new Set(
                        result.data.products.map((product) => product.category.label)
                    ),
                ];
                setCategories(uniqueCategories);
            } else {
                console.error("Failed to fetch products:", result.message);
                Swal.fire({
                    icon: 'error',
                    title: t('Error!'),
                    text: result.message || t("Failed to load products."),
                });
            }
        } catch (error) {
            console.error("Error fetching products:", error);
            Swal.fire({
                icon: 'error',
                title: t('Oops...'),
                text: t("An unexpected error occurred while loading products."),
            });
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    // Filter products based on search query and selected category
    useEffect(() => {
        let currentFiltered = products;

        if (searchQuery) {
            currentFiltered = currentFiltered.filter((product) =>
                product.nama.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (selectedCategory && selectedCategory !== "All") {
            currentFiltered = currentFiltered.filter(
                (product) => product.category.label === selectedCategory
            );
        }

        setFilteredProducts(currentFiltered);
        setCurrentPage(1); // Reset to the first page when filters change
    }, [searchQuery, selectedCategory, products]);

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleCategoryChange = (e) => {
        setSelectedCategory(e.target.value);
    };

    // Pagination logic
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = filteredProducts.slice(
        indexOfFirstProduct,
        indexOfLastProduct
    );
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handleEdit = (id) => {
        navigate(`/admin/edit/${id}`);
    };

    const handleDelete = async (id, namaProduk) => {
        const result = await Swal.fire({
            title: t('Are you sure?'),
            text: t(`You are about to delete product: ${namaProduk}. This action cannot be undone!`),
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: t('Yes, delete it!'),
            cancelButtonText: t('No, cancel')
        });

        if (result.isConfirmed) {
            try {
                const response = await deleteProduct(id, token);
                if (response.status === 200) {
                    Swal.fire(
                        t('Deleted!'),
                        t('Your product has been deleted.'),
                        'success'
                    );
                    fetchProducts(); // Re-fetch products to update the list
                } else if (response.status === 401) {
                    emptyUser(); // Clear user session
                    navigate("/login");
                    Swal.fire({
                        icon: 'error',
                        title: t('Authentication Error!'),
                        text: t('Your session has expired. Please log in again.'),
                        confirmButtonText: t('OK')
                    });
                } else {
                    Swal.fire(
                        t('Failed!'),
                        response.message || t('There was an error deleting the product.'),
                        'error'
                    );
                }
            } catch (error) {
                console.error("Error deleting product:", error);
                Swal.fire(
                    t('Error!'),
                    t('An unexpected error occurred during deletion.'),
                    'error'
                );
            }
        }
    };

    return (
        <div className="admin-product-list">
            <div className="admin-product-list__header">
                <h1>{t("Welcome to the Product List")}</h1>
                <button
                    className="admin-product-list__add-button"
                    onClick={() => navigate("/admin/add")}
                >
                    {t("Add New Product")}
                </button>
            </div>

            <div className="admin-product-list__filters">
                <input
                    type="text"
                    placeholder={t("Search Products by Name...")}
                    value={searchQuery}
                    onChange={handleSearch}
                    className="admin-product-list__search-input"
                />
                <select
                    className="admin-product-list__category-select"
                    value={selectedCategory}
                    onChange={handleCategoryChange}
                >
                    {categories.map((category) => (
                        <option key={category} value={category}>
                            {category}
                        </option>
                    ))}
                </select>
            </div>

            {loading ? (
                <p className="admin-product-list__loading">{t("Loading products...")}</p>
            ) : (
                <>
                    {filteredProducts.length === 0 && (searchQuery !== "" || selectedCategory !== "All") ? (
                        <p className="admin-product-list__no-products">{t("No products found matching your criteria.")}</p>
                    ) : filteredProducts.length === 0 && searchQuery === "" && selectedCategory === "All" ? (
                        <p className="admin-product-list__no-products">{t("No products available.")}</p>
                    ) : (
                        <div className="admin-product-list__grid">
                            {currentProducts.map((product) => (
                                <div key={product.id} className="admin-product-card">
                                    <img
                                        src={product.gambar}
                                        alt={product.nama}
                                        className="admin-product-card__image"
                                    />
                                    <div className="admin-product-card__details">
                                        <h3 className="admin-product-card__name">{product.nama}</h3>
                                        <p className="admin-product-card__category">
                                            {t("Category")}: {product.category.label}
                                        </p>
                                        <p className="admin-product-card__price">
                                            {t("Price")}: {product.harga}
                                        </p>
                                        <p className="admin-product-card__stock">
                                            {t("Stock")}: {product.stock}
                                        </p>
                                    </div>
                                    <div className="admin-product-card__actions">
                                        <button
                                            className="admin-product-card__button admin-product-card__button--edit"
                                            onClick={() => handleEdit(product.id)}
                                        >
                                            {t("Edit")}
                                        </button>
                                        <button
                                            className="admin-product-card__button admin-product-card__button--delete"
                                            onClick={() => handleDelete(product.id, product.nama)}
                                        >
                                            {t("Delete")}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {totalPages > 1 && (
                        <div className="admin-product-list__pagination">
                            {Array.from({ length: totalPages }).map((_, index) => (
                                <button
                                    key={index + 1}
                                    onClick={() => paginate(index + 1)}
                                    className={`admin-product-list__pagination-button ${currentPage === index + 1 ? "admin-product-list__pagination-button--active" : ""}`}
                                >
                                    {index + 1}
                                </button>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Products;
