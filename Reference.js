const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const colors = require("colors");

// import DB connection
const connectDB = require("./config/db");

const app = express();

// JSON body pharser
app.use(express.json());

// load env vars
dotenv.config({ path: "./config/config.env" });

// connect to DB
connectDB();

const Author = mongoose.model(
  "Author",
  new mongoose.Schema({
    name: String,
    bio: String,
    website: String,
  })
);

const Course = mongoose.model(
  "Course",
  new mongoose.Schema({
    name: String,
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Author",
    },
  })
);

async function createAuthor(name, bio, website) {
  let author = new Author({
    name,
    bio,
    website,
  });
  author = await author.save();
  console.log(author);
}

async function createCourse(name,author){
    let course = new Course({
        name, 
        author
    })
    course = await course.save()
    console.log(course)
}

//createAuthor("Brad Traversy", "Developer", "http://traversymedia.com");

//createCourse("React-Native course", "609cc2f73d008b04b08dd1db");

async function listCourse(){
  const courses = await Course.find().select('name').populate('author','name')
  console.log(courses)
}

listCourse()

const PORT = 8000;

// listen to server port
app.listen(PORT, () => {
  console.log(
    `Server is running on ${process.env.NODE_ENV} mode on port ${process.env.PORT}`
      .yellow.bold
  );
});
