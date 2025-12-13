// models/orderModel.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db.js");
const User = require("./userModel.js");
const OrderItem = require("./orderItemModel.js");

const Order = sequelize.define(
  "Order",
  {
    // ===== MIDTRANS (legacy) =====
    data_mid: {
      // kalau di DB kamu longtext, ini aman juga
      type: DataTypes.TEXT("long"),
      allowNull: true,
      get() {
        const raw = this.getDataValue("data_mid");
        if (!raw) return null;
        try {
          return typeof raw === "string" ? JSON.parse(raw) : raw;
        } catch {
          return raw; // fallback kalau ternyata bukan JSON valid
        }
      },
      set(val) {
        if (val === null || val === undefined) return this.setDataValue("data_mid", null);
        if (typeof val === "string") return this.setDataValue("data_mid", val);
        return this.setDataValue("data_mid", JSON.stringify(val));
      },
    },

    midtrans_id: { type: DataTypes.STRING(50), allowNull: true },

    // ===== TRIPAY =====
    tripay_reference: { type: DataTypes.STRING(64), allowNull: true },
    tripay_merchant_ref: { type: DataTypes.STRING(100), allowNull: true },

    // DB kamu: data_tripay = LONGTEXT, jadi di model: TEXT("long")
    data_tripay: {
      type: DataTypes.TEXT("long"),
      allowNull: true,
      get() {
        const raw = this.getDataValue("data_tripay");
        if (!raw) return null;
        try {
          return typeof raw === "string" ? JSON.parse(raw) : raw;
        } catch {
          return raw;
        }
      },
      set(val) {
        if (val === null || val === undefined) return this.setDataValue("data_tripay", null);
        if (typeof val === "string") return this.setDataValue("data_tripay", val);
        return this.setDataValue("data_tripay", JSON.stringify(val));
      },
    },

    // ===== DATA PEMBELI =====
    email: { type: DataTypes.STRING(255), allowNull: false },

    status: {
      type: DataTypes.ENUM("pending", "success", "failed"),
      defaultValue: "pending",
      allowNull: true,
    },

    nama: { type: DataTypes.STRING(255), allowNull: true },
    alamat: { type: DataTypes.STRING(255), allowNull: true },
    catatan: { type: DataTypes.TEXT, allowNull: true },
    total_harga: { type: DataTypes.INTEGER, allowNull: true },

    // ===== BOT KEY FIELDS =====
    key_id: { type: DataTypes.INTEGER, allowNull: true },
    telegram_chat_id: { type: DataTypes.BIGINT, allowNull: true },
    key_durasi: {
      type: DataTypes.ENUM("1 jam", "1 minggu", "1 bulan"),
      allowNull: true,
    },
    key_text: { type: DataTypes.STRING(255), allowNull: true },
    key_delivered_at: { type: DataTypes.DATE, allowNull: true },
  },
  {
    tableName: "orders",
    timestamps: true,
  }
);

// ===== RELASI =====
Order.belongsTo(User, { foreignKey: "user_id" });
User.hasMany(Order, { foreignKey: "user_id" });

Order.hasMany(OrderItem, { foreignKey: "order_id", as: "OrderItems" });
OrderItem.belongsTo(Order, { foreignKey: "order_id" });

module.exports = Order;
