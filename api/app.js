import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { env } from "../utils/env.js";
import { apiResponse } from "../utils/response.js";
import authRouter from "../routes/auth.routes.js";
import leadRouter from "../routes/lead.routes.js";

const app = express();

app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

app.get("/health", (req, res) => {
  return res.status(200).json(apiResponse(true, { status: "ok" }, "Server is healthy"));
});

app.use("/auth", authRouter);
app.use("/leads", leadRouter);

app.use((req, res, next) => {
  if (req.path.startsWith("/")) {
    return res.status(404).json(apiResponse(false, null, "Endpoint not found"));
  }
  next();
});

app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";
  const errors = err.errors || undefined;
  if (env.NODE_ENV !== "production") {
    console.error("Error:", err);
  }
  return res.status(status).json(apiResponse(false, null, message, errors));
});

export default app;

