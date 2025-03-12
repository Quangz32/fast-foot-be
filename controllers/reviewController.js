const Review = require("../models/Review");
const Order = require("../models/Order");

const getReviewsByProductId = async (req, res) => {
  try {
    const reviews = await Review.find({ foodId: req.params.productId });
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const review = await Review.findById(req.params.reviewId).populate("orderId");
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (review.orderId.customerId.toString() !== req.user.userId) {
      return res.status(401).json({ message: "You are not allowed to update this review" });
    }
    review.orderId = review.orderId._id; // "anti-populate"

    review.rating = rating;
    review.comment = comment;
    review.reviewed = true;

    await review.save();
    res.json({ messenge: "Review updated successfully", review: review });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getReviewsByProductId, updateReview };
