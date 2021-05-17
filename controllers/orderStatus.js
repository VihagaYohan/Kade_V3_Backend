const { OrderStatus, orderStatusValidation } = require("../models/OrderStatus");
const ErrorResponse = require("../utility/errorResponse");

// @desc        get all order status
// @route       GET/api/orderStatus/
// @access      PRIVATE
exports.getAllStatus = async (req, res, next) => {
  try {
    const orderStatus = await OrderStatus.find();
    if (orderStatus.length == 0)
      return next(new ErrorResponse("There are no order status to show", 400));

    res.status(200).json({
      sucess: true,
      data: orderStatus,
    });
  } catch (error) {
    next(new ErrorResponse(error.message, 500));
  }
};

// @desc    add new order status
// @route   POST/api/orderStatus
// @access  PRIVATE
exports.addOrderStatus = async (req, res, next) => {
  try {
    // check for input data validation
    const { error } = orderStatusValidation(req.body);
    if (error) return next(new ErrorResponse(error.details[0].message, 400));

    // create new order status
    let orderStatus = new OrderStatus({
      name: req.body.name,
    });

    orderStatus = await orderStatus.save();

    res.status(200).json({
      sucess: true,
      data: orderStatus,
    });
  } catch (error) {
    next(new ErrorResponse(error.message, 500));
  }
};
