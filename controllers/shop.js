const { Shop, validationShop } = require("../models/Shop");
const auth = require("../middlewear/auth");
const geocoder = require("../utility/geoCoder");
const ErrorResponse = require("../utility/errorResponse");
const config = require("config");
const path = require("path");
const AWS = require("aws-sdk");
const s3Obj = require("../utility/aws");
const S3obj = require("../utility/aws");

// @desc    get all shops that status is true or shows all the available/ currently operational shops
// @route   GET/api/shops
// @access  PUBLIC
exports.getAllShops = async (req, res, next) => {
  try {
    // check if shops available
    const shops = await Shop.find({ status: true });
    if (shops.length == 0)
      return next(new ErrorResponse("There are no shops to show", 404));

    // return availble shops / status = true
    res.status(200).json({
      sucess: true,
      count: shops.length,
      data: shops,
    });
  } catch (error) {
    next(new ErrorResponse(error.message, 500));
  }
};

// @desc    get shop based on shopID
// @route   GET/api/shops/:shopId
// @access  PUBLIC
exports.getShop = async (req, res, next) => {
  try {
    // check if the shop is available
    const shop = await Shop.findById(req.params.shopId);
    if (!shop)
      return next(
        new ErrorResponse("The shop for the given ID was not found", 404)
      );

    // return shop
    res.status(200).json({
      sucess: true,
      data: shop,
    });
  } catch (error) {
    next(new ErrorResponse(error.message, 500));
  }
};

// @desc    create new shop under user ID
// @route   POST/api/shops/
// @access  PRIVATE
exports.addShop = async (req, res, next) => {
  console.log(process.env.GOOGLE_GEO_API_KEY);
  console.log(config.get("GEO_API"));
  try {
    // check for data validation
    const { error } = validationShop(req.body);
    if (error) return next(new ErrorResponse(error.details[0].message, 400));

    // create shop
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

// @desc    update shop details
// @route   PUT/api/shops/:shopId
// @access  PRIVATE
exports.updateShop = async (req, res, next) => {
  try {
    // check if the shop existing in the database
    let shop = await Shop.findById(req.params.shopId);
    if (!shop)
      return next(
        new ErrorResponse("Shop for the given ID was not found", 400)
      );

    // update shop data
    const { name, userId, address, email, phoneNumber } = req.body;
    shop.name = name;
    shop.userId = userId;
    shop.address = address;
    shop.email = email;
    shop.phoneNumber = phoneNumber;

    // get the geocode for updated address
    const loc = await geocoder.geocode(req.body.address);
    this.location = {
      type: "Point",
      coordinates: [loc[0].longitude, loc[0].latitude],
      formattedAddress: loc[0].formattedAddress,
      street: loc[0].streetName,
      city: loc[0].city,
      state: loc[0].stateCode,
      zipcode: loc[0].zipcode,
      country: loc[0].countryCode,
    };

    // save updated details of the shop
    shop = await shop.save();

    shop.name = res.status(200).json({
      sucess: true,
      data: shop,
    });
  } catch (error) {
    next(new ErrorResponse(error.message, 500));
  }
};

// @desc    delete shop
// @route   DELETE/api/shops/:shopId
// @access  PRIVATE
exports.deleteShop = async (req, res, next) => {
  try {
    shop = await Shop.findByIdAndUpdate(req.params.shopId, {
      name: "Fab Restaurant",
      status: true,
    });
    if (shop == null)
      return next(
        new ErrorResponse("The shop for the given ID was not found", 400)
      );

    setTimeout(() => {
      console.log(shop);
    }, 10000);

    res.status(200).json({
      sucess: true,
      msg: `${shop.name} has been deleted`,
    });
  } catch (error) {
    next(new ErrorResponse(error.message, 500));
  }
};

// @desc    upload picture to shop
// @route   PUT/api/shops/:shopId/photo
// @access  PRIVATE
exports.uploadImage = async (req, res, next) => {
  try {
    // check if the shop is existing and status set to true/active
    let shop = await Shop.findOne({ _id: req.params.shopId, status: true });
    if (!shop)
      return res.status(404).json({
        sucess: false,
        msg: "The shop for the given ID was not found",
      });

    // check if image file has been selected
    if (!req.files) return next("Please select an image to upload", 400);

    console.log(req.files);
    const file = req.files.file;

    // check the size of the image/file
    const maxFileUpload = process.env.MAX_FILE_UPLOAD;
    const fileUploadPath = process.env.FILE_UPLOOAD_PATH;

    if (!file.size > maxFileUpload) {
      res.status(400).json({
        sucess: false,
        data: `Please upload an image less than ${fileUploadPath}`,
      });
    }

    // create custom file name
    file.name = `photo_${shop._id}${path.parse(file.name).ext}`;
    const fileName = file.name;

    console.log(file.name);

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
      shop = await Shop.findByIdAndUpdate(
        req.params.shopId,
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
