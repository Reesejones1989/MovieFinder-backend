const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const userRoutes = require("./controllers/useRoutes");

const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());

// -----------------------------
// ✅ MongoDB Connection
// -----------------------------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// -----------------------------
// ✅ API Routes (MUST stay BEFORE frontend fallback)
// -----------------------------
app.use("/api", userRoutes);

// -----------------------------
// ✅ Health Check Route
// -----------------------------
app.get("/api", (req, res) => {
  res.send("MovieFinder API Running");
});

// -----------------------------
// ✅ Serve Frontend (Vite build)
// -----------------------------
const clientPath = path.join(__dirname, "dist");

// Serve static files
app.use(express.static(clientPath));

// Catch-all handler for React Router (IMPORTANT)
app.get("*", (req, res) => {
  res.sendFile(path.join(clientPath, "index.html"));
});

// -----------------------------
// ✅ Start Server
// -----------------------------
const PORT = process.env.PORT || 5001;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);