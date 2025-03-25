const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/auth");

const {
  updateReview,
  getReviewsByProductId,
  getReviewsByCustomer,
} = require("../controllers/reviewController");

router.get("/food/:foodId", getReviewsByProductId);
router.put("/:reviewId", authMiddleware, updateReview);
router.get("/my-reviews", authMiddleware, getReviewsByCustomer);

module.exports = router;
