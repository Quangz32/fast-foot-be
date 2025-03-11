const express = require("express");
const router = express.Router();
const { isShopOwner } = require("../middleware/auth");
const upload = require("../middleware/upload");
const {
  createFood,
  getFoodByQuery,
  getAllFoodByShop,
  getFoodByShop,
  updateFood,
  deleteFood,
} = require("../controllers/foodController");

// Food routes (all require shop authentication)
router.post(
  "/shops/:shopId/foods",
  isShopOwner,
  upload.single("image"),
  createFood
);

router.get("/foods", getFoodByQuery);
router.get("/shops/:shopId/foods", getAllFoodByShop);
router.get("/shops/:shopId/foods/:foodId", getFoodByShop);

router.put(
  "/:shopId/foods/:foodId",
  isShopOwner,
  upload.single("image"),
  updateFood
);
router.delete("/:shopId/foods/:foodId", isShopOwner, deleteFood);

module.exports = router;
