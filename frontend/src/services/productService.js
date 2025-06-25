const API_URL = `${import.meta.env.VITE_URL_BACKEND}`;


export const getProducts = async (params = null) => {
    try {
        let url = `${API_URL}/product`;

        if (typeof params === "number" || typeof params === "string") {
            url += `/${params}`;
        }

        if (typeof params === "object" && params !== null && !Array.isArray(params)) {
            const queryString = new URLSearchParams(params).toString();
            url += `?${queryString}`;
        }

        const res = await fetch(url);
        const resJson = await res.json();

        if (res.ok) {
            return { status: res.status, data: resJson };
        } else {
            return {
                status: res.status,
                message: resJson.message || "Failed to fetch products",
            };
        }
    } catch (err) {
        console.error("Request error:", err);
        return { status: 500, message: "Server error. Please try again." };
    }
};

export const getProductBySlug = async (slug) => {
    try {
        const res = await fetch(`${API_URL}/product/slug/${slug}`);
        const resJson = await res.json();

        if (res.ok) {
            return { status: res.status, data: resJson };
        } else {
            return {
                status: res.status,
                message: resJson.message || "Failed to fetch product by slug",
            };
        }
    } catch (err) {
        console.error("Request error:", err);
        return {
            status: 500,
            message: "Server error. Please try again.",
        };
    }
};

// Menambahkan produk baru
export const addProduct = async (data, token) => {
    try {
        console.log("ini form data hasil frontend");
        console.log(data);
        const res = await fetch(`${API_URL}/product`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: data,
        });
        const resJson = await res.json();

        if (res.ok) {
            console.log("Produk berhasil ditambahkan:", resJson);
            return { status: res.status, message: resJson.message };
        } else {
            console.log("Gagal menambahkan produk:", resJson);
            return {
                status: res.status,
                message: resJson.message || "Failed to add product",
            };
        }
    } catch (err) {
        console.error("Request error:", err);
        return { status: 500, message: "Server error. Please try again." };
    }
};

// Mengupdate produk
export const updateProduct = async (id, data, token) => {
    try {
        const res = await fetch(`${API_URL}/product/${id}`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: data,
        });
        const resJson = await res.json();

        if (res.ok) {
            console.log("Produk berhasil diperbarui:", resJson);
            return { status: res.status, message: resJson.message };
        } else {
            console.log("Gagal memperbarui produk:", resJson);
            return {
                status: res.status,
                message: resJson.message || "Failed to update product",
            };
        }
    } catch (err) {
        console.error("Request error:", err);
        return { status: 500, message: "Server error. Please try again." };
    }
};

// Menghapus produk
export const deleteProduct = async (id, token) => {
    try {
        const res = await fetch(`${API_URL}/product/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });
        const resJson = await res.json();

        if (res.ok) {
            console.log("Produk berhasil dihapus:", resJson);
            return { status: res.status, message: resJson.message };
        } else {
            console.log("Gagal menghapus produk:", resJson);
            return {
                status: res.status,
                message: resJson.message || "Failed to delete product",
            };
        }
    } catch (err) {
        console.error("Request error:", err);
        return { status: 500, message: "Server error. Please try again." };
    }
};

// Mendapatkan produk terlaris
export const getProductLaris = async () => {
    try {
        const res = await fetch(`${API_URL}/product/laris`);
        const resJson = await res.json();
        if (res.ok) {
            return { status: res.status, data: resJson };
        } else {
            return {
                status: res.status,
                message: resJson.message || "Failed to fetch best-selling products",
            };
        }
    } catch (err) {
        console.error("Request error:", err);
        return { status: 500, message: "Server error. Please try again." };
    }
};