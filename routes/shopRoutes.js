const express = require("express");
const router = express.Router();
const { registerShop, getShop } = require("../controllers/shopController");

// Route đăng ký shop
router.post("/register", registerShop);

// Route xem thông tin shop
router.get("/:shopId", getShop);

module.exports = router;
