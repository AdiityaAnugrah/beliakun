const API_URL = import.meta.env.VITE_URL_BACKEND;

export const getWishlist = async (token) => {
    try {
        const res = await fetch(`${API_URL}/wishlist`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        const json = await res.json();
        return res.ok
            ? { status: res.status, data: json }
            : { status: res.status, message: json.message };
    } catch (error) {
        console.log(error);
        return { status: 500, message: "Server error" };
    }
};

export const addToWishlist = async (productId, token) => {
    try {
        const res = await fetch(`${API_URL}/wishlist`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ productId }),
        });
        const json = await res.json();
        return res.ok
            ? { status: res.status, message: json.message }
            : { status: res.status, message: json.message };
    } catch (error) {
        console.log(error);
        return { status: 500, message: "Server error" };
    }
};

export const removeFromWishlist = async (productId, token) => {
    try {
        const res = await fetch(`${API_URL}/wishlist/${productId}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        const json = await res.json();
        return res.ok
            ? { status: res.status, message: json.message }
            : { status: res.status, message: json.message };
    } catch (error) {
        console.log(error);
        return { status: 500, message: "Server error" };
    }
};
