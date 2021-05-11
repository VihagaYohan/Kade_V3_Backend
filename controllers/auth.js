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
const ErrorResponse = require("../utility/errorResponse");

// @desc    register new user
// @route   POST/api/auth/register
// @access  public
exports.registerUser = async (req, res, next) => {
  try {
    const { name, email, password, phoneNumber } = req.body;

    // check for user data validation
    const { error } = validationUser(req.body);
    if (error)
      return next(new ErrorResponse(`${error.details[0].message}`, 400));

    // check if the user email address already exists
    let user = await User.findOne({ email });
    if (user)
      return next(new ErrorResponse(`The user email already exists`, 400));

    // check if the user phone number already exists
    user = await User.findOne({ phoneNumber });
    if (user)
      return next(new ErrorResponse("Phone number already exists", 400));

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

    // create JWT token
    const token = user.generateAuthToken();

    res.status(200).json({
      sucess: true,
      data: user,
      token: token,
    });
  } catch (error) {
    next(new ErrorResponse(`${error.message}`, 500));
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
    if (error) return next(new ErrorResponse(error.details[0].message, 400));

    // check for user in the database
    const user = await User.findOne({ email }).select("+password");
    if (!user) return next(new ErrorResponse("Invalid email or password", 400));

    // check for password validity
    const result = await bcrypt.compare(password, user.password);
    if (!result)
      return next(new ErrorResponse("Invalid email or password", 400));

    // create JWT token
    const token = user.generateAuthToken();

    res.status(200).json({
      sucess: true,
      token: token,
    });
  } catch (error) {
    next(new ErrorResponse("${error.message}", 500));
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
    if (error) return next(new ErrorResponse(error.details[0].message, 400));

    // find user with provided email address
    let user = await User.findOne({ email: email });
    if (!user)
      return next(new ErrorResponse("User not found for the given email", 404));

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

      return next(new ErrorResponse("Email could not be sent", 500));
    }
  } catch (error) {
    next(new ErrorResponse(error.message, 500));
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
    if (!user) return next(new ErrorResponse("Invalid token", 400));

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
    next(new ErrorResponse(error.message, 500));
  }
};
