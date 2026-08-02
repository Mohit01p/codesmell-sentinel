const mongoose = require("mongoose");

const scanSchema = new mongoose.Schema(
  {
    repo: { type: mongoose.Schema.Types.ObjectId, ref: "Repo", required: true },
    prNumber: { type: Number, required: true },
    prTitle: { type: String },
    prAuthor: { type: String },
    status: {
      type: String,
      enum: ["pending", "running", "completed", "failed"],
      default: "pending",
    },
    overallScore: { type: Number, min: 0, max: 100 },
    totalFindings: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: false } }
);

module.exports = mongoose.model("Scan", scanSchema);
