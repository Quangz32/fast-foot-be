const express = require("express");
const router = express.Router();
const {
  addOrderItem,
  deleteOrderItem,
} = require("../controllers/orderController");

router.post("/items", addOrderItem);
router.delete("/:orderId/items", deleteOrderItem);

module.exports = router;
