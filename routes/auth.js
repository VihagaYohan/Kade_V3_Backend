const express = require("express");
const {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
} = require("../controllers/auth");

const router = express.Router();

router.route("/register").post(registerUser);

router.route("/login").post(loginUser);

router.route("/forgotPassword").post(forgotPassword);

router.route("/resetPassword/:resetToken").put(resetPassword);

module.exports = router;
