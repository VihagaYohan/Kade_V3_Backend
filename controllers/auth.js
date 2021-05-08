const bcrypt = require("bcryptjs");
const { User, validationUser } = require("../models/User");

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

    console.log("fahs");
    // hashing user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // create new user
    user = new User({ name, email, password: hashedPassword, phoneNumber });
    user = await user.save();

    res.status(200).json({
      sucess: true,
      data: user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      sucess: false,
      msg: `Failed: ${error.message}`,
    });
  }
};
