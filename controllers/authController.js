const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Tạo access token
const generateAccessToken = (user) => {
  return jwt.sign(
    { userId: user._id, role: user.role, shopId: user.shopId },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
};

// Tạo refresh token
const generateRefreshToken = (user) => {
  return jwt.sign({ userId: user._id, role: user.role }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
};

// Đăng ký tài khoản
const register = async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;

    // Kiểm tra email đã tồn tại
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Tạo user mới với role mặc định là customer
    const user = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      role: "customer", // Set role mặc định
      address,
    });

    await user.save();

    // Tạo token
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.status(201).json({
      message: "User registered successfully",
      accessToken,
      refreshToken,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Đăng nhập
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Kiểm tra user tồn tại
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Kiểm tra password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Tạo token
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.json({
      message: "Login successful",
      accessToken,
      refreshToken,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Refresh token
const refresh = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.json({
      accessToken,
      refreshToken,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Thêm hàm logout
const logout = async (req, res) => {
  try {
    // Trong thực tế, bạn có thể muốn:
    // 1. Thêm refresh token vào blacklist trong database
    // 2. Hoặc xóa refresh token khỏi client's storage

    res.json({
      message: "Logged out successfully",
      // Trả về token rỗng để client xóa token cũ
      accessToken: "",
      refreshToken: "",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  register,
  login,
  refresh,
  logout, // Thêm logout vào exports
};
