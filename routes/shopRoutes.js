const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/auth");
const { registerShop, getShop } = require("../controllers/shopController");

// Route đăng ký shop
router.post("/register", authMiddleware, registerShop);

// Route xem thông tin shop
router.get("/:shopId", getShop);

module.exports = router;
