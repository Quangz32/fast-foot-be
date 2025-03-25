const Review = require("../models/Review");
const Order = require("../models/Order");
const Food = require("../models/Food");
const Shop = require("../models/Shop");

const getReviewsByProductId = async (req, res) => {
  try {
    const reviews = await Review.find({ foodId: req.params.productId });
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Function to recalculate average rating for a food item
const recalculateFoodRating = async (foodId) => {
  try {
    const reviews = await Review.find({
      foodId: foodId,
      reviewed: true, // Only count reviews that have been submitted
    });

    if (reviews.length === 0) return;

    // Calculate average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    // Update food rating
    await Food.findByIdAndUpdate(foodId, { rating: averageRating });

    return averageRating;
  } catch (error) {
    console.error("Error recalculating food rating:", error);
    throw error;
  }
};

// Function to recalculate average rating for a shop
const recalculateShopRating = async (shopId) => {
  try {
    // Get all foods for this shop
    const foods = await Food.find({ shopId: shopId });

    if (foods.length === 0) return;

    // Calculate average rating across all foods
    const totalRating = foods.reduce(
      (sum, food) => sum + (food.rating || 0),
      0
    );
    const averageRating = totalRating / foods.length;

    // Update shop rating
    await Shop.findByIdAndUpdate(shopId, { rating: averageRating });

    return averageRating;
  } catch (error) {
    console.error("Error recalculating shop rating:", error);
    throw error;
  }
};

const updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const review = await Review.findById(req.params.reviewId)
      .populate("orderId")
      .populate("foodId");

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (review.orderId.customerId.toString() !== req.user.userId) {
      return res
        .status(401)
        .json({ message: "You are not allowed to update this review" });
    }

    // Store shopId before populating to avoid losing reference
    const foodId = review.foodId._id;
    const shopId = review.foodId.shopId;

    // Update the review data
    review.orderId = review.orderId._id; // "anti-populate"
    review.foodId = foodId; // "anti-populate"
    review.rating = rating;
    review.comment = comment;
    review.reviewed = true;

    await review.save();

    // Recalculate ratings
    await recalculateFoodRating(foodId);
    await recalculateShopRating(shopId);

    res.json({ message: "Review updated successfully", review: review });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get reviews by customer
const getReviewsByCustomer = async (req, res) => {
  try {
    // Find orders by customer ID
    const orders = await Order.find({
      customerId: req.user.userId,
      status: "received", // Only completed orders
    });

    if (orders.length === 0) {
      return res.json([]);
    }

    // Get order IDs
    const orderIds = orders.map((order) => order._id);

    // Find reviews for these orders
    const reviews = await Review.find({
      orderId: { $in: orderIds },
    })
      .populate("foodId")
      .populate("orderId");

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getReviewsByProductId,
  updateReview,
  getReviewsByCustomer,
  recalculateFoodRating,
  recalculateShopRating,
};
