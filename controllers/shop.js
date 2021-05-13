const { Shop, validationShop } = require("../models/Shop");
const ErrorResponse = require("../utility/errorResponse");

// @desc    create new shop under user ID
// @route   POST/api/shop/
// @access  PRIVATE
exports.addShop = async (req, res, next) => {
  try {
    // check for data validation
    const { error } = validationShop(req.body);
    if (error) return next(new ErrorResponse(error.details[0].message, 400));

    let shop = new Shop(req.body);
    shop = await shop.save();

    res.status(201).json({
      sucess: true,
      data: shop,
    });
  } catch (error) {
    next(new ErrorResponse(error.message, 500));
  }
};
