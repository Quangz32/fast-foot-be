const express = require("express");
const app = express();
const cors = require("cors");
const connectDB = require("./config/db");

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
    next(); //tạm thời
    // authMiddleware(req, res, next);
  }
});

// Định nghĩa route
app.get("/", (req, res) => {
  res.send("Hello World!");
});

module.exports = app; // Xuất app để sử dụng trong server.js
