const express = require("express");
const router = express.Router();
const {
  addOrderItem,
  deleteOrderItem,
  updateOrder,
  updateOrderStatusByShop,
  updateOrderStatusByCustomer,
} = require("../controllers/orderController");

router.post("/items", addOrderItem);
router.delete("/:orderId/items", deleteOrderItem);
router.put("/:orderId", updateOrder);
router.post("/:orderId/update_status_by_shop", updateOrderStatusByShop);
router.post("/:orderId/update_status_by_customer", updateOrderStatusByCustomer);

module.exports = router;
