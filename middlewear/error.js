const errorHandler = (error, req, res, next) => {
  // log to console for dev
  console.log(error.stack.red);

  console.log(error)

  res
    .status(error.statusCode || 500)
    .json({ sucess: false, error: error.message || "Server error" });
};

module.exports = errorHandler;
