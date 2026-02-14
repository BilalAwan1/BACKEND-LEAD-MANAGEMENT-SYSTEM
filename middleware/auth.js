import { verifyToken } from "../utils/jwt.js";
import User from "../models/User.js";
import { httpError } from "../utils/response.js";

export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return next(httpError(401, "Missing Authorization token"));

  const decoded = verifyToken(token);
  if (!decoded) return next(httpError(401, "Invalid or expired token"));

  try {
    const user = await User.findById(decoded.sub);
    if (!user) return next(httpError(401, "User not found"));
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

