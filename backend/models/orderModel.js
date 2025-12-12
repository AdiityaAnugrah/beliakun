const { DataTypes } = require("sequelize");
const sequelize = require("../config/db.js");
const User = require("./userModel.js");
const OrderItem = require("./orderItemModel.js");

const Order = sequelize.define(
  "Order",
  {
    data_mid: { type: DataTypes.JSON },
    midtrans_id: { type: DataTypes.TEXT },

    tripay_reference: { type: DataTypes.STRING },
    tripay_merchant_ref: { type: DataTypes.STRING },
    data_tripay: { type: DataTypes.JSON },

    email: { type: DataTypes.STRING, allowNull: false },

    status: {
      type: DataTypes.ENUM("pending", "success", "failed"),
      defaultValue: "pending",
    },

    nama: { type: DataTypes.STRING },
    alamat: { type: DataTypes.STRING },
    catatan: { type: DataTypes.TEXT },
    total_harga: { type: DataTypes.INTEGER },

    // ===== BOT KEY FIELDS =====
    key_id: { type: DataTypes.INTEGER, allowNull: true },
    telegram_chat_id: { type: DataTypes.BIGINT, allowNull: true },
    key_durasi: { type: DataTypes.ENUM("1 jam", "1 minggu", "1 bulan"), allowNull: true },
    key_text: { type: DataTypes.STRING, allowNull: true },
    key_delivered_at: { type: DataTypes.DATE, allowNull: true },
  },
  {
    tableName: "orders",
    timestamps: true,
  }
);

Order.belongsTo(User, { foreignKey: "user_id" });
User.hasMany(Order, { foreignKey: "user_id" });

Order.hasMany(OrderItem, { foreignKey: "order_id", as: "OrderItems" });
OrderItem.belongsTo(Order, { foreignKey: "order_id" });

module.exports = Order;
