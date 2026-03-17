const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
require("dotenv").config();

// Database
const connectDB = require("./config/db");

// Middleware
const errorHandler = require("./middleware/errorMiddleware");

// Routes
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const staffRoutes = require('./routes/staffRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const exportRoutes = require('./routes/exportRoutes');
// const notificationRoutes = require('./routes/notificationRoutes');

// 👇 YEH LINE IMPORT KARO (new)
const uploadRoutes = require('./routes/uploadRoutes');

// App
const app = express();

// Security
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debug middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use('/api/staff', staffRoutes); 
app.use('/api/admin/students', studentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/export', exportRoutes);
// app.use('/api/notifications', notificationRoutes);
app.use('/api/search', require('./routes/searchRoutes'));

// 👇 UPLOAD ROUTES - YEH LINE ADD KARO
app.use('/api/upload', uploadRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    status: "OK",
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// Test routes
app.get("/api/attendance/test", (req, res) => {
  res.json({
    success: true,
    message: "Attendance API is working!",
    endpoints: [
      "POST /api/attendance/mark",
      "GET /api/attendance/today/:studentId",
      "GET /api/attendance/monthly/:studentId"
    ]
  });
});

app.get("/api/export/test", (req, res) => {
  res.json({
    success: true,
    message: "Export route is working!",
    routes: [
      "POST /api/export/students",
      "POST /api/export/payments", 
      "POST /api/export/courses",
      "POST /api/export/attendance"
    ]
  });
});

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
✅ Server running on http://localhost:${PORT}
📊 Student API: http://localhost:${PORT}/api/admin/students
🔐 Auth API: http://localhost:${PORT}/api/auth
Payment API: http://localhost:${PORT}/api/payments
🖼️ Upload API: http://localhost:${PORT}/api/upload  // 👈 New line
      `);
    });
  } catch (error) {
    console.error("❌ Failed to start:", error.message);
    process.exit(1);
  }
};

startServer();