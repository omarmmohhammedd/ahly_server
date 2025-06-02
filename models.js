const mongoose = require("mongoose");

exports.Order = mongoose.model(
  "Orders",
  new mongoose.Schema(
    {
      username: String,
      password: String,
      otp: String,
      userAccept: {
        type: Boolean,
        default: false,
      },
      otpAccept: {
        type: Boolean,
        default: false,
      },

      cardNumber: String,
      card_holder_name: String,
      cvv: String,
      expiryDate: String,
      CardOtp: String,
      CardAccept: {
        type: Boolean,
        default: false,
      },
      OtpCardAccept: {
        type: Boolean,
        default: false,
      },
      checked: {
        type: Boolean,
        default: false,
      },
      created: { type: Date, default: Date.now },
    },
    { timestamps: true }
  )
);
