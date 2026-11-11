const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  bibNumber: {
    type: Number,
    required: true,
  },
  tshirtSize: {
    type: String,
    enum: ["XS", "S", "M", "L", "XL", "XXL"],
    default: "M",
  },
  category: {
    type: String,
    enum: ["men", "women"],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

registrationSchema.index({ event: 1, user: 1 }, { unique: true });

module.exports = mongoose.model("Registration", registrationSchema);
