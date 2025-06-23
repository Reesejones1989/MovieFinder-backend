const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Favorite = require("../models/Favorite");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

const SECRET = process.env.JWT_SECRET;

// ✅ Signup Route
router.post("/signup", async (req, res) => {
  const { username, password } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      username,
      password: hashedPassword,
    });

    await user.save();
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Login Route
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, SECRET, { expiresIn: "7d" });
    res.json({ token, username: user.username });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Get User's Favorites
router.get("/favorites", authMiddleware, async (req, res) => {
  try {
    const favorites = await Favorite.find({ userId: req.user.id });
    res.status(200).json({ favorites });
  } catch (error) {
    res.status(500).json({ message: "Error fetching favorites", error });
  }
});

// ✅ Add to Favorites
router.post("/favorites", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { movieId, title } = req.body;
    console.log(`Adding movie: ${movieId}, title: ${title}`);

    let favorite = await Favorite.findOne({ userId: req.user.id });
    if (!favorite) {
      const newFavorite = new Favorite({
        userId: req.user.id,
        favorites: [{ movieId, title }],
      });
      await newFavorite.save();
      return res.status(200).json({
        message: "Added to favorites",
        favorites: newFavorite.favorites,
      });
    }

    const exists = favorite.favorites.find((fav) => fav.movieId === movieId);
    if (exists) {
      return res.status(400).json({ message: "Already in favorites" });
    }

    favorite.favorites.push({ movieId, title });
    await favorite.save();

    res.status(200).json({
      message: "Added to favorites",
      favorites: favorite.favorites,
    });
  } catch (error) {
    console.error("Error adding favorite:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Remove from Favorites
router.delete("/favorites/:id", authMiddleware, async (req, res) => {
  try {
    const favorite = await Favorite.findOne({ userId: req.user.id });
    if (!favorite) return res.status(404).json({ message: "Favorites not found" });

    favorite.favorites = favorite.favorites.filter(
      (fav) => fav.movieId !== req.params.id
    );

    await favorite.save();
    res.json({ message: "Removed from favorites", favorites: favorite.favorites });
  } catch (error) {
    console.error("Error removing favorite:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
