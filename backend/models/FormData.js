const mongoose = require("mongoose");

const FormDataSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },

  password: {
    type: String,
    required: true,
  },

  resetOTP: String,
  otpExpiry: Date,
});

module.exports = mongoose.model("log_reg_form", FormDataSchema);
