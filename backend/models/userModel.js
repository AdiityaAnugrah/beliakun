// import { DataTypes } from "sequelize";
// import sequelize from "../config/db.js";
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db.js");

const User = sequelize.define(
    "User",
    {
        nama: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
        },
        username: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        role: {
            type: DataTypes.ENUM("admin", "pelanggan"),
            allowNull: false,
            defaultValue: "pelanggan",
        },
        status: {
            type: DataTypes.ENUM("active", "inactive"),
            defaultValue: "active",
        },
        token: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
        },
        verificationCode: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        isVerified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
    },
    {
        tableName: "users", // supaya sama dengan struktur yang kamu sebut
        timestamps: true,
    }
);

// export default User;
module.exports = User;
