const express = require("express");
const { getAllOrders, getOrder } = require("../controllers/order");

const router = express.Router();

router.route("/").get(getAllOrders);

router.route("/:orderId").get(getOrder);

module.exports = router;
