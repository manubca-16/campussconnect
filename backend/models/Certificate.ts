import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema(
  {
    certificateId: { type: String, required: true, unique: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    studentName: { type: String, required: true },
    email: { type: String, required: true },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    eventName: { type: String, required: true },
    eventDate: { type: Date, required: true },
    issuedAt: { type: Date, default: Date.now },
    fileUrl: { type: String, required: true },
    templateUsed: { type: String, enum: ["default", "custom"], default: "default" },
  },
  { timestamps: true }
);

certificateSchema.index({ studentId: 1, eventId: 1 }, { unique: true });

export const Certificate =
  mongoose.models.Certificate || mongoose.model("Certificate", certificateSchema);

