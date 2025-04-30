const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const User = require("../models/userModel.js");

const filterAuth = (req, res, next) => {
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
            .status(400)
            .json({ message: "User not found or token expired" });
    });
};
module.exports = filterAuth;
