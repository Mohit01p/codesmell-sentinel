const severityEmoji = {
  critical: "🔴",
  high: "🟠",
  medium: "🟡",
  low: "⚪",
};

/**
 * Turns a list of findings into a single readable Markdown comment.
 */
function formatFindingsComment(findings, score) {
  if (findings.length === 0) {
    return `## 🛡️ CodeSmell Sentinel Review\n\n✅ No issues found on the changed lines. Nice work!`;
  }

  let comment = `## 🛡️ CodeSmell Sentinel Review\n\n`;
  comment += `**Score: ${score}/100** — ${findings.length} issue(s) found\n\n---\n\n`;

  for (const f of findings) {
    const emoji = severityEmoji[f.severity] || "⚪";
    comment += `### ${emoji} ${f.filePath}:${f.lineNumber}\n`;
    comment += `**Tool:** \`${f.tool}\` · **Rule:** \`${f.ruleId}\` · **Severity:** ${f.severity}\n\n`;
    comment += `**Issue:** ${f.rawMessage}\n\n`;
    if (f.aiExplanation) {
      comment += `**Explanation:** ${f.aiExplanation}\n\n`;
    }
    if (f.aiSuggestedFix) {
      comment += `**Suggested fix:** ${f.aiSuggestedFix}\n\n`;
    }
    comment += `---\n\n`;
  }

  comment += `_Powered by CodeSmell Sentinel — ESLint + Semgrep + Gemini AI_`;
  return comment;
}

module.exports = { formatFindingsComment };