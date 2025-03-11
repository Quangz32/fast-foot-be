const Order = require("../models/Order");
const Food = require("../models/Food");
const User = require("../models/User");

//Hàm so sánh options (của food)

const cleanFoodOptions = (options) => {
  return options.map((option) => ({
    name: option.name,
    value: option.value,
  }));
};
const isEqualOptions = (opt1, opt2) => {
  return (
    JSON.stringify(cleanFoodOptions(opt1)) ===
    JSON.stringify(cleanFoodOptions(opt2))
  );
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

    const itemToInsert = {
      foodId: foodId,
      options: options,
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
        console.log(existingOrder.items[i]);
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
        message:
          "Cannot remove items from an order that is not in creating state",
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

module.exports = {
  addOrderItem,
  deleteOrderItem,
};
