const express = require("express");
const dotenv = require("dotenv");
const config = require("config");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
const morgan = require("morgan");
const colors = require("colors");
const fileUpload = require("express-fileupload");
const path = require("path");

// import middle-wears
const errorHandler = require("./middlewear/error");

// import DB connection
const connectDB = require("./config/db");

// import route files
const users = require("./routes/users");
const auth = require("./routes/auth");
const shops = require("./routes/shops");
const categories = require("./routes/categories");
const products = require("./routes/products");
const orderStatus = require("./routes/orderStatus");
const orders = require("./routes/order");
const payments = require('./routes/payments')

const app = express();

// JSON body pharser
app.use(express.json());

// load env vars
dotenv.config({ path: "./config/config.env" });

// connect to DB
connectDB();

// file upload
app.use(fileUpload());

app.use(express.static(path.join(__dirname, "./public")));

// init routes
app.use("/api/users/", users);
app.use("/api/auth/", auth);
app.use("/api/shops/", shops);
app.use("/api/categories/", categories);
app.use("/api/products/", products);
app.use("/api/orderStatus", orderStatus);
app.use("/api/orders/", orders);
app.use('/api/payments',payments)

// initiate middle-wear
app.use(errorHandler);

const PORT = 8000;

// listen to server port
app.listen(PORT, () => {
  console.log(
    `Server is running on ${process.env.NODE_ENV} mode on port ${process.env.PORT}`
      .yellow.bold
  );
});

// handle unhandled rejection
/* process.on("unhandledRejection", (err, promise) => {
  console.log(`Error : ${err.message}`.red);
  // close server and exit process
  server.close(() => process.exit(1));
});
 */
