const Category = require("../models/Category");
const { saveBase64Image } = require("../utils/imageUtils");

// Create a new category
const createCategory = async (req, res) => {
  try {
    const { name, description, imageBase64 } = req.body;

    let imagePath;
    if (req.file) {
      // Handle file upload
      imagePath = `/uploads/${req.file.filename}`;
    } else if (imageBase64) {
      // Handle base64 image
      imagePath = saveBase64Image(imageBase64);
    }

    const category = new Category({
      name,
      description,
      image: imagePath,
    });

    await category.save();
    res.status(201).json({
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all categories
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get a single category
const getCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update a category
const updateCategory = async (req, res) => {
  try {
    const { name, description, imageBase64 } = req.body;

    let imagePath;
    if (req.file) {
      // Handle file upload
      imagePath = `/uploads/${req.file.filename}`;
    } else if (imageBase64) {
      // Handle base64 image
      imagePath = saveBase64Image(imageBase64);
    }

    const update = {
      name,
      description,
      ...(imagePath && { image: imagePath }),
    };

    const category = await Category.findByIdAndUpdate(
      req.params.categoryId,
      update,
      { new: true }
    );

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json({
      message: "Category updated successfully",
      category,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete a category
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
};
