const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// Remove the password before sending account information to the client.
function getPublicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
  };
}

// Create an account and return a token so the new member is signed in.
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (
    typeof name !== "string" ||
    !name.trim() ||
    typeof email !== "string" ||
    !email.trim() ||
    typeof password !== "string" ||
    !password
  ) {
    return res.status(400).json({ message: "Name, email, and password are required." });
  }

  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is not configured.");
    return res.status(500).json({ message: "Server authentication is not configured." });
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(400).json({ message: "An account with this email already exists." });
    }

    // The User model hashes this password in its pre-save hook.
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
    });

    const publicUser = getPublicUser(user);
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "24h" });

    return res.status(201).json({ user: publicUser, token });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "An account with this email already exists." });
    }

    console.error("Could not register user:", error);
    return res.status(500).json({ message: "Could not register user." });
  }
});

// Check a password and return a signed token for the existing member.
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (typeof email !== "string" || !email.trim() || typeof password !== "string" || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is not configured.");
    return res.status(500).json({ message: "Server authentication is not configured." });
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Email or password is incorrect." });
    }

    const publicUser = getPublicUser(user);
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "24h" });

    return res.status(200).json({ user: publicUser, token });
  } catch (error) {
    console.error("Could not log in user:", error);
    return res.status(500).json({ message: "Could not log in user." });
  }
});

module.exports = router;
