const sequelize = require("../config/db.js");

const Product = require("./productModel");
const Category = require("./categoryModel");
const Cart = require("./cartModel");
const Key = require("./keyModel");
const Order = require("./orderModel");
const OrderItem = require("./orderItemModel");
const TokenAds = require("./tokenAdsModel");
const User = require("./userModel");
const Wishlist = require("./wishlistModel");

// RELASI (optional, bisa tambah lain kalau mau)
Product.belongsTo(Category, { foreignKey: "categoryId", as: "category" });
// Category.hasMany(Product, { foreignKey: "categoryId", as: "products" });

const initModels = async () => {
    try {
        await sequelize.authenticate();
        console.log("✅ DB connected with Sequelize");

        await sequelize.sync(); // { force: true } untuk drop & recreate
        console.log("✅ All models were synchronized");
    } catch (error) {
        console.error("❌ Sequelize error:", error);
    }
};

// Export semua model (biar mudah diimport di controller/router)
module.exports = {
    sequelize,
    Product,
    Category,
    Cart,
    Key,
    Order,
    OrderItem,
    TokenAds,
    User,
    Wishlist,
    initModels,
};
