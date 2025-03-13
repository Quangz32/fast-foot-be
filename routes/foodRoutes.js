const express = require("express");
const router = express.Router();
const { isShopOwner } = require("../middleware/auth");
const upload = require("../middleware/upload");
const {
  createFood,
  getFoodByQuery,
  getAllFoodByShop,
  getFoodById,
  updateFood,
  deleteFood,
} = require("../controllers/foodController");

// Food routes (all require shop authentication)
router.post("/", isShopOwner, upload.single("image"), createFood);

router.get("/", getFoodByQuery);
router.get("/shops/:shopId", getAllFoodByShop);
router.get("/:foodId", getFoodById);

router.put("/:foodId", isShopOwner, upload.single("image"), updateFood);
router.delete("/:foodId", isShopOwner, deleteFood);

module.exports = router;

// [
//   {
//     name: "size",
//     value: [
//       { name: "XL", priceDiff: 100000 },
//       { name: "L", priceDiff: 0 },
//     ],
//   },
//   {
//     name: "color",
//     value: [
//       { name: "orange", priceDiff: 3000 },
//       { name: "green", priceDiff: 4000 },
//     ],
//   },
// ];
