const jwt = require("jsonwebtoken");
require("dotenv").config();

const HEADER = process.env.JWT_HEADER || "Authorization";
const PREFIX = (process.env.JWT_PREFIX || "Bearer").toLowerCase();

function financeAuth(req, res, next) {
  // BYPASS DEV: aktif saat NODE_ENV !== 'production' dan query ?dev=1
  if (process.env.NODE_ENV !== "production" && req.query.dev === "1") {
    req.user = { id: 1, email: "dev@local", name: "Dev", tenant_id: 1, roles: ["admin"] };
    return next();
  }

  try {
    const raw = req.header(HEADER) || "";
    const [prefix, token] = raw.split(" ");
    if (!token || (prefix || "").toLowerCase() !== PREFIX) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: payload.id,
      email: payload.email,
      name: payload.name,
      tenant_id: payload.tenant_id || null,
      roles: payload.roles || []
    };
    next();
  } catch (e) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

module.exports = { financeAuth };


