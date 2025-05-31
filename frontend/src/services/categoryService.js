const API_URL = `${import.meta.env.VITE_URL_BACKEND}`;

export const getCategories = async () => {
    const res = await fetch(`${API_URL}/category`);
    const data = await res.json();
    return data.categories || [];
};

export const createCategory = async (form, isFormData = false) => {
    return fetch(`${API_URL}/category`, {
        method: "POST",
        headers: isFormData
            ? undefined
            : { "Content-Type": "application/json" },
        body: isFormData ? form : JSON.stringify(form),
    });
};

export const updateCategory = async (id, form, isFormData = false) => {
    return fetch(`${API_URL}/category/${id}`, {
        method: "PUT",
        headers: isFormData
            ? undefined
            : { "Content-Type": "application/json" },
        body: isFormData ? form : JSON.stringify(form),
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
