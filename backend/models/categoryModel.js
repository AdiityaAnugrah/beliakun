const { DataTypes } = require("sequelize");
const sequelize = require("../config/db.js");

const Category = sequelize.define(
    "Category",
    {
        label: { type: DataTypes.STRING, allowNull: false },
        gambar: { type: DataTypes.STRING, allowNull: false },
    },
    {
        tableName: "categories",
        timestamps: true,
    }
);



module.exports = Category;
