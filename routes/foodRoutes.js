const express = require("express");
const router = express.Router();
const { isShopOwner } = require("../middleware/auth");
const upload = require("../middleware/upload");
const {
  createFood,
  getFoods,
  getFood,
  updateFood,
  deleteFood,
} = require("../controllers/foodController");

// Food routes (all require shop authentication)
router.post("/:shopId/foods", isShopOwner, upload.single("image"), createFood);
router.get("/:shopId/foods", getFoods);
router.get("/:shopId/foods/:foodId", getFood);
router.put(
  "/:shopId/foods/:foodId",
  isShopOwner,
  upload.single("image"),
  updateFood
);
router.delete("/:shopId/foods/:foodId", isShopOwner, deleteFood);

module.exports = router;
