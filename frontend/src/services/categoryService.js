const API_URL = `${import.meta.env.VITE_URL_BACKEND}`;

export const getCategories = async () => {
    const res = await fetch(`${API_URL}/category`);
    if (res.status === 200) {
        const data = await res.json();
        if (data.error) {
            throw new Error(data.error);
        }
        console.log("Categories fetched successfully:", data.categories);
        return data.categories;
    } else {
        throw new Error("Failed to fetch categories");
    }
};

export const createCategory = async (form, isFormData = false) => {
    return fetch(`${API_URL}/category`, {
        method: "POST",
        headers: isFormData ? {} : { "Content-Type": "application/json" },
        body: form,  // Pastikan form adalah FormData jika isFormData = true
    });
};

export const updateCategory = async (id, form, isFormData = false) => {
    return fetch(`${API_URL}/category/${id}`, {
        method: "PUT",
        headers: isFormData ? {} : { "Content-Type": "application/json" },
        body: form,  // Pastikan form adalah FormData jika isFormData = true
    });
};

export const deleteCategory = async (id) => {
    return fetch(`${API_URL}/category/${id}`, { method: "DELETE" });
};

export const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("image", file);
    return fetch(`${API_URL}/upload`, {
        method: "POST",
        body: formData,
    });
};

export const getImageUrl = (filename) => {
    return `${API_URL}/uploads/${filename}`;
};
