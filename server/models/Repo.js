const mongoose = require("mongoose");

const repoSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    repoName: { type: String, required: true }, // e.g. "username/project"
    githubRepoId: { type: String, required: true },
    webhookId: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: false } }
);

module.exports = mongoose.model("Repo", repoSchema);
