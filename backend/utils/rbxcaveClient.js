// backend/utils/rbxcaveClient.js
const { URL } = require("url");

function rbxcavePaths() {
  return {
    gamepass: process.env.RBXCAVE_PATH_GAMEPASS || "/api/orders/gamepass",
    vipserver: process.env.RBXCAVE_PATH_VIPSERVER || "/api/orders/vip-server",
    cancel: process.env.RBXCAVE_PATH_CANCEL || "/orders/cancel",
  };
}

function joinUrl(base, path) {
  const u = new URL(base);
  const basePath = u.pathname.endsWith("/") ? u.pathname.slice(0, -1) : u.pathname;
  const p = path.startsWith("/") ? path : `/${path}`;
  u.pathname = basePath + p;
  return u.toString();
}

async function fetchJson(url, { method = "GET", headers = {}, body, timeoutMs = 25000 } = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);

  try {
    const res = await fetch(url, { method, headers, body, signal: ctrl.signal });
    const text = await res.text();

    let data;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }

    if (!res.ok) {
      const err = new Error(`HTTP ${res.status}`);
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  } finally {
    clearTimeout(t);
  }
}

function makeRBXCaveClient() {
  const baseURL = process.env.RBXCAVE_BASE_URL || "https://rbxcave.com";
  const apiKey = process.env.RBXCAVE_API_KEY;
  if (!apiKey) throw new Error("RBXCAVE_API_KEY missing (set it in backend/.env)");

  const paths = rbxcavePaths();
  const headersJson = () => ({
    "Content-Type": "application/json",
    // ✅ sesuai docs RBXCave
    "api-key": apiKey,
  });

  return {
    paths,
    async createGamepassOrder(payload) {
      const url = joinUrl(baseURL, paths.gamepass);
      return fetchJson(url, { method: "POST", headers: headersJson(), body: JSON.stringify(payload) });
    },
    async createVipServerOrder(payload) {
      const url = joinUrl(baseURL, paths.vipserver);
      return fetchJson(url, { method: "POST", headers: headersJson(), body: JSON.stringify(payload) });
    },
    async cancelOrder(payload) {
      const url = joinUrl(baseURL, paths.cancel);
      return fetchJson(url, { method: "POST", headers: headersJson(), body: JSON.stringify(payload) });
    },
  };
}

module.exports = { makeRBXCaveClient };
