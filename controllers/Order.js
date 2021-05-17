const { OrderStatus } = require("../models/OrderStatus");
const { Order, orderValidation, OrderSchema } = require("../models/Order");
const ErrorResponse = require("../utility/errorResponse");

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
