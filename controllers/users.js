const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const { User, validationUser } = require("../models/User");

// @desc    get all users
// @route   GET/api/users/
// @access  private
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort("name");
    if (!users)
      return res
        .status(404)
        .json({ sucess: false, data: "There are no users to show" });

    res.status(200).json({
      sucess: true,
      data: users,
    });
  } catch (error) {
    res.status(500).json({ sucess: false, data: error });
  }
};

// @desc    get a user by ID
// @route   GET/api/users/:id
// @access  private
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.find({ _id: req.params.id });
    if (!user)
      return res
        .status(404)
        .json({ sucess: false, data: "User not found for the given ID" });

    res.status(200).json({
      sucess: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({ sucess: false, data: error });
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
      return res.status(400).json({
        sucess: false,
        data: error.details[0].message,
      });

    // check if the user already exists in the database
    let user = await User.findOne({ email: req.body.email });
    if (user)
      return res
        .status(404)
        .json({ sucess: false, data: "User already exists" });

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
    res.status(500).json({
      sucess: false,
      data: `Failed : ${error.message}`,
    });
  }
};

// @desc    update  user
// @route   PUT/api/users/
// @access  private
exports.updateUser = async (req, res, next) => {
  try {
    // validation
    const { error } = validationUser(req.body);
    if (error)
      return res.status(400).json({
        sucess: false,
        data: error.details[0].message,
      });

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
      return res.status(404).json({
        sucess: false,
        data: "The user with the given ID was not found",
      });
    }

    res.status(200).json({
      sucess: false,
      data: user,
    });
  } catch (error) {
    res.status(500).json({ sucess: false, data: `Error : ${error.message}` });
  }
};
