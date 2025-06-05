import React, { useState, useEffect } from "react";
import {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
} from "../../services/categoryService";
import DragDropImage from "../../components/DragDropImage";
import "./AdminCategory.scss";

const INIT_FORM = { nama: "", label: "" };

export default function AdminCategory() {
    const [categories, setCategories] = useState([]);
    const [form, setForm] = useState(INIT_FORM);
    const [editing, setEditing] = useState(null);
    const [showForm, setShowForm] = useState(false);

    const [imageSrc, setImageSrc] = useState(null);
    const [imageFile, setImageFile] = useState(null);

    const fetchAll = async () => {
        const cats = await getCategories();
        setCategories(cats);
    };

    useEffect(() => {
        fetchAll();
    }, []);

    const openForm = (cat = null) => {
        setEditing(cat);
        if (cat) {
            setForm({ nama: cat.nama, label: cat.label });
            setImageSrc(cat.gambar || null);
        } else {
            setForm(INIT_FORM);
            setImageSrc(null);
        }
        setImageFile(null);
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setForm(INIT_FORM);
        setEditing(null);
        setImageFile(null);
        setImageSrc(null);
    };

    // Handle drag & drop or normal file input
    const handleChange = (e) => {
        if (e.target && e.target.name === "image") {
            const file = e.target.files[0];
            if (!file) return;
            if (file.size > 5 * 1024 * 1024) {
                alert("Ukuran maksimal 5MB");
                return;
            }
            setImageFile(file);
            const reader = new FileReader();
            reader.onload = () => setImageSrc(reader.result);
            reader.readAsDataURL(file);
        } else {
            setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if ( !form.label) {
            alert("Lengkapi semua field!");
            return;
        }
        // Siapkan FormData
        const fd = new FormData();
        fd.append("label", form.label);
        if (imageFile) fd.append("image", imageFile);

        if (editing) {
            await updateCategory(editing.id, fd, true); // true: multipart
        } else {
            await createCategory(fd, true);
        }
        closeForm();
        fetchAll();
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Hapus kategori ini?")) return;
        await deleteCategory(id);
        fetchAll();
    };

    return (
        <div className="admin-category-container">
            <div className="header-bar">
                <h1>Category Management</h1>
                <button className="btn-primary" onClick={() => openForm()}>
                    + Add Category
                </button>
            </div>

            <div className="category-table-wrap">
                <table className="category-table">
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>Label</th>
                            <th>Nama</th>
                            <th>Gambar</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.length === 0 && (
                            <tr>
                                <td
                                    colSpan={5}
                                    style={{
                                        textAlign: "center",
                                        color: "#888",
                                    }}
                                >
                                    (No categories)
                                </td>
                            </tr>
                        )}
                        {categories.map((cat, idx) => (
                            <tr key={cat.id}>
                                <td>{idx + 1}</td>
                                <td>{cat.label}</td>
                                <td>{cat.nama}</td>
                                <td>
                                    {cat.gambar && (
                                        <img
                                            src={cat.gambar}
                                            alt={cat.label}
                                            className="img-thumb"
                                        />
                                    )}
                                </td>
                                <td>
                                    <button
                                        className="btn-action edit"
                                        onClick={() => openForm(cat)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="btn-action delete"
                                        onClick={() => handleDelete(cat.id)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showForm && (
                <div className="category-modal-backdrop" onClick={closeForm}>
                    <div
                        className="category-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2>{editing ? "Edit Category" : "Add Category"}</h2>
                        <form
                            onSubmit={handleSubmit}
                            encType="multipart/form-data"
                        >
                            <label>
                                Label
                                <input
                                    type="text"
                                    name="label"
                                    value={form.label}
                                    onChange={handleChange}
                                    placeholder="Contoh: STORY-RICH"
                                    required
                                />
                            </label>
                            <label>
                                Upload Gambar
                                <DragDropImage
                                    imageSrc={imageSrc}
                                    onChange={handleChange}
                                    label="Drag & drop gambar, atau klik di sini"
                                />
                            </label>
                            <div className="form-buttons">
                                <button className="btn-primary" type="submit">
                                    {editing ? "Save" : "Add"}
                                </button>
                                <button
                                    type="button"
                                    className="btn-cancel"
                                    onClick={closeForm}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
