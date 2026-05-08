import dns from "dns";
dns.setServers(["1.1.1.1", "8.8.8.8"]);
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { User } from "./models/User.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, ".env") });

async function fix() {
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI is missing. Loaded from:", path.resolve(__dirname, ".env"));
    return;
  }
  await mongoose.connect(process.env.MONGODB_URI!);
  console.log("✅ Connected to", process.env.MONGODB_URI.split("@")[1]?.split("?")[0]);

  const email = "superadmin@campusconnect.com";
  const password = "SuperAdminPassword123!";
  const hash = await bcrypt.hash(password, 10);

  // Delete any existing ones to be sure
  await User.deleteMany({ email });
  
  const superAdmin = await User.create({
    name: "Super Admin",
    email: email,
    password: hash,
    role: "super_admin",
    approved: true
  });

  console.log("✅ Super Admin created successfully:");
  console.log(JSON.stringify(superAdmin, null, 2));

  // Double check
  const found = await User.findOne({ email });
  if (found) {
    console.log("🔍 Verification: User found in DB after creation.");
    console.log("Role in DB:", found.role);
    console.log("Password hash in DB:", found.password);
  } else {
    console.log("❌ Verification FAILED: User still not found!");
  }

  await mongoose.disconnect();
}

fix().catch(console.error);
