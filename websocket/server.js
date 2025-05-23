const WebSocket = require("ws");
const server = new WebSocket.Server({ port: 8000 });

server.on("connection", (socket) => {
    console.log("Client connected");

    socket.on("message", (message) => {
        const textMessage = message.toString();
        console.log("Received:");
        console.log(JSON.parse(textMessage));
        server.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(textMessage); // Kirim pesan ke semua klien
            }
        });
    });

    socket.on("close", () => {
        console.log("Client disconnected");
    });
});
