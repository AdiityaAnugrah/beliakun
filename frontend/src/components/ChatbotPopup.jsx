import React, { useState, useRef, useEffect } from "react";
import { askChatGpt } from "../services/chatgptService";
import { askGemini } from "../services/askGemini";

const BOT_OPTIONS = [
    { key: "chatgpt", label: "Agent Lucky" },
    { key: "gemini", label: "Agent Ghost" },
];

const bubbleAnimStyle = {
    animation: "bubbleIn 0.46s cubic-bezier(.42,.1,.47,1.25) both",
    willChange: "transform,opacity",
};

export default function ChatbotPopup() {
    const [bot, setBot] = useState(BOT_OPTIONS[1].key);
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const chatRef = useRef(null);

    // Deteksi mobile
    const [isMobile, setIsMobile] = useState(window.innerWidth < 540);
    useEffect(() => {
        function handleResize() {
            setIsMobile(window.innerWidth < 540);
        }
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        if (open) chatRef.current?.scrollTo(0, chatRef.current.scrollHeight);
    }, [messages, open]);

    const sendMessage = async () => {
        if (!input.trim()) return;
        setError("");
        const newMessages = [...messages, { role: "user", text: input }];
        setMessages(newMessages);
        setLoading(true);
        setInput("");

        try {
            let reply;
            if (bot === "chatgpt") {
                reply = await askChatGpt(input, newMessages);
            } else if (bot === "gemini") {
                reply = await askGemini(input, newMessages);
            }
            if (!reply) throw new Error("Bot did not respond.");
            setMessages([...newMessages, { role: "bot", text: reply, bot }]);
        } catch (err) {
            console.error("Error in chatbot:", err);
            setError(
                `Bot ${bot === "chatgpt" ? "ChatGPT" : "Gemini"} error. ${
                    bot === "chatgpt"
                        ? "Try switching to Gemini."
                        : "Try switching to ChatGPT."
                }`
            );
        }
        setLoading(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") sendMessage();
    };

    const handleChangeBot = (e) => {
        setBot(e.target.value);
        setMessages([]);
        setError("");
    };

    function Bubble({ text, isUser }) {
        return (
            <div
                style={{
                    display: "flex",
                    justifyContent: isUser ? "flex-end" : "flex-start",
                    marginBottom: 10,
                    fontFamily: "'Inter', sans-serif",
                }}
            >
                {!isUser && (
                    <div
                        style={{
                            width: 30,
                            height: 30,
                            borderRadius: 15,
                            background: "var(--bubble-bot)",
                            border: "2px solid var(--merah)",
                            color: "var(--merah)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginRight: 8,
                            fontWeight: 700,
                            fontSize: 16,
                            boxShadow: "0 2px 7px #f7374f18",
                            ...bubbleAnimStyle,
                        }}
                    >
                        B
                    </div>
                )}
                <span
                    style={{
                        maxWidth: isMobile ? 200 : 260,
                        background: isUser
                            ? "var(--bubble-user)"
                            : "var(--bubble-bot)",
                        color: isUser
                            ? "var(--bubble-user-text)"
                            : "var(--bubble-bot-text)",
                        borderRadius: 16,
                        border: isUser
                            ? "none"
                            : "1px solid var(--merah, #f7374f)",
                        padding: "11px 18px",
                        fontSize: isMobile ? 14 : 15,
                        boxShadow: isUser
                            ? "0 1px 5px #f7374f18"
                            : "0 1px 7px #eee",
                        borderBottomRightRadius: isUser ? 4 : 16,
                        borderBottomLeftRadius: !isUser ? 4 : 16,
                        fontFamily: "'Inter', sans-serif",
                        ...bubbleAnimStyle,
                    }}
                >
                    {text}
                </span>
                {isUser && <div style={{ width: 40 }} />}
            </div>
        );
    }

    // ==== POSISI CHATBOT ====
    // Ganti 76 jika menu bawah/mobile nav lebih tinggi
    const mobileBottomOffset = 90;
    const chatbotPositionStyle = isMobile
        ? { bottom: mobileBottomOffset, right: 16 }
        : { bottom: 32, right: 32 };

    return (
        <>
            <style>{`
            @keyframes bubbleIn {
                0% { opacity: 0; transform: translateY(30px) scale(.95); }
                90% { opacity: 1; transform: translateY(-2px) scale(1.02);}
                100% { opacity: 1; transform: none;}
            }
            .chatbot-popup-custom {
                font-family: 'Inter', sans-serif;
                transition: background .2s;
            }
            `}</style>
            <div
                className="chatbot-popup-custom"
                style={{
                    position: "fixed",
                    ...chatbotPositionStyle,
                    zIndex: 1200,
                    width: "auto",
                    maxWidth: isMobile ? "96vw" : "390px",
                    transition: "all .2s cubic-bezier(.22,1,.36,1)",
                }}
            >
                {!open && (
                    <button
                        onClick={() => setOpen(true)}
                        style={{
                            width: isMobile ? 44 : 54,
                            height: isMobile ? 44 : 54,
                            borderRadius: "50%",
                            background: "var(--merah)",
                            border: "none",
                            boxShadow: "0 2px 10px #f7374f45",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                        }}
                        title="Open Chatbot"
                    >
                        <svg
                            width={isMobile ? "22" : "24"}
                            height={isMobile ? "22" : "24"}
                            viewBox="0 0 32 32"
                            fill="#fff"
                        >
                            <circle
                                cx="16"
                                cy="16"
                                r="16"
                                fill="var(--merah)"
                            />
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
                    </button>
                )}

                {open && (
                    <div
                        style={{
                            width: isMobile ? "96vw" : 390,
                            height: isMobile ? "64vh" : 600,
                            background: "var(--abu)",
                            boxShadow: "0 8px 24px #2222",
                            borderRadius: isMobile ? 12 : 22,
                            display: "flex",
                            flexDirection: "column",
                            overflow: "hidden",
                            position: "relative",
                            border: "1.5px solid var(--merah)",
                            maxHeight: isMobile ? "75vh" : "90vh",
                            minWidth: isMobile ? 0 : 340,
                        }}
                    >
                        {/* === HEADER CHATBOX === */}
                        <div
                            style={{
                                padding: isMobile
                                    ? "12px 12px 10px 18px"
                                    : "18px 18px 14px 22px",
                                background: "var(--header-bg)",
                                color: "var(--header-text)",
                                fontWeight: "bold",
                                fontSize: isMobile ? 16 : 18,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                borderBottom: "1px solid #fa585824",
                                boxShadow: "0 3px 10px #fa585811",
                            }}
                        >
                            <span>
                                Chatting{" "}
                                <span style={{ fontWeight: 300, fontSize: 14 }}>
                                    (
                                    {
                                        BOT_OPTIONS.find((o) => o.key === bot)
                                            .label
                                    }
                                    )
                                </span>
                            </span>
                            <button
                                onClick={() => setOpen(false)}
                                style={{
                                    background: "transparent",
                                    border: "none",
                                    color: "var(--merah)",
                                    fontSize: isMobile ? 24 : 27,
                                    cursor: "pointer",
                                    marginLeft: 12,
                                }}
                                title="Close"
                            >
                                &times;
                            </button>
                        </div>
                        {/* === BOT SWITCHER & INFO === */}
                        <div
                            style={{
                                background: "var(--abu2)",
                                padding: isMobile ? "7px 10px" : "8px 16px",
                                borderBottom: "1px solid #eee",
                                display: "flex",
                                gap: 10,
                                alignItems: "center",
                            }}
                        >
                            <select
                                value={bot}
                                onChange={handleChangeBot}
                                style={{
                                    borderRadius: 6,
                                    border: "1px solid var(--merah)",
                                    fontSize: 13,
                                    padding: "3px 8px",
                                    outline: "none",
                                    marginRight: 8,
                                    background: "var(--putih)",
                                    color: "var(--merah)",
                                }}
                            >
                                {BOT_OPTIONS.map((b) => (
                                    <option key={b.key} value={b.key}>
                                        {b.label}
                                    </option>
                                ))}
                            </select>
                            <span
                                style={{
                                    fontSize: 11,
                                    color: "var(--merah)",
                                    fontWeight: 500,
                                }}
                            >
                                Powered by BeliAkun
                            </span>
                        </div>
                        {/* === ISI CHAT === */}
                        <div
                            ref={chatRef}
                            style={{
                                flex: 1,
                                overflowY: "auto",
                                padding: isMobile ? 13 : 22,
                                background: "var(--abu)",
                                fontFamily: "'Inter', sans-serif",
                            }}
                        >
                            {messages.length === 0 && (
                                <div
                                    style={{
                                        color: "#888",
                                        textAlign: "center",
                                        marginTop: isMobile ? 32 : 60,
                                        fontFamily: "'Inter',sans-serif",
                                    }}
                                >
                                    Hello! You can ask about digital products,
                                    accounts, promos, and more.
                                </div>
                            )}
                            {messages.map((msg, i) => (
                                <Bubble
                                    key={i + "-" + msg.text.slice(0, 8)}
                                    text={msg.text}
                                    isUser={msg.role === "user"}
                                />
                            ))}
                            {loading && (
                                <Bubble text="Typing..." isUser={false} />
                            )}
                            {error && (
                                <div
                                    style={{
                                        color: "red",
                                        marginTop: 12,
                                        textAlign: "center",
                                    }}
                                >
                                    {error}
                                </div>
                            )}
                        </div>
                        {/* === INPUT BAR === */}
                        <div
                            style={{
                                display: "flex",
                                borderTop: "1px solid #ddd",
                                padding: isMobile ? 9 : 14,
                                background: "var(--header-bg)",
                                fontFamily: "'Inter', sans-serif",
                            }}
                        >
                            <input
                                style={{
                                    flex: 1,
                                    borderRadius: 12,
                                    padding: isMobile
                                        ? "11px 10px"
                                        : "12px 16px",
                                    border: "1px solid #eee",
                                    fontSize: isMobile ? 14 : 15,
                                    outline: "none",
                                    background: "var(--input-bg)",
                                    fontFamily: "'Inter', sans-serif",
                                }}
                                placeholder="Type a message..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                disabled={loading}
                            />
                            <button
                                onClick={sendMessage}
                                disabled={loading || !input.trim()}
                                style={{
                                    marginLeft: 9,
                                    background: "var(--merah)",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: 10,
                                    padding: isMobile ? "0 13px" : "0 22px",
                                    fontWeight: "bold",
                                    fontSize: isMobile ? 14 : 15,
                                    cursor: loading ? "not-allowed" : "pointer",
                                    boxShadow: "0 1px 7px #fa585811",
                                    fontFamily: "'Inter', sans-serif",
                                }}
                            >
                                Send
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
