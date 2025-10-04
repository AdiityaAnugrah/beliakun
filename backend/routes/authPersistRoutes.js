// routes/authPersistRoutes.js
const router = require("express").Router();
const jwt = require("jsonwebtoken");

/* ===== Konfigurasi token & cookie ===== */
const ACCESS_TTL = process.env.ACCESS_TOKEN_TTL || "15m";
const REFRESH_TTL = process.env.REFRESH_TOKEN_TTL || "30d";
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";
const REFRESH_SECRET = process.env.REFRESH_SECRET || (JWT_SECRET + "_refresh");

const isProd = process.env.NODE_ENV === "production";
const cookieName = process.env.REFRESH_COOKIE_NAME || "rt_fin";

const cookieOpts = {
  httpOnly: true,
  sameSite: isProd ? "none" : "lax",
  secure: isProd,
  path: "/",
  maxAge: 30 * 24 * 60 * 60 * 1000,
};

/* ===== Helpers ===== */
function readBearer(req) {
  const h = req.headers.authorization || "";
  if (h.startsWith("Bearer ")) return h.slice(7);
  return null;
}
function signAccess(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TTL });
}
function signRefresh(payload) {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_TTL });
}
function requireAccess(req, res, next) {
  try {
    const token = readBearer(req);
    if (!token) return res.status(401).json({ error: "Unauthorized" });
    const payload = jwt.verify(token, JWT_SECRET);
    req.auth = payload;
    next();
  } catch (_e) {
    return res.status(401).json({ error: "Unauthorized" });
  }
}

/* ===================== DEV SIGNUP (opsional) ===================== */
/* Aktifkan hanya di DEV:
   .env:
   DEV_SIGNUP=1
*/
const DEV_SIGNUP_ENABLED = process.env.DEV_SIGNUP === "1";
if (DEV_SIGNUP_ENABLED) {
  const mysql = require("mysql2/promise");
  const bcrypt = require("bcrypt");

  async function getPool() {
    return mysql.createPool({
      host: process.env.DB_HOST || "127.0.0.1",
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "beliakun",
      connectionLimit: 5,
    });
  }

  router.post("/dev-signup", async (req, res) => {
    try {
      const { name, email, password } = req.body || {};
      if (!email || !password) return res.status(400).json({ error: "Email & password wajib" });

      const pool = await getPool();

      // cek struktur tabel users
      const [cols] = await pool.query("SHOW COLUMNS FROM users");
      const names = cols.map((c) => c.Field);

      // cek existing
      const emailCol = names.includes("email") ? "email" : null;
      if (!emailCol) return res.status(500).json({ error: "Kolom email tidak ditemukan di tabel users" });

      const [dup] = await pool.query(`SELECT 1 FROM users WHERE ${emailCol}=? LIMIT 1`, [email]);
      if (dup.length) return res.status(409).json({ error: "Email sudah terdaftar" });

      const hash = await bcrypt.hash(String(password), 10);
      const toInsert = {};

      if (names.includes("email")) toInsert.email = email;
      if (names.includes("password")) toInsert.password = hash;
      if (names.includes("name") && name) toInsert.name = name;
      else if (names.includes("username") && name) toInsert.username = name;
      else if (names.includes("full_name") && name) toInsert.full_name = name;

      if (names.includes("role")) toInsert.role = "user";
      if (names.includes("status")) toInsert.status = "active";
      if (names.includes("is_verified")) toInsert.is_verified = 1;
      if (names.includes("verified")) toInsert.verified = 1;
      if (names.includes("email_verified")) toInsert.email_verified = 1;

      const fields = Object.keys(toInsert);
      const vals = Object.values(toInsert);
      if (fields.length < 2) {
        return res.status(500).json({ error: "Skema users tidak kompatibel: minimal butuh email & password" });
      }

      const placeholders = fields.map(() => "?").join(",");
      const sql = `INSERT INTO users (${fields.join(",")}) VALUES (${placeholders})`;
      await pool.query(sql, vals);

      // selesai
      return res.json({ ok: true, message: "User dev dibuat. Silakan login." });
    } catch (e) {
      console.error("dev-signup error:", e);
      return res.status(500).json({ error: "Internal error dev-signup" });
    }
  });
} else {
  // kalau dimatikan, balas 404 agar tidak kebaca
  router.post("/dev-signup", (_req, res) => res.status(404).json({ error: "dev-signup disabled" }));
}
/* ================================================================ */

/* ===== Routes persist auth utama (tetap) ===== */
router.post("/persist/attach", requireAccess, (req, res) => {
  const { uid, tenant_id } = req.auth || {};
  if (!uid) return res.status(400).json({ error: "Invalid user" });

  const payload = { uid, tenant_id: tenant_id || null };
  const refresh = signRefresh(payload);
  res.cookie(cookieName, refresh, cookieOpts);

  const access_token = signAccess(payload);
  return res.json({ access_token, expires_in: ACCESS_TTL });
});

router.post("/refresh", (req, res) => {
  const token = req.cookies?.[cookieName];
  if (!token) return res.status(401).json({ error: "No refresh token" });

  try {
    const payload = jwt.verify(token, REFRESH_SECRET);
    const data = { uid: payload.uid, tenant_id: payload.tenant_id || null };

    const newRefresh = signRefresh(data);
    res.cookie(cookieName, newRefresh, cookieOpts);

    const access_token = signAccess(data);
    return res.json({ access_token, expires_in: ACCESS_TTL });
  } catch (_e) {
    return res.status(401).json({ error: "Invalid refresh token" });
  }
});

router.post("/persist/logout", (_req, res) => {
  res.clearCookie(cookieName, { ...cookieOpts, maxAge: 0 });
  return res.json({ ok: true });
});

router.post("/attach-tenant", requireAccess, (req, res) => {
  const { uid } = req.auth || {};
  const { tenant_id } = req.body || {};
  if (!uid || !tenant_id) return res.status(400).json({ error: "Bad request" });

  const data = { uid, tenant_id: Number(tenant_id) };
  const access_token = signAccess(data);
  const refresh = signRefresh(data);
  res.cookie(cookieName, refresh, cookieOpts);
  return res.json({ access_token, expires_in: ACCESS_TTL });
});

module.exports = router;
