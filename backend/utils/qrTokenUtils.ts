import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const QR_SECRET = process.env.QR_SECRET || 'fallback_qr_secret_key';

export const generateQRPayload = (eventId: string) => {
  const payload = {
    eventId,
    iat: Math.floor(Date.now() / 1000), // Standard JWT iat
    nonce: uuidv4()
  };

  // 45 seconds expiration
  const token = jwt.sign(payload, QR_SECRET, { expiresIn: 45 });
  return token;
};

export const verifyQRPayload = (token: string) => {
  try {
    const decoded = jwt.verify(token, QR_SECRET);
    return decoded;
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      const err = new Error('QR_EXPIRED');
      err.name = 'QR_EXPIRED';
      throw err;
    }
    const err = new Error('QR_INVALID');
    err.name = 'QR_INVALID';
    throw err;
  }
};
