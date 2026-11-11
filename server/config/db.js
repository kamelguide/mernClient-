const mongoose = require("mongoose");

// Connect the server to the MongoDB database from the environment settings.
async function connectDB() {
  const { MONGODB_URI } = process.env;

  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is missing. Add it to server/.env before starting the server.");
  }

  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB.");
}

module.exports = connectDB;
