const { DataTypes } = require("sequelize");
const sequelize = require("../config/db.js");
const Category = require("./categoryModel.js");

const Product = sequelize.define(
    "Product",
    {
        nama: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        harga: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        stock: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        gambar: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        link_shopee: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM("dijual", "tidak_dijual"),
            defaultValue: "dijual",
        },
        produk_terjual: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        deskripsi: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        categoryId: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Categories', // Reference the 'Category' table
                key: 'id',
            },
        },
        // kategori: {
        //     type: DataTypes.ENUM("games", "tools"),
        //     defaultValue: "games",
        // },
    },
    {
        tableName: "products",
        timestamps: true,
    }
);


module.exports = Product;
