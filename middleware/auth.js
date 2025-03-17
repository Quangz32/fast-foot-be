const jwt = require("jsonwebtoken");
const Shop = require("../models/Shop");

const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Access token not found" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

const refreshMiddleware = (req, res, next) => {
  try {
    const refreshToken = req.body.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token not found" });
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid refresh token" });
  }
};

// Middleware kiểm tra role admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Requires admin privileges" });
  }
  next();
};

// Middleware kiểm tra quyền shop owner (hoặc Admin)
const isShopOwner = async (req, res, next) => {
  try {
    if (req.user.role === "admin") {
      return next();
    }
    const shop = await Shop.findOne({ userId: req.user.userId });
    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }

    if (shop.userId.toString() === req.user.userId) {
      req.shop = shop; // Lưu shop vào request để sử dụng sau
      next();
    } else {
      res.status(403).json({ message: "Not authorized: not shop owner" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  authMiddleware,
  refreshMiddleware,
  isAdmin,
  isShopOwner,
};
