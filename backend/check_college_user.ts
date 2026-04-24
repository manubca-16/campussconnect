import dns from "dns";
dns.setServers(["1.1.1.1", "8.8.8.8"]);
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, ".env") });

async function check() {
  await mongoose.connect(process.env.MONGODB_URI!);
  const user = await mongoose.connection.collection("users").findOne({ email: "chaya@gmail.com" });
  console.log("RESULT:", user ? JSON.stringify({ email: user.email, role: user.role, approved: user.approved }) : "NOT FOUND");
  await mongoose.disconnect();
}
check();
