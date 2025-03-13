const Food = require("../models/Food");
const Category = require("../models/Category");

// Create a new food item
const createFood = async (req, res) => {
  try {
    const { name, description, optionsJSON, price, categoryId } = req.body;
    console.log(optionsJSON);
    const options = JSON.parse(optionsJSON);
    console.log(JSON.stringify(options));
    const shopId = req.shop._id;

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
      options,
      category: categoryId, // Using categoryId instead of category object
      rating: 0,
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

const getFoodByQuery = async (req, res) => {
  try {
    let { name, shopId, categoryId, minPrice, maxPrice, sortBy } = req.query;
    if (!minPrice) minPrice = 0;
    if (!maxPrice) maxPrice = Infinity;

    //Sort
    // Xác định cách sắp xếp
    let sortOptions = {};
    if (sortBy) {
      const sortFields = sortBy.split(","); // Ví dụ: "price,-rating"
      sortFields.forEach((field) => {
        const direction = field.startsWith("-") ? -1 : 1; // -1 cho giảm dần, 1 cho tăng dần
        const fieldName = field.replace("-", ""); // Loại bỏ dấu '-' nếu có
        sortOptions[fieldName] = direction;
      });
    }

    const foods = await Food.find({
      name: { $regex: new RegExp(name, "i") },
      category: categoryId ? { $eq: categoryId } : { $exists: true },
      shopId: shopId ? { $eq: shopId } : { $exists: true },
      price: { $gte: minPrice, $lte: maxPrice },
    })
      .populate("category", "name description")
      .populate("shopId")
      .sort(sortOptions)
      .exec();
    res.json(foods);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all foods for a shop
const getAllFoodByShop = async (req, res) => {
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
const getFoodById = async (req, res) => {
  try {
    const food = await Food.findById(req.params.foodId)
      .populate("category", "name description")
      .populate("shopId", "shopName rating location");

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
    const { name, description, optionsJSON, price, categoryId } = req.body;
    const options = optionsJSON ? JSON.parse(optionsJSON) : null;

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
      options,
      ...(categoryId && { category: categoryId }),
    };

    // Update image if new file is uploaded
    if (req.file) {
      update.image = `/uploads/${req.file.filename}`;
    }

    const food = await Food.findById(req.params.foodId);
    if (!food) {
      return res.status(404).json({ message: "Food not found" });
    }

    if (req.user.role !== "admin" && food.shopId.toString() !== req.shop._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const updatedFood = await Food.findByIdAndUpdate({ _id: food._id }, update, {
      new: true,
    });

    res.json({
      message: "Food updated successfully",
      updatedFood,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete a food item
const deleteFood = async (req, res) => {
  try {
    const food = await Food.findById(req.params.foodId);

    if (!food) {
      return res.status(404).json({ message: "Food not found" });
    }

    if (req.user.role !== "admin" && food.shopId.toString() !== req.shop._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Food.deleteOne({ _id: req.params.foodId });
    res.json({ message: "Food deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createFood,
  getFoodByQuery,
  getAllFoodByShop,
  getFoodById,
  updateFood,
  deleteFood,
};
