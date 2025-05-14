require("dotenv").config();
const TokenAds = require("../models/tokenAdsModel.js");

const create = async (req, res) => {
    try {
        let token = "";
        const possible =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (let i = 0; i < 16; i++) {
            token += possible.charAt(
                Math.floor(Math.random() * possible.length)
            );
        }
        const expired = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
        const tokenAds = await TokenAds.create({ token, expired });
        res.status(200).json(tokenAds);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

const verify = async (req, res) => {
    try {
        const token = req.body.token;
        const fetchOne = await TokenAds.findOne({ where: { token: token } });
        if (fetchOne) {
            const expired = new Date(fetchOne.expired);
            const now = new Date();
            if (now > expired) {
                await TokenAds.destroy({ where: { token: token } });
                return res.status(400).json({ message: "Token expired" });
            }
            await TokenAds.destroy({ where: { token: token } });
            res.status(200).json({ message: "Token valid" });
        } else {
            res.status(400).json({ message: "Token invalid" });
        }
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = { create, verify };
