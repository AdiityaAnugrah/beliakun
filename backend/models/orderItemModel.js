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
        order_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        product_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    },
    {
        tableName: "order_items", // ✅ ubah dari 'carts'
        timestamps: true,
    }
);

// Relasi
OrderItem.belongsTo(Product, { foreignKey: "product_id", onDelete: "CASCADE" });
Product.hasMany(OrderItem, { foreignKey: "product_id", onDelete: "CASCADE" });

module.exports = OrderItem;
