import dns from "dns";
dns.setServers(["1.1.1.1", "8.8.8.8"]);
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, ".env") });

const UserSchema = new mongoose.Schema({
  name: String, email: { type: String, unique: true },
  password: String, role: String, approved: Boolean,
}, { strict: false });
const User = mongoose.models.User || mongoose.model("User", UserSchema);

await mongoose.connect(process.env.MONGODB_URI!);
console.log("✅ Connected");

const pw = "SuperAdminPassword123!";
const hash = await bcrypt.hash(pw, 10);
console.log("Hashed password:", hash);

// Verify the hash works
const ok = await bcrypt.compare(pw, hash);
console.log("bcrypt.compare test:", ok);

const result = await User.findOneAndUpdate(
  { email: "superadmin@campusconnect.com" },
  { $set: { name: "Super Admin", password: hash, role: "super_admin", approved: true } },
  { upsert: true, new: true }
);
console.log("✅ Super Admin fixed:", result?.email, "| role:", result?.role, "| approved:", result?.approved);
await mongoose.disconnect();
console.log("Done! Try logging in now.");
