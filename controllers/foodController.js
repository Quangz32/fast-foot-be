const Food = require("../models/Food");
const Category = require("../models/Category");
const Order = require("../models/Order");
const { saveBase64Image } = require("../utils/imageUtils");

// Create a new food item
const createFood = async (req, res) => {
  try {
    const {
      name,
      description,
      optionsJSON,
      originalPrice,
      price,
      categoryId,
      imageBase64,
    } = req.body;
    console.log(optionsJSON);
    const options = JSON.parse(optionsJSON);
    console.log(JSON.stringify(options));
    const shopId = req.shop._id;

    // Verify that the category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    let imagePath;
    if (req.file) {
      // Handle file upload
      imagePath = `/uploads/${req.file.filename}`;
    } else if (imageBase64) {
      // Handle base64 image
      imagePath = saveBase64Image(imageBase64);
    }

    const food = new Food({
      shopId,
      name,
      description,
      originalPrice,
      price,
      options,
      category: categoryId,
      rating: 0,
      image: imagePath,
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

const getTopSellingFoods = async (req, res) => {
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const topSellingFoods = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: oneWeekAgo },
          status: { $ne: "cancelled" },
        },
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.foodId",
          totalSold: { $sum: "$items.quantity" },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "foods", // Tên collection của món ăn
          localField: "_id",
          foreignField: "_id",
          as: "foodDetails",
        },
      },
      {
        $unwind: "$foodDetails", // Chuyển đổi từ mảng thành đối tượng
      },
      {
        $lookup: {
          from: "shops", // Tên collection của cửa hàng
          localField: "foodDetails.shopId", // Trường shopId trong foodDetails
          foreignField: "_id",
          as: "shopDetails",
        },
      },
      {
        $unwind: "$shopDetails", // Chuyển đổi từ mảng thành đối tượng
      },
      {
        $project: {
          _id: 1,
          totalSold: 1,
          foodDetails: 1,
          shopDetails: {
            shopName: "$shopDetails.shopName",
            location: "$shopDetails.location",
          }, // Chọn các trường cần thiết
        },
      },
    ]);

    res.json(topSellingFoods);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// const getTopSellingFoods = async (req, res) => {
//   try {
//     console.log("getTopSellingFoods");
//     const oneWeekAgo = new Date();
//     oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

//     const topSellingFoods = await Order.aggregate([
//       {
//         $match: {
//           createdAt: { $gte: oneWeekAgo },
//           status: { $ne: "cancelled" },
//         },
//       },
//       { $unwind: "$items" },
//       {
//         $group: {
//           _id: "$items.foodId",
//           totalSold: { $sum: "$items.quantity" },
//         },
//       },
//       { $sort: { totalSold: -1 } },
//       { $limit: 10 },
//       {
//         $lookup: {
//           from: "foods",
//           localField: "_id",
//           foreignField: "_id",
//           as: "foodDetails",
//         },
//       },
//       {
//         $project: {
//           _id: 1,
//           totalSold: 1,
//           foodDetails: { $arrayElemAt: ["$foodDetails", 0] },
//         },
//       },
//     ]);

//     res.json(topSellingFoods);
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// Update a food item
const updateFood = async (req, res) => {
  try {
    const {
      name,
      description,
      optionsJSON,
      originalPrice,
      price,
      categoryId,
      imageBase64,
    } = req.body;
    const options = optionsJSON ? JSON.parse(optionsJSON) : null;

    // Verify that the category exists if categoryId is provided
    if (categoryId) {
      const category = await Category.findById(categoryId);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
    }

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
      originalPrice,
      price,
      options,
      ...(categoryId && { category: categoryId }),
      ...(imagePath && { image: imagePath }),
    };

    const food = await Food.findById(req.params.foodId);
    if (!food) {
      return res.status(404).json({ message: "Food not found" });
    }

    if (
      req.user.role !== "admin" &&
      food.shopId.toString() !== req.shop._id.toString()
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const updatedFood = await Food.findByIdAndUpdate(
      { _id: food._id },
      update,
      {
        new: true,
      }
    );

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

    if (
      req.user.role !== "admin" &&
      food.shopId.toString() !== req.shop._id.toString()
    ) {
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
  getTopSellingFoods,
  updateFood,
  deleteFood,
};
