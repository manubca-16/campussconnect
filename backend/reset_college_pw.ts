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

async function reset() {
  await mongoose.connect(process.env.MONGODB_URI!);
  const hash = await bcrypt.hash("Chaya@123", 10);
  const result = await User.findOneAndUpdate(
    { email: "chaya@gmail.com" },
    { $set: { password: hash, approved: true, role: "college_admin" } },
    { upsert: true, new: true }
  );
  console.log("✅ Password reset for:", result.email);
  await mongoose.disconnect();
}
reset();
