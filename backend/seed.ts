import dns from "dns";
dns.setServers(["1.1.1.1", "8.8.8.8"]);

import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import path from "path";
import { fileURLToPath } from "url";
import { User } from "./models/User.js";
import { College } from "./models/College.js";
import { Event } from "./models/Event.js";
import { Registration } from "./models/Registration.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, ".env") });

if (!process.env.MONGODB_URI) {
  console.error("MONGODB_URI is required in .env");
  process.exit(1);
}

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI!);
  console.log("✅ Connected to MongoDB. Starting seed...");

  // ── 1. Super Admin ──────────────────────────────────────────────────
  const hp = async (pw: string) => bcrypt.hash(pw, 10);

  const superAdminEmail = "superadmin@campusconnect.com";
  let superAdmin = await User.findOne({ email: superAdminEmail });
  if (!superAdmin) {
    superAdmin = await User.create({
      name: "Super Admin",
      email: superAdminEmail,
      password: await hp("SuperAdminPassword123!"),
      role: "super_admin",
      approved: true,
    });
    console.log("  ✔ Super Admin created");
  } else {
    superAdmin.password = await hp("SuperAdminPassword123!");
    await superAdmin.save();
    console.log("  ✔ Super Admin password refreshed");
  }

  // ── 2. Colleges & College Admins ────────────────────────────────────
  const collegeData = [
    { collegeName: "MIT College of Engineering", location: "Pune, Maharashtra", adminEmail: "admin@mitcoe.edu.in", adminName: "Dr. Ramesh Kulkarni", status: "approved" },
    { collegeName: "VJTI Mumbai", location: "Mumbai, Maharashtra", adminEmail: "admin@vjti.ac.in", adminName: "Prof. Sunita Sharma", status: "approved" },
    { collegeName: "PSG College of Technology", location: "Coimbatore, Tamil Nadu", adminEmail: "admin@psgtech.edu", adminName: "Dr. Anand Krishnan", status: "approved" },
    { collegeName: "NIT Warangal", location: "Warangal, Telangana", adminEmail: "admin@nitw.ac.in", adminName: "Prof. Lakshmi Reddy", status: "pending" },
    { collegeName: "BITS Pilani", location: "Pilani, Rajasthan", adminEmail: "admin@bits-pilani.ac.in", adminName: "Dr. Vikram Singh", status: "pending" },
  ];

  const savedColleges: any[] = [];
  for (const c of collegeData) {
    let adminUser = await User.findOne({ email: c.adminEmail });
    if (!adminUser) {
      adminUser = await User.create({
        name: c.adminName,
        email: c.adminEmail,
        password: await hp("Admin@123"),
        role: "college_admin",
        approved: c.status === "approved",
      });
    }
    let college = await College.findOne({ name: c.collegeName });
    if (!college) {
      college = await College.create({
        name: c.collegeName,
        location: c.location,
        adminId: adminUser._id.toString(),
        status: c.status,
      });
    }
    savedColleges.push({ college, admin: adminUser });
  }
  console.log(`  ✔ ${savedColleges.length} colleges seeded`);

  // ── 3. Student Users ─────────────────────────────────────────────────
  const studentData = [
    { name: "Priya Nair", email: "priya@student.com" },
    { name: "Arjun Mehta", email: "arjun@student.com" },
    { name: "Sneha Patel", email: "sneha@student.com" },
    { name: "Rohan Desai", email: "rohan@student.com" },
    { name: "Anjali Rao", email: "anjali@student.com" },
    { name: "Karan Malhotra", email: "karan@student.com" },
    { name: "Divya Joshi", email: "divya@student.com" },
    { name: "Vignesh Kumar", email: "vignesh@student.com" },
  ];

  const savedStudents: any[] = [];
  for (const s of studentData) {
    let student = await User.findOne({ email: s.email });
    if (!student) {
      student = await User.create({
        name: s.name,
        email: s.email,
        password: await hp("Student@123"),
        role: "student",
        approved: true,
      });
    }
    savedStudents.push(student);
  }
  console.log(`  ✔ ${savedStudents.length} students seeded`);

  // ── 4. Events ─────────────────────────────────────────────────────────
  const now = new Date();
  const fmtDate = (daysOffset: number) =>
    new Date(now.getTime() + daysOffset * 86400000).toISOString().split("T")[0];

  const eventTemplates = [
    {
      name: "HackFest 2025", category: "Hackathon", type: "Inter College",
      description: "48-hour hackathon where teams of 3-4 build innovative solutions using AI/ML. Mentors from top tech companies will guide participants. Top 3 teams present to industry jury.",
      rules: "Teams of 2-4. No pre-built code. Original ideas only.", date: fmtDate(10), time: "09:00", venue: "Tech Hub Auditorium",
      price: 299, maxParticipants: 200, prizeDetails: "₹1,00,000 prize pool", collegeIdx: 0,
    },
    {
      name: "CodeSprint Championship", category: "Technical", type: "Inter College",
      description: "Competitive programming contest featuring algorithmic challenges in three rounds. Problems range from beginner to expert. Uses LeetCode-style judging.",
      rules: "Individual participation. Duration: 3 hours. C++, Java, Python allowed.", date: fmtDate(14), time: "10:00", venue: "CS Department Lab",
      price: 149, maxParticipants: 300, prizeDetails: "₹50,000 prize pool", collegeIdx: 0,
    },
    {
      name: "Robowars 2025", category: "Technical", type: "Inter College",
      description: "Build a combat robot and fight for supremacy! Teams design, build, and operate remote-controlled robots in an arena battle.",
      rules: "Robot weight limit: 15kg. No hazardous materials. 2 members per team.", date: fmtDate(20), time: "11:00", venue: "Engineering Workshop",
      price: 499, maxParticipants: 64, prizeDetails: "Trophy + ₹75,000", collegeIdx: 1,
    },
    {
      name: "Cultural Fiesta", category: "Cultural", type: "College Level",
      description: "Annual cultural extravaganza featuring dance, drama, music, and art competitions. Open to all students with talent and passion for performing arts.",
      rules: "Solo and group entries. No vulgarity. Prior registration mandatory.", date: fmtDate(7), time: "18:00", venue: "College Amphitheatre",
      price: 0, maxParticipants: 500, prizeDetails: "Trophies + Certificates", collegeIdx: 1,
    },
    {
      name: "AI/ML Workshop", category: "Workshop", type: "College Level",
      description: "Hands-on workshop on Machine Learning fundamentals. Topics: Linear Regression, Neural Networks, Model Deployment. Participants build a mini project by end of session.",
      rules: "Bring your own laptop. Python basics required.", date: fmtDate(5), time: "09:30", venue: "Seminar Hall A",
      price: 199, maxParticipants: 80, prizeDetails: "Certificate of Participation", collegeIdx: 2,
    },
    {
      name: "Debate Championship", category: "Cultural", type: "Inter College",
      description: "Oxford-style debate tournament on technology, society, and policy topics. Teams argue for and against motions across 4 elimination rounds.",
      rules: "Teams of 2. 3 minutes per speaker. Judge decision is final.", date: fmtDate(12), time: "14:00", venue: "Seminar Hall B",
      price: 99, maxParticipants: 120, prizeDetails: "₹20,000 prize pool", collegeIdx: 2,
    },
    {
      name: "Sports Meet 2025", category: "Sports", type: "Inter College",
      description: "Annual inter-college sports tournament including cricket, football, kabaddi, and athletics. Best performance awards for individuals and teams.",
      rules: "College ID required. Participation in max 2 sports. Sportsman spirit mandatory.", date: fmtDate(25), time: "07:00", venue: "Sports Ground",
      price: 0, maxParticipants: 1000, prizeDetails: "Championship Trophy", collegeIdx: 0,
    },
    {
      name: "Design Thinking Summit", category: "Workshop", type: "Inter College",
      description: "1-day intensive workshop on design thinking methodology hosted by UX designers from top product companies. Includes real case study challenges.",
      rules: "Individual participation. No prior design experience needed.", date: fmtDate(8), time: "10:00", venue: "Innovation Lab",
      price: 249, maxParticipants: 60, prizeDetails: "Certificate + LinkedIn badge", collegeIdx: 1,
    },
    {
      name: "Photography Contest", category: "Cultural", type: "College Level",
      description: "Capture the theme 'Urban Rhythm' in 5 photos. Judged on creativity, technical skill, and storytelling. Winners displayed in campus gallery.",
      rules: "5 photos max. DSLR or mobile accepted. No heavy filters.", date: fmtDate(18), time: "All Day", venue: "Campus Wide",
      price: 50, maxParticipants: 100, prizeDetails: "Camera worth ₹30,000", collegeIdx: 2,
    },
    {
      name: "Startup Pitch Battle", category: "Technical", type: "Inter College",
      description: "Present your startup idea to a panel of VCs and angel investors. Stage 1: Elevator pitch. Stage 2: Full presentation. Top 5 teams get incubation support.",
      rules: "Teams of 1-3. 10-min pitch + 5-min Q&A. Idea must be original.", date: fmtDate(30), time: "13:00", venue: "Innovation Conference Hall",
      price: 199, maxParticipants: 50, prizeDetails: "Seed funding opportunity + ₹2,00,000", collegeIdx: 0,
    },
  ];

  const savedEvents: any[] = [];
  for (const tpl of eventTemplates) {
    const { collegeIdx, ...rest } = tpl;
    const { college, admin } = savedColleges[collegeIdx % savedColleges.length];
    const existing = await Event.findOne({ name: tpl.name });
    if (!existing) {
      const ev = await Event.create({
        ...rest,
        college: college.name,
        collegeId: college._id.toString(),
        contactEmail: admin.email,
      });
      savedEvents.push(ev);
    } else {
      savedEvents.push(existing);
    }
  }
  console.log(`  ✔ ${savedEvents.length} events seeded`);

  // ── 5. Registrations ─────────────────────────────────────────────────
  const regCombos = [
    { studentIdx: 0, eventIdx: 0 }, { studentIdx: 0, eventIdx: 4 }, { studentIdx: 0, eventIdx: 7 },
    { studentIdx: 1, eventIdx: 0 }, { studentIdx: 1, eventIdx: 1 }, { studentIdx: 1, eventIdx: 6 },
    { studentIdx: 2, eventIdx: 2 }, { studentIdx: 2, eventIdx: 3 }, { studentIdx: 2, eventIdx: 8 },
    { studentIdx: 3, eventIdx: 0 }, { studentIdx: 3, eventIdx: 9 }, { studentIdx: 3, eventIdx: 5 },
    { studentIdx: 4, eventIdx: 1 }, { studentIdx: 4, eventIdx: 4 }, { studentIdx: 4, eventIdx: 6 },
    { studentIdx: 5, eventIdx: 3 }, { studentIdx: 5, eventIdx: 7 }, { studentIdx: 5, eventIdx: 2 },
    { studentIdx: 6, eventIdx: 5 }, { studentIdx: 6, eventIdx: 9 },
    { studentIdx: 7, eventIdx: 0 }, { studentIdx: 7, eventIdx: 6 },
  ];

  let regCount = 0;
  for (const { studentIdx, eventIdx } of regCombos) {
    const student = savedStudents[studentIdx % savedStudents.length];
    const event = savedEvents[eventIdx % savedEvents.length];
    if (!student || !event) continue;
    const exists = await Registration.findOne({ userId: student._id.toString(), eventId: event._id.toString() });
    if (!exists) {
      await Registration.create({
        eventId: event._id.toString(),
        userId: student._id.toString(),
        userName: student.name,
        userEmail: student.email,
        college: event.college,
        date: new Date(Date.now() - Math.random() * 7 * 86400000),
      });
      regCount++;
    }
  }
  console.log(`  ✔ ${regCount} registrations seeded`);

  await mongoose.disconnect();
  console.log("\n🎉 Database seeded successfully!");
  console.log("\n📋 Login credentials:");
  console.log("  Super Admin → superadmin@campusconnect.com / SuperAdminPassword123!");
  console.log("  College Admin (MIT) → admin@mitcoe.edu.in / Admin@123");
  console.log("  College Admin (VJTI) → admin@vjti.ac.in / Admin@123");
  console.log("  Student → priya@student.com / Student@123");
}

seed().catch(err => { console.error(err); process.exit(1); });
