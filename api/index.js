import serverless from "serverless-http";
import { connectMongo } from "../utils/db.js";
import app from "./app.js";

let handler;

export default async function (req, res) {
  if (!handler) {
    try {
      await connectMongo();
    } catch (err) {
      console.error("Failed to connect to MongoDB:", err);
    }
    handler = serverless(app, { basePath: "/api" });
  }
  return handler(req, res);
}