// import sequelize from "../config/db.js";
// import User from "./userModel.js";

const sequelize = require("../config/db.js");

// Sync semua model ke database
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

// export { sequelize, initModels, User };
module.exports = { sequelize, initModels };
