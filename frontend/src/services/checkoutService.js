const API_URL = `${import.meta.env.VITE_URL_BACKEND}`;
export const checkoutManual = async (payload, token) => {
    try {
        const res = await fetch(
            `${import.meta.env.VITE_URL_BACKEND}/checkout/manual`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            }
        );

        const data = await res.json();

        return {
            status: res.status,
            data,
        };
    } catch (error) {
        console.error("Checkout failed", error);
        return {
            status: 500,
            message: "Server error",
        };
    }
};

export const getOrder = async (midtrans_id, token) => {
    try {
        const res = await fetch(`${API_URL}/order/${midtrans_id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });
        const resJson = await res.json();
        return { status: res.status, data: resJson };
    } catch (err) {
        console.error("Request error:", err);
        return { status: 500, message: "Server error. Please try again." };
    }
};
