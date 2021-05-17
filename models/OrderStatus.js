const mongoose = require("mongoose");
const Joi = require("joi");

const orderStatusSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255,
  },
  createdOn: {
    type: Date,
    default: Date.now,
  },
});

// input validation
const orderStatusValidation = (status) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(255).required(),
  });

  return schema.validate(status);
};

const OrderStatus = new mongoose.model("OrderStatus", orderStatusSchema);

module.exports = {
  orderStatusSchema,
  orderStatusValidation,
  OrderStatus,
};
