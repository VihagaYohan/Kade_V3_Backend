const mongoose = require("mongoose");
const Joi = require("joi");

const categorySchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    minLength: 3,
    maxLength: 50,
  },
  photo: {
    type: String,
    default:
      "https://kade-bucket.s3.ap-south-1.amazonaws.com/Default-Images/default-image.jpg",
  },
  status: {
    type: Boolean,
    default: true,
  },
});

// input data validation
const categoryValidation = (category) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
  });

  return schema.validate(category);
};

// create collection
const Category = new mongoose.model("Category", categorySchema);

module.exports = {
  Category,
  categorySchema,
  categoryValidation,
};
