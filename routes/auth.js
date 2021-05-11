const express = require("express");
const {
  registerUser,
  loginUser,
  forgotPassword,
} = require("../controllers/auth");

const router = express.Router();

router.route("/register").post(registerUser);

router.route("/login").post(loginUser);

router.route("/forgotPassword").post(forgotPassword)


module.exports = router;
