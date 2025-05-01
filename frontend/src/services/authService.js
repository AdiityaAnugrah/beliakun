const API_URL = `${import.meta.env.VITE_URL_BACKEND}`;

export const signup = async (data) => {
    try {
        const res = await fetch(`${API_URL}/api/auth/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        // Cek apakah status respons adalah 2xx
        if (res.ok) {
            const resJson = await res.json();
            console.log("RESPON DARI SI backend:", resJson); // Log respons dari backend
            return {
                status: res.status,
                message: resJson.message,
            };
        } else {
            // Tangani jika status bukan 2xx (gagal)
            const resJson = await res.json();
            console.log("Error response from backend:", resJson);
            return {
                status: res.status,
                message: resJson.message || "Something went wrong!",
            };
        }
    } catch (err) {
        // Tangani error saat fetch request
        console.error("Request error:", err);
        return {
            status: 500,
            message: "Signup failed. Please try again.",
        };
    }
};

export const login = async (data) => {
    const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    const resJson = await res.json();
    const hasil = {
        status: res.status,
        message: resJson.message,
        data: resJson.data,
    };
    return hasil;
};
export const logout = async (token) => {
    const res = await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
    });
    const resJson = await res.json();
    const hasil = {
        status: res.status,
        message: resJson.message,
    };
    return hasil;
};
