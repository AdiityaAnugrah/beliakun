// utils/jwtTokens.js
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
require("dotenv").config();

const ACCESS_TTL = process.env.ACCESS_TTL || "15m";          // masa hidup access token
const REFRESH_TTL_DAYS = Number(process.env.REFRESH_TTL_DAYS || 30);

function signAccessToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: ACCESS_TTL });
}
function verifyAccessToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}
function generateRefreshToken() {
  return crypto.randomBytes(64).toString("hex"); // panjang & acak
}

module.exports = { signAccessToken, verifyAccessToken, generateRefreshToken, REFRESH_TTL_DAYS };
