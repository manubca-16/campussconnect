import dns from "dns";
dns.setServers(["1.1.1.1", "8.8.8.8"]);

import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { protect, authorize, generateToken } from "./middleware/auth.js";
import { User } from "./models/User.js";
import { College } from "./models/College.js";
import { Event } from "./models/Event.js";
import { Registration } from "./models/Registration.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import certificateRoutes from "./routes/certificateRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, ".env") });

const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

async function ensureDatabaseConnection() {
  if (!mongoUri) {
    throw new Error("MONGODB_URI is required in .env before starting the server.");
  }

  await mongoose.connect(mongoUri, {
    autoIndex: true,
  });

  console.log("✅ Connected to MongoDB");
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  try {
    await ensureDatabaseConnection();
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1);
  }

  const corsOriginsRaw = process.env.CORS_ORIGIN || process.env.CORS_ORIGINS || "";
  const corsOrigins = corsOriginsRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  app.use(
    cors({
      origin: corsOrigins.length ? corsOrigins : true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  app.use(cookieParser());
  fs.mkdirSync(path.resolve(__dirname, process.env.CERTIFICATE_STORAGE_PATH || "./storage/certificates"), { recursive: true });
  fs.mkdirSync(path.resolve(__dirname, process.env.TEMPLATE_STORAGE_PATH || "./storage/templates"), { recursive: true });
  app.use("/storage", express.static(path.join(__dirname, "storage")));

  app.use("/api", attendanceRoutes);
  app.use("/api", certificateRoutes);

  // --- API Routes ---
  
  // Auth
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { name, email, password, role, collegeName, location } = req.body;
      
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await User.create({ 
        name, 
        email, 
        password: hashedPassword,
        role, 
        approved: role === 'student' 
      });
      
      if (role === 'college_admin') {
        await College.create({ 
          name: collegeName, 
          location, 
          adminId: newUser._id.toString(), 
          status: 'pending' 
        });
      }
      
      const token = generateToken(newUser);
      res.cookie("token", token, { httpOnly: true });
      res.json({ 
        message: "Registration successful", 
        user: { id: newUser._id, name, email, role },
        token 
      });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      console.log(`[Login Attempt] Email: ${email}`);
      
      const user = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, "i") } });
      if (!user) {
        console.log(`[Login Failed] User not found: ${email}`);
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        console.log(`[Login Failed] Password mismatch for: ${email}`);
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      console.log(`[Login Success] User: ${email}, Role: ${user.role}`);

      if (user.role === 'college_admin' && !user.approved) {
        return res.status(403).json({ message: "Your account is pending approval by Super Admin." });
      }

      const token = generateToken(user);
      res.cookie("token", token, { httpOnly: true });
      res.json({ 
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
        token 
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Events
  app.get("/api/events", async (req, res) => {
    try {
      const events = await Event.find();
      res.json(events);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/events/:id", async (req, res) => {
    try {
      const event = await Event.findById(req.params.id);
      if (!event) return res.status(404).json({ error: "Event not found" });
      res.json(event);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/events", async (req, res) => {
    try {
      const event = await Event.create({ ...req.body });
      res.json(event);
    } catch (error: any) {
      console.error("Error creating event:", error);
      res.status(500).json({ error: error?.message || "Internal server error" });
    }
  });

  app.put("/api/events/:id", async (req, res) => {
    try {
      const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (event) {
        res.json(event);
      } else {
        res.status(404).json({ error: "Event not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/events/:id", async (req, res) => {
    try {
      const result = await Event.findByIdAndDelete(req.params.id);
      if (result) {
        res.status(204).send();
      } else {
        res.status(404).json({ error: "Event not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Admin
  app.get("/api/admin/colleges", async (req, res) => {
    try {
      const colleges = await College.find();
      res.json(colleges);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get all users
  app.get("/api/admin/users", async (req, res) => {
    try {
      const users = await User.find({ role: { $ne: "super_admin" } }).select("-password");
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Toggle user active status
  app.put("/api/admin/users/:id/toggle", async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) return res.status(404).json({ error: "User not found" });
      user.approved = !user.approved;
      await user.save();
      res.json({ message: "User status updated", approved: user.approved });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Toggle college admin approval
  app.put("/api/admin/colleges/:id/toggle", async (req, res) => {
    try {
      const college = await College.findById(req.params.id);
      if (!college) return res.status(404).json({ error: "College not found" });
      const newStatus = college.status === "approved" ? "pending" : "approved";
      college.status = newStatus;
      await college.save();
      // Also update the associated admin user's approved status
      await User.findByIdAndUpdate(college.adminId, { approved: newStatus === "approved" });
      res.json({ message: "College status updated", status: newStatus });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get analytics for super admin
  app.get("/api/admin/analytics", async (req, res) => {
    try {
      const totalUsers = await User.countDocuments({ role: "student" });
      const totalAdmins = await User.countDocuments({ role: "college_admin" });
      const totalEvents = await Event.countDocuments();
      const totalColleges = await College.countDocuments();
      const pendingColleges = await College.countDocuments({ status: "pending" });
      res.json({ totalUsers, totalAdmins, totalEvents, totalColleges, pendingColleges });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/admin/colleges/:id/approve", async (req, res) => {
    try {
      const college = await College.findByIdAndUpdate(req.params.id, { status: 'approved' }, { new: true });
      if (college) {
        res.json({ message: "College approved" });
      } else {
        res.status(404).json({ error: "College not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/admin/colleges/:id/reject", async (req, res) => {
    try {
      const result = await College.findByIdAndDelete(req.params.id);
      if (result) {
        res.status(204).send();
      } else {
        res.status(404).json({ error: "College not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Registrations
  app.get("/api/registrations", async (req, res) => {
    try {
      const { userId, collegeId } = req.query;
      let query: any = {};
      if (userId) query.userId = userId;
      
      if (collegeId) {
        // Resolve collegeId if it's actually an admin's User ID
        let resolvedCollegeId = collegeId;
        const college = await College.findOne({ adminId: collegeId });
        if (college) {
          resolvedCollegeId = college._id.toString();
        }

        const collegeEvents = await Event.find({ collegeId: resolvedCollegeId }).select('_id');
        const eventIds = collegeEvents.map(e => e._id.toString());
        query.eventId = { $in: eventIds };
      }
      
      const results = await Registration.find(query);
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/registrations", async (req, res) => {
    try {
      const registration = await Registration.create({ 
        ...req.body, 
        date: new Date().toISOString()
      });
      res.status(201).json(registration);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });


  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      root: path.resolve(__dirname, "..", "frontend"),
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    
    // Serve transformed index.html for all non-API routes
    app.get("*", async (req, res, next) => {
      if (req.originalUrl.startsWith("/api")) return next();
      
      try {
        const templatePath = path.resolve(__dirname, "..", "frontend", "index.html");
        let template = fs.readFileSync(templatePath, "utf-8");
        template = await vite.transformIndexHtml(req.originalUrl, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    // Split deploy: do not serve frontend assets from the backend.
    // Keep backend strictly API-only in production (Render).
    app.get("/", (_req, res) => {
      res.type("text/plain").send("CampusConnect API Running");
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
