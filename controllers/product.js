const {
  Product,
  productSchema,
  productValidation,
} = require("../models/Product");
const { Shop } = require("../models/Shop");
const { Category } = require("../models/Category");
const ErrorResponse = require("../utility/errorResponse");
const AWS = require("aws-sdk");
const S3obj = require("../utility/aws");
const path = require("path");
const deleteImage = require("../utility/deleteImage");
const { UploadSingleImage } = require("../utility/uploadImage");

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

// @desc    get all products for given shop id
// @route   GET/api/products/:shopId/products
// @access  PUBLIC
exports.getProductsForShop = async (req, res, next) => {
  try {
    // check if the product exsiting in the database
    const products = await Product.find({ shopId: req.params.shopId });
    if (products.length == 0)
      return next(
        new ErrorResponse("Unable to locate products for given shop ID", 404)
      );

    res.status(200).json({
      sucess: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    next(new ErrorResponse(error.message, 500));
  }
};


// @desc    add new product to a shop. this requires user role of admin or shop owner
// @route   POST/api/products/:shopId/:categoryId
// @access  PRIVATE
exports.addProduct = async (req, res, next) => {
  try {
    // check for the input validation
    const { error } = await productValidation(req.body);
    if (error) return next(new ErrorResponse(error.details[0].message, 400));

    // check if the shop is existing in the database
    let shop = await Shop.findById(req.body.shopId);
    if (!shop)
      return next(
        new ErrorResponse("Shop for the given ID was not found", 404)
      );

    // check if the product category id extisting in the database
    const category = await Category.findById(req.body.productCategoryId);
    if (!category)
      return next(
        new ErrorResponse("Category for the given ID was not found", 404)
      );

    // saving product with the image
    let product = new Product({
      productName: req.body.productName,
      description: req.body.description,
      price: req.body.price,
      stockCount: req.body.stockCount,
      shopId: shop._id,
      productCategoryId: req.body.productCategoryId,
    });

    product = await product.save();

    // get product image from file
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
    file.name = `photo_${product._id}${path.parse(file.name).ext}`;
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

      console.log(imageURL); // return data - developement purpose
      console.log(imageKey); // return data - developement purpose

      // update shop document on mongoDB with public s3 URL for the image
      product = await Product.findByIdAndUpdate(
        product._id,
        { photo: imageURL, photoKey: imageKey },
        { new: true }
      );

      // return response object(ETag, location,key,bucket)
      res.status(200).json({
        sucess: true,
        data: data,
      });
    });
  } catch (error) {
    next(new ErrorResponse(error.message, 500));
  }
};

// @desc    upload product image
// @route   PUT/api/products/:productId/photo
// @access  PRIVATE
exports.uploadProductImage = async (req, res, next) => {
  try {
    // check for input data validation
    const { error } = productValidation(req.body);
    if (error) return next(new ErrorResponse(error.details[0].message, 400));

    // check if the product exists in the database
    let product = await Product.findById(req.params.productId);
    if (!product)
      return next(
        new ErrorResponse("Product for the given ID was not found", 404)
      );

    const oldPhotoKey = product.photoKey;

    product.productName = req.body.productName;
    product.description = req.body.description;
    product.price = req.body.price;
    product.stockCount = req.body.stockCount;
    product.shopId = req.body.shopId;
    product.productCategoryId = req.body.productCategoryId;

    // find files
    if (!req.files) {
      return res.status(400).json({
        sucess: false,
        data: "Please upload an image file",
      });
    }

    const file = req.files.file;

    // make sure the selected file is an image
    if (!file.mimetype.startsWith("image")) {
      res
        .status(400)
        .json({ sucess: false, data: "Please select an image file" });
    }

    // check the file size
    const maxFileUpload = process.env.MAX_FILE_UPLOAD;
    const fileUploadPath = process.env.FILE_UPLOOAD_PATH;

    if (file.size > maxFileUpload) {
      res.status(400).json({
        sucess: false,
        data: `Please upload an image less than ${fileUploadPath}`,
      });
    }

    // create custom file name
    file.name = `photo_${product._id}${path.parse(file.name).ext}`;
    const fileName = file.name;

    console.log("uploading image"); // development purpose
    const result = UploadSingleImage(file, fileName);
    if (result.imgUrl === "null" || result.imgKey === "null") {
      return next(
        new ErrorResponse(
          "Product image upload failed. Please select an image and try again",
          500
        )
      );
    } else {
      const imageURL = result.imgUrl;
      const imageKey = result.imgKey;

      // update product document with new image URL and image key
      product = await Product.findByIdAndUpdate(
        product._id,
        { photo: imageURL, photoKey: imageKey },
        { new: true }
      );

      console.log(imageURL); /* for development purpose */
      console.log(imageKey);

      // delete old image from AWS s3 bucket
      console.log(`Old ID : ${oldPhotoKey}`);
      deleteImage(oldPhotoKey);

      res.status(200).json({
        sucess: true,
        data: product,
      });
    }
  } catch (error) {
    next(new ErrorResponse(error.message, 500));
  }
};

// @desc    update product by product ID
// @route   PUT/api/products/:productId
// @access  PRIVATE
exports.updateProduct = async (req, res, next) => {
  try {
    // check for input data validations
    const { error } = await productValidation(req.body);
    if (error) return next(new ErrorResponse(error.details[0].message, 400));

    // find product and update
    let product = await Product.findByIdAndUpdate(
      req.params.productId,
      req.body,
      {
        new: true,
      }
    );
    if (!product)
      return next(
        new ErrorResponse("The product for the given ID was not found", 404)
      );

    res.status(200).json({
      sucess: true,
      data: product,
    });
  } catch (error) {
    next(new ErrorResponse(error.message, 500));
  }
};

// @desc      delete product by product ID
// @route     DELETE/api/products/:productID
// @access    PRIVATE
exports.deleteProduct = async (req, res, next) => {
  try {
    // find product in the database
    let product = await Product.findById(req.params.productId);
    if (!product)
      return next(
        new ErrorResponse("Product for the given ID was not found", 404)
      );

    // old photokey to delete image from AWS s3
    const oldPhotoKey = product.photoKey;

    // delete product from the database
    product = await Product.findByIdAndRemove(req.params.productId);
    if (!product)
      return next(
        new ErrorResponse("Product for the given ID was not found", 404)
      );

    deleteImage(oldPhotoKey); // delete old image from AWS s3

    res.status(200).json({
      sucess: true,
      data: `${product.productName} has been deleted`,
    });
  } catch (error) {
    next(new ErrorResponse(error.message, 500));
  }
};

