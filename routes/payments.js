const express = require("express");
const router = express.Router();

const { createPaymentIntent } = require("../controllers/payments");

router.route("/").post(createPaymentIntent);

module.exports = router;
