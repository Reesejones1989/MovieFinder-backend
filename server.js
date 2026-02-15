const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const userRoutes = require("./controllers/useRoutes");

const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());

app.use(cors()); // allows all origins


// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// ✅ Health Check Route (Helpful for debugging)
app.get("/", (req, res) => {
  res.send("MovieFinder API Running");
});

// ✅ API Routes
app.use("/api", userRoutes);

// ✅ Start Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
