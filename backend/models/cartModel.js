const { DataTypes } = require("sequelize");
const sequelize = require("../config/db.js");
const User = require("./userModel.js");
const Product = require("./productModel.js");

const Cart = sequelize.define(
    "Cart",
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

Cart.belongsTo(Product, { foreignKey: "product_id", onDelete: "CASCADE" });
Product.hasMany(Cart, { foreignKey: "product_id", onDelete: "CASCADE" });

Cart.belongsTo(Product, { foreignKey: "product_id" });
Product.hasMany(Cart, { foreignKey: "product_id" });

module.exports = Cart;
