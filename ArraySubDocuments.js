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

const authorSchema = new mongoose.Schema({
  name: String,
  bio: String,
  website: String,
});

const Author = mongoose.model("Author", authorSchema);

const Course = mongoose.model(
  "Course",
  new mongoose.Schema({
    name: String,
    authors: {
      type: [authorSchema],
      required: true,
    },
  })
);

// update course author name
async function updateCourse(courseId) {
  const course = await Course.findById({ _id: courseId });
  course.author.name = "Mosh Hamedani";
  course.save();

  console.log(course);
}

//updateCourse("609d5b88373f05059c3cffdb");

// create course
async function createCourse(name, authors) {
  course = new Course({
    name,
    authors,
  });
  course = await course.save();
  console.log(course);
}

createCourse("React-Native course", [new Author({ name: "Mosh" }), new Author({name:"Josh"})]);

// remove author
async function removeAuthor (courseId,authorId){
  const course = await Course.findById(courseId);
  const author = course.authors.id(authorId)
  author.remove();
  course.save();
}



// list courses
async function listCourse() {
  const courses = await Course.find().select("name").populate("author", "name");
  console.log(courses);
}

//listCourse();

const PORT = 8000;

// listen to server port
app.listen(PORT, () => {
  console.log(
    `Server is running on ${process.env.NODE_ENV} mode on port ${process.env.PORT}`
      .yellow.bold
  );
});
