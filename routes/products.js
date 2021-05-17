const express = require("express");
const router = express.Router();

const auth = require("../middlewear/auth");
const shopOwner = require("../middlewear/shopOwer");
const {
  getAllProducts,
  getProduct,
  getProductsForShop,
  addProduct,
} = require("../controllers/product");

router.route("/").get(getAllProducts).post([auth, shopOwner], addProduct);

router.route("/:productId").get(getProduct);

router.route("/:shopId/products").get(getProductsForShop);

module.exports = router;
