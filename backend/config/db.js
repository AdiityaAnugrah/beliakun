const { Sequelize } = require("sequelize");
const path = require("path");
const dotenv = require("dotenv");

// Paksa dotenv baca .env dari folder backend (bukan dari cwd)
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const DB_HOST = process.env.DB_HOST;
const DB_USER = process.env.DB_USER;
const DB_PASS = process.env.DB_PASSWORD ?? "";
const DB_NAME = process.env.DB_NAME;
const DB_PORT = Number(process.env.DB_PORT || 3306);

// Kalau env kosong, jangan diam-diam jalan (biar ketahuan masalahnya)
if (!DB_HOST || !DB_USER || !DB_NAME) {
  throw new Error(
    `Missing DB env. DB_HOST=${DB_HOST} DB_USER=${DB_USER} DB_NAME=${DB_NAME}`
  );
}

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: "mysql",
  logging: false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

module.exports = sequelize;
