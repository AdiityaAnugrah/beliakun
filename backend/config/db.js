// backend/config/db.js
const { Sequelize } = require("sequelize");
const path = require("path");
const dotenv = require("dotenv");

// ✅ Paksa baca .env dari folder backend, dan override env lama (PM2 kadang nyangkut)
dotenv.config({ path: path.join(__dirname, "..", ".env"), override: true });

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    port: Number(process.env.DB_PORT || 3306),
    logging: false,
    // optional tapi aman:
    dialectOptions: {
      // kalau DB remote kadang perlu
      // connectTimeout: 10000,
    },
  }
);

module.exports = sequelize;
