const express = require("express");
const {
  getAllCategories,
  getCategory,
  addCategory,
  updateCategory,
  deleteCategory,
  getProducts,
} = require("../controllers/category");
const admin = require("../middlewear/admin");
const auth = require("../middlewear/auth");

const router = express.Router();

router.route("/").get(getAllCategories).post([auth, admin], addCategory);

router
  .route("/:categoryId")
  .get(getCategory)
  .put([auth, admin], updateCategory)
  .delete([auth, admin], deleteCategory);

router.route("/:categoryId/products").get(getProducts);

module.exports = router;
