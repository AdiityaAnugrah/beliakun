const API_URL = `${import.meta.env.VITE_URL_BACKEND}`;

export const signup = async (data) => {
    const res = await fetch(`${API_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    const resJson = await res.json();
    console.log("RESPON DARI SI backend:", resJson);
    const hasil = {
        status: res.status,
        message: resJson.message,
    };
    return hasil;
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
