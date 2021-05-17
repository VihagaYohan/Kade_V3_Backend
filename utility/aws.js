// utility to get access to AWS s3 bucket for image upload process
const AWS = require("aws-sdk");
const config = require("config");

// get access AWS-S3 bucket
const S3obj = new AWS.S3({
  accessKeyId: config.get("AWS_ID"),
  secretAccessKey: config.get("AWS_SECRET"),
});

module.exports = S3obj;
