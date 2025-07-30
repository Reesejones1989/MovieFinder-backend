const express = require("express");
const Favorite = require("../models/Favorite");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

// ✅ Get User's Favorites
router.get("/favorites", authMiddleware, async (req, res) => {
  try {
    const favorite = await Favorite.findOne({ userId: req.user.uid });
    res.status(200).json(favorite?.favorites || []);
  } catch (error) {
    res.status(500).json({ message: "Error fetching favorites", error });
  }
});

// ✅ Add to Favorites
router.post("/favorites", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { movieId, title, vidSrc, levidia } = req.body;

    let favorite = await Favorite.findOne({ userId });
    if (!favorite) {
      favorite = new Favorite({
        userId,
        favorites: [{ movieId, title, vidSrc, levidia }],
      });
      await favorite.save();
      return res.status(200).json({ message: "Added to favorites", favorites: favorite.favorites });
    }

    const exists = favorite.favorites.some((fav) => fav.movieId === movieId);
    if (exists) return res.status(400).json({ message: "Already in favorites" });

    favorite.favorites.push({ movieId, title, vidSrc, levidia });
    await favorite.save();

    res.status(200).json({ message: "Added to favorites", favorites: favorite.favorites });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// ✅ Remove from Favorites
router.delete("/favorites/:id", authMiddleware, async (req, res) => {
  try {
    const favorite = await Favorite.findOne({ userId: req.user.uid });
    if (!favorite) return res.status(404).json({ message: "Favorites not found" });

    favorite.favorites = favorite.favorites.filter((fav) => fav.movieId !== req.params.id);
    await favorite.save();

    res.json({ message: "Removed from favorites", favorites: favorite.favorites });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

module.exports = router;
