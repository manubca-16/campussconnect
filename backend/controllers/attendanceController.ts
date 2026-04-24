import { Event } from '../../frontend/src/models/Event.js';
import { Attendance } from '../../frontend/src/models/Attendance.js';
import { generateQRPayload, verifyQRPayload } from '../utils/qrTokenUtils.js';
import * as XLSX from 'xlsx';

export const getQRToken = async (req: any, res: any) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const token = generateQRPayload(eventId);
    res.json({ token, expiresIn: 45 });
  } catch (error: any) {
    console.error("Error generating QR:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const markAttendance = async (req: any, res: any) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: "Token is required" });

    let decoded;
    try {
      decoded = verifyQRPayload(token);
    } catch (err: any) {
      if (err.name === 'QR_EXPIRED') {
        return res.status(400).json({ message: "QR code expired" });
      }
      return res.status(400).json({ message: "Invalid QR code" });
    }

    const { eventId } = decoded as any;
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const existingAttendance = await Attendance.findOne({ studentId: req.user.id, eventId });
    if (existingAttendance) {
      return res.status(409).json({ message: "Attendance already marked" });
    }

    const record = await Attendance.create({
      studentId: req.user.id,
      studentName: req.user.name,
      email: req.user.email,
      eventId: event._id,
      eventName: event.name || event.title || "Event"
    });

    res.status(201).json({ message: "Attendance marked successfully", record });
  } catch (error: any) {
    console.error("Error marking attendance:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAttendanceByEvent = async (req: any, res: any) => {
  try {
    const { eventId } = req.params;
    const records = await Attendance.find({ eventId }).sort({ markedAt: 1 });
    res.json(records);
  } catch (error: any) {
    console.error("Error fetching attendance:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const exportAttendanceExcel = async (req: any, res: any) => {
  try {
    const { eventId } = req.params;
    const records = await Attendance.find({ eventId }).sort({ markedAt: 1 });

    const data = records.map((record: any) => ({
      Name: record.studentName,
      Email: record.email,
      Event: record.eventName,
      Time: new Date(record.markedAt).toLocaleString()
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");

    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="attendance-${eventId}.xlsx"`);
    res.send(excelBuffer);
  } catch (error: any) {
    console.error("Error exporting attendance:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
