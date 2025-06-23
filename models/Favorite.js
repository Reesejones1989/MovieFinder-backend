const mongoose = require("mongoose");

const FavoriteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  favorites: [
    {
      movieId: String,
      title: String,
    }
  ],
});

module.exports = mongoose.model("Favorite", FavoriteSchema);
