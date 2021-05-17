const express = require("express");
const {
  getAllOrders,
  getOrder,
  getShopsOrders,
  getUsersOrders,
} = require("../controllers/order");

const router = express.Router();

router.route("/").get(getAllOrders);

router.route("/:orderId").get(getOrder);

router.route("/:shopId/orders").get(getShopsOrders);

router.route("/:userId/orders").get(getUsersOrders);

module.exports = router;
