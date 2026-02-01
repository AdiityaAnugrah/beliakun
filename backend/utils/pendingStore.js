// backend/utils/pendingStore.js
const fs = require("fs");
const path = require("path");

const STORE_PATH = path.join(__dirname, "..", "storage", "pending_orders.json");

function ensureDir() {
  const dir = path.dirname(STORE_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function safeReadJson() {
  ensureDir();
  if (!fs.existsSync(STORE_PATH)) {
    return { pendingByToken: {}, pendingByUser: {}, adminAwait: {}, userFlow: {} };
  }
  try {
    const raw = fs.readFileSync(STORE_PATH, "utf8");
    const obj = raw ? JSON.parse(raw) : {};
    return {
      pendingByToken: obj.pendingByToken || {},
      pendingByUser: obj.pendingByUser || {},
      adminAwait: obj.adminAwait || {},
      userFlow: obj.userFlow || {},
    };
  } catch {
    return { pendingByToken: {}, pendingByUser: {}, adminAwait: {}, userFlow: {} };
  }
}

// simple write queue biar gak tabrakan
let writeQueue = Promise.resolve();

function atomicWriteJson(obj) {
  ensureDir();
  const tmp = STORE_PATH + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(obj, null, 2));
  fs.renameSync(tmp, STORE_PATH);
}

class PendingStore {
  constructor() {
    const initial = safeReadJson();
    this.state = initial;
  }

  _save() {
    const snapshot = JSON.parse(JSON.stringify(this.state));
    writeQueue = writeQueue
      .then(() => {
        atomicWriteJson(snapshot);
      })
      .catch(() => {});
    return writeQueue;
  }

  // ===== getters =====
  getByToken(token) {
    return this.state.pendingByToken[token] || null;
  }

  getTokenByUser(userId) {
    return this.state.pendingByUser[String(userId)] || null;
  }

  getAdminAwait(adminUserId) {
    return this.state.adminAwait[String(adminUserId)] || null;
  }

  getUserFlow(userId) {
    return this.state.userFlow[String(userId)] || null;
  }

  // ===== setters =====
  async setPending(token, data) {
    this.state.pendingByToken[token] = data;
    this.state.pendingByUser[String(data.userId)] = token;
    await this._save();
  }

  async updatePending(token, patch) {
    const cur = this.state.pendingByToken[token];
    if (!cur) return null;
    this.state.pendingByToken[token] = { ...cur, ...patch };
    await this._save();
    return this.state.pendingByToken[token];
  }

  async removePending(token) {
    const cur = this.state.pendingByToken[token];
    if (cur?.userId) {
      delete this.state.pendingByUser[String(cur.userId)];
      delete this.state.userFlow[String(cur.userId)];
    }
    delete this.state.pendingByToken[token];
    await this._save();
  }

  async clearUser(userId) {
    const uid = String(userId);

    const tok = this.state.pendingByUser[uid];
    if (tok) delete this.state.pendingByToken[tok];

    delete this.state.pendingByUser[uid];
    delete this.state.userFlow[uid];
    await this._save();
  }

  // admin awaiting custom reason / acc note
  async setAdminAwait(adminUserId, data) {
    this.state.adminAwait[String(adminUserId)] = data;
    await this._save();
  }

  async clearAdminAwait(adminUserId) {
    delete this.state.adminAwait[String(adminUserId)];
    await this._save();
  }

  // user flow
  async setUserFlow(userId, flow) {
    this.state.userFlow[String(userId)] = flow;
    await this._save();
  }

  async clearUserFlow(userId) {
    delete this.state.userFlow[String(userId)];
    await this._save();
  }

  // cleanup expired
  async cleanupExpired(ttlMs) {
    const now = Date.now();
    const tokens = Object.keys(this.state.pendingByToken);
    for (const tok of tokens) {
      const d = this.state.pendingByToken[tok];
      if (d?.createdAt && d.createdAt + ttlMs < now) {
        if (d.userId) {
          delete this.state.pendingByUser[String(d.userId)];
          delete this.state.userFlow[String(d.userId)];
        }
        delete this.state.pendingByToken[tok];
      }
    }
    await this._save();
  }
}

module.exports = { PendingStore };
