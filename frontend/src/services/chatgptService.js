const API_URL = `${import.meta.env.VITE_URL_BACKEND}`;

export async function askChatGpt(message, history = []) {
    // Konversi role "bot" jadi "assistant" (biar backend aman)
    const historyForApi = history.map((msg) => ({
        role: msg.role === "bot" ? "assistant" : msg.role,
        text: msg.text,
    }));

    const response = await fetch(`${API_URL}/api/chatgpt-chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, history: historyForApi }),
    });
    const data = await response.json();
    return data.reply;
}
