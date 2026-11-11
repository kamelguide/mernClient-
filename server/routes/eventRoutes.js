const express = require("express");
const mongoose = require("mongoose");
const Event = require("../models/Event");
const Feedback = require("../models/Feedback");
const Registration = require("../models/Registration");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

const EVENT_TYPES = ["training", "marathon", "trail", "10K"];

async function addStats(events) {
  const ids = events.map((event) => event._id);

  const ratings = await Feedback.aggregate([
    { $match: { event: { $in: ids } } },
    { $group: { _id: "$event", average: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);

  const registrations = await Registration.aggregate([
    { $match: { event: { $in: ids } } },
    { $group: { _id: "$event", count: { $sum: 1 } } },
  ]);

  return events.map((event) => {
    const rating = ratings.find((item) => item._id.toString() === event._id.toString());
    const registration = registrations.find(
      (item) => item._id.toString() === event._id.toString(),
    );

    return {
      ...event.toObject(),
      averageRating: rating ? Number(rating.average.toFixed(1)) : null,
      feedbackCount: rating ? rating.count : 0,
      registeredCount: registration ? registration.count : 0,
    };
  });
}

// List events publicly and include each creator's name.
router.get("/", async (req, res) => {
  try {
    const events = await Event.find().populate("author", "name").sort({ date: 1 });
    return res.status(200).json(await addStats(events));
  } catch (error) {
    console.error("Could not load events:", error);
    return res.status(500).json({ message: "Could not load events." });
  }
});

router.get("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Event ID is invalid." });
  }

  try {
    const event = await Event.findById(req.params.id).populate("author", "name");

    if (!event) {
      return res.status(404).json({ message: "Event not found." });
    }

    const [eventWithStats] = await addStats([event]);
    return res.status(200).json(eventWithStats);
  } catch (error) {
    console.error("Could not load event:", error);
    return res.status(500).json({ message: "Could not load event." });
  }
});

// Create an event for the member identified by the verified token.
router.post("/", protect, async (req, res) => {
  const { title, type, date, location, distanceKm, description, capacity, imageUrl } = req.body;
  const numericCapacity = capacity === undefined || capacity === "" ? 50 : Number(capacity);

  if (
    typeof title !== "string" ||
    !title.trim() ||
    typeof type !== "string" ||
    !EVENT_TYPES.includes(type) ||
    !date ||
    typeof location !== "string" ||
    !location.trim() ||
    distanceKm === undefined ||
    distanceKm === null ||
    distanceKm === "" ||
    !Number.isFinite(Number(distanceKm)) ||
    Number(distanceKm) < 0 ||
    (description !== undefined && typeof description !== "string") ||
    (imageUrl !== undefined && typeof imageUrl !== "string") ||
    !Number.isInteger(numericCapacity) ||
    numericCapacity < 1
  ) {
    return res.status(400).json({ message: "Please provide valid event details." });
  }

  if (!mongoose.isValidObjectId(req.user.id)) {
    return res.status(401).json({ message: "Authorization token contains an invalid user." });
  }

  try {
    const event = await Event.create({
      title: title.trim(),
      type,
      date,
      location: location.trim(),
      distanceKm: Number(distanceKm),
      description: description ? description.trim() : "",
      capacity: numericCapacity,
      imageUrl: imageUrl ? imageUrl.trim() : "",
      author: req.user.id,
    });

    await event.populate("author", "name");
    const [eventWithStats] = await addStats([event]);
    return res.status(201).json(eventWithStats);
  } catch (error) {
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({ message: "Please provide valid event details." });
    }

    console.error("Could not create event:", error);
    return res.status(500).json({ message: "Could not create event." });
  }
});

// Delete an event only when the signed-in member created it.
router.delete("/:id", protect, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Event ID is invalid." });
  }

  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found." });
    }

    if (event.author.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only delete your own events." });
    }

    // Remove feedback that belongs to this event so it does not become orphaned.
    await Feedback.deleteMany({ event: event._id });
    await Registration.deleteMany({ event: event._id });
    await event.deleteOne();

    return res.status(200).json({ message: "Event and its feedback were deleted." });
  } catch (error) {
    console.error("Could not delete event:", error);
    return res.status(500).json({ message: "Could not delete event." });
  }
});

module.exports = router;
