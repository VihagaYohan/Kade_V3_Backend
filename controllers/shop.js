const { Shop, validationShop } = require("../models/Shop");
const auth = require("../middlewear/auth");
const geocoder = require("../utility/geoCoder");
const ErrorResponse = require("../utility/errorResponse");

// @desc    create new shop under user ID
// @route   POST/api/shops/
// @access  PRIVATE
exports.addShop = async (req, res, next) => {
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
