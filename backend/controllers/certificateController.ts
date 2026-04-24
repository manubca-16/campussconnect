import { Event } from "../../frontend/src/models/Event.js";
import { Attendance } from "../../frontend/src/models/Attendance.js";
import { Certificate } from "../models/Certificate.js";
import { generateCertificateId } from "../utils/certificateIdUtils.js";
import { generateQRImageBuffer } from "../utils/qrGenerator.js";
import { generateCertificatePDF } from "../utils/certificateGenerator.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

function parseEventDate(value: any) {
  if (!value) return new Date();
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return new Date();
  return d;
}

function resolveSafeTemplatePath(input: string | null) {
  if (!input) return null;

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const backendRoot = path.resolve(__dirname, "..");
  const templatesDir = path.resolve(backendRoot, process.env.TEMPLATE_STORAGE_PATH || "./storage/templates");

  const fullPath = path.isAbsolute(input) ? input : path.resolve(backendRoot, input);
  const normalizedFull = path.resolve(fullPath);
  const normalizedTemplates = path.resolve(templatesDir);

  if (!normalizedFull.startsWith(normalizedTemplates + path.sep)) {
    throw new Error("Invalid templatePath");
  }
  if (!fs.existsSync(normalizedFull)) {
    throw new Error("Template file not found");
  }
  return normalizedFull;
}

export const markEventCompleted = async (req: any, res: any) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (event.status === "completed") {
      return res.status(400).json({ message: "Event is already marked as completed" });
    }

    event.status = "completed";
    await event.save();

    return res.status(200).json({ message: "Event marked as completed", event });
  } catch (error: any) {
    console.error("Error marking event completed:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const generateCertificates = async (req: any, res: any) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (event.status !== "completed") {
      return res.status(400).json({ message: "Event must be marked as completed before generating certificates" });
    }

    if (event.certificatesGenerated === true) {
      return res.status(400).json({ message: "Certificates have already been generated for this event. Use regenerate if needed." });
    }

    const attendanceRecords = await Attendance.find({ eventId });
    if (!attendanceRecords || attendanceRecords.length === 0) {
      return res.status(404).json({ message: "No attendance records found for this event" });
    }

    let templatePath: string | null = null;
    try {
      templatePath = resolveSafeTemplatePath(req.body?.templatePath || null);
    } catch (e: any) {
      return res.status(400).json({ message: e?.message || "Invalid templatePath" });
    }

    const baseUrl = process.env.BASE_URL || process.env.APP_URL || "http://localhost:3000";

    let sequenceNumber = (await Certificate.countDocuments({ eventId })) + 1;
    let created = 0;
    let skipped = 0;
    let failed = 0;

    for (const attendance of attendanceRecords) {
      try {
        const exists = await Certificate.findOne({ studentId: attendance.studentId, eventId });
        if (exists) {
          skipped += 1;
          continue;
        }

        const certificateId = generateCertificateId(eventId, sequenceNumber);
        const verificationUrl = `${baseUrl.replace(/\\/$/, "")}/verify/${certificateId}`;
        const qrBuffer = await generateQRImageBuffer(verificationUrl);

        const { fileUrl, templateUsed } = await generateCertificatePDF(
          {
            studentName: attendance.studentName || "Student",
            eventName: event.name || event.title || attendance.eventName || "Event",
            eventDate: parseEventDate(event.date),
            certificateId,
            verificationUrl,
          },
          templatePath,
          qrBuffer
        );

        await Certificate.create({
          certificateId,
          studentId: attendance.studentId,
          studentName: attendance.studentName || "Student",
          email: attendance.email,
          eventId: event._id,
          eventName: event.name || event.title || attendance.eventName || "Event",
          eventDate: parseEventDate(event.date),
          issuedAt: new Date(),
          fileUrl,
          templateUsed,
        });

        created += 1;
        sequenceNumber += 1;
      } catch (err: any) {
        failed += 1;
        console.error(`Certificate generation failed for student ${attendance?.studentId}:`, err);
      }
    }

    if (failed === 0) {
      event.certificatesGenerated = true;
    }
    await event.save();

    return res.status(201).json({
      message: "Certificates generated successfully",
      total: created,
      skipped,
      failed,
    });
  } catch (error: any) {
    console.error("Error generating certificates:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const uploadTemplateHandler = async (req: any, res: any) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Template file is required" });
    return res.status(200).json({ message: "Template uploaded", templatePath: req.file.path });
  } catch (error: any) {
    console.error("Error uploading template:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getStudentCertificates = async (req: any, res: any) => {
  try {
    const { studentId } = req.params;
    if (req.user?.id?.toString() !== studentId) {
      return res.status(403).json({ message: "Access denied" });
    }

    const certs = await Certificate.find({ studentId }).sort({ issuedAt: -1 });
    return res.status(200).json(certs);
  } catch (error: any) {
    console.error("Error fetching student certificates:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const verifyCertificate = async (req: any, res: any) => {
  try {
    const { certificateId } = req.params;
    const cert = await Certificate.findOne({ certificateId });
    if (!cert) {
      return res.status(404).json({ valid: false, message: "Certificate not found or invalid" });
    }

    return res.status(200).json({
      valid: true,
      certificate: {
        studentName: cert.studentName,
        eventName: cert.eventName,
        eventDate: cert.eventDate,
        issuedAt: cert.issuedAt,
        certificateId: cert.certificateId,
      },
    });
  } catch (error: any) {
    console.error("Error verifying certificate:", error);
    res.status(500).json({ valid: false, message: "Internal server error" });
  }
};
