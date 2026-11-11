const express = require("express");
const mongoose = require("mongoose");
const Event = require("../models/Event");
const Feedback = require("../models/Feedback");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// List feedback for one event and include each reviewer's name.
router.get("/events/:id/feedbacks", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Event ID is invalid." });
  }

  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found." });
    }

    const feedbacks = await Feedback.find({ event: event._id })
      .populate("author", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json(feedbacks);
  } catch (error) {
    console.error("Could not load feedback:", error);
    return res.status(500).json({ message: "Could not load feedback." });
  }
});

// Add feedback to an existing event using the signed-in member as its author.
router.post("/events/:id/feedbacks", protect, async (req, res) => {
  const { text, rating } = req.body;
  const numericRating = Number(rating);

  if (
    !mongoose.isValidObjectId(req.params.id) ||
    typeof text !== "string" ||
    !text.trim() ||
    !Number.isFinite(numericRating) ||
    numericRating < 1 ||
    numericRating > 5
  ) {
    return res.status(400).json({ message: "Please provide a valid event ID, text, and rating from 1 to 5." });
  }

  if (!mongoose.isValidObjectId(req.user.id)) {
    return res.status(401).json({ message: "Authorization token contains an invalid user." });
  }

  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found." });
    }

    if (new Date(event.date) > new Date()) {
      return res.status(400).json({ message: "You can review this event after it takes place." });
    }

    const existingFeedback = await Feedback.findOne({ event: event._id, author: req.user.id });

    if (existingFeedback) {
      return res.status(400).json({ message: "You have already reviewed this event." });
    }

    const feedback = await Feedback.create({
      text: text.trim(),
      rating: numericRating,
      event: event._id,
      author: req.user.id,
    });

    await feedback.populate("author", "name");
    return res.status(201).json(feedback);
  } catch (error) {
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({ message: "Please provide valid feedback details." });
    }

    console.error("Could not create feedback:", error);
    return res.status(500).json({ message: "Could not create feedback." });
  }
});

// Delete feedback only when the signed-in member wrote it.
router.delete("/feedbacks/:id", protect, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Feedback ID is invalid." });
  }

  try {
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found." });
    }

    if (feedback.author.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only delete your own feedback." });
    }

    await feedback.deleteOne();
    return res.status(200).json({ message: "Feedback deleted." });
  } catch (error) {
    console.error("Could not delete feedback:", error);
    return res.status(500).json({ message: "Could not delete feedback." });
  }
});

module.exports = router;
