const {
  Category,
  categorySchema,
  categoryValidation,
} = require("../models/Category");

// @desc    get all categories
// @route   GET/api/categories
// @access  PUBLIC
exports.getAllCategories = (req, res, next) => {
  try {
    const categories = await Category.find();
    if (!categories)
      return next("There are not product categories to show", 404);

    res.status(200).json({
      sucess: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    next(error.message, 500);
  }
};

// @desc    get a product category
// @route   GET/api/categories/:categoryId
// @access  PUBLIC
exports.getCategory = (req, res, next) => {
  try {
    const category = await Category.findById(req.params.categoryId);
    if (!category) return next("Category for the given ID was not found", 404);

    res.status(200).json({
      sucess: true,
      data: category,
    });
  } catch (error) {
    next(error.message, 500);
  }
};
