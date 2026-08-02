const mongoose = require("mongoose");

const findingSchema = new mongoose.Schema({
  scan: { type: mongoose.Schema.Types.ObjectId, ref: "Scan", required: true },
  filePath: { type: String, required: true },
  lineNumber: { type: Number },
  tool: { type: String, enum: ["eslint", "semgrep"], required: true },
  ruleId: { type: String },
  severity: {
    type: String,
    enum: ["low", "medium", "high", "critical"],
    required: true,
  },
  rawMessage: { type: String },
  aiExplanation: { type: String },
  aiSuggestedFix: { type: String },
});

module.exports = mongoose.model("Finding", findingSchema);
