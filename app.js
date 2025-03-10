const express = require("express");
const app = express();
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const { authMiddleware } = require("./middleware/auth");

// Cấu hình middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  cors({
    origin: "http://localhost:2005",
    credentials: true,
  })
);

app.use((req, res, next) => {
  console.log(`Request URL: ${req.url}`);

  //Auth và upload (tạm thời) không cần jwt
  if (req.url.startsWith("/api/auth") || req.url.startsWith("/uploads")) {
    next();
  } else {
    authMiddleware(req, res, next);
  }
});

// Định nghĩa route
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Auth routes
app.use("/api/auth", authRoutes);

module.exports = app; // Xuất app để sử dụng trong server.js
