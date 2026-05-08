import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    type: { type: String, required: true },
    description: { type: String, required: true },
    rules: { type: String },
    date: { type: String, required: true },
    time: { type: String, required: true },
    venue: { type: String, required: true },
    price: { type: Number, default: 0 },
    maxParticipants: { type: Number },
    contactEmail: { type: String, required: true },
    prizeDetails: { type: String },
    college: { type: String, required: true },
    collegeId: { type: String, required: true },
    poster: { type: String },
    isFest: { type: Boolean, default: false },
    parentFestId: { type: String },
    paymentOptions: { type: [String], default: ["Online"] },
    status: { type: String, enum: ["upcoming", "ongoing", "completed"], default: "upcoming" },
    certificatesGenerated: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Event = mongoose.model("Event", eventSchema);

