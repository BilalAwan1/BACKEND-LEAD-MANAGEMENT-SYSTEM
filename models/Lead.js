import mongoose from "mongoose";

export const STATUSES = ["New", "Contacted", "Qualified", "Closed"];

const leadSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    status: { type: String, enum: STATUSES, default: "New", index: true },
    source: { type: String, default: "Website", trim: true, index: true },
    notes: { type: String, default: "" },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  },
  { timestamps: true },
);

leadSchema.index({ fullName: "text", email: "text", phone: "text" });

const Lead = mongoose.model("Lead", leadSchema);
export default Lead;

