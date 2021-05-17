const {
  Category,
  categorySchema,
  categoryValidation,
} = require("../models/Category");
const ErrorResponse = require("../utility/errorResponse");

// @desc    get all categories
// @route   GET/api/categories
// @access  PUBLIC
exports.getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ status: true });
    if (categories.length == 0)
      return next(
        new ErrorResponse("There are not product categories to show", 404)
      );

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
exports.getCategory = async (req, res, next) => {
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

// @desc    create new product cateogry
// @route   POST/api/categories/
// @access  PRIVATE
exports.addCategory = async (req, res, next) => {
  try {
    // check for data validation
    const { error } = await categoryValidation(req.body);
    if (error) return next(new ErrorResponse(error.details[0].message, 400));

    // create new product category and save
    let category = new Category({ name: req.body.name });
    category = await category.save();

    res.status(200).json({
      sucess: true,
      data: category,
    });
  } catch (error) {
    next(error.message, 500);
  }
};

// @desc    update product cateogry
// @route   PUT/api/categories/:categoryId
// @access  PRIVATE
exports.updateCategory = async (req, res, next) => {
  try {
    // check for user input validation
    const { error } = await categoryValidation(req.body);
    if (error) return next(new ErrorResponse(error.details[0].message, 400));

    // check if the category is alreay existing in the database
    let category = await Category.findById(req.params.categoryId);
    if (!category)
      return next(
        new ErrorResponse("Category for the provided ID was not found", 404)
      );

    // update category
    category.name = req.body.name;
    category = await category.save();

    res.status(200).json({
      sucess: true,
      data: category,
    });
  } catch (error) {
    next(new ErrorResponse(error.message, 500));
  }
};

// @desc    delete product category or make status to false
// @route   DELETE/api/categories/:categoryId
// @access  PRIVATE
exports.deleteCategory = async (req, res, next) => {
  try {
    // check if the category is alreay existing in the database
    let category = await Category.findById(req.params.categoryId);
    if (!category)
      return next(
        new ErrorResponse("Category for the provided ID was not found", 404)
      );

    // make status to false
    category.status = false;
    category = await category.save();

    res.status(200).json({
      sucess: true,
      msg: `${category.name} has been deleted`,
    });
  } catch (error) {
    next(new ErrorResponse(error.message, 500));
  }
};
