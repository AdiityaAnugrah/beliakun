const { DataTypes } = require("sequelize");
const sequelize = require("../config/db.js");

const TokenAdsModel = sequelize.define(
    "TokenAds",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        token: {
            type: DataTypes.TEXT("long"),
            allowNull: false,
        },
        expired: {
            type: DataTypes.DATE,
            allowNull: false,
        },
    },
    {
        tableName: "token_ads",
        timestamps: false,
    }
);

module.exports = TokenAdsModel;
