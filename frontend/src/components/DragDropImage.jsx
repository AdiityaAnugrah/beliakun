import React, { useRef } from "react";

export default function DragDropImage({
    onChange,
    imageSrc,
    label = "Drag & drop gambar di sini, atau klik untuk memilih file",
}) {
    const inputRef = useRef();

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const file = e.dataTransfer.files[0];
        if (file) onChange({ target: { files: [file], name: "image" } });
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const openFileDialog = () => {
        inputRef.current.click();
    };

    return (
        <div
            className="drag-drop-upload"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={openFileDialog}
        >
            <input
                ref={inputRef}
                type="file"
                name="image"
                style={{ display: "none" }}
                accept="image/*"
                onChange={onChange}
            />
            {imageSrc ? (
                <img
                    src={imageSrc}
                    alt="Preview"
                    className="img-preview"
                    style={{
                        maxWidth: 120,
                        maxHeight: 90,
                        borderRadius: 8,
                        marginBottom: 6,
                    }}
                />
            ) : (
                <div className="drag-drop-placeholder">
                    <span role="img" aria-label="Upload">
                        📷
                    </span>
                    <p style={{ margin: 6, color: "#888" }}>{label}</p>
                </div>
            )}
        </div>
    );
}
