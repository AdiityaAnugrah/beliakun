const WebSocket = require("ws");
const jwt = require("jsonwebtoken");
const url = require("url");

const server = new WebSocket.Server({ port: 8000 });

// ✅ SECURITY: Rate limiting per client
const clientMessageCounts = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_MESSAGES_PER_MINUTE = 30;

// ✅ SECURITY: Clean up old rate limit data
setInterval(() => {
    const now = Date.now();
    for (const [clientId, data] of clientMessageCounts.entries()) {
        if (now - data.firstMessageTime > RATE_LIMIT_WINDOW) {
            clientMessageCounts.delete(clientId);
        }
    }
}, RATE_LIMIT_WINDOW);

// ✅ SECURITY: JWT authentication on connection
server.on("connection", (socket, req) => {
    try {
        // Extract token from query parameter
        const queryParams = url.parse(req.url, true).query;
        const token = queryParams.token;

        if (!token) {
            console.warn("❌ Connection rejected: No token provided");
            socket.close(1008, "Authentication required");
            return;
        }

        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Attach user info to socket
        socket.userId = decoded.email || decoded.id;
        socket.userEmail = decoded.email;
        socket.userName = decoded.nama || decoded.username;

        console.log(`✅ User connected: ${socket.userEmail}`);

        // Send welcome message
        socket.send(JSON.stringify({
            type: "connection",
            message: "Connected successfully",
            userId: socket.userId
        }));

    } catch (err) {
        console.error("❌ Authentication failed:", err.message);
        socket.close(1008, "Invalid token");
        return;
    }

    // ✅ SECURITY: Message handling with validation
    socket.on("message", (message) => {
        try {
            // Rate limiting check
            const clientId = socket.userId;
            const now = Date.now();
            
            if (!clientMessageCounts.has(clientId)) {
                clientMessageCounts.set(clientId, {
                    count: 1,
                    firstMessageTime: now
                });
            } else {
                const data = clientMessageCounts.get(clientId);
                if (now - data.firstMessageTime < RATE_LIMIT_WINDOW) {
                    data.count++;
                    if (data.count > MAX_MESSAGES_PER_MINUTE) {
                        socket.send(JSON.stringify({
                            type: "error",
                            message: "Rate limit exceeded. Slow down!"
                        }));
                        return;
                    }
                } else {
                    // Reset counter after window expires
                    clientMessageCounts.set(clientId, {
                        count: 1,
                        firstMessageTime: now
                    });
                }
            }

            // Parse and validate message
            const textMessage = message.toString();
            const data = JSON.parse(textMessage);

            // ✅ SECURITY: Validate message structure
            if (!data.type || typeof data.type !== "string") {
                socket.send(JSON.stringify({
                    type: "error",
                    message: "Invalid message format"
                }));
                return;
            }

            // Add sender info
            data.sender = {
                userId: socket.userId,
                email: socket.userEmail,
                name: socket.userName
            };
            data.timestamp = new Date().toISOString();

            console.log(`📨 Message from ${socket.userEmail}:`, data);

            // ✅ SECURITY: Room-based broadcasting (example)
            // For now, broadcast to all authenticated clients
            // TODO: Implement proper room management
            server.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN && client.userId) {
                    client.send(JSON.stringify(data));
                }
            });

        } catch (err) {
            console.error("❌ Message handling error:", err.message);
            socket.send(JSON.stringify({
                type: "error",
                message: "Invalid message format"
            }));
        }
    });

    socket.on("close", () => {
        console.log(`👋 User disconnected: ${socket.userEmail || "Unknown"}`);
        clientMessageCounts.delete(socket.userId);
    });

    socket.on("error", (err) => {
        console.error("WebSocket error:", err);
    });
});

console.log("✅ Secure WebSocket server running on port 8000");
console.log("⚠️  JWT authentication required for connections");
