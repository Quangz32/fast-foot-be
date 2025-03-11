const Order = require("../models/Order");
const Food = require("../models/Food");
const User = require("../models/User");

// Hàm loại bỏ trường _id
const cleanArray = (arr) => {
  return arr.map(({ _id, ...rest }) => rest);
};

//Thêm sản phẩm vào Order
const addFood = async (req, res) => {
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
    console.log(customer._id.toString());
    console.log(food.shopId.toString());

    let existingOrder = await Order.findOne({
      customerId: customer._id,
      shopId: food.shopId,
      status: "creating",
    }).exec();

    //Nếu chưa có Order, phải tạo
    if (!existingOrder) {
      console.log("Order not found");
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
      console.log("Order  found");

      //kiểm tra xem đã có sản phẩm giống id, options
      let added = false;
      existingOrder.items.forEach((item) => {
        if (item.foodId.toString() === foodId) {
          console.log("foodId da giong nhau");

          const itemOptions = [];
          item.options.forEach((option) => {
            itemOptions.push({ name: option.name, value: option.value });
          });

          console.log(itemOptions);
          console.log(itemToInsert.options);

          if (
            JSON.stringify(itemOptions) === JSON.stringify(itemToInsert.options)
          ) {
            console.log("Options da giong nhau");

            added = true;
            item.quantity += quantity;
            return;
          }
        }
      });

      if (!added) {
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

module.exports = {
  addFood,
};
