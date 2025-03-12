const express = require("express");
const router = express.Router();
const { addOrderItem, deleteOrderItem, updateOrder } = require("../controllers/orderController");

router.post("/items", addOrderItem);
router.delete("/:orderId/items", deleteOrderItem);
router.put("/:orderId", updateOrder);

module.exports = router;
