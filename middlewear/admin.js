const ErrorResponse = require("../utility/errorResponse");
const jwt = require("jsonwebtoken");

const admin = (req, res, next) => {
  try {
    const user = req.user.role;
    if (user !== "admin") return next(new ErrorResponse("Access denied"), 400);
    next();
  } catch (error) {
    next(new ErrorResponse(error.message, 400));
  }
};

module.exports = admin;
