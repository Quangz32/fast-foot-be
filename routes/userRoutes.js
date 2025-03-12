const express = require("express");
const router = express.Router();
const { isAdmin } = require("../middleware/auth");
const { getUsers, getUser, updateUser, deleteUser } = require("../controllers/userController");

router.get("/", getUsers);
router.get("/:userId", getUser);
router.put("/:userId", updateUser);
router.delete("/:userId", isAdmin, deleteUser);

module.exports = router;
