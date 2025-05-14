const { DataTypes } = require("sequelize");
const sequelize = require("../config/db.js");
const User = require("./userModel.js");
const Product = require("./productModel.js");
const Cart = require("./cartModel.js");
const OrderItem = require("./orderItemModel.js");

const Order = sequelize.define(
    "Order",
    {
        email: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM("pending", "success", "failed"),
            defaultValue: "pending",
        },
    },
    {
        tableName: "orders",
        timestamps: true,
    }
);

Order.belongsTo(User, { foreignKey: "user_id" });
User.hasMany(Order, { foreignKey: "user_id" });

Order.hasMany(OrderItem, { foreignKey: "order_id" });
OrderItem.belongsTo(Order, { foreignKey: "order_id" });

module.exports = Order;
