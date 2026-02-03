// backend/utils/pendingStore.js
const fs = require("fs");
const path = require("path");

const STORE_PATH = path.join(__dirname, "..", "storage", "pending_orders.json");

/**
 * Memastikan direktori penyimpanan tersedia.
 */
function ensureDir() {
  const dir = path.dirname(STORE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Membaca data JSON dengan aman. Jika file tidak ada atau rusak, 
 * mengembalikan struktur state default.
 */
function safeReadJson() {
  ensureDir();
  if (!fs.existsSync(STORE_PATH)) {
    return { pendingByToken: {}, pendingByUser: {}, adminAwait: {}, userFlow: {} };
  }
  try {
    const raw = fs.readFileSync(STORE_PATH, "utf8");
    if (!raw) return { pendingByToken: {}, pendingByUser: {}, adminAwait: {}, userFlow: {} };
    
    const obj = JSON.parse(raw);
    return {
      pendingByToken: obj.pendingByToken || {},
      pendingByUser: obj.pendingByUser || {},
      adminAwait: obj.adminAwait || {},
      userFlow: obj.userFlow || {},
    };
  } catch (err) {
    console.error("[PendingStore] Gagal membaca JSON, menggunakan state kosong:", err.message);
    return { pendingByToken: {}, pendingByUser: {}, adminAwait: {}, userFlow: {} };
  }
}

let writeQueue = Promise.resolve();

/**
 * Menulis JSON secara atomik menggunakan file sementara (.tmp)
 * untuk mencegah file menjadi kosong/rusak jika terjadi crash saat menulis.
 */
function atomicWriteJson(obj) {
  ensureDir();
  const tmp = STORE_PATH + ".tmp";
  try {
    fs.writeFileSync(tmp, JSON.stringify(obj, null, 2));
    fs.renameSync(tmp, STORE_PATH);
  } catch (err) {
    console.error("[PendingStore] Gagal menulis JSON:", err.message);
  }
}

class PendingStore {
  constructor() {
    this.state = safeReadJson();
  }

  /**
   * Menyimpan state saat ini ke file secara antre (queue).
   */
  _save() {
    const snapshot = JSON.parse(JSON.stringify(this.state));
    writeQueue = writeQueue
      .then(() => {
        atomicWriteJson(snapshot);
      })
      .catch((err) => {
        console.error("[PendingStore] Error dalam antrean simpan:", err.message);
      });
    return writeQueue;
  }

  // =========================
  // GETTERS
  // =========================
  
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

  // =========================
  // SETTERS & MUTATORS
  // =========================

  async setPending(token, data) {
    const uid = String(data.userId);
    this.state.pendingByToken[token] = data;
    this.state.pendingByUser[uid] = token;
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
    if (cur && cur.userId) {
      const uid = String(cur.userId);
      delete this.state.pendingByUser[uid];
      delete this.state.userFlow[uid];
    }
    delete this.state.pendingByToken[token];
    await this._save();
  }

  async clearUser(userId) {
    const uid = String(userId);
    const tok = this.state.pendingByUser[uid];
    
    if (tok) {
      delete this.state.pendingByToken[tok];
    }
    
    delete this.state.pendingByUser[uid];
    delete this.state.userFlow[uid];
    await this._save();
  }

  // Admin flow: menunggu input catatan atau alasan reject
  async setAdminAwait(adminUserId, data) {
    this.state.adminAwait[String(adminUserId)] = data;
    await this._save();
  }

  async clearAdminAwait(adminUserId) {
    delete this.state.adminAwait[String(adminUserId)];
    await this._save();
  }

  // User flow: melacak langkah-langkah di bot (wizard)
  async setUserFlow(userId, flow) {
    this.state.userFlow[String(userId)] = flow;
    await this._save();
  }

  async clearUserFlow(userId) {
    delete this.state.userFlow[String(userId)];
    await this._save();
  }

  // =========================
  // MAINTENANCE
  // =========================

  /**
   * Menghapus transaksi yang sudah kadaluarsa (Expired).
   * @param {number} ttlMs - Waktu kadaluarsa dalam milidetik.
   */
  async cleanupExpired(ttlMs) {
    const now = Date.now();
    const tokens = Object.keys(this.state.pendingByToken);
    let changed = false;

    for (const tok of tokens) {
      const d = this.state.pendingByToken[tok];
      if (d?.createdAt && d.createdAt + ttlMs < now) {
        if (d.userId) {
          const uid = String(d.userId);
          delete this.state.pendingByUser[uid];
          delete this.state.userFlow[uid];
        }
        delete this.state.pendingByToken[tok];
        changed = true;
      }
    }

    if (changed) {
      await this._save();
    }
  }
}

module.exports = { PendingStore };