const NodeGeocoder = require("node-geocoder");

const options = {
  provider: process.env.GEOCODER_PROVIDER,
  httpAdapter: "https",
  //apiKey: process.env.GOOGLE_GEO_API_KEY,
  apiKey: "AIzaSyD-NNHViyXqhtlsYQRjCR49rv2xmFO1Tc8",
  formatter: null,
};

const geocoder = NodeGeocoder(options);

module.exports = geocoder;
