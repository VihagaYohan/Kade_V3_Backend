const express = require("express");
const auth = require("../middlewear/auth");

const { addShop } = require("../controllers/shop");
const router = express.Router();

router.route("/").post(auth, addShop);

module.exports = router;
