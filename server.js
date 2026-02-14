import express from "express";
import app from "./api/app.js";

const server = express();
server.use("/api", app);

const port = process.env.PORT || 3000;
const host = "0.0.0.0";
server.listen(port, host);
