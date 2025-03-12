const express = require("express");
const router = express.Router();
const {
  addOrderItem,
  deleteOrderItem,
  updateOrder,
  placeOrder,
  cancelOrder,
} = require("../controllers/orderController");

router.post("/items", addOrderItem);
router.delete("/:orderId/items", deleteOrderItem);
router.put("/:orderId", updateOrder);
router.post("/:orderId/place", placeOrder);
router.post("/:orderId/cancel", cancelOrder);

module.exports = router;
