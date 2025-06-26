const API_URL = `${import.meta.env.VITE_URL_BACKEND}`;

export const signup = async (data) => {
    try {
        const res = await fetch(`${API_URL}/auth/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        // Cek apakah status respons adalah 2xx
        const resJson = await res.json();

        if (res.status >= 200 && res.status < 300) {
            return {
                status: res.status,
                message: resJson.message,
            };
        } else {
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

export const verify = async (data) => {
    try {
        const res = await fetch(`${API_URL}/auth/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data), // { email, code }
        });
        const resJson = await res.json();

        if (res.status >= 200 && res.status < 300) {
            console.log("RESPON DARI BACKEND (verify):", resJson);
            return {
                status: res.status,
                message: resJson.message,
            };
        } else {
            console.log("Error response dari backend (verify):", resJson);
            return {
                status: res.status,
                message: resJson.message || "Verifikasi gagal!",
            };
        }
    } catch (err) {
        console.error("Request error (verify):", err);
        return {
            status: 500,
            message: "Verification request failed. Please try again.",
        };
    }
};

export const updateEmail = async (data) => {
    try {
        const res = await fetch(`${API_URL}/auth/update-email`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data), // { oldEmail, newEmail }
        });
        const resJson = await res.json();
        if (res.status >= 200 && res.status < 300) {
            console.log("RESPON DARI BACKEND (updateEmail):", resJson);
            return {
                status: res.status,
                message: resJson.message,
                newEmail: resJson.newEmail,
            };
        } else {
            return {
                status: res.status,
                message: resJson.message || "Email update failed",
            };
        }
    } catch (err) {
        console.error("Request error (updateEmail):", err);
        return { status: 500, message: "Email update failed" };
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
