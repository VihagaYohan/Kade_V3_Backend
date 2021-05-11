const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const colors = require("colors");

// import middle-wear
const errorHandler = require("./middlewear/error");

// import DB connection
const connectDB = require("./config/db");

// import route files
const users = require("./routes/users");
const auth = require("./routes/auth");

const app = express();

// JSON body pharser
app.use(express.json());

// load env vars
dotenv.config({ path: "./config/config.env" });

// connect to DB
connectDB();

// init routes
app.use("/api/users/", users);
app.use("/api/auth/", auth);

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
