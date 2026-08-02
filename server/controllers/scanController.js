const Scan = require("../models/Scan");
const Finding = require("../models/Finding");

const severityWeight = {
  critical: 15,
  high: 8,
  medium: 4,
  low: 1,
};

function calculateOverallScore(findings) {
  const totalPenalty = findings.reduce(
    (sum, f) => sum + (severityWeight[f.severity] || 0),
    0
  );
  return Math.max(0, 100 - totalPenalty);
}

/**
 * Saves a completed scan + all its findings to MongoDB.
 */
async function saveScanResults({ repoId, prNumber, prTitle, prAuthor, findings, score }) {
  const scan = await Scan.create({
    repo: repoId,
    prNumber,
    prTitle,
    prAuthor,
    status: "completed",
    overallScore: score,
    totalFindings: findings.length,
  });

  if (findings.length > 0) {
    const findingDocs = findings.map((f) => ({ ...f, scan: scan._id }));
    await Finding.insertMany(findingDocs);
  }

  return scan;
}

// GET /api/scans/:repoId — scan history for a repo
async function getScanHistory(req, res, next) {
  try {
    const scans = await Scan.find({ repo: req.params.repoId }).sort({ createdAt: -1 });
    res.json({ success: true, scans });
  } catch (err) {
    next(err);
  }
}

// GET /api/scans/detail/:scanId — one scan + its findings
async function getScanDetail(req, res, next) {
  try {
    const scan = await Scan.findById(req.params.scanId);
    if (!scan) {
      return res.status(404).json({ success: false, message: "Scan not found" });
    }
    const findings = await Finding.find({ scan: scan._id });
    res.json({ success: true, scan, findings });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  calculateOverallScore,
  saveScanResults,
  getScanHistory,
  getScanDetail,
};