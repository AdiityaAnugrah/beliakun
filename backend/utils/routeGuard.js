// utils/routeGuard.js
// Patch Express supaya saat ada PATH tidak valid (URL penuh / Windows path)
// atau path-to-regexp meledak, kita tahu persis argumen & stack sumbernya.

const express = require("express");

function isUrlPath(x) {
  return typeof x === "string" && /^[a-z]+:\/\//i.test(x); // http://, https://, ws://, dll
}
function isWindowsPath(x) {
  return typeof x === "string" && /^[A-Za-z]:[\\/]/.test(x); // C:\ atau D:/
}
function arrayHasBadPath(arr) {
  return Array.isArray(arr) && arr.some((p) => isUrlPath(p) || isWindowsPath(p));
}

function patch(proto, label) {
  const methods = ["use", "get", "post", "put", "patch", "delete", "options", "all"];
  methods.forEach((m) => {
    const original = proto[m];
    if (typeof original !== "function") return;

    proto[m] = function patched(firstArg, ...rest) {
      // 1) Validasi path sebelum diproses Express
      if (isUrlPath(firstArg) || isWindowsPath(firstArg) || arrayHasBadPath(firstArg)) {
        const bad = Array.isArray(firstArg)
          ? firstArg.find((p) => isUrlPath(p) || isWindowsPath(p))
          : firstArg;
        const err = new Error(
          `[routeGuard] INVALID PATH on ${label}.${m}(${JSON.stringify(firstArg)})\n` +
          `→ Ditemukan argumen bukan path: "${bad}".\n` +
          `Gunakan PATH relatif seperti "/auth/refresh", BUKAN URL penuh atau Windows path.\n`
        );
        console.error(err.stack);
        throw err;
      }

      // 2) Jalankan original, tapi tangkap error biar tahu 'firstArg'-nya apa
      try {
        return original.call(this, firstArg, ...rest);
      } catch (e) {
        const info = new Error(
          `[routeGuard] ERROR saat mount ${label}.${m}(${JSON.stringify(firstArg)}): ${e && e.message}`
        );
        console.error(info.stack);
        throw e;
      }
    };
  });
}

// Patch Application & Router
patch(express.application, "app");
if (express.Router && express.Router.prototype) {
  patch(express.Router.prototype, "router");
}

module.exports = {};
