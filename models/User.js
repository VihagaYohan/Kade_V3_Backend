const mongoose = require("mongoose");
const Joi = require("joi");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please add a name"],
    trim: true,
    minlength: [2, "Name should be longer 2 characters"],
    maxlength: [50, "Name should not be longer than 50 characters"],
  },
  email: {
    type: String,
    trim: true,
    required: [true, "Please add an email address"],
    unieq: true,
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      "Please add a valid email",
    ],
  },
  password: {
    type: String,
    required: [true, "Please add a password"],
    trim: true,
    minlength: [4, "Password should be longer than 4 characters"],
    select: false,
  },
  phoneNumber: {
    type: String,
    required: [true, "Please add a phone number"],
    trim: true,
    maxlength: [10, "Phone number shoud not be longer than 10 characters"],
  },
  role: {
    type: String,
    enum: ["user", "shopOwner", "admin"],
    trim: true,
    default: "user",
  },
  resetPasswordToken: {
    type: String,
  },
  resetPasswordExpire: {
    type: Date,
  },
  createdOn: {
    type: Date,
    default: Date.now,
  },
});

// create Signed and return JWT token
userSchema.methods.generateAuthToken = function () {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

const User = mongoose.model("User", userSchema);

// validation for user model
// this checks user input data before save into database
const validationUser = (user) => {
  const schema = Joi.object({
    name: Joi.string().required().min(2).max(50),
    email: Joi.string()
      .email({
        minDomainSegments: 2,
        tlds: { allow: ["com", "net"] },
      })
      .required(),
    password: Joi.string().required().min(4),
    phoneNumber: Joi.string().required().max(10),
  });

  return schema.validate(user);
};

// user login data validation - email address and password
const validationLogin = (loginData) => {
  const schema = Joi.object({
    email: Joi.string()
      .email({
        minDomainSegments: 2,
        tlds: { allow: ["com", "net"] },
      })
      .required(),
    password: Joi.string().required().min(4),
  });

  return schema.validate(loginData);
};

module.exports = {
  User,
  userSchema,
  validationUser,
  validationLogin
};
