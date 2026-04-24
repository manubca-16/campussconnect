import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, 'backend/.env') });

import { User } from './frontend/src/models/User.js';
import { Event } from './frontend/src/models/Event.js';
import { Registration } from './frontend/src/models/Registration.js';

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI!);
  console.log("Connected to MongoDB");

  const event = await Event.findOne({ name: /codex/i });
  if (!event) {
    console.log("Event 'Tech Fest Codex' not found. Creating it...");
    // Fallback if not found
  }
  
  const targetEvent = event || await Event.create({
    name: "Tech Fest Codex",
    category: "Technical",
    type: "Inter College",
    description: "A grand technical fest",
    rules: "Standard rules apply",
    date: "2026-05-20",
    time: "10:00 AM",
    venue: "Main Campus Auditorium",
    price: 500,
    maxParticipants: 500,
    contactEmail: "admin@college.edu",
    college: "Main College",
    collegeId: "main_college_id",
    isFest: true,
    paymentOptions: ["Online", "COD"]
  });

  const students = [
    { name: "Rahul Sharma", email: "rahul@example.com" },
    { name: "Anish Gupta", email: "anish@example.com" },
    { name: "Priya Singh", email: "priya@example.com" }
  ];

  for (let i = 0; i < students.length; i++) {
    const s = students[i];
    let user = await User.findOne({ email: s.email });
    if (!user) {
      user = await User.create({
        name: s.name,
        email: s.email,
        password: "hashedpassword", // Not really used for this seed
        role: "student",
        approved: true
      });
    }

    const method = i === 0 ? "Online" : "COD";
    
    await Registration.create({
      eventId: targetEvent._id.toString(),
      userId: user._id.toString(),
      userName: user.name,
      userEmail: user.email,
      eventName: targetEvent.name,
      college: "BMS College", // Dummy origin college
      price: targetEvent.price,
      paymentMethod: method,
      date: new Date()
    });
    console.log(`Registered ${s.name} for ${targetEvent.name} via ${method}`);
  }

  process.exit();
}

seed();
