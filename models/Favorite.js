const mongoose = require("mongoose");

const favoriteSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  favorites: [
    {
      movieId: String,
      title: String,
      vidSrc: String,
      levidia: String,
    },
  ],
});

module.exports = mongoose.model("Favorite", favoriteSchema);
