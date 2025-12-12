// Import Sequelize instance
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
const BennerHome = require("./bennerHomeModel")(
    sequelize,
    require("sequelize").DataTypes
);
const Newsletter = require("./newsletterModel")(
    sequelize,
    require("sequelize").DataTypes
);


// RELASI (optional, bisa tambah lain kalau mau)
Product.belongsTo(Category, { foreignKey: "categoryId", as: "category" });
Category.hasMany(Product, { foreignKey: "categoryId", as: "products" });
// Category.hasMany(Product, { foreignKey: "categoryId", as: "products" });

// Cart <-> Product
Cart.belongsTo(Product, { foreignKey: "product_id", onDelete: "CASCADE" });
Product.hasMany(Cart, { foreignKey: "product_id", onDelete: "CASCADE" });

// OrderItem <-> Product
OrderItem.belongsTo(Product, { foreignKey: "product_id", onDelete: "CASCADE" });
Product.hasMany(OrderItem, { foreignKey: "product_id", onDelete: "CASCADE" });

// Wishlist <-> Product
Wishlist.belongsTo(Product, { foreignKey: "product_id", onDelete: "CASCADE" });
Product.hasMany(Wishlist, { foreignKey: "product_id", onDelete: "CASCADE" });


const initModels = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ DB connected with Sequelize");

    // ✅ Dev saja yang boleh sync/alter
    if (process.env.NODE_ENV !== "production") {
      console.log("⚠️ Dev mode: sequelize.sync({ alter: true })");
      await sequelize.sync({ alter: true });
    } else {
      // ✅ Production: jangan sync biar tidak ALTER TABLE
      console.log("🛑 Production mode: SKIP sequelize.sync()");
    }
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
    BennerHome,
    initModels,
    Newsletter,
};
