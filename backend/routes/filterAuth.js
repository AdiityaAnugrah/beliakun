const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const User = require("../models/userModel.js");

const filterPelanggan = (req, res, next) => {
    const { token } = req.body;
    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const userCurrent = await User.findOne({
            where: { email: decoded.email },
        });
        if (userCurrent && userCurrent.token == token) {
            req.user = userCurrent;
            return next();
        }
        if (userCurrent.role != "pelanggan") {
            return res
                .status(401)
                .json({ message: "you don't have permission" });
        }
        return res
            .status(401)
            .json({ message: "User not found or token expired" });
    });
};

const filterAdmin = (req, res, next) => {
    const { token } = req.body;
    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const userCurrent = await User.findOne({
            where: { email: decoded.email },
        });
        if (userCurrent && userCurrent.token == token) {
            req.user = userCurrent;
            return next();
        }
        if (userCurrent.role != "admin") {
            return res
                .status(401)
                .json({ message: "you don't have permission" });
        }

        return res
            .status(401)
            .json({ message: "User not found or token expired" });
    });
};

const filterAll = (req, res, next) => {
    const { token } = req.body;
    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const userCurrent = await User.findOne({
            where: { email: decoded.email },
        });
        if (userCurrent && userCurrent.token == token) {
            req.user = userCurrent;
            return next();
        }

        return res
            .status(401)
            .json({ message: "User not found or token expired" });
    });
};

module.exports = { filterPelanggan, filterAdmin, filterAll };
