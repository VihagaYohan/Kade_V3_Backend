// upload image
const s3Obj = require("./aws");
const config = require("config");

var imageURL = "null";
var imageKey = "null";

const uploadSingleImage = (file, fileName) => {
  const params = {
    Bucket: config.get("AWS_BUCKET_NAME"),
    Key: fileName,
    Body: file.data,
    ACL: "public-read",
  };

  s3Obj.upload(params, async (error, data) => {
    if (error) {
      console.log(error);
    } else {
      imageURL = data.Location;
      imageKey = data.Key;
    }
  });

  return {
    imgUrl: imageURL,
    imgKey: imageKey,
  };
};

const uploadMultipleImage = () => {};

exports.UploadSingleImage = uploadSingleImage;
exports.UploadMultipleImage = uploadMultipleImage;
