const {
  Category,
  categorySchema,
  categoryValidation,
} = require("../models/Category");
const ErrorResponse = require("../utility/errorResponse");
const S3obj = require("../utility/aws");
const path = require("path");
const deleteImage = require("../utility/deleteImage");
const { UploadSingleImage } = require("../utility/uploadImage");

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

    // create new product category without image
    let category = new Category({ name: req.body.name });
    category = await category.save();

    //get product category image from file
    if (!req.files)
      return next(new ErrorResponse("Please upload an image", 400));

    const file = req.files.file;
    console.log(file); // development purpose

    // make sure selected file is an image
    if (!file.mimetype.startsWith("image"))
      return next(new ErrorResponse("Please select an image file", 400));

    // process.env values
    const maxFileUpload = process.env.MAX_FILE_UPLOAD;
    const fileUploadPath = process.env.FILE_UPLOOAD_PATH;

    // check for the file size
    if (file.size > maxFileUpload) {
      res.status(400).json({
        sucess: false,
        data: `Please upload an image less than ${fileUploadPath}`,
      });
    }

    // create custom file name
    file.name = `photo_${category._id}${path.parse(file.name).ext}`;
    const fileName = file.name;

    // setting s3 parameters
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileName,
      Body: file.data,
      ACL: "public-read",
    };

    // upload image to AWS s3 bucket
    S3obj.upload(params, async (error, data) => {
      if (error)
        return res.status(500).json({
          sucess: false,
          data: error,
          message: "Problem with file upload",
        });

      console.log(data); // return data - developement purpose
      const imageURL = data.Location;
      const imageKey = data.Key;

      console.log("URL : " + imageURL); // return data - developement purpose
      console.log("Key : " + imageKey); // return data - developement purpose

      // update shop document on mongoDB with public s3 URL for the image
      category = await Category.findByIdAndUpdate(
        category._id,
        { photo: imageURL, photoKey: imageKey },
        { new: true }
      );

      // return response object(ETag, location,key,bucket)
      /* res.status(200).json({
        sucess: true,
        data: data,
      }); */
    });

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
