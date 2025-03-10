const express = require("express");
const router = express.Router();
const { authMiddleware, isShopOwner } = require("../middleware/auth");
const upload = require("../middleware/upload");
const {
  registerShop,
  getShop,
  createFood,
  getFoods,
  getFood,
  updateFood,
  deleteFood,
} = require("../controllers/shopController");

// Route đăng ký shop
router.post("/register", authMiddleware, registerShop);

// Route xem thông tin shop
router.get("/:shopId", getShop);

// Routes quản lý món ăn
router.post(
  "/:shopId/foods",
  authMiddleware,
  isShopOwner,
  upload.single("image"),
  createFood
);
router.get("/:shopId/foods", getFoods);
router.get("/:shopId/foods/:foodId", getFood);
router.put(
  "/:shopId/foods/:foodId",
  authMiddleware,
  isShopOwner,
  upload.single("image"),
  updateFood
);
router.delete(
  "/:shopId/foods/:foodId",
  authMiddleware,
  isShopOwner,
  deleteFood
);

module.exports = router;
