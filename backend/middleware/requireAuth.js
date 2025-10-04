// middleware/requireAuth.js
const jwt = require("jsonwebtoken");
require("dotenv").config();

function requireAuth(req, res, next) {
  try {
    const raw = req.header("Authorization") || "";
    const [prefix, token] = raw.split(" ");
    if (!token || (prefix || "").toLowerCase() !== "bearer") {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { id, email, name, tenant_id?, roles? }
    next();
  } catch (e) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

module.exports = { requireAuth };
