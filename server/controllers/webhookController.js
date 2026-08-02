const { verifyGithubSignature } = require("../services/webhookVerifier");
const githubConfig = require("../config/github");
const githubService = require("../services/githubService");
const { runESLint, runSemgrep, mergeFindings } = require("../services/staticAnalysisService");
const { explainFinding } = require("../services/aiService");
const { getChangedLineNumbers } = require("../utils/diffParser");
const Repo = require("../models/Repo");
const User = require("../models/User");
const { postPRComment } = require("../services/githubService");
const { formatFindingsComment } = require("../utils/commentFormatter");
const { calculateOverallScore, saveScanResults } = require("./scanController");
const JS_EXTENSIONS = [".js", ".jsx", ".ts", ".tsx"];

function isJsFile(filename) {
  return JS_EXTENSIONS.some((ext) => filename.endsWith(ext));
}

async function handlePullRequestEvent(req, res) {
  const signature = req.headers["x-hub-signature-256"];
  const isValid = verifyGithubSignature(
    req.rawBody,
    signature,
    githubConfig.webhookSecret
  );

  if (!isValid) {
    console.warn("[webhook] Invalid signature - rejecting request");
    return res.status(401).json({ success: false, message: "Invalid signature" });
  }

  const event = req.headers["x-github-event"];
  const payload = req.body;

  console.log(`[webhook] Received GitHub event: ${event}`);
  res.status(200).json({ success: true });

  if (event !== "pull_request") return;

  const action = payload.action;
  if (action !== "opened" && action !== "synchronize") return;

  const prNumber = payload.pull_request.number;
  const repoFullName = payload.repository.full_name;
  const [owner, repoName] = repoFullName.split("/");

  console.log(`[webhook] PR #${prNumber} on ${repoFullName} -> action: ${action}`);

  try {
    const repoDoc = await Repo.findOne({ repoName: repoFullName, isActive: true });
    if (!repoDoc) {
      console.log(`[webhook] Repo ${repoFullName} is not activated in our app - skipping`);
      return;
    }

    const user = await User.findById(repoDoc.owner);
    let files = await githubService.fetchPRFiles(user.accessToken, owner, repoName, prNumber);

    const MAX_FILES_TO_SCAN = 25;
    let truncated = false;
    if (files.length > MAX_FILES_TO_SCAN) {
      truncated = true;
      files = files.slice(0, MAX_FILES_TO_SCAN);
      console.log(
        `[webhook] PR has more than ${MAX_FILES_TO_SCAN} files - only scanning the first ${MAX_FILES_TO_SCAN}`
      );
    }

    console.log(`[webhook] Fetched ${files.length} changed file(s)`);

    const allFindings = [];

    for (const file of files) {
      if (file.status === "removed") continue;
      if (!isJsFile(file.filename)) {
        console.log(`  - ${file.filename}: skipped (not a JS/TS file)`);
        continue;
      }

      const changedLines = getChangedLineNumbers(file.patch);

      const content = await githubService.fetchFileRawContent(
        user.accessToken,
        file.raw_url
      );

      const [eslintFindings, semgrepFindings] = await Promise.all([
        runESLint(file.filename, content),
        runSemgrep(file.filename, content),
      ]);
      const findings = mergeFindings(eslintFindings, semgrepFindings);
      const relevantFindings = findings.filter((f) =>
        changedLines.includes(f.lineNumber)
      );

      console.log(
        `  - ${file.filename}: ${findings.length} ESLint finding(s) total, ${relevantFindings.length} on changed lines`
      );
      relevantFindings.forEach((f) =>
        console.log(`      Line ${f.lineNumber} [${f.severity}] ${f.ruleId}: ${f.rawMessage}`)
      );

      allFindings.push(...relevantFindings);
    }

    console.log(`[webhook] Total relevant findings: ${allFindings.length}`);

    if (allFindings.length > 0) {
      console.log("[webhook] Getting AI explanations from Gemini...");

      for (const finding of allFindings) {
        const { explanation, suggestedFix } = await explainFinding(
          "", // Day 9 will pass the real code snippet around this line
          finding
        );
        finding.aiExplanation = explanation || "(AI explanation unavailable)";
        finding.aiSuggestedFix = suggestedFix || "(No suggestion available)";

        console.log(`  - ${finding.filePath}:${finding.lineNumber}`);
        console.log(`      Explanation: ${finding.aiExplanation}`);
        console.log(`      Fix: ${finding.aiSuggestedFix}`);
      }
    }

const score = calculateOverallScore(allFindings);
   const commentBody =
      formatFindingsComment(allFindings, score) +
      (truncated
        ? `\n\n⚠️ _This PR changed more than ${MAX_FILES_TO_SCAN} files — only the first ${MAX_FILES_TO_SCAN} were scanned._`
        : "");

    await postPRComment(user.accessToken, owner, repoName, prNumber, commentBody);

    console.log(`[webhook] Posted review comment on PR #${prNumber} (score: ${score}/100)`);

    await saveScanResults({
      repoId: repoDoc._id,
      prNumber,
      prTitle: payload.pull_request.title,
      prAuthor: payload.pull_request.user.login,
      findings: allFindings,
      score,
    });

    console.log(`[webhook] Scan saved to database`);
  } catch (err) {
    console.error("[webhook] Error during analysis:", err.message);
  }
}

module.exports = { handlePullRequestEvent };