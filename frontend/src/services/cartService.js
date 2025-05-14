const API_URL = `${import.meta.env.VITE_URL_BACKEND}`;

export const addToCart = async (productId, quantity, token) => {
    try {
        console.log({ productId, quantity, token });
        const res = await fetch(`${API_URL}/cart`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ productId, quantity }),
        });
        const resJson = await res.json();
        if (res.ok) {
            return { status: res.status, data: resJson };
        } else {
            return {
                status: res.status,
                message: resJson.message || "Failed to add cart",
            };
        }
    } catch (err) {
        console.error("Request error:", err);
        return { status: 500, message: "Server error. Please try again." };
    }
};

export const getCart = async (token) => {
    try {
        const res = await fetch(`${API_URL}/cart`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });
        const resJson = await res.json();

        if (res.ok) {
            console.log("Cart berhasil diambil:", resJson);
            return { status: res.status, data: resJson };
        } else {
            console.log("Gagal mengambil produk:", resJson);
            return {
                status: res.status,
                message: resJson.message,
            };
        }
    } catch (err) {
        console.error("Request error:", err);
        return { status: 500, message: "Server error. Please try again." };
    }
};
