const mongoose = require("mongoose");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);

const geocoder = require("../util/geocoder");
const { array } = require("joi");

const orderSchema = mongoose.Schema({
  shopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Shop",
    required: true,
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  orderItems: {
    type: [],
  },
  orderTotal: {
    type: Number,
    min: 0,
  },
  address: {
    type: String,
    type: String,
    required: [true, "Please add an address"],
    maxlength: [255, "Address can not be more than 255 characters"],
  },
  location: {
    // GeoJSON point
    type: {
      type: String,
      enum: ["Point"],
    },
    coordinates: {
      type: [Number],
      index: "2dsphere",
    },
    formatedAddress: String,
    street: String,
    city: String,
    state: String,
    zipcode: String,
    country: String,
  },
  contactNo: {
    type: [String],
    required: true,
  },
  orderType: {
    type: String,
    enum: ["Cash", "Card"],
    required: true,
  },
  orderStatus: {
    type: String,
    default: "Order Placed",
    required: true,
  },
  createdOn: {
    type: Date,
    default: Date.now,
  },
});

// geo-coder and create location field
orderSchema.pre("save", async function (next) {
  const loc = await geocoder.geocode(this.address);
  this.location = {
    type: "Point",
    coordinates: [loc[0].latitude, loc[0].longitude],
    formattedAddress: loc[0].formattedAddress,
    street: loc[0].streetName,
    city: loc[0].city,
    state: loc[0].stateCode,
    zipcode: loc[0].zipcode,
    country: loc[0].countryCode,
  };
  next();
});


orderSchema.post("update", async function (next) {
  console.log("update one worked");
  next();
});

// input validation
const orderValidation = (order) => {
  const schema = Joi.object({
    shopId: Joi.objectId().required(),
    customerId: Joi.objectId().required(),
    orderItems: Joi.array().items(
      Joi.object({
        productId: Joi.string().required(),
        productName: Joi.string().required(),
        quantity: Joi.number().required(),
        unitPrice: Joi.number().required(),
        discount: Joi.number(),
        lineTotal: Joi.number().required(),
      })
    ),
    address: Joi.string().max(255).required(),
    contactNo: Joi.array().items(Joi.string().min(8)),
    orderType: Joi.string().required(),
  });
  return schema.validate(order);
};

const Order = new mongoose.model("Order", orderSchema);

exports.Order = Order;
exports.OrderSchema = orderSchema;
exports.Validation = orderValidation;
