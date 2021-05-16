const { Shop, validationShop } = require("../models/Shop");
const auth = require("../middlewear/auth");
const geocoder = require("../utility/geoCoder");
const ErrorResponse = require("../utility/errorResponse");
const config = require("config");

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
    const shop = await Shop.findOne({ _id: req.params.shopId, status: true });
    if (!shop)
      return res.status(404).json({
        sucess: false,
        msg: "The shop for the given ID was not found",
      });

    console.log(process.env.GOOGLE_GEO_API_KEY);
    console.log(typeof process.env.GEOCODER_PROVIDER);
    res.status(200).json({
      sucess: true,
      txt: config.get("GEO_API"),
    });
  } catch (error) {
    next(new ErrorResponse(error.message, 500));
  }
};
