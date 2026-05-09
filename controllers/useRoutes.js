const express = require("express");
const axios = require("axios");
const Favorite = require("../models/Favorite");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

// ✅ CORS
const cors = require("cors");
router.use(cors({
  origin: [
    "http://localhost:5173",
    "https://moviefinderonline.netlify.app",
    "https://moviefinder-fl61.onrender.com"
  ],
  credentials: true,
}));

// ✅ Helper: Convert IMDb → TMDb ID
async function getTMDBId(imdbID) {
  const res = await axios.get(
    `https://api.themoviedb.org/3/find/${imdbID}`,
    {
      params: {
        api_key: process.env.TMDB_API_KEY,
        external_source: "imdb_id",
      },
    }
  );

  return res.data.tv_results?.[0]?.id || null;
}

// ✅ Get Movie (VidSrc + Title + Year)
router.get("/movies/:id", async (req, res) => {
  try {
    const { id } = req.params;

if (!id || id === "undefined" || id === "null") {
  return res.status(400).json({
    message: "Invalid IMDb ID",
  });
}
    
    const TMDB_KEY = process.env.TMDB_API_KEY;

    if (!TMDB_KEY) {
      return res.status(500).json({ message: "TMDB_API_KEY missing" });
    }

    // 🔥 STEP 1: Convert IMDb → TMDb
    const findRes = await axios.get(
      `https://api.themoviedb.org/3/find/${id}`,
      {
        params: {
          api_key: TMDB_KEY,
          external_source: "imdb_id",
        },
      }
    );

    const movie = findRes.data.movie_results?.[0];

    if (!movie) {
      return res.status(404).json({ message: "Movie not found in TMDB" });
    }

    const tmdbId = movie.id;

    // 🔥 STEP 2: Get full movie details
    const movieRes = await axios.get(
      `https://api.themoviedb.org/3/movie/${tmdbId}`,
      {
        params: { api_key: TMDB_KEY },
      }
    );

    const movieData = movieRes.data;

    // 🔥 STEP 3: Return everything frontend needs
    res.status(200).json({
      movieId: id,
      Title: movieData.title,
      Year: movieData.release_date?.split("-")[0],
      vidSrc: `https://vsembed.ru/embed/movie/${id}`,
    });

  } catch (error) {
    console.error("MOVIE ERROR:", error.response?.data || error.message);

    res.status(500).json({
      message: "Error fetching movie",
      error: error.response?.data || error.message,
    });
  }
});

// ✅ Get TV Show Info (TMDb)
router.get("/tv/:id/info", async (req, res) => {
  try {
const { id } = req.params;

if (!id || id === "undefined" || id === "null") {
  return res.status(400).json({
    message: "Invalid IMDb ID",
  });
}    const { season } = req.query;

    //const TMDB_KEY = process.env.TMDB_API_KEY;
    const TMDB_KEY = process.env.TMDB_API_KEY

    if (!TMDB_KEY) {
      return res.status(500).json({ message: "TMDB_API_KEY missing" });
    }

    // ✅ STEP 1: Convert IMDb → TMDB
    const findRes = await axios.get(
      `https://api.themoviedb.org/3/find/${id}`,
      {
        params: {
          api_key: TMDB_KEY,
          external_source: "imdb_id",
        },
      }
    );

    const show = findRes.data.tv_results[0];

    if (!show) {
      return res.status(404).json({ message: "Show not found in TMDB" });
    }

    const tmdbId = show.id;

    // ✅ STEP 2: If season requested → get episodes
    if (season) {
      const seasonRes = await axios.get(
        `https://api.themoviedb.org/3/tv/${tmdbId}/season/${season}`,
        {
          params: { api_key: TMDB_KEY },
        }
      );

      return res.json({
        season: seasonRes.data.season_number,
        episodes: seasonRes.data.episodes,
      });
    }

    // ✅ STEP 3: Get show details
    const showRes = await axios.get(
      `https://api.themoviedb.org/3/tv/${tmdbId}`,
      {
        params: { api_key: TMDB_KEY },
      }
    );

    res.json({
      id: tmdbId,
      Title: showRes.data.name,
      Year: showRes.data.first_air_date?.split("-")[0],
      totalSeasons: showRes.data.number_of_seasons,
    });

  } catch (error) {
    console.error("TMDB ERROR:", error.response?.data || error.message);

    res.status(500).json({
      message: "Error fetching show info",
      error: error.response?.data || error.message,
    });
  }
});

// ✅ Get TV Episode (VidSrc playback)
router.get("/tv/:id", async (req, res) => {
  try {
const { id } = req.params;

if (!id || id === "undefined" || id === "null") {
  return res.status(400).json({
    message: "Invalid IMDb ID",
  });
}    const { season, episode } = req.query;

    if (!season || !episode) {
      return res.status(400).json({
        message: "Season and episode required",
      });
    }

    res.status(200).json({
      showId: id,
      season,
      episode,
      vidSrc: `https://vsembed.ru/embed/tv/${id}/${season}/${episode}`,
    });

  } catch (error) {
    res.status(500).json({
      message: "Error fetching TV episode",
      error,
    });
  }
});

// ✅ Favorites (UNCHANGED)
router.get("/favorites", authMiddleware, async (req, res) => {
  try {
    const favorite = await Favorite.findOne({ userId: req.user.uid });
    res.status(200).json(favorite?.favorites || []);
  } catch (error) {
    res.status(500).json({ message: "Error fetching favorites", error });
  }
});

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
      return res.status(200).json({
        message: "Added to favorites",
        favorites: favorite.favorites,
      });
    }

    const exists = favorite.favorites.some(
      (fav) => fav.movieId === movieId
    );

    if (exists) {
      return res.status(400).json({
        message: "Already in favorites",
      });
    }

    favorite.favorites.push({ movieId, title, vidSrc, levidia });
    await favorite.save();

    res.status(200).json({
      message: "Added to favorites",
      favorites: favorite.favorites,
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

router.delete("/favorites/:id", authMiddleware, async (req, res) => {
  try {
    const favorite = await Favorite.findOne({ userId: req.user.uid });

    if (!favorite) {
      return res.status(404).json({
        message: "Favorites not found",
      });
    }

    favorite.favorites = favorite.favorites.filter(
      (fav) => fav.movieId !== req.params.id
    );

    await favorite.save();

    res.json({
      message: "Removed from favorites",
      favorites: favorite.favorites,
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

module.exports = router;