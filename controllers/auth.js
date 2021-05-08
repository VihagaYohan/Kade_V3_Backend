const bcrypt = require("bcryptjs");
const { User, validationUser } = require("../models/User");
const jwt = require("jsonwebtoken");

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
    user = new User({ name, email, password: hashedPassword, phoneNumber });
    user = await user.save();

    // create token
    const token = jwt.sign(
      { _id: user.id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRE,
      }
    );

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
  } catch (error) {
    res.status(500).json({
      suscess: false,
      msg: `Falied: ${error.message}`,
    });
  }
};
