const express = require("express");

const { addShop } = require("../controllers/shop");
const router = express.Router();

router.route("/").post(addShop);

module.exports = router;
