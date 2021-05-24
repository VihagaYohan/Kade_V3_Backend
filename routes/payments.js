const express = require("express");
const router = express.Router();

const { createPaymentIntent } = require("../controllers/payments");

router.route("/").get(createPaymentIntent);

module.exports = router;
