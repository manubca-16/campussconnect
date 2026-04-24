import QRCode from "qrcode";

export async function generateQRImageBuffer(text: string) {
  const buffer = await QRCode.toBuffer(text, {
    type: "png",
    errorCorrectionLevel: "M",
    margin: 1,
    scale: 6,
  });
  return buffer;
}

