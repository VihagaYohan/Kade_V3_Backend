const bcrypt = require("bcryptjs");

const dataEncrypt = async (value) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(value, salt);
};

module.exports = dataEncrypt;
