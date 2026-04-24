import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema({
  eventId: { type: String, required: true },
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  userEmail: { type: String },
  eventName: { type: String },
  college: { type: String, required: true },
  price: { type: Number, default: 0 },
  paymentMethod: { type: String },
  date: { type: Date, default: Date.now },
}, { timestamps: true });

export const Registration = mongoose.model("Registration", registrationSchema);
