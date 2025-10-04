// utils/refreshTokenStore.js
const crypto = require("crypto");
const { q } = require("../config/db.session");

function sha256(s) {
  return crypto.createHash("sha256").update(String(s)).digest("hex");
}

function fmt(d) {
  const pad = n => String(n).padStart(2, "0");
  const y = d.getFullYear(), m = pad(d.getMonth()+1), day = pad(d.getDate());
  const h = pad(d.getHours()), mi = pad(d.getMinutes()), s = pad(d.getSeconds());
  return `${y}-${m}-${day} ${h}:${mi}:${s}`;
}

async function saveRefreshToken({ userId, token, userAgent, ip, ttlDays }) {
  const tokenHash = sha256(token);
  const expiresAt = new Date(Date.now() + ttlDays * 86400 * 1000);
  await q(
    `INSERT INTO auth_refresh_tokens (user_id, token_hash, user_agent, ip, expires_at)
     VALUES (?,?,?,?,?)`,
    [userId, tokenHash, userAgent || null, ip || null, fmt(expiresAt)]
  );
  return expiresAt;
}

async function getRefreshRow(token) {
  const tokenHash = sha256(token);
  const rows = await q(
    `SELECT id, user_id, expires_at, revoked_at
       FROM auth_refresh_tokens
      WHERE token_hash=? LIMIT 1`,
    [tokenHash]
  );
  return rows.length ? rows[0] : null;
}

async function revokeRefreshToken(token) {
  const tokenHash = sha256(token);
  await q(
    `UPDATE auth_refresh_tokens
        SET revoked_at = NOW()
      WHERE token_hash=? AND revoked_at IS NULL`,
    [tokenHash]
  );
}

async function revokeAllUserTokens(userId) {
  await q(
    `UPDATE auth_refresh_tokens
        SET revoked_at = NOW()
      WHERE user_id=? AND revoked_at IS NULL`,
    [userId]
  );
}

module.exports = { saveRefreshToken, getRefreshRow, revokeRefreshToken, revokeAllUserTokens };
