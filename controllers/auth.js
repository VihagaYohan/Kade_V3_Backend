const bcrypt = require("bcryptjs");
const {
  User,
  validationUser,
  validationLogin,
  validationResetPassword,
} = require("../models/User");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const crypto = require("crypto");
const sendEmail = require("../utility/sendEmail");
const { getForgotPasswordEmail } = require("../email/GetForgotPasswordEmail");

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

// @desc    forgot password
// @route   POST/api/auth/forgotPassword
// @access  private
exports.forgotPassword = async (req, res, next) => {
  try {
    const email = req.body.email;

    // check for validation - email format
    const { error } = validationResetPassword(req.body);
    if (error)
      return res.status(400).json({
        sucess: false,
        mgs: error.details[0].message,
      });

    // find user with provided email address
    let user = await User.findOne({ email: email });
    if (!user)
      return res.status(404).json({
        sucess: false,
        mgs: "User not found for the given email",
      });

    // get reset password token
    var resetToken = await user.getResetPasswordToken();

    // save user with reset password token and reset password expire to DB
    user = await user.save();

    // create reset URL
    const resetURL = `${req.protocol}://${req.get(
      "host"
    )}/api/auth/resetPassword/${resetToken}`;

    const message = `You are receving this email because you (or someone else) has requested the reset of a password. Please make a put request to : \n\n${resetURL}`;

    // sending email to user
    try {
      await sendEmail({
        email: "vihagayohan94@gmail.com",
        subject: "Password reset - Kade",
        message: message,
        html: getForgotPasswordEmail(user.name, resetURL),
      });

      res.status(200).json({
        sucess: true,
        data: "Email has been send",
      });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save({ validationBeforeSave: false });

      res.status(500).json({
        sucess: false,
        mgs: "Email could not be sent",
      });
    }
  } catch (error) {
    res.status(500).json({
      suscess: false,
      msg: `Falied: ${error.message}`,
    });
  }
};

// @desc    reset password
// @route   PUT/api/auth/resetPassword/:resetToken
// @access  public
exports.resetPassword = async (req, res, next) => {
  try {
    // get hashed token
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.resetToken)
      .digest("hex");

    console.log(resetPasswordToken);

    // find user and check if the token is valid
    let user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });
    if (!user)
      return res.status(400).json({ sucess: false, msg: "Invalid token" });

    // set new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    // save user with new password
    user = await user.save();

    // return JWT token
    const token = user.generateAuthToken();

    res.status(200).json({
      sucess: true,
      token: token,
    });
  } catch (error) {
    res.status(500).json({
      sucess: false,
      msg: error.message,
    });
  }
};
