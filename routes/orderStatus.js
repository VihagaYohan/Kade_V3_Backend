const express = require("express");
const router = express.Router();

const { getAllStatus, addOrderStatus } = require("../controllers/orderStatus");

router.route("/").get(getAllStatus).post(addOrderStatus);

module.exports = router;
