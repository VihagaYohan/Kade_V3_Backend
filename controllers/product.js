const {
  Product,
  productSchema,
  productValidation,
} = require("../models/Product");
const ErrorResponse = require("../utility/errorResponse");

// @desc      get all products
// @route     GET/api/products
// @access    PUBLIC
exports.getAllProducts = async (req, res, next) => {
  try {
    const products = await Product.find();
    if (products.length == 0)
      return next(new ErrorResponse("There are no products to show", 404));

    res.status(200).json({
      sucess: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    next(new ErrorResponse(error.message));
  }
};

// @desc      get product
// @route     GET/api/products/:productId
// @access    PUBLIC
exports.getProduct = async (req, res, next) => {
  try {
    // check if the product category is existing in the database
    const product = await Product.findById(req.params.productId);
    if (!product)
      return next(
        new ErrorResponse("Product for the given ID was not found", 404)
      );

    res.status(200).json({
      sucess: true,
      data: product,
    });
  } catch (error) {
    next(new ErrorResponse(error.message));
  }
};


