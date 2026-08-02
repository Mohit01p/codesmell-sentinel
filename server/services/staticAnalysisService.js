const { ESLint } = require("eslint");
const { execFile } = require("child_process");
const { promisify } = require("util");
const fs = require("fs/promises");
const os = require("os");
const path = require("path");

const execFileAsync = promisify(execFile);

async function runESLint(filePath, code) {
  const eslint = new ESLint({
    useEslintrc: false,
    baseConfig: {
      env: { browser: true, node: true, es2021: true },
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
      extends: ["eslint:recommended"],
      rules: {
        "no-unused-vars": "warn",
        "no-undef": "error",
      },
    },
  });

  const results = await eslint.lintText(code, { filePath });

  const findings = [];
  for (const result of results) {
    for (const msg of result.messages) {
      findings.push({
        filePath,
        lineNumber: msg.line,
        tool: "eslint",
        ruleId: msg.ruleId || "unknown",
        severity: msg.severity === 2 ? "high" : "medium",
        rawMessage: msg.message,
      });
    }
  }
  return findings;
}

/**
 * Runs Semgrep against a file's content. Semgrep is a CLI tool that
 * needs an actual file on disk, so we write the code to a temp file
 * first, scan it, then clean up.
 */
async function runSemgrep(filePath, code) {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "semgrep-"));
  const tempFileName = path.basename(filePath);
  const tempFilePath = path.join(tempDir, tempFileName);

  try {
    await fs.writeFile(tempFilePath, code, "utf8");

    const { stdout } = await execFileAsync(
      "semgrep",
      ["--config=auto", "--json", "--quiet", tempFilePath],
      { maxBuffer: 10 * 1024 * 1024 } // 10MB, in case output is large
    );

    const parsed = JSON.parse(stdout);
    const findings = [];

    for (const result of parsed.results || []) {
      findings.push({
        filePath,
        lineNumber: result.start.line,
        tool: "semgrep",
        ruleId: result.check_id,
        severity: mapSemgrepSeverity(result.extra.severity),
        rawMessage: result.extra.message,
      });
    }
    return findings;
  } catch (err) {
    // Semgrep failing shouldn't crash the whole scan - log and continue
    console.error("[staticAnalysisService] Semgrep error:", err.message);
    return [];
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}

function mapSemgrepSeverity(semgrepSeverity) {
  switch (semgrepSeverity) {
    case "ERROR":
      return "critical";
    case "WARNING":
      return "high";
    default:
      return "medium";
  }
}

/**
 * Combines findings from both tools. If both tools flag the exact
 * same line in the exact same file, we keep both (they're catching
 * different things) but this is where you'd add dedup logic if needed.
 */
function mergeFindings(eslintResults, semgrepResults) {
  return [...eslintResults, ...semgrepResults];
}

module.exports = { runESLint, runSemgrep, mergeFindings };