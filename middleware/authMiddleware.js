const admin = require("../controllers/firebase");
const User = require("../models/User");

async function authenticateFirebaseToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing or invalid token" });
  }

  const idToken = authHeader.split("Bearer ")[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, email } = decodedToken;

    // Check if user exists in MongoDB
    let user = await User.findOne({ firebaseUid: uid });
    if (!user) {
      user = await User.create({
        firebaseUid: uid,
        username: email || uid, // fallback if no email
      });
    }

    req.user = {
      id: user._id,        // MongoDB user ID
      uid: uid,            // Firebase UID
      email: email || "",  // Email if available
    };

    next();
  } catch (error) {
    console.error("Firebase Auth error:", error);
    return res.status(401).json({ message: "Unauthorized", error });
  }
}

module.exports = authenticateFirebaseToken;
