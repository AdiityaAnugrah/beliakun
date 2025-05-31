import React, { useRef, useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

// SERVICE FETCH
const API_URL = `${import.meta.env.VITE_URL_BACKEND}`;
const getCategories = async () => {
    try {
        const res = await fetch(`${API_URL}/category`);
        if (!res.ok) return [];
        const data = await res.json();
        return data.categories;
    } catch (err) {
        console.error("Error fetching categories:", err);
        return [];
    }
};

export default function CategoryCarousel({ selected, onSelect }) {
    const catListRef = useRef();
    const [categories, setCategories] = useState([]);
    const [activeDot, setActiveDot] = useState(0);

    useEffect(() => {
        async function fetchCategories() {
            const data = await getCategories();
            setCategories(data || []);
        }
        fetchCategories();
    }, []);

    const scrollCategory = (dir) => {
        if (catListRef.current) {
            const card = catListRef.current.children[0];
            if (!card) return;
            const cardWidth = card.offsetWidth + 22; // gap
            catListRef.current.scrollBy({
                left: dir * cardWidth,
                behavior: "smooth",
            });

            let newActive = activeDot + dir;
            if (newActive < 0) newActive = 0;
            if (newActive > categories.length - 1)
                newActive = categories.length - 1;
            setActiveDot(newActive);
        }
    };

    useEffect(() => {
        const ref = catListRef.current;
        if (!ref) return;
        const handler = () => {
            const scrollLeft = ref.scrollLeft;
            const cardWidth = ref.firstChild.offsetWidth + 22;
            const idx = Math.round(scrollLeft / cardWidth);
            setActiveDot(idx);
        };
        ref.addEventListener("scroll", handler);
        return () => ref.removeEventListener("scroll", handler);
    }, [categories]);

    return (
        <div className="category-section">
            <div className="category-header">BROWSE BY CATEGORY</div>
            <div className="category-carousel">
                <button
                    className="carousel-arrow left"
                    aria-label="Previous category"
                    onClick={() => scrollCategory(-1)}
                    disabled={activeDot === 0}
                >
                    <FaChevronLeft />
                </button>
                <div className="category-list" ref={catListRef}>
                    {categories.map((cat, idx) => (
                        <div
                            className={
                                "category-card" +
                                (selected &&
                                selected.toLowerCase() ===
                                    (cat.nama || cat.label || "").toLowerCase()
                                    ? " selected"
                                    : "")
                            }
                            key={idx}
                            onClick={() =>
                                onSelect &&
                                onSelect(cat.nama || cat.label || "")
                            }
                            style={{ cursor: "pointer" }}
                        >
                            <img
                                src={cat.gambar}
                                alt={cat.label}
                                loading="lazy"
                            />
                            <div className="category-gradient" />
                            <div className="category-label">
                                <span className="category-label-inner">
                                    {cat.label}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
                <button
                    className="carousel-arrow right"
                    aria-label="Next category"
                    onClick={() => scrollCategory(1)}
                    disabled={activeDot === categories.length - 1}
                >
                    <FaChevronRight />
                </button>
            </div>
            <div className="carousel-dots">
                {categories.map((_, i) => (
                    <span
                        key={i}
                        className={`dot${i === activeDot ? " active" : ""}`}
                    ></span>
                ))}
            </div>
        </div>
    );
}
