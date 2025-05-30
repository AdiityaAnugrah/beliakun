const API_URL = import.meta.env.VITE_URL_BACKEND;

export async function askGemini(message, history = []) {
    const response = await fetch(`${API_URL}/api/gemini-chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, history }),
    });
    const data = await response.json();
    return data.reply;
}
