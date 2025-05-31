import React, { useState, useEffect, useRef } from "react";
import { getAllBannerHome } from "../services/bennerHomeService";

function getYouTubeId(url) {
    const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\\?v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
}

const BASE_URL = import.meta.env.VITE_URL_BACKEND;

export default function BennerHome() {
    const [bannerData, setBannerData] = useState([]);
    const [loading, setLoading] = useState(true);
    const intervalRef = useRef();

    // Fetch data dari backend
    useEffect(() => {
        getAllBannerHome()
            .then((data) => {
                setBannerData(
                    data.length
                        ? data.map((d, i) => ({ ...d, active: i === 0 }))
                        : []
                );
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (!loading && bannerData.length) startIntervalBanner();
        return () => clearInterval(intervalRef.current);
    }, [bannerData, loading]);

    const startIntervalBanner = () => {
        clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
            setBannerData((prev) => {
                const idx = prev.findIndex((n) => n.active);
                const nextIdx = (idx + 1) % prev.length;
                return prev.map((n, i) => ({
                    ...n,
                    active: i === nextIdx,
                }));
            });
        }, 4000);
    };

    const handleClickBanner = (ind_n) => {
        setBannerData((prev) =>
            prev.map((n, i) => ({
                ...n,
                active: i === ind_n,
            }))
        );
        startIntervalBanner();
    };

    if (loading) return <div>Loading banner...</div>;
    if (!bannerData.length) return <div>Belum ada banner.</div>;

    return (
        <div className="container-negara" onMouseLeave={startIntervalBanner}>
            <div className="content">
                <div className="anak-content">
                    {/* Dots slider */}
                    <div className="slider">
                        <div
                            className="w-full flex justify-center py-6"
                            style={{
                                backgroundImage:
                                    "linear-gradient(to top, var(--gelap), transparent)",
                            }}
                        >
                            <div className="flex gap-2">
                                {bannerData.map((n, ind_n) => (
                                    <span
                                        key={ind_n}
                                        onClick={() => handleClickBanner(ind_n)}
                                        className={n.active ? "active" : ""}
                                    ></span>
                                ))}
                            </div>
                        </div>
                    </div>
                    {/* Teks konten */}
                    <div className="isi">
                        <div className="anak-isi">
                            {bannerData.map((n, ind_n) => (
                                <div
                                    key={ind_n}
                                    className={`item ${
                                        n.active ? "active" : ""
                                    }`}
                                >
                                    <p
                                        className="text-white mb-1"
                                        style={{ fontWeight: "bold" }}
                                    >
                                        {n.tipe_media === "video"
                                            ? "Video"
                                            : "Game"}
                                    </p>
                                    <h1
                                        style={{
                                            maxWidth: "500px",
                                            width: "80%",
                                        }}
                                        className="text-white text-center"
                                    >
                                        {n.nama}
                                    </h1>
                                    {n.deskripsi && (
                                        <p
                                            className="text-white text-center"
                                            style={{ marginTop: 4 }}
                                        >
                                            {n.deskripsi}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Background gradient */}
                    <div className="background">
                        <div className="container mx-auto pt-5">
                            <hr
                                className="putih"
                                style={{ width: "100%", opacity: 0.3 }}
                            />
                        </div>
                    </div>
                </div>
            </div>
            {/* Media */}
            <div className="gambar">
                {bannerData.map((n, ind_n) => {
                    if (n.tipe_media === "image") {
                        return (
                            <img
                                key={ind_n}
                                src={
                                    n.media_url.startsWith("http")
                                        ? n.media_url
                                        : `${BASE_URL}${n.media_url}`
                                }
                                alt={n.nama}
                                className={n.active ? "active" : ""}
                                draggable={false}
                                loading="lazy"
                                style={{
                                    objectFit: "cover",
                                    width: "100%",
                                    height: "100%",
                                }}
                            />
                        );
                    } else if (
                        n.tipe_media === "video" &&
                        (n.media_url.includes("youtube.com") ||
                            n.media_url.includes("youtu.be"))
                    ) {
                        return (
                            <iframe
                                key={ind_n}
                                src={
                                    n.media_url.includes("embed")
                                        ? n.media_url
                                        : `https://www.youtube.com/embed/${getYouTubeId(
                                              n.media_url
                                          )}`
                                }
                                title={n.nama}
                                className={n.active ? "active" : ""}
                                allow="autoplay; encrypted-media"
                                allowFullScreen
                                style={{
                                    border: 0,
                                    width: "100%",
                                    height: "100%",
                                }}
                            />
                        );
                    } else if (n.tipe_media === "video") {
                        return (
                            <video
                                key={ind_n}
                                src={
                                    n.media_url.startsWith("http")
                                        ? n.media_url
                                        : `${BASE_URL}${n.media_url}`
                                }
                                className={n.active ? "active" : ""}
                                controls
                                style={{
                                    background: "#111",
                                    objectFit: "cover",
                                    width: "100%",
                                    height: "100%",
                                }}
                            />
                        );
                    }
                    return null;
                })}
            </div>
        </div>
    );
}
