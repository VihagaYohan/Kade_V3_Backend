const mongoose = require("mongoose");
const Joi = require("joi");
Joi.objecctId = require("joi-objectid")(Joi);

const productSchema = mongoose.Schema({
  productName: {
    type: String,
    required: [true, "Please add a product name"],
    trim: true,
    minlength: [2],
    maxlength: [50, "Product name can not be more than 50 characters"],
  },
  description: {
    type: String,
    maxlength: 1024,
  },
  photo: {
    type: String,
    default:
      "https://kade-bucket.s3.ap-south-1.amazonaws.com/Default-Images/default-image.jpg",
  },
  photoKey: {
    type: String,
    default: "null",
  },
  price: {
    type: Number,
    required: [true, "Please add product price"],
    min: 1,
  },
  stockCount: {
    type: Number,
    required: [true, "Please add stock count"],
    min: 1,
  },
  discount: {
    type: Number,
  },
  shopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Shop",
  },
  productCategoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
  },
  createdOn: {
    type: Date,
    default: Date.now,
  },
});

// product input data validation
const productValidation = (product) => {
  const schema = Joi.object({
    productName: Joi.string().min(2).max(50).required(),
    description: Joi.string().max(1024),
    price: Joi.number().min(1).required(),
    stockCount: Joi.number().min(1).required(),
    shopId: Joi.objectId().required(),
    productCategoryId: Joi.objectId().required(),
  });
  return schema.validate(product);
};

// Product collection
const Product = new mongoose.model("Product", productSchema);

module.exports = {
  Product,
  productSchema,
  productValidation,
};
