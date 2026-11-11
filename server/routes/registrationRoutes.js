const express = require("express");
const mongoose = require("mongoose");
const Event = require("../models/Event");
const Registration = require("../models/Registration");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/events/:id/registrations", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Event ID is invalid." });
  }

  try {
    const registrations = await Registration.find({ event: req.params.id })
      .populate("user", "name")
      .sort({ bibNumber: 1 });

    return res.status(200).json(registrations);
  } catch (error) {
    console.error("Could not load registrations:", error);
    return res.status(500).json({ message: "Could not load registrations." });
  }
});

router.post("/events/:id/registrations", protect, async (req, res) => {
  const { tshirtSize, category } = req.body;

  if (
    !mongoose.isValidObjectId(req.params.id) ||
    !["men", "women"].includes(category) ||
    (tshirtSize !== undefined && !["XS", "S", "M", "L", "XL", "XXL"].includes(tshirtSize))
  ) {
    return res.status(400).json({ message: "Please choose a valid category and T-shirt size." });
  }

  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found." });
    }

    if (new Date(event.date) < new Date()) {
      return res.status(400).json({ message: "Registrations are closed for this event." });
    }

    const alreadyRegistered = await Registration.findOne({ event: event._id, user: req.user.id });

    if (alreadyRegistered) {
      return res.status(400).json({ message: "You are already registered for this event." });
    }

    const count = await Registration.countDocuments({ event: event._id });

    if (count >= event.capacity) {
      return res.status(400).json({ message: "This event is sold out." });
    }

    const lastRegistration = await Registration.findOne({ event: event._id }).sort({
      bibNumber: -1,
    });

    const registration = await Registration.create({
      event: event._id,
      user: req.user.id,
      bibNumber: lastRegistration ? lastRegistration.bibNumber + 1 : 1,
      tshirtSize: tshirtSize || "M",
      category,
    });

    await registration.populate("user", "name");
    return res.status(201).json(registration);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "You are already registered for this event." });
    }

    console.error("Could not create registration:", error);
    return res.status(500).json({ message: "Could not create registration." });
  }
});

router.delete("/events/:id/registrations", protect, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Event ID is invalid." });
  }

  try {
    const registration = await Registration.findOne({ event: req.params.id, user: req.user.id });

    if (!registration) {
      return res.status(404).json({ message: "You are not registered for this event." });
    }

    await registration.deleteOne();
    return res.status(200).json({ message: "Registration cancelled." });
  } catch (error) {
    console.error("Could not cancel registration:", error);
    return res.status(500).json({ message: "Could not cancel registration." });
  }
});

router.get("/registrations/me", protect, async (req, res) => {
  try {
    const registrations = await Registration.find({ user: req.user.id })
      .populate("event")
      .sort({ createdAt: -1 });

    return res.status(200).json(registrations.filter((registration) => registration.event));
  } catch (error) {
    console.error("Could not load your registrations:", error);
    return res.status(500).json({ message: "Could not load your registrations." });
  }
});

module.exports = router;
