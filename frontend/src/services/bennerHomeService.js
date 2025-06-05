const API_URL = `${import.meta.env.VITE_URL_BACKEND}/bennerhome`;

// Ambil semua banner
export const getAllBannerHome = async () => {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("Gagal fetch banner");
    return response.json();
};

// Tambah banner (FormData)
export const addBannerHome = async (formData) => {
    const response = await fetch(API_URL, {
        method: "POST",
        body: formData,
    });
    console.log("Response from addBannerHome:", response);
    if (!response.ok) throw new Error("Gagal tambah banner");
    return response.json();
};

// Update banner (FormData)
export const updateBannerHome = async (id, formData) => {
    const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        body: formData,
    });
    console.log("Response from updateBannerHome:", response);
    if (!response.ok) throw new Error("Gagal update banner");
    return response.json();
};

// Hapus banner
export const deleteBannerHome = async (id) => {
    const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
    });
    if (!response.ok) throw new Error("Gagal hapus banner");
    return response.json();
};
