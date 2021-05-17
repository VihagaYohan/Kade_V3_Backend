const express = require("express");
const {
  getAllCategories,
  getCategory,
  addCategory,
} = require("../controllers/category");
const admin = require("../middlewear/admin");
const auth = require("../middlewear/auth");

const router = express.Router();

router.route("/").get(getAllCategories).post([auth, admin], addCategory);

router.route("/:categoryId").get(getCategory);

module.exports = router;
