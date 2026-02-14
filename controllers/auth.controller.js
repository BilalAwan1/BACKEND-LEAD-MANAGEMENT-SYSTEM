import Joi from "joi";
import User from "../models/User.js";
import { signToken } from "../utils/jwt.js";
import { apiResponse, httpError } from "../utils/response.js";

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(80).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

export async function register(req, res, next) {
  try {
    const { error, value } = registerSchema.validate(req.body, { abortEarly: false });
    if (error) return next(httpError(400, "Validation failed", error.details));

    const existing = await User.findOne({ email: value.email });
    if (existing) return next(httpError(409, "Email already in use"));

    const user = await User.create(value);
    const token = signToken(user._id.toString());
    return res.status(201).json(apiResponse(true, { user, token }, "Registered successfully"));
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { error, value } = loginSchema.validate(req.body, { abortEarly: false });
    if (error) return next(httpError(400, "Validation failed", error.details));

    const user = await User.findOne({ email: value.email });
    if (!user) return next(httpError(401, "Invalid credentials"));

    const ok = await user.comparePassword(value.password);
    if (!ok) return next(httpError(401, "Invalid credentials"));

    const token = signToken(user._id.toString());
    return res.status(200).json(apiResponse(true, { user, token }, "Logged in successfully"));
  } catch (err) {
    next(err);
  }
}

export async function me(req, res, next) {
  try {
    return res.status(200).json(apiResponse(true, { user: req.user }));
  } catch (err) {
    next(err);
  }
}

