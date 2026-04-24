import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  studentName: { type: String, required: true },
  email: { type: String, required: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
  eventName: { type: String, required: true },
  markedAt: { type: Date, default: Date.now }
});

// Enforce one-attendance-per-student-per-event
attendanceSchema.index({ studentId: 1, eventId: 1 }, { unique: true });

export const Attendance = mongoose.models.Attendance || mongoose.model("Attendance", attendanceSchema);
