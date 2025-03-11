const express = require("express");
const router = express.Router();
const { addFood } = require("../controllers/orderController");

router.post("/items", addFood);

module.exports = router;
