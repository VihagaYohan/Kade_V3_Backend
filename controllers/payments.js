const express = require("express");
const ErrorResponse = require("../middlewear/error");
const stripe = require("stripe")(
  "sk_test_51Iule3EHwMdMCEQYfPkAthzISrzZBIbJUzP2RvYXXs2TJKBqpOcEM7nqgI9VL0szZCUX0YgZxfcfEbglQo3aB98500vqGKsFWH"
);

// @desc    create stripe payment intent
// @route   GET/api/payments/
// @access  PUBLIC
exports.createPaymentIntent = async (req, res, next) => {
  const orderAmount = req.body.amount;
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: orderAmount,
      currency: "lkr",
    });

    res.status(200).json({
      sucess: true,
      clientSecret: paymentIntent.client_secret,
      amount: paymentIntent.amount,
    });
  } catch (error) {
    console.log(error);
  }
};
