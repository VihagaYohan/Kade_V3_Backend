const bcrypt = require("bcryptjs");
const { User, validationUser, validationLogin } = require("../models/User");
const jwt = require("jsonwebtoken");
const Joi = require("joi");

// @desc    register new user
// @route   POST/api/auth/register
// @access  public
exports.registerUser = async (req, res, next) => {
  try {
    const { name, email, password, phoneNumber } = req.body;

    // check for user data validation
    const { error } = validationUser(req.body);
    if (error)
      return res.status(400).json({
        sucess: false,
        msg: error.details[0].message,
      });

    // check if the user email address already exists
    let user = await User.findOne({ email });
    if (user)
      return res.status(400).json({
        sucess: false,
        msg: "User email already exists",
      });

    // hashing user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // create new user
    user = await User.create({
      name,
      email,
      password: hashedPassword,
      phoneNumber,
    });
    //user = await user.save();

    const token = user.generateAuthToken();

    /* // create token
    const token = jwt.sign(
      { _id: user.id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRE,
      }
    ); */

    res.status(200).json({
      sucess: true,
      data: user,
      token: token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      sucess: false,
      msg: `Failed: ${error.message}`,
    });
  }
};

// @desc    login user
// @route   POST/api/auth/login
// @access  private
exports.loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // validate email and password
    const { error } = validationLogin(req.body);
    if (error)
      return res.status(400).json({
        sucess: false,
        msg: error.details[0].message,
      });

    // check for user in the database
    const user = await User.findOne({ email }).select("+password");
    if (!user)
      return res.status(400).json({
        sucess: false,
        msg: "Invalid email or password",
      });

    // check for password validity
    const result = await bcrypt.compare(password, user.password);
    if (!result)
      return res.status(400).json({
        sucess: false,
        msg: "Invalid email or password",
      });

    // create JWT token
    const token = user.generateAuthToken();

    res.status(200).json({
      sucess: true,
      token: token,
    });
  } catch (error) {
    res.status(500).json({
      suscess: false,
      msg: `Falied: ${error.message}`,
    });
  }
};
