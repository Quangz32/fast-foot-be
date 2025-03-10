const Food = require("../models/Food");
const Category = require("../models/Category");

// Create a new food item
const createFood = async (req, res) => {
  try {
    const { name, description, price, categoryId } = req.body;
    const shopId = req.params.shopId;

    // Verify that the category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const food = new Food({
      shopId,
      name,
      description,
      price,
      category: categoryId, // Using categoryId instead of category object
      image: req.file ? `/uploads/${req.file.filename}` : undefined,
    });

    await food.save();
    res.status(201).json({
      message: "Food item created successfully",
      food,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all foods for a shop
const getFoods = async (req, res) => {
  try {
    const foods = await Food.find({ shopId: req.params.shopId })
      .populate("category", "name description")
      .exec();
    res.json(foods);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get a single food item
const getFood = async (req, res) => {
  try {
    const food = await Food.findOne({
      shopId: req.params.shopId,
      _id: req.params.foodId,
    }).populate("category", "name description");

    if (!food) {
      return res.status(404).json({ message: "Food not found" });
    }

    res.json(food);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update a food item
const updateFood = async (req, res) => {
  try {
    const { name, description, price, categoryId } = req.body;

    // Verify that the category exists if categoryId is provided
    if (categoryId) {
      const category = await Category.findById(categoryId);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
    }

    const update = {
      name,
      description,
      price,
      ...(categoryId && { category: categoryId }),
    };

    // Update image if new file is uploaded
    if (req.file) {
      update.image = `/uploads/${req.file.filename}`;
    }

    const food = await Food.findOneAndUpdate(
      {
        shopId: req.params.shopId,
        _id: req.params.foodId,
      },
      update,
      { new: true }
    ).populate("category", "name description");

    if (!food) {
      return res.status(404).json({ message: "Food not found" });
    }

    res.json({
      message: "Food updated successfully",
      food,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete a food item
const deleteFood = async (req, res) => {
  try {
    const food = await Food.findOneAndDelete({
      shopId: req.params.shopId,
      _id: req.params.foodId,
    });

    if (!food) {
      return res.status(404).json({ message: "Food not found" });
    }

    res.json({ message: "Food deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createFood,
  getFoods,
  getFood,
  updateFood,
  deleteFood,
};
