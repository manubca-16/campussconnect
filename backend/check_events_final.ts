import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

const Event = mongoose.model('Event', new mongoose.Schema({}, { strict: false }));

async function check() {
  await mongoose.connect(process.env.MONGODB_URI!);
  const events = await Event.find();
  console.log('Events in DB:');
  events.forEach(e => {
    console.log(`- ${e.name} (College: ${e.college}, ID: ${e.collegeId})`);
  });
  process.exit();
}
check();
