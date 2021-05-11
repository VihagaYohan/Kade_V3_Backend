const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const ErrorResponse = require("../utility/errorResponse");
const { User, validationUser } = require("../models/User");

// @desc    get all users
// @route   GET/api/users/
// @access  private
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort("name");
    if (!users)
      return next(new ErrorResponse("There are no users to show", 404));

    res.status(200).json({
      sucess: true,
      data: users,
    });
  } catch (error) {
    next(new ErrorResponse(`${error.message}`, 500));
  }
};

// @desc    get a user by ID
// @route   GET/api/users/:id
// @access  private
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user)
      return next(
        new ErrorResponse(`User for the given ID was not found`, 404)
      );

    res.status(200).json({
      sucess: true,
      data: user,
    });
  } catch (error) {
    next(new ErrorResponse(`${error.message}`, 500));
  }
};

// @desc    add a new user
// @route   POST/api/users/
// @access  private
exports.addUser = async (req, res, next) => {
  try {
    // check user input data validation
    const { error } = validationUser(req.body);
    if (error)
      return next(new ErrorResponse(`${error.details[0].message}`, 400));

    // check if the user already exists in the database
    let user = await User.findOne({ email: req.body.email });
    if (user) return next(new ErrorResponse(`User already exists`, 400));

    // hasing user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // create and save user
    user = new User({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
      phoneNumber: req.body.phoneNumber,
    });

    user = await user.save();

    res.status(200).json({ sucess: true, data: user });
  } catch (error) {
    next(new ErrorResponse(`${error.message}`, 500));
  }
};

// @desc    update  user
// @route   PUT/api/users/:id
// @access  private
exports.updateUser = async (req, res, next) => {
  try {
    // validation
    const { error } = validationUser(req.body);
    if (error)
      return next(new ErrorResponse(`${error.details[0].message}`, 400));

    const { name, email, phoneNumber } = req.body;

    // update user details
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        name,
        email,
        phoneNumber,
      },
      { new: true }
    );

    if (!user) {
      return next(
        new ErrorResponse(`The user with the given ID was not found`, 404)
      );
    }

    res.status(200).json({
      sucess: false,
      data: user,
    });
  } catch (error) {
    next(new ErrorResponse(`${error.message}`, 500));
  }
};

// @desc    delete user
// @route   DELETE/api/users/:id,
// @access  private
exports.deleteUser = async (req, res, next) => {
  try {
    // find user
    const user = await User.findByIdAndRemove(req.params.id);
    if (!user)
      return next(
        new ErrorResponse("The user with given ID was not found", 404)
      );

    res.status(200).json({
      sucess: true,
      data: `${user.name} user has been removed`,
    });
  } catch (error) {
    next(new ErrorResponse(`${error.message}`, 500));
  }
};
