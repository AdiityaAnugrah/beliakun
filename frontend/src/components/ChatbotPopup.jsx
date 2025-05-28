import React, { useState, useRef, useEffect } from "react";
import { askChatGpt } from "../services/chatgptService";

// Ikon chat
const ChatIcon = () => (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="#fff">
        <circle cx="16" cy="16" r="16" fill="#007bff" />
        <path
            d="M10 22v-2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2"
            stroke="#fff"
            strokeWidth="2"
            strokeLinecap="round"
        />
        <circle cx="12" cy="14" r="1.5" fill="#fff" />
        <circle cx="16" cy="14" r="1.5" fill="#fff" />
        <circle cx="20" cy="14" r="1.5" fill="#fff" />
    </svg>
);

export default function ChatbotPopup() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const chatRef = useRef(null);

    useEffect(() => {
        if (open) chatRef.current?.scrollTo(0, chatRef.current.scrollHeight);
    }, [messages, open]);

    const sendMessage = async () => {
        if (!input.trim()) return;
        const newMessages = [...messages, { role: "user", text: input }];
        setMessages(newMessages);
        setLoading(true);
        setInput("");
        try {
            const reply = await askChatGpt(input, newMessages);
            setMessages([...newMessages, { role: "bot", text: reply }]);
        } catch {
            setMessages([...newMessages, { role: "bot", text: "Error..." }]);
        }
        setLoading(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") sendMessage();
    };

    return (
        <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999 }}>
            {/* Tombol Chat Bulat */}
            {!open && (
                <button
                    onClick={() => setOpen(true)}
                    style={{
                        width: 60,
                        height: 60,
                        borderRadius: "50%",
                        background: "#007bff",
                        border: "none",
                        boxShadow: "0 2px 10px #007bff55",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                    }}
                    title="Buka Chatbot"
                >
                    <ChatIcon />
                </button>
            )}

            {/* Popup Chat */}
            {open && (
                <div
                    style={{
                        width: 350,
                        height: 480,
                        background: "#fff",
                        boxShadow: "0 8px 24px #2222",
                        borderRadius: 16,
                        display: "flex",
                        flexDirection: "column",
                        overflow: "hidden",
                        animation: "fadeIn .2s",
                        position: "relative",
                    }}
                >
                    {/* Header */}
                    <div
                        style={{
                            padding: "16px 16px 12px 20px",
                            background: "#007bff",
                            color: "#fff",
                            fontWeight: "bold",
                            fontSize: 18,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                        }}
                    >
                        ChatGPT Chatbot
                        <button
                            onClick={() => setOpen(false)}
                            style={{
                                background: "transparent",
                                border: "none",
                                color: "#fff",
                                fontSize: 24,
                                cursor: "pointer",
                                marginLeft: 12,
                            }}
                            title="Tutup"
                        >
                            &times;
                        </button>
                    </div>
                    {/* Chat Area */}
                    <div
                        ref={chatRef}
                        style={{
                            flex: 1,
                            overflowY: "auto",
                            padding: 16,
                            background: "#f6f7fb",
                        }}
                    >
                        {messages.length === 0 && (
                            <div
                                style={{
                                    color: "#888",
                                    textAlign: "center",
                                    marginTop: 40,
                                }}
                            >
                                Halo! Ada yang bisa saya bantu? 👋
                            </div>
                        )}
                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                style={{
                                    margin: "10px 0",
                                    textAlign:
                                        msg.role === "user" ? "right" : "left",
                                }}
                            >
                                <span
                                    style={{
                                        display: "inline-block",
                                        background:
                                            msg.role === "user"
                                                ? "#daf0ff"
                                                : "#eee",
                                        color: "#333",
                                        borderRadius: 8,
                                        padding: "8px 14px",
                                        maxWidth: "80%",
                                        wordBreak: "break-word",
                                    }}
                                >
                                    {msg.text}
                                </span>
                            </div>
                        ))}
                        {loading && (
                            <div style={{ color: "#999", textAlign: "left" }}>
                                Mengetik...
                            </div>
                        )}
                    </div>
                    {/* Input */}
                    <div
                        style={{
                            display: "flex",
                            borderTop: "1px solid #eee",
                            padding: 10,
                            background: "#fff",
                        }}
                    >
                        <input
                            style={{
                                flex: 1,
                                padding: 10,
                                border: "none",
                                outline: "none",
                                borderRadius: 6,
                                fontSize: 16,
                            }}
                            placeholder="Tulis pesan..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={loading}
                        />
                        <button
                            onClick={sendMessage}
                            disabled={loading || !input.trim()}
                            style={{
                                marginLeft: 8,
                                background: "#007bff",
                                color: "#fff",
                                border: "none",
                                borderRadius: 7,
                                padding: "10px 20px",
                                fontWeight: "bold",
                                cursor: loading ? "not-allowed" : "pointer",
                            }}
                        >
                            Kirim
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
