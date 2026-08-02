const mongoose = require("mongoose");

/**
 * Connects to MongoDB Atlas using the URI in process.env.MONGO_URI.
 * Call this once from server.js on startup.
 */
async function connectDB() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error(
      "[db] MONGO_URI is not set. Copy .env.example to .env and fill it in."
    );
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log(`[db] MongoDB connected: ${mongoose.connection.host}`);
  } catch (err) {
    console.error("[db] MongoDB connection failed:", err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
