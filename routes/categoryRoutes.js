const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const { isAdmin } = require("../middleware/auth");
const {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");

// Admin routes for category management
router.post("/", isAdmin, upload.single("image"), createCategory);
router.get("/", getCategories);
router.get("/:categoryId", getCategory);
router.put("/:categoryId", isAdmin, updateCategory);
router.delete("/:categoryId", isAdmin, deleteCategory);

module.exports = router;
