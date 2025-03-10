const Shop = require("../models/Shop");
const User = require("../models/User");
const Food = require("../models/Food");

// Đăng ký bán hàng
const registerShop = async (req, res) => {
  try {
    const { shopName, address, latitude, longitude } = req.body;
    const userId = req.user.userId;

    // Kiểm tra user đã có shop chưa
    const existingShop = await Shop.findOne({ userId });
    if (existingShop) {
      return res.status(400).json({ message: "User already has a shop" });
    }

    // Tạo shop mới
    const shop = new Shop({
      userId,
      shopName,
      location: {
        address,
        coordinates: {
          latitude,
          longitude,
        },
      },
    });

    await shop.save();

    // Cập nhật role của user thành shop
    await User.findByIdAndUpdate(userId, { role: "shop" });

    res.status(201).json({
      message: "Shop registered successfully",
      shop,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Lấy thông tin shop
const getShop = async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.shopId);
    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }
    res.json(shop);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// CRUD cho món ăn
const createFood = async (req, res) => {
  try {
    const { name, description, price, category } = req.body;
    const shopId = req.params.shopId;

    const food = new Food({
      shopId,
      name,
      description,
      price,
      category,
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

const getFoods = async (req, res) => {
  try {
    const foods = await Food.find({ shopId: req.params.shopId });
    res.json(foods);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getFood = async (req, res) => {
  try {
    const food = await Food.findOne({
      shopId: req.params.shopId,
      _id: req.params.foodId,
    });

    if (!food) {
      return res.status(404).json({ message: "Food not found" });
    }

    res.json(food);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateFood = async (req, res) => {
  try {
    const { name, description, price, category } = req.body;
    const update = {
      name,
      description,
      price,
      category,
    };

    // Cập nhật ảnh nếu có upload file mới
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
    );

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
  registerShop,
  getShop,
  createFood,
  getFoods,
  getFood,
  updateFood,
  deleteFood,
};
