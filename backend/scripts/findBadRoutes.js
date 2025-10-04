// scripts/findBadRoutes.js
// Scan source untuk menemukan baris yang memasang URL penuh / Windows path sebagai path,
// termasuk ARRAY path, serta pemakaian path.join/__dirname sebagai argumen pertama.
const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const EXCLUDES = ["node_modules", ".git", ".next", "dist", "build"];
const FILE_EXT = [".js", ".cjs", ".mjs", ".ts"];

const BAD_PATTERNS = [
  // app/router dengan string URL penuh
  /\bapp\.(use|get|post|put|patch|delete|options|all)\(\s*["'`](https?:\/\/)[^"'`]*["'`]/i,
  /\brouter\.(use|get|post|put|patch|delete|options|all)\(\s*["'`](https?:\/\/)[^"'`]*["'`]/i,
  // ARRAY berisi URL penuh
  /\bapp\.(use|get|post|put|patch|delete|options|all)\(\s*\[\s*["'`](https?:\/\/)[^"'`]*["'`]/i,
  /\brouter\.(use|get|post|put|patch|delete|options|all)\(\s*\[\s*["'`](https?:\/\/)[^"'`]*["'`]/i,
  // Windows drive (C:\...) dipakai sebagai path
  /\bapp\.(use|get|post|put|patch|delete|options|all)\(\s*["'`][A-Za-z]:[\\\/][^"'`]*/,
  /\brouter\.(use|get|post|put|patch|delete|options|all)\(\s*["'`][A-Za-z]:[\\\/][^"'`]*/,
  // express.static diberi URL
  /\bexpress\.static\(\s*["'`](https?:\/\/)[^"'`]*["'`]/i,
  // Pola umum: path.join/__dirname dipakai langsung sebagai argumen pertama (sering tidak sengaja)
  /\bapp\.(use|get|post|put|patch|delete|options|all)\(\s*(path\.join|path\.resolve|__dirname)/,
  /\brouter\.(use|get|post|put|patch|delete|options|all)\(\s*(path\.join|path\.resolve|__dirname)/,
];

function walk(dir, out) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (EXCLUDES.includes(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (FILE_EXT.includes(path.extname(e.name))) out.push(p);
  }
}

function scan(file) {
  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
  const hits = [];
  lines.forEach((ln, i) => {
    if (BAD_PATTERNS.some((re) => re.test(ln))) {
      hits.push({ line: i + 1, text: ln.trim() });
    }
  });
  return hits;
}

(function main() {
  const files = [];
  walk(ROOT, files);
  let total = 0;
  files.forEach((f) => {
    const hits = scan(f);
    if (hits.length) {
      console.log("\n" + f);
      hits.forEach((h) => {
        total++;
        console.log(`  [${h.line}] ${h.text}`);
      });
    }
  });
  if (!total) console.log("✅ Tidak ada pola mencurigakan (string/array URL, Windows path, path.join/__dirname) ditemukan.");
  else console.log(`\n⚠️ Ditemukan ${total} baris mencurigakan. Pastikan argumen pertama adalah PATH relatif ("/...").`);
})();
