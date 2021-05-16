const NodeGeocoder = require("node-geocoder");
const config = require('config')


const options = {
  provider: process.env.GEOCODER_PROVIDER,
  httpAdapter: "https",
  //apiKey: process.env.GOOGLE_GEO_API_KEY,
  apiKey: config.get("GEO_API"),
  formatter: null,
};

const geocoder = NodeGeocoder(options);

module.exports = geocoder;
