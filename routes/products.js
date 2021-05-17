const express = require("express");
const router = express.Router();

const auth = require("../middlewear/auth");
const shopOwner = require("../middlewear/shopOwer");
const {
  getAllProducts,
  getProduct,
  getProductsForShop,
  addProduct,
  updateProduct,
  uploadProductImage,
  deleteProduct,
} = require("../controllers/product");

router.route("/").get(getAllProducts).post([auth, shopOwner], addProduct);

router
  .route("/:productId")
  .get(getProduct)
  .put(updateProduct)
  .delete(deleteProduct);

router.route("/:productId/photo").put(uploadProductImage);

router.route("/:shopId/products").get(getProductsForShop);

module.exports = router;
