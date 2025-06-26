const { DataTypes } = require("sequelize");
const sequelize = require("../config/db.js");
const User = require("./userModel.js");
const Product = require("./productModel.js");
const Cart = require("./cartModel.js");
const OrderItem = require("./orderItemModel.js");

const Order = sequelize.define(
    "Order",
    {
        data_mid: {
            type: DataTypes.JSON,
        },
        midtrans_id: {
            type: DataTypes.TEXT,
        },
        tripay_reference: {
            type: DataTypes.STRING,
        },
        tripay_merchant_ref: {
            type: DataTypes.STRING,
        },
        data_tripay: {
            type: DataTypes.JSON,
        },

        email: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM("pending", "success", "failed"),
            defaultValue: "pending",
        },
        nama: {
            type: DataTypes.STRING,
        },
        alamat: {
            type: DataTypes.STRING,
        },
        catatan: {
            type: DataTypes.TEXT,
        },
        total_harga: {
            type: DataTypes.INTEGER,
        },
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
