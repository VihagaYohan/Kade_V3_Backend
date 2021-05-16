const express = require("express");
const auth = require("../middlewear/auth");

const { addShop,updateShop, deleteShop } = require("../controllers/shop");

const router = express.Router();

router.route("/").post(auth, addShop);

router.route('/:shopId').put(auth,updateShop).delete(auth,deleteShop)

module.exports = router;
