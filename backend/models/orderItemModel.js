const { DataTypes } = require("sequelize");
const sequelize = require("../config/db.js");
const Product = require("./productModel.js");

const OrderItem = sequelize.define(
    "OrderItem",
    {
        quantity: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
            allowNull: false,
        },
    },
    {
        tableName: "carts",
        timestamps: true,
    }
);

OrderItem.belongsTo(Product, { foreignKey: "product_id" });
Product.hasMany(OrderItem, { foreignKey: "product_id" });

// OrderItem.belongsTo(Order, { foreignKey: "order_id" });
// Order.hasMany(OrderItem, { foreignKey: "order_id" });

module.exports = OrderItem;
