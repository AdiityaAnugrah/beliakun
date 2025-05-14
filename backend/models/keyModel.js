const { DataTypes } = require("sequelize");
const sequelize = require("../config/db.js");

const KeyModel = sequelize.define(
    "Key",
    {
        key: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM("nonaktif", "aktif"),
            defaultValue: "nonaktif",
        },
        durasi: {
            type: DataTypes.ENUM("1 jam", "1 minggu", "1 bulan"),
            allowNull: false,
        },
    },
    {
        tableName: "keys",
        timestamps: false,
    }
);

module.exports = KeyModel;
