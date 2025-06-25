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
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "carts",
    timestamps: true,
  }
);

// RELASI
Cart.belongsTo(Product, { foreignKey: "product_id", onDelete: "CASCADE" });
Product.hasMany(Cart, { foreignKey: "product_id", onDelete: "CASCADE" });

Cart.belongsTo(User, { foreignKey: "user_id", onDelete: "CASCADE" });
User.hasMany(Cart, { foreignKey: "user_id", onDelete: "CASCADE" });

module.exports = Cart;
