// import express from "express";
// import dotenv from "dotenv";
// import cors from "cors";
// import bodyParser from "body-parser";
// import authRoutes from "./routes/authRoutes.js";
// import { initModels } from "./models/index.js";

const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");
const authRoutes = require("./routes/authRoutes.js");
const { initModels } = require("./models/index.js");

dotenv.config();
const app = express();

app.use(cors());
app.use(bodyParser.json());

// Routes
app.get("/", (req, res) => {
    res.send("Welcome to the API!");
});
app.use("/api/auth", authRoutes);

// Init DB & start server
const PORT = process.env.PORT || 5000;
initModels().then(() => {
    app.listen(PORT, () => {
        console.log(`✅ Server running on http://localhost:${PORT}`);
    });
});
