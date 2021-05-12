const mongoose = require("mongoose");

const connectDB = async () => {
  const conn = await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  });

  console.log(conn.connection.host.cyan.underline);
  console.log(conn.connection.port)
  console.log(
    `MongoDB connected : ${conn.Connection.host}`.cyan.underline.bold
  );
};

module.exports = connectDB;
