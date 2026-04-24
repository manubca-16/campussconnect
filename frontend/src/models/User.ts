import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["student", "college_admin", "super_admin"], required: true },
  approved: { type: Boolean, default: false },
}, { timestamps: true });

export const User = mongoose.model("User", userSchema);
