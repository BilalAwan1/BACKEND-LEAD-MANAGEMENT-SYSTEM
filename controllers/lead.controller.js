import Joi from "joi";
import Lead, { STATUSES } from "../models/Lead.js";
import { apiResponse, httpError } from "../utils/response.js";

const createSchema = Joi.object({
  fullName: Joi.string().min(2).max(120).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().min(5).max(30).required(),
  status: Joi.string()
    .valid(...STATUSES)
    .default("New"),
  source: Joi.string().max(60).default("Website"),
  notes: Joi.string().allow("").default(""),
});

const updateSchema = Joi.object({
  fullName: Joi.string().min(2).max(120),
  email: Joi.string().email(),
  phone: Joi.string().min(5).max(30),
  status: Joi.string().valid(...STATUSES),
  source: Joi.string().max(60),
  notes: Joi.string().allow(""),
}).min(1);

const statusSchema = Joi.object({
  status: Joi.string()
    .valid(...STATUSES)
    .required(),
});

export async function list(req, res, next) {
  try {
    const { q, status, source, sort = "createdAt:desc", page = 1, limit = 10 } = req.query;
    const filter = { owner: req.user._id };
    if (status) filter.status = status;
    if (source) filter.source = source;
    if (q) {
      const regex = new RegExp(q, "i");
      filter.$or = [{ fullName: regex }, { email: regex }, { phone: regex }];
    }
    const [sortField, sortDir] = String(sort).split(":");
    const sortObj = { [sortField]: sortDir === "asc" ? 1 : -1 };

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
    const skip = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      Lead.find(filter).sort(sortObj).skip(skip).limit(limitNum),
      Lead.countDocuments(filter),
    ]);

    const meta = {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    };
    return res.status(200).json(apiResponse(true, { items, meta }));
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const { error, value } = createSchema.validate(req.body, { abortEarly: false });
    if (error) return next(httpError(400, "Validation failed", error.details));
    const lead = await Lead.create({ ...value, owner: req.user._id });
    return res.status(201).json(apiResponse(true, { lead }, "Lead created"));
  } catch (err) {
    next(err);
  }
}

export async function get(req, res, next) {
  try {
    const lead = await Lead.findOne({ _id: req.params.id, owner: req.user._id });
    if (!lead) return next(httpError(404, "Lead not found"));
    return res.status(200).json(apiResponse(true, { lead }));
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const { error, value } = updateSchema.validate(req.body, { abortEarly: false });
    if (error) return next(httpError(400, "Validation failed", error.details));
    const lead = await Lead.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { $set: value },
      { new: true },
    );
    if (!lead) return next(httpError(404, "Lead not found"));
    return res.status(200).json(apiResponse(true, { lead }, "Lead updated"));
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const lead = await Lead.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!lead) return next(httpError(404, "Lead not found"));
    return res.status(200).json(apiResponse(true, { lead }, "Lead deleted"));
  } catch (err) {
    next(err);
  }
}

export async function updateStatus(req, res, next) {
  try {
    const { error, value } = statusSchema.validate(req.body, { abortEarly: false });
    if (error) return next(httpError(400, "Validation failed", error.details));
    const lead = await Lead.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { $set: { status: value.status } },
      { new: true },
    );
    if (!lead) return next(httpError(404, "Lead not found"));
    return res.status(200).json(apiResponse(true, { lead }, "Status updated"));
  } catch (err) {
    next(err);
  }
}

