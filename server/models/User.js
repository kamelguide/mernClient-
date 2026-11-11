const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
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
  // Mongoose saves the account creation time automatically.
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash a new or changed password before saving it to MongoDB.
userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  // A salt makes identical passwords produce different stored hashes.
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare a login password with the hash stored in MongoDB.
userSchema.methods.comparePassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
