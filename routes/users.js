const express = require("express");

const { getAllUsers, getUser, addUser } = require("../controllers/users");

const router = express.Router();

router.route("/").get(getAllUsers).post(addUser)

router.route("/:id").get(getUser);

/* router.post("/", async (req, res) => {
  res.send(req.body);
}); */

module.exports = router;
