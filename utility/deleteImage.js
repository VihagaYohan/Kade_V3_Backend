// delete image from AWS - S3 bucket
const s3Obj = require("./aws");
const config = require("config");

const deleteImage = async (imageKey) => {
  try {
    const params = {
      Bucket: config.get("AWS_BUCKET_NAME"),
      Key: imageKey,
    };

    s3Obj.deleteObject(params, function (err, data) {
      if (err) {
        console.log("Error :" + err);
        return false;
      } else {
        console.log(`${imageKey} has been deleted`);
        return true;
      }
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = deleteImage;
