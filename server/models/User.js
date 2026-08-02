const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    githubId: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    // Store this encrypted in a real deployment (Day 2 note).
    accessToken: { type: String, required: true },
    avatarUrl: { type: String },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: false } }
);

module.exports = mongoose.model("User", userSchema);
