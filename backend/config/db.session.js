// config/db.core.js
const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "beliakun",
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
  decimalNumbers: true,
  dateStrings: true,
  multipleStatements: false
});

async function q(sql, params = []) {
  const [rows] = await pool.query(sql, params);
  return rows;
}

module.exports = { pool, q };
