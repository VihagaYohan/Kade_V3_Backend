const mongoose = require("mongoose");
const { OrderStatus } = require("../models/OrderStatus");
const { Order, orderValidation, OrderSchema } = require("../models/Order");
const { User } = require("../models/User");
const { Product } = require("../models/Product");
const geocoder = require("../utility/geoCoder");
const updateStock = require("../utility/Product/updateStock");
const ErrorResponse = require("../utility/errorResponse");
const Fawn = require("fawn"); // 2-phase commit

Fawn.init(mongoose);

// @desc    get all orders
// @route   GET/api/orders
// @access  PRIVATE
exports.getAllOrders = async (req, res, next) => {
  try {
    const order = await Order.find();
    if (order.length == 0)
      return next(new ErrorResponse("There are no orders to show", 404));

    res.status(200).json({
      sucess: true,
      data: order,
    });
  } catch (error) {
    next(new ErrorResponse(error.message, 500));
  }
};

// @desc    get a single order
// @route   GET/api/orders/:orderId
// @access  PRIVATE
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order)
      return next(
        new ErrorResponse("The order for the given ID was not found", 404)
      );

    res.status(200).json({
      sucess: true,
      data: order,
    });
  } catch (error) {
    next(new ErrorResponse(error.message, 500));
  }
};

// @desc    get all orders for a specific shop
// @route   GET/api/orders/:shopId/orders
// @access  PRIVATE
exports.getShopsOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ shopId: req.params.shopId });
    if (!orders)
      return res.status(404).json({
        sucess: false,
        data: orders,
      });

    res.status(200).json({
      sucess: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    next(new ErrorResponse(error.message, 500));
  }
};

// @desc    get all orders for a specific user
// @route   GET/api/orders/:userId/orders
// @access  PRIVATE
exports.getUsersOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ customerId: req.params.userId });
    if (!orders)
      return res.status(404).json({
        sucess: false,
        data: "Unable to locate orders for the given user ID",
      });

    res.status(200).json({
      sucess: true,
      count: order.length,
      data: order,
    });
  } catch (error) {
    next(new ErrorResponse(error.message, 500));
  }
};

// @desc    add new order
// @route   POST/api/orders/
// @access  PRIVATE
exports.addOrder = async (req, res, next) => {
  try {
    let shopId = "null";
    let notAvailable = [];

    // check for input data validation
    const { error } = orderValidation(req.body);
    if (error)
      return res.status(400).json({
        sucess: false,
        data: error.details[0].message,
      });

    shopId = req.body.shopId; // getting shop Id

    // check if the user exists in the database
    const customer = await User.findById(req.body.customerId);
    if (!customer)
      return res.status(404).json({
        sucess: false,
        data: `The ID for the given user  was not found`,
      });

    // creating order object
    let order = new Order({
      shopId: req.body.shopId,
      customerId: req.body.customerId,
      orderItems: req.body.orderItems,
      address: req.body.address,
      contactNo: req.body.contactNo,
      orderType: req.body.orderType,
    });

    // implementing 2-phase commit
    try {
      let task = new Fawn.Task(); // create task
      task = task.save("orders", order); // save order

      // loop through order items
      const orderItems = order.orderItems;
      for (i in orderItems) {
        const product = await Product.findById(orderItems[i].productId);
        const currentStock = product.stockCount;
        const quantity = orderItems[i].quantity;
        let balance;

        console.log(`quantity : ${quantity}`); // for development purpose

        // check for stock
        if (currentStock <= 0) {
          console.log(`Not enough stock for selected product`);
          notAvailable.push(orderItems[i]); // if the current stock is 0 then that order item will be added to notAvailable array
        } else if (quantity > currentStock) {
          console.log(
            `Not enough stock for selected product. ${
              quantity - currentStock
            } items required`
          );
          notAvailable.push(orderItems[i]); // if the requested stock amount is greater than the current stock count then order item will be added notAvailable array
        } else {
          balance = currentStock - quantity;
          console.log(`balance : ${balance}`);

          task = task.update(
            "products",
            { _id: product._id },
            {
              $inc: {
                stockCount: -quantity,
              },
            }
          );
        }
      }
      task.run(); // run fawn task

      res.status(200).json({
        sucess: true,
        data: order,
        notAvailable: notAvailable,
      });
    } catch (error) {}
  } catch (error) {
    next(new ErrorResponse(error.message, 500));
  }
};


