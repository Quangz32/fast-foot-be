const express = require("express");
const router = express.Router();

const { updateReview, getReviewsByProductId } = require("../controllers/reviewController");

router.get("/food/:foodId", getReviewsByProductId);
router.put("/:reviewId", updateReview);

module.exports = router;
