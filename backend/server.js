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

app.use(
    cors({
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);
app.use(bodyParser.json());

// Routes
app.get("/api", (req, res) => {
    res.send("Welcome to the API!");
});
app.use("/api/auth", authRoutes);

// Init DB & start server
const PORT = process.env.PORT || 4000;
initModels().then(() => {
    app.listen(PORT, () => {
        console.log(`✅ UDAH JALAN DI SERVERMU DI PORT [${PORT}]`);
    });
});
