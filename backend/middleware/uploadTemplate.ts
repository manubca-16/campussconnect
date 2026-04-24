import fs from "fs";
import path from "path";
import multer from "multer";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const templateStoragePath = process.env.TEMPLATE_STORAGE_PATH || "./storage/templates";
const resolvedTemplateDir = path.resolve(__dirname, "..", templateStoragePath);
fs.mkdirSync(resolvedTemplateDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, resolvedTemplateDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `template-${Date.now()}${ext}`);
  },
});

const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  const allowed = ["image/png", "image/jpeg", "application/pdf"];
  if (!allowed.includes(file.mimetype)) {
    return cb(new Error("Only PNG, JPG, JPEG, or PDF templates are allowed"));
  }
  cb(null, true);
};

export const uploadTemplate = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

