const express = require("express");
const app = express();
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const { authMiddleware } = require("./middleware/auth");
const shopRoutes = require("./routes/shopRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const foodRoutes = require("./routes/foodRoutes");

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

// Serve static files từ thư mục uploads
app.use("/uploads", express.static("uploads"));

// Shop routes
app.use("/api/shops", shopRoutes);

// Category routes
app.use("/api/categories", categoryRoutes);

// Food routes (now separate from shop routes)
app.use("/api/shops", foodRoutes);

module.exports = app; // Xuất app để sử dụng trong server.js
