const mongoose = require("mongoose");
const Joi = require("joi");
const geocoder = require("../utility/geoCoder");

const shopSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please add a name"],
    maxlength: [20, "Name should not be longer than 20 characters"],
    minlength: [4, "Name atleast has 4 characters long"],
    trim: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  address: {
    type: String,
    required: [true, "Please add an address"],
    maxlength: [100, "Address should not be longer than 100 characters"],
  },
  categories: {
    type: [String],
    required: true,
  },
  location: {
    // GEO Json point
    type: {
      type: String,
      enum: ["Point"],
    },
    coordinates: {
      type: [Number],
      index: "2dsphere",
    },

    formattedAddres: String,
    street: String,
    city: String,
    state: String,
    zipcode: String,
    country: String,
  },
  email: {
    type: [String],
    trim: true,
    required: [true, "Please add an email address"],
    unieq: true,
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      "Please add a valid email",
    ],
  },
  phoneNumber: {
    type: [String],
    required: [true, "Please add atleast 1 phone number"],
    trim: true,
  },
  status: {
    type: Boolean,
    default: true,
  },
  photo: {
    type: String,
    default:
      "https://kade-bucket.s3.ap-south-1.amazonaws.com/Default-Images/default-shop.png",
  },
  createdOn: {
    type: Date,
    default: Date.now(),
  },
});

// geocode and create location field
shopSchema.pre("save", async function (next) {
  const loc = await geocoder.geocode(this.address);
  this.location = {
    type: "Point",
    coordinates: [loc[0].longitude, loc[0].latitude],
    formattedAddres: loc[0].formattedAddress,
    city: loc[0].city,
    state: loc[0].stateCode,
    zipcode: loc[0].zipcode,
    country: loc[0].countryCode,
  };

  // do not save address in DB
  this.address = undefined;
  next();
});

shopSchema.pre("update", async function (next) {
  console.log("update process");
});

// creating model
const Shop = mongoose.model("Shop", shopSchema);

// add new shop data validation
const validationShop = (shop) => {
  const schema = Joi.object({
    name: Joi.string().max(20).min(4).required(),
    userId: Joi.objectId().required(),
    /*  email: Joi.string()
      .email({
        minDomainSegments: 2,
        tlds: { allow: ["com", "net"] },
      })
      .required(), */
    address: Joi.string().required(),
    email: Joi.array().items(
      Joi.string().email({
        minDomainSegments: 2,
        tlds: { allow: ["com", "net"] },
      })
    ),
    phoneNumber: Joi.array().items(Joi.string()).required(),
  });
  return schema.validate(shop);
};

module.exports = {
  shopSchema,
  Shop,
  validationShop,
};
