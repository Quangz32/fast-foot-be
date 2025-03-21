const express = require("express");
const router = express.Router();
const { isAdmin } = require("../middleware/auth");
const {
  getUsers,
  getRequestMaker,
  getUser,
  updateUser,
  deleteUser,
} = require("../controllers/userController");

router.get("/", getUsers);
router.get("/me", getRequestMaker);
router.get("/:userId", getUser);
router.put("/:userId", updateUser);
router.delete("/:userId", isAdmin, deleteUser);

module.exports = router;
