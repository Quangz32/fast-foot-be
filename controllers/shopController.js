const Shop = require("../models/Shop");
const User = require("../models/User");

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

module.exports = {
  registerShop,
  getShop,
};
