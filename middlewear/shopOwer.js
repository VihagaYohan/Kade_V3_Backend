const ErrorResponse = require("../utility/errorResponse");
const jwt = require("jsonwebtoken");

const shopOwner = (req, res, next) => {
  try {
    const user = req.user.role;
    if (user == "shopOwner" || user == "admin") {
      next();
    } else {
      res.status(400).json({
        sucess: false,
        msg: "Access denied",
      });
    }
  } catch (error) {
    next(new ErrorResponse(error.message, 400));
  }
};

module.exports = shopOwner;
