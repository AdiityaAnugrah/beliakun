import { useEffect, useState } from "react";
import { getProducts } from "../../services/productService";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const Products = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [productsPerPage] = useState(10);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchProducts = async () => {
            const result = await getProducts();
            if (result.status === 200) {
                setProducts(result.data.products);
                setFilteredProducts(result.data.products);
                const uniqueCategories = [
                    "All",
                    ...new Set(
                        result.data.products.map((product) => product.kategori)
                    ),
                ];
                setCategories(uniqueCategories);
            } else {
                console.log(result.message);
            }
            setLoading(false);
        };

        fetchProducts();
    }, []);

    // Search filter
    const handleSearch = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        filterProducts(query, selectedCategory);
    };
    const filterProducts = (query, category) => {
        let filtered = products;
        if (query) {
            filtered = filtered.filter((product) =>
                product.nama.toLowerCase().includes(query.toLowerCase())
            );
        }
        if (category && category !== "All") {
            filtered = filtered.filter(
                (product) => product.kategori === category
            );
        }
        setFilteredProducts(filtered);
    };

    const handleCategoryChange = (e) => {
        const selectedCategory = e.target.value;
        setSelectedCategory(selectedCategory);
        filterProducts(searchQuery, selectedCategory);
    };

    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = filteredProducts.slice(
        indexOfFirstProduct,
        indexOfLastProduct
    );

    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    const handleEdit = (id) => {
        alert(`Edit product with id: ${id}`);
        navigate(`/admin/products/edit/${id}`);
    };

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this product?")) {
            alert(`Deleted product with id: ${id}`);
        }
    };

    return (
        <div className="product-list">
            <div className="top-actions">
                <h1>{t("Welcome to the Product List")}</h1>
                <button
                    className="add-product-btn"
                    onClick={() => navigate("/admin/add")}
                >
                    {t("Add Product")}
                </button>
            </div>
            <div className="flex gap-4 w-full">
                <input
                    type="text"
                    placeholder={t("Search Products")}
                    value={searchQuery}
                    onChange={handleSearch}
                    className="search-bar"
                />
                <select
                    className="category-filter"
                    value={selectedCategory}
                    onChange={handleCategoryChange}
                >
                    {categories.map((category, index) => (
                        <option key={index} value={category}>
                            {category}
                        </option>
                    ))}
                </select>
            </div>
            {loading ? (
                <p>{t("Loading...")}</p>
            ) : (
                <div className="products">
                    {currentProducts.length > 0 ? (
                        currentProducts.map((product) => (
                            <div key={product.id} className="product-item">
                                <img
                                    src={product.gambar}
                                    alt={product.nama}
                                    className="product-image"
                                />
                                <h3>{product.nama}</h3>
                                <p className="price">{product.harga}</p>
                                <div className="product-actions">
                                    <button
                                        className="edit-button"
                                        onClick={() => handleEdit(product.id)}
                                    >
                                        {t("Edit")}
                                    </button>
                                    <button
                                        className="delete-button"
                                        onClick={() => handleDelete(product.id)}
                                    >
                                        {t("Delete")}
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>{t("No products available.")}</p>
                    )}
                </div>
            )}
            <div className="pagination">
                {Array.from({
                    length: Math.ceil(
                        filteredProducts.length / productsPerPage
                    ),
                }).map((_, index) => (
                    <button
                        key={index + 1}
                        onClick={() => paginate(index + 1)}
                        className={`page-button ${
                            currentPage === index + 1 ? "active" : ""
                        }`}
                    >
                        {index + 1}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default Products;
