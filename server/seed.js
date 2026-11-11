const dotenv = require("dotenv");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const User = require("./models/User");
const Event = require("./models/Event");
const Feedback = require("./models/Feedback");
const Registration = require("./models/Registration");

dotenv.config();

const image = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1400&q=80`;

const daysFromNow = (days, hour = 7) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, 0, 0, 0);
  return date;
};

const users = [
  { name: "Demo Runner", email: "demo@runclub.tn", category: "men" },
  { name: "Aya Ben Amor", email: "aya@runclub.tn", category: "women" },
  { name: "Youssef Trabelsi", email: "youssef@runclub.tn", category: "men" },
  { name: "Sarra Mejri", email: "sarra@runclub.tn", category: "women" },
  { name: "Mehdi Gharbi", email: "mehdi@runclub.tn", category: "men" },
  { name: "Ines Haddad", email: "ines@runclub.tn", category: "women" },
  { name: "Karim Jaziri", email: "karim@runclub.tn", category: "men" },
  { name: "Nour Ben Salah", email: "nour@runclub.tn", category: "women" },
  { name: "Amine Chaabane", email: "amine@runclub.tn", category: "men" },
  { name: "Lina Ounaies", email: "lina@runclub.tn", category: "women" },
];

const events = [
  {
    title: "Sunrise Run Lac de Tunis",
    type: "training",
    days: 4,
    location: "Les Berges du Lac, Tunis",
    distanceKm: 8,
    capacity: 40,
    author: 0,
    imageUrl: image("photo-1552674605-db6ffd4facb5"),
    description:
      "An easy group run around the lake at sunrise. Three pace groups (5:00, 5:45 and 6:30 min/km), coffee together at the finish.",
  },
  {
    title: "Sousse Marina Intervals",
    type: "training",
    days: 7,
    location: "Port El Kantaoui, Sousse",
    distanceKm: 6,
    capacity: 25,
    author: 2,
    imageUrl: image("photo-1571008887538-b36bb32f4571"),
    description:
      "Speed session with coach Youssef: warm-up, 8 x 400 m along the marina, cool-down. Perfect to prepare your next 10K.",
  },
  {
    title: "Carthage 10K by Night",
    type: "10K",
    days: 11,
    location: "Carthage Hannibal, Tunis",
    distanceKm: 10,
    capacity: 120,
    author: 1,
    imageUrl: image("photo-1513593771513-7b58b6c4af38"),
    description:
      "A night race past the Roman ruins of Carthage. Headlamps recommended, finisher medal and live music at the finish line.",
  },
  {
    title: "Sidi Bou Said Coastal 10K",
    type: "10K",
    days: 18,
    location: "Sidi Bou Said, Tunis",
    distanceKm: 10,
    capacity: 80,
    author: 0,
    imageUrl: image("photo-1452626038306-9aae5e071dd3"),
    description:
      "Blue doors, white walls and a sea view: a rolling 10K through the most beautiful village of Tunisia.",
  },
  {
    title: "Ain Draham Forest Trail",
    type: "trail",
    days: 25,
    location: "Ain Draham, Jendouba",
    distanceKm: 24,
    capacity: 60,
    author: 2,
    imageUrl: image("photo-1473448912268-2022ce9509d8"),
    description:
      "24 km and 900 m of elevation under the cork oaks of the Kroumirie mountains. Two refreshment points, mandatory water bottle.",
  },
  {
    title: "Hammamet Beach Half Marathon",
    type: "marathon",
    days: 39,
    location: "Yasmine Hammamet, Nabeul",
    distanceKm: 21.1,
    capacity: 150,
    author: 1,
    imageUrl: image("photo-1594882645126-14020914d58d"),
    description:
      "A flat and fast half marathon along the Mediterranean coast. Pacers for 1h30, 1h45 and 2h00.",
  },
  {
    title: "Tozeur Oasis Trail",
    type: "trail",
    days: 52,
    location: "Tozeur",
    distanceKm: 32,
    capacity: 70,
    author: 2,
    imageUrl: image("photo-1502904550040-7534597429ae"),
    description:
      "Run between palm groves, canyons and dunes at the gates of the Sahara. A unique desert adventure.",
  },
  {
    title: "Djerba Island Marathon",
    type: "marathon",
    days: 80,
    location: "Houmt Souk, Djerba",
    distanceKm: 42.2,
    capacity: 200,
    author: 0,
    imageUrl: image("photo-1461896836934-ffe607ba8211"),
    description:
      "The full 42.2 km around the island of Djerba. Club bus from Tunis, hotel discount for members.",
  },
  {
    title: "Bizerte Corniche 10K",
    type: "10K",
    days: -20,
    location: "Corniche de Bizerte",
    distanceKm: 10,
    capacity: 90,
    author: 1,
    imageUrl: image("photo-1486218119243-13883505764c"),
    description: "Our autumn 10K along the Bizerte seafront, finishing at the old port.",
  },
  {
    title: "Zaghouan Mountain Trail",
    type: "trail",
    days: -45,
    location: "Jebel Zaghouan, Zaghouan",
    distanceKm: 18,
    capacity: 50,
    author: 2,
    imageUrl: image("photo-1532444458054-01a7dd3e9fca"),
    description: "Climb to the Temple des Eaux and run the ridge of Jebel Zaghouan.",
  },
  {
    title: "Monastir Ribat Long Run",
    type: "training",
    days: -60,
    location: "Ribat de Monastir",
    distanceKm: 15,
    capacity: 30,
    author: 0,
    imageUrl: image("photo-1476480862126-209bfaa8edc8"),
    description: "Sunday long run from the Ribat to Skanes beach and back, at conversation pace.",
  },
  {
    title: "Sfax Marathon Classic",
    type: "marathon",
    days: -120,
    location: "Sfax",
    distanceKm: 42.2,
    capacity: 180,
    author: 1,
    imageUrl: image("photo-1544717305-2782549b5136"),
    description: "The club travelled together to the Sfax marathon: 23 members finished!",
  },
];

const reviews = [
  { text: "Amazing organisation, the route was beautiful and well marked.", rating: 5 },
  { text: "Great atmosphere and very friendly volunteers. I will come back!", rating: 5 },
  { text: "Nice event, but the refreshment point came a bit late.", rating: 4 },
  { text: "Hard course but worth it. The view at the top was incredible.", rating: 5 },
  { text: "Good pacing groups, I beat my personal record.", rating: 4 },
  { text: "Started 20 minutes late, otherwise a lovely morning.", rating: 3 },
];

const sizes = ["S", "M", "L", "XL", "M", "S"];

async function seed() {
  await connectDB();

  const emails = users.map((user) => user.email);
  const oldUsers = await User.find({ email: { $in: emails } });
  const oldUserIds = oldUsers.map((user) => user._id);
  const oldEvents = await Event.find({ author: { $in: oldUserIds } });
  const oldEventIds = oldEvents.map((event) => event._id);

  await Feedback.deleteMany({ $or: [{ author: { $in: oldUserIds } }, { event: { $in: oldEventIds } }] });
  await Registration.deleteMany({
    $or: [{ user: { $in: oldUserIds } }, { event: { $in: oldEventIds } }],
  });
  await Event.deleteMany({ _id: { $in: oldEventIds } });
  await User.deleteMany({ _id: { $in: oldUserIds } });

  const createdUsers = [];
  for (const user of users) {
    createdUsers.push(await User.create({ name: user.name, email: user.email, password: "123456" }));
  }

  let registrationTotal = 0;
  let feedbackTotal = 0;

  for (const [index, data] of events.entries()) {
    const event = await Event.create({
      title: data.title,
      type: data.type,
      date: daysFromNow(data.days, data.type === "10K" && data.days === 11 ? 20 : 7),
      location: data.location,
      distanceKm: data.distanceKm,
      capacity: data.capacity,
      description: data.description,
      imageUrl: data.imageUrl,
      author: createdUsers[data.author]._id,
    });

    const runnerCount = Math.min(3 + ((index * 3) % 8), createdUsers.length, data.capacity);
    const runners = createdUsers
      .map((user, userIndex) => ({ user, userIndex }))
      .filter(({ userIndex }) => userIndex !== 0 || [0, 2, 5, 8].includes(index))
      .slice(0, runnerCount);

    for (const [position, { user, userIndex }] of runners.entries()) {
      await Registration.create({
        event: event._id,
        user: user._id,
        bibNumber: position + 1,
        tshirtSize: sizes[userIndex % sizes.length],
        category: users[userIndex].category,
      });
      registrationTotal += 1;
    }

    if (data.days < 0) {
      const reviewers = runners.slice(0, 2 + (index % 3));
      for (const [position, { user }] of reviewers.entries()) {
        const review = reviews[(index + position) % reviews.length];
        await Feedback.create({
          text: review.text,
          rating: review.rating,
          event: event._id,
          author: user._id,
          createdAt: daysFromNow(data.days + 1 + position),
        });
        feedbackTotal += 1;
      }
    }
  }

  console.log(
    `Seed done: ${createdUsers.length} users, ${events.length} events, ${registrationTotal} registrations, ${feedbackTotal} reviews.`,
  );
  console.log("Demo account: demo@runclub.tn / 123456");
}

seed()
  .catch((error) => {
    console.error("Seed failed:", error.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
