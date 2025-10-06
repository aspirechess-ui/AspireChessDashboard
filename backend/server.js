import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Import routes
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import adminRoutes from "./routes/admin.js";
import batchRoutes from "./routes/batches.js";
import classRoutes from "./routes/classes.js";
import attendanceRoutes from "./routes/attendance.js";
import announcementRoutes from "./routes/announcements.js";
import lichessRoutes from "./routes/lichess.js";
import lichessAutoSyncRoutes from "./routes/lichessAutoSync.js";
import classJoinRequestRoutes from "./routes/classJoinRequests.js";

// Import utilities
import { scheduleCleanup } from "./utils/cleanup.js";

// ES6 module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// Rate limiting - Configurable via environment variables
if (process.env.RATE_LIMIT === "true") {
  const apiRate = process.env.API_RATE || "100/15";
  const [maxRequests, windowMinutes] = apiRate.split("/").map(Number);

  const limiter = rateLimit({
    windowMs: windowMinutes * 60 * 1000, // Convert minutes to milliseconds
    max: maxRequests, // limit each IP to maxRequests per windowMs
    message: "Too many requests from this IP, please try again later.",
  });
  app.use("/api/", limiter);
  console.log(
    `🛡️  Rate limiting enabled: ${maxRequests} requests per ${windowMinutes} minutes`
  );
} else {
  console.log("🔓 Rate limiting disabled");
}

// CORS configuration - Enhanced for production
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      "https://aspire-chess-dashboard-frontend.vercel.app",
      "https://dashboard.aspirechessacademy.in/",
      "http://localhost:5173",
      "http://localhost:3000"
    ].filter(Boolean); // Remove any null/undefined values
    
    console.log(`CORS check - Origin: ${origin}, Allowed: ${allowedOrigins.includes(origin)}`);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With', 
    'Accept', 
    'Origin',
    'Access-Control-Allow-Origin',
    'Access-Control-Allow-Headers',
    'Access-Control-Allow-Methods'
  ],
  exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar'],
  optionsSuccessStatus: 200, // Some legacy browsers choke on 204
  preflightContinue: false
};

app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options('*', cors(corsOptions));

// Additional CORS middleware for file uploads
app.use('/api/users/profile/image', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Static files with proper headers for images
app.use("/uploads", (req, res, next) => {
  // Set proper headers for images
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
}, express.static(path.join(__dirname, "uploads")));

// Database connection - Simple and clean
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/chess-academy")
  .then(() => {
    console.log("✅ Connected to MongoDB");
    // Schedule cleanup jobs after database connection
    scheduleCleanup();
  })
  .catch((error) => {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  });

// API route for serving profile images with proper CORS headers
app.get("/api/uploads/profiles/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, "uploads", "profiles", filename);
  
  // Set proper CORS headers for images
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
  
  // Check if file exists and serve it
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: 'Image not found' });
  }
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/batches", batchRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/lichess", lichessRoutes);
app.use("/api/lichess-auto-sync", lichessAutoSyncRoutes);
app.use("/api/class-join-requests", classJoinRequestRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Chess Academy API is running",
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);

  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Validation Error",
      errors: Object.values(err.errors).map((e) => e.message),
    });
  }

  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Invalid ID format",
    });
  }

  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: "Duplicate field value",
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🌐 API URL: http://localhost:${PORT}/api`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  mongoose.connection.close(() => {
    console.log("MongoDB connection closed.");
    process.exit(0);
  });
});

export default app;
