const Order = require("../models/Order");
const Food = require("../models/Food");
const User = require("../models/User");
const Review = require("../models/Review");

//Hàm so sánh options (của food)

const cleanFoodOptions = (options) => {
  return options.map((option) => ({
    name: option.name,
    value: option.value,
  }));
};
const isEqualOptions = (opt1, opt2) => {
  return JSON.stringify(cleanFoodOptions(opt1)) === JSON.stringify(cleanFoodOptions(opt2));
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customerId: req.user.userId })
      .sort({ createdAt: -1 })
      .populate("shopId", "shopName")
      .populate("items.foodId", "name price image")
      .exec();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const createReviewsForOrder = async (order) => {
  const foodIdsDuplicate = order.items.map((item) => item.foodId.toString());
  const foodIds = [...new Set(foodIdsDuplicate)];

  foodIds.forEach((foodId) => {
    const review = new Review({
      orderId: order._id,
      foodId: foodId,
      reviewed: false,
    }).save();
  });
};

//Thêm sản phẩm vào Order (Giỏ hàng), quantity có thể âm (bớt sản phẩm)
const addOrderItem = async (req, res) => {
  try {
    const { foodId, options, quantity } = req.body;

    const customer = await User.findById(req.user.userId); //để lấy địa chỉ
    if (!customer) {
      return res.status(404).json({ message: "UserId is not valid" });
    }

    // Kiểm tra food tồn tại
    const food = await Food.findById(foodId);
    if (!food) {
      return res.status(404).json({ message: "Food not found" });
    }

    //Kiểm tra options hợp lệ, và thêm PriceDiff
    const formatedOptions = [];
    for (let i = 0; i < options.length; i++) {
      const option = options[i];
      const validOption = food.options.find((opt) => opt.name === option.name);
      console.log(validOption);
      if (!validOption) {
        return res.status(400).json({ message: "Invalid options" });
      }

      const validValue = validOption.values.find((val) => val.name === option.value);
      if (!validValue) {
        return res.status(400).json({ message: "Invalid options" });
      }

      console.log("ValidValue", validValue);

      formatedOptions.push({
        name: option.name,
        value: option.value,
        priceDiff: validValue.priceDiff,
      });
      // option = { ...option, priceDiff: validValue.priceDiff };
    }
    console.log("formatedOptions", formatedOptions);
    const itemToInsert = {
      foodId: foodId,
      options: formatedOptions,
      quantity: quantity,
      price: food.price, //Lấy từ database
    };

    //Tìm hoặc tạo order
    let existingOrder = await Order.findOne({
      customerId: customer._id,
      shopId: food.shopId,
      status: "creating",
    }).exec();

    //Nếu chưa có Order, phải tạo
    if (!existingOrder) {
      if (itemToInsert.quantity < 0) {
        return res.status(400).json({ message: "Invalid init quantity" });
      }

      const newOrder = new Order({
        customerId: customer._id,
        shopId: food.shopId,
        items: itemToInsert,
        totalAmount: food.price * quantity,
        status: "creating",
        paymentMethod: "cash",
        deliveryAddress: customer.address,
      });

      await newOrder.save();
    } else {
      //kiểm tra xem đã có sản phẩm giống id, options
      let edited = false;

      for (let i = 0; i < existingOrder.items.length; i++) {
        item = existingOrder.items[i];

        if (item?.foodId.toString() === foodId) {
          if (isEqualOptions(item.options, itemToInsert.options)) {
            if (item.quantity + quantity < 0) {
              return res.status(400).json({ message: "Invalid edit quantity" });
            }
            edited = true;
            item.quantity += quantity;

            if (item.quantity === 0) {
              existingOrder.items.remove(item);
            }
          }
        }
      }

      if (!edited) {
        if (itemToInsert.quantity < 0) {
          return res.status(400).json({ message: "Invalid init quantity #2" });
        }
        existingOrder.items.push(itemToInsert);
      }

      // update $$ for the order
      existingOrder.totalAmount += food.price * quantity;
      await existingOrder.save();
    }

    res.status(200).json({ message: "Food added to order successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteOrderItem = async (req, res) => {
  try {
    const orderId = req.params.order;
    const { foodId, options, quantity } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    if (order.status != "creating") {
      return res.status(400).json({
        message: "Cannot remove items from an order that is not in creating state",
      });
    }

    //Loại bỏ item
    let minusAmount = 0;
    order.items.filter((item) => {
      if (item.foodId != foodId) return true;
      if (isEqualOptions(item.options, options)) {
        minusAmount -= item.price * item.quantity;
        return false;
      }
    });

    // update $$ for the order
    order.totalAmount -= minusAmount;
    await existingOrder.save();
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Order owner update note, payment method and delivery address
const updateOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.customerId != req.user.userId) {
      return res.status(403).json({ message: "Unauthorized to update this order" });
    }

    const { note, paymentMethod, deliveryAddress } = req.body;

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.orderId,
      { note, paymentMethod, deliveryAddress },
      { new: true, runValidators: true }
    );

    res.json({ message: "Order updated successfully", order: updatedOrder });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateOrderStatusByShop = async (req, res) => {
  try {
    const { status, reason } = req.body;

    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.shopId.toString() !== req.user.shopId) {
      return res.status(403).json({ message: "Unauthorized to update this order" });
    }

    if (!["preparing", "delivering", "delivered", "cancelled"].includes(status)) {
      return res.status(403).json({ message: "invalid status to update" });
    }

    order.status = status;
    if (status == "cancelled") {
      order.cancellation = {
        cancelledBy: "shop",
        customerId: null,
        shopId: req.user.shopId,
        reason: reason || "",
        cancelledAt: new Date(),
      };
    }
    await order.save();
    res.json({ message: "Order status updated successfully", order: order });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateOrderStatusByCustomer = async (req, res) => {
  try {
    console.log(req.user);
    const { status, reason } = req.body;

    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    if (order.customerId.toString() != req.user.userId) {
      return res.status(403).json({ message: "Unauthorized to update this order" });
    }

    if (!["placed", "received", "cancelled"].includes(status)) {
      return res.status(403).json({ message: "invalid status to update" });
    }

    order.status = status;
    if (status == "cancelled") {
      order.cancellation = {
        cancelledBy: "customer",
        customerId: req.user.userId,
        shopId: null,
        reason: req.body.reason || "",
        cancelledAt: new Date(),
      };
    }
    await order.save();
    if (order.status == "received") {
      createReviewsForOrder(order);
      // Send notification to shop
    }
    res.json({ message: "Order status updated successfully", order: order });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getMyOrders,
  addOrderItem,
  deleteOrderItem,
  updateOrder,
  updateOrderStatusByShop,
  updateOrderStatusByCustomer,
};
