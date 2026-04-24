import express from "express";
import {
  markEventCompleted,
  generateCertificates,
  uploadTemplateHandler,
  getStudentCertificates,
  verifyCertificate,
} from "../controllers/certificateController.js";
import { protect, authorize } from "../middleware/auth.js";
import { uploadTemplate } from "../middleware/uploadTemplate.js";

const router = express.Router();

router.patch(
  "/certificates/event/:eventId/complete",
  protect,
  authorize("college_admin", "super_admin"),
  markEventCompleted
);

router.post(
  "/certificates/generate/:eventId",
  protect,
  authorize("college_admin", "super_admin"),
  generateCertificates
);

router.post(
  "/certificates/upload-template",
  protect,
  authorize("college_admin", "super_admin"),
  uploadTemplate.single("template"),
  uploadTemplateHandler
);

router.get(
  "/certificates/student/:studentId",
  protect,
  authorize("student"),
  getStudentCertificates
);

router.get("/certificates/verify/:certificateId", verifyCertificate);

export default router;

