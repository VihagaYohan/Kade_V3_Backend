const express = require("express");
const {
  getAllOrders,
  getOrder,
  getShopsOrders,
  getUsersOrders,
  addOrder,
} = require("../controllers/order");
const auth = require("../middlewear/auth");
const router = express.Router();

router.route("/").get(getAllOrders).post(auth, addOrder);

router.route("/:orderId").get(getOrder);

router.route("/:shopId/orders").get(getShopsOrders);

router.route("/:userId/userOrders").get(getUsersOrders);

module.exports = router;
