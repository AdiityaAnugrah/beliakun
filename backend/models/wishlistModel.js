const { DataTypes } = require("sequelize");
const sequelize = require("../config/db.js");
const User = require("./userModel.js");
const Product = require("./productModel.js");

const Wishlist = sequelize.define(
    "Wishlist",
    {},
    {
        tableName: "wishlists",
        timestamps: true,
    }
);

// Relasi
Wishlist.belongsTo(User, { foreignKey: "user_id" });
User.hasMany(Wishlist, { foreignKey: "user_id" });

Wishlist.belongsTo(Product, { foreignKey: "product_id" });
Product.hasMany(Wishlist, { foreignKey: "product_id" });

module.exports = Wishlist;
