const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const path = require("path");
require("dotenv").config();

// Database
const connectDB = require("./config/db");

// Middleware
const errorHandler = require("./middleware/errorMiddleware");
const corsOptions = require("./config/corsConfig");
const apiVersioning = require("./middleware/versioning");

// Routes
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const staffRoutes = require('./routes/staffRoutes');
const studentRoutes = require('./routes/studentRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const exportRoutes = require('./routes/exportRoutes');
const searchRoutes = require('./routes/searchRoutes');

// 👇 YEH LINE IMPORT KARO (new)
const uploadRoutes = require('./routes/uploadRoutes');

// App
const app = express();

// Trust proxy for rate limiting (important for deployment)
app.set('trust proxy', 1);

// Security
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

app.use(cors(corsOptions));

app.use(cookieParser());

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debug middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// ==========================================
//  API VERSIONING - INDUSTRY STANDARD
// ==========================================
// Apply versioning middleware early
app.use(apiVersioning);

// Versioned API Routes (Preferred - /api/v1/)
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/attendance", attendanceRoutes);
app.use('/api/v1/staff', staffRoutes); 
app.use('/api/v1/students', studentRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/settings', settingsRoutes);
app.use('/api/v1/export', exportRoutes);
app.use('/api/v1/search', searchRoutes);
app.use('/api/v1/upload', uploadRoutes);

// ==========================================
//   BACKWARD COMPATIBILITY - DEPRECATED
// ==========================================
// Old /api/ endpoints maintained for backward compatibility
// These will continue working but send deprecation warnings
// Remove after 6 months or when all clients migrate

// Health check (still available at old path)
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    status: "OK",
    message: "Server is running",
    timestamp: new Date().toISOString(),
    deprecated: true,
    migrate_to: "/api/v1/health"
  });
});

// Test routes (still available at old paths)
app.get("/api/attendance/test", (req, res) => {
  res.json({
    success: true,
    message: "Attendance API is working!",
    deprecated: true,
    migrate_to: "/api/v1/attendance/test",
    endpoints: [
      "POST /api/v1/attendance/mark",
      "GET /api/v1/attendance/user/:userId/today",
      "GET /api/v1/attendance/user/:userId/monthly"
    ]
  });
});

app.get("/api/export/test", (req, res) => {
  res.json({
    success: true,
    message: "Export route is working!",
    deprecated: true,
    migrate_to: "/api/v1/export/test",
    routes: [
      "POST /api/v1/export/students",
      "POST /api/v1/export/payments",
      "POST /api/v1/export/attendance"
    ]
  });
});

// Legacy API routes (will be removed in future)
// These automatically get deprecation headers from versioning middleware
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use('/api/staff', staffRoutes); 
app.use('/api/students', studentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/upload', uploadRoutes);

// Serve frontend for all other routes (LAST)
app.use(express.static(path.join(__dirname, "../frontend/dist")));

// Handle SPA
if (process.env.NODE_ENV === 'development') {
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "index.html"));
  });
} else {
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist", "index.html"));
  });
}

// Global error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`
 Server running on http://localhost:${PORT}
 Student API: http://localhost:${PORT}/api/admin/students
 Auth API: http://localhost:${PORT}/api/auth
Payment API: http://localhost:${PORT}/api/payments
 Upload API: http://localhost:${PORT}/api/upload  //  New line
      `);
    });
  } catch (error) {
    console.error(" Failed to start:", error.message);
    process.exit(1);
  }
};

startServer();