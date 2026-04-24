import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

type CertificatePDFData = {
  studentName: string;
  eventName: string;
  eventDate: Date;
  certificateId: string;
  verificationUrl: string;
};

function hexToRgb(hex: string) {
  const normalized = hex.replace("#", "").trim();
  const value =
    normalized.length === 3
      ? normalized
          .split("")
          .map((c) => c + c)
          .join("")
      : normalized;
  const num = parseInt(value, 16);
  return {
    r: ((num >> 16) & 255) / 255,
    g: ((num >> 8) & 255) / 255,
    b: (num & 255) / 255,
  };
}

function formatEventDate(date: Date) {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

export async function generateCertificatePDF(
  data: CertificatePDFData,
  templatePath: string | null,
  qrPngBuffer: Buffer
) {
  const certificateStoragePath = process.env.CERTIFICATE_STORAGE_PATH || "./storage/certificates";
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const backendRoot = path.resolve(__dirname, "..");
  const resolvedStorageDir = path.resolve(backendRoot, certificateStoragePath);
  fs.mkdirSync(resolvedStorageDir, { recursive: true });

  const outputDiskPath = path.join(resolvedStorageDir, `${data.certificateId}.pdf`);
  const outputUrlPath = `/storage/certificates/${data.certificateId}.pdf`;

  const accentHex = "#7C3AED";
  const accentRgb = hexToRgb(accentHex);
  const gray = rgb(0.45, 0.45, 0.45);

  let pdfDoc: PDFDocument;
  let page: any;

  const isCustom = Boolean(templatePath);
  const templateExt = templatePath ? path.extname(templatePath).toLowerCase() : "";

  if (templatePath && templateExt === ".pdf") {
    const templateBytes = fs.readFileSync(templatePath);
    pdfDoc = await PDFDocument.load(templateBytes);
    page = pdfDoc.getPages()[0];
  } else {
    pdfDoc = await PDFDocument.create();
    page = pdfDoc.addPage([842, 595]); // A4 landscape

    if (templatePath) {
      const templateBytes = fs.readFileSync(templatePath);
      const embedded =
        templateExt === ".png"
          ? await pdfDoc.embedPng(templateBytes)
          : await pdfDoc.embedJpg(templateBytes);

      const { width: pageWidth, height: pageHeight } = page.getSize();
      const imgDims = embedded.scale(1);
      const scale = Math.min(pageWidth / imgDims.width, pageHeight / imgDims.height);
      const drawWidth = imgDims.width * scale;
      const drawHeight = imgDims.height * scale;
      const x = (pageWidth - drawWidth) / 2;
      const y = (pageHeight - drawHeight) / 2;

      page.drawRectangle({ x: 0, y: 0, width: pageWidth, height: pageHeight, color: rgb(1, 1, 1) });
      page.drawImage(embedded, { x, y, width: drawWidth, height: drawHeight });
    } else {
      const { width: pageWidth, height: pageHeight } = page.getSize();
      page.drawRectangle({ x: 0, y: 0, width: pageWidth, height: pageHeight, color: rgb(1, 1, 1) });

      const inset = 20;
      page.drawRectangle({
        x: inset,
        y: inset,
        width: pageWidth - inset * 2,
        height: pageHeight - inset * 2,
        borderColor: rgb(accentRgb.r, accentRgb.g, accentRgb.b),
        borderWidth: 2,
      });
      page.drawRectangle({
        x: inset + 8,
        y: inset + 8,
        width: pageWidth - (inset + 8) * 2,
        height: pageHeight - (inset + 8) * 2,
        borderColor: rgb(accentRgb.r, accentRgb.g, accentRgb.b),
        borderWidth: 0.75,
      });
    }
  }

  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const helveticaItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
  const courier = await pdfDoc.embedFont(StandardFonts.Courier);

  const { width, height } = page.getSize();

  const heading = "CERTIFICATE OF PARTICIPATION";
  const headingSize = 30;
  page.drawText(heading, {
    x: (width - helveticaBold.widthOfTextAtSize(heading, headingSize)) / 2,
    y: height - 95,
    size: headingSize,
    font: helveticaBold,
    color: rgb(accentRgb.r, accentRgb.g, accentRgb.b),
  });

  const sub = "This is to certify that";
  const subSize = 15;
  page.drawText(sub, {
    x: (width - helvetica.widthOfTextAtSize(sub, subSize)) / 2,
    y: height - 135,
    size: subSize,
    font: helvetica,
    color: gray,
  });

  const studentName = data.studentName || "Student";
  const studentSize = 34;
  page.drawText(studentName, {
    x: (width - helveticaBold.widthOfTextAtSize(studentName, studentSize)) / 2,
    y: height - 195,
    size: studentSize,
    font: helveticaBold,
    color: rgb(accentRgb.r, accentRgb.g, accentRgb.b),
  });

  const body1 = "has successfully participated in";
  const bodySize = 14;
  page.drawText(body1, {
    x: (width - helvetica.widthOfTextAtSize(body1, bodySize)) / 2,
    y: height - 235,
    size: bodySize,
    font: helvetica,
    color: gray,
  });

  const eventName = data.eventName || "Event";
  const eventSize = 20;
  page.drawText(eventName, {
    x: (width - helveticaBold.widthOfTextAtSize(eventName, eventSize)) / 2,
    y: height - 275,
    size: eventSize,
    font: helveticaBold,
    color: rgb(accentRgb.r, accentRgb.g, accentRgb.b),
  });

  const dateLine = `held on ${formatEventDate(data.eventDate)}`;
  const dateSize = 12;
  page.drawText(dateLine, {
    x: (width - helvetica.widthOfTextAtSize(dateLine, dateSize)) / 2,
    y: height - 305,
    size: dateSize,
    font: helvetica,
    color: gray,
  });

  const certIdLine = `Certificate ID: ${data.certificateId}`;
  const certIdSize = 10;
  page.drawText(certIdLine, {
    x: 48,
    y: 40,
    size: certIdSize,
    font: courier,
    color: gray,
  });

  const verifyLine = `Verify at: ${data.verificationUrl}`;
  const verifySize = 10;
  page.drawText(verifyLine, {
    x: (width - helveticaItalic.widthOfTextAtSize(verifyLine, verifySize)) / 2,
    y: 40,
    size: verifySize,
    font: helveticaItalic,
    color: gray,
  });

  const qrImage = await pdfDoc.embedPng(qrPngBuffer);
  page.drawImage(qrImage, { x: width - 48 - 64, y: 28, width: 64, height: 64 });

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(outputDiskPath, pdfBytes);

  return {
    fileUrl: outputUrlPath,
    templateUsed: isCustom ? "custom" : "default",
  };
}
