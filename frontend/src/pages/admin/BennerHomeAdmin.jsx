import React, { useEffect, useState } from "react";
import {
    getAllBannerHome,
    addBannerHome,
    updateBannerHome,
    deleteBannerHome,
} from "../../services/bennerHomeService";
import "./BennerHomeAdmin.scss";

export default function BennerHomeAdmin() {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const initialForm = {
        nama: "",
        tipe_media: "image",
        media_url: "",
        deskripsi: "",
        urutan: 0,
        active: false,
        media_file: null,
    };
    const [form, setForm] = useState(initialForm);
    const [previewUrl, setPreviewUrl] = useState("");

    useEffect(() => {
        loadBanner();
    }, []);

    const loadBanner = () => {
        setLoading(true);
        getAllBannerHome()
            .then(setBanners)
            .finally(() => setLoading(false));
    };

    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target;
        if (type === "checkbox") {
            setForm((f) => ({ ...f, [name]: checked }));
        } else if (type === "file") {
            setForm((f) => ({ ...f, media_file: files[0] }));
            if (files && files[0]) setPreviewUrl(URL.createObjectURL(files[0]));
        } else {
            setForm((f) => ({ ...f, [name]: value }));
            if (name === "media_url") setPreviewUrl(value);
        }
    };

    const openAdd = () => {
        setForm(initialForm);
        setEditId(null);
        setPreviewUrl("");
        setModalOpen(true);
    };

    const openEdit = (b) => {
        setForm({
            nama: b.nama,
            tipe_media: b.tipe_media,
            media_url: b.media_url || "",
            deskripsi: b.deskripsi || "",
            urutan: b.urutan || 0,
            active: !!b.active,
            media_file: null,
        });
        setEditId(b.id);
        setPreviewUrl(b.media_url || "");
        setModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        Object.entries(form).forEach(([k, v]) => {
            if (v !== null && v !== "" && k !== "media_url")
                formData.append(k, v);
        });
        if (!form.media_file && form.media_url)
            formData.append("media_url", form.media_url);

        if (editId) await updateBannerHome(editId, formData);
        else await addBannerHome(formData);

        setModalOpen(false);
        setEditId(null);
        setForm(initialForm);
        setPreviewUrl("");
        loadBanner();
    };

    const handleDelete = async (id) => {
        if (window.confirm("Hapus banner ini?")) {
            await deleteBannerHome(id);
            loadBanner();
        }
    };

    function getYouTubeId(url) {
        const regExp =
            /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return match && match[2].length === 11 ? match[2] : null;
    }

    const renderModal = () => (
        <div
            className="benner-modal__backdrop"
            onClick={() => setModalOpen(false)}
        >
            <div className="benner-modal" onClick={(e) => e.stopPropagation()}>
                <button
                    className="close-btn"
                    onClick={() => setModalOpen(false)}
                    type="button"
                >
                    &times;
                </button>
                <form onSubmit={handleSubmit}>
                    <h3>{editId ? "Edit" : "Tambah"} Banner</h3>
                    <div className="form-row">
                        <label>Nama</label>
                        <input
                            name="nama"
                            value={form.nama}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-row">
                        <label>Tipe Media</label>
                        <select
                            name="tipe_media"
                            value={form.tipe_media}
                            onChange={handleChange}
                        >
                            <option value="image">Image</option>
                            <option value="video">Video</option>
                        </select>
                    </div>
                    <div className="form-row">
                        <label>
                            {form.tipe_media === "image"
                                ? "Upload Gambar"
                                : "Upload Video (opsional)"}
                        </label>
                        <input
                            name="media_file"
                            type="file"
                            accept={
                                form.tipe_media === "image"
                                    ? "image/*"
                                    : "video/*"
                            }
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-row">
                        <label>
                            {form.tipe_media === "video"
                                ? "Atau Masukkan URL Video (YouTube Embed/MP4)"
                                : "Atau Masukkan URL Gambar"}
                        </label>
                        <input
                            name="media_url"
                            value={form.media_url}
                            onChange={handleChange}
                            placeholder="URL internet (jika tidak upload file)"
                        />
                    </div>
                    {previewUrl && (
                        <div className="form-row">
                            <span className="preview-label">Preview:</span>
                            <div className="preview">
                                {form.tipe_media === "image" ? (
                                    <img src={previewUrl} alt="preview" />
                                ) : previewUrl.includes("youtube.com") ||
                                  previewUrl.includes("youtu.be") ? (
                                    <iframe
                                        src={
                                            previewUrl.includes("embed")
                                                ? previewUrl
                                                : `https://www.youtube.com/embed/${getYouTubeId(
                                                      previewUrl
                                                  )}`
                                        }
                                        title="Preview"
                                        allow="autoplay; encrypted-media"
                                        allowFullScreen
                                    />
                                ) : (
                                    <video src={previewUrl} controls />
                                )}
                            </div>
                        </div>
                    )}
                    <div className="form-row">
                        <label>Deskripsi</label>
                        <input
                            name="deskripsi"
                            value={form.deskripsi}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-row">
                        <label>Urutan</label>
                        <input
                            name="urutan"
                            type="number"
                            value={form.urutan}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-row" style={{ marginTop: 6 }}>
                        <label>
                            <input
                                name="active"
                                type="checkbox"
                                checked={form.active}
                                onChange={handleChange}
                            />{" "}
                            Aktif
                        </label>
                    </div>
                    <div className="modal-btn-row">
                        <button
                            type="button"
                            className="batal-btn"
                            onClick={() => setModalOpen(false)}
                        >
                            Batal
                        </button>
                        <button type="submit" className="submit-btn">
                            {editId ? "Update" : "Tambah"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    return (
        <div className="benner-admin">
            <div className="header">
                <h2>Manajemen Banner Home</h2>
                <button className="add-btn" onClick={openAdd}>
                    + Tambah Banner
                </button>
            </div>
            <div className="table-wrap">
                <table>
                    <thead>
                        <tr>
                            <th>Nama</th>
                            <th>Media</th>
                            <th>Deskripsi</th>
                            <th>Urutan</th>
                            <th>Aktif</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={6} style={{ textAlign: "center" }}>
                                    Loading...
                                </td>
                            </tr>
                        ) : banners.length === 0 ? (
                            <tr>
                                <td colSpan={6} style={{ textAlign: "center" }}>
                                    Belum ada data banner
                                </td>
                            </tr>
                        ) : (
                            banners.map((b) => (
                                <tr key={b.id}>
                                    <td>{b.nama}</td>
                                    <td>
                                        {b.tipe_media === "image" ? (
                                            <img
                                                src={b.media_url}
                                                alt={b.nama}
                                            />
                                        ) : (
                                            <a
                                                href={b.media_url}
                                                target="_blank"
                                                rel="noreferrer"
                                                style={{
                                                    color: "#1961c1",
                                                    textDecoration: "underline",
                                                }}
                                            >
                                                [Video]
                                            </a>
                                        )}
                                    </td>
                                    <td>{b.deskripsi}</td>
                                    <td style={{ textAlign: "center" }}>
                                        {b.urutan}
                                    </td>
                                    <td style={{ textAlign: "center" }}>
                                        {b.active ? (
                                            <span className="active-label">
                                                Ya
                                            </span>
                                        ) : (
                                            "Tidak"
                                        )}
                                    </td>
                                    <td>
                                        <div className="aksi-btns">
                                            <button
                                                className="edit-btn"
                                                onClick={() => openEdit(b)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="del-btn"
                                                onClick={() =>
                                                    handleDelete(b.id)
                                                }
                                            >
                                                Hapus
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            {modalOpen && renderModal()}
        </div>
    );
}
