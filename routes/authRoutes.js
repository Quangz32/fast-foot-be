const express = require("express");
const router = express.Router();
const {
  register,
  login,
  refresh,
  logout,
} = require("../controllers/authController");
const { refreshMiddleware, authMiddleware } = require("../middleware/auth");

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refreshMiddleware, refresh);
router.post("/logout", authMiddleware, logout);

module.exports = router;
