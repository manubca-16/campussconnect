import dns from "dns";
dns.setServers(["1.1.1.1", "8.8.8.8"]);
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, ".env") });

async function check() {
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI is missing in .env");
    return;
  }
  console.log("Connecting to:", process.env.MONGODB_URI.split("@")[1]); // Log only the host for security
  await mongoose.connect(process.env.MONGODB_URI!);
  
  const user = await mongoose.connection.collection("users").findOne({ email: "superadmin@campusconnect.com" });
  
  if (!user) {
    console.log("❌ User NOT FOUND for superadmin@campusconnect.com");
    // List all users to see what's there
    const allUsers = await mongoose.connection.collection("users").find({}).toArray();
    console.log("Current users in 'users' collection:");
    allUsers.forEach(u => console.log(`- ${u.email} (${u.role})`));
  } else {
    console.log("✅ User FOUND:");
    console.log("- Email:", user.email);
    console.log("- Role:", user.role);
    console.log("- Approved:", user.approved);
    console.log("- Password exists:", !!user.password);
    console.log("- Password length:", user.password?.length);
  }
  
  await mongoose.disconnect();
}

check().catch(console.error);
