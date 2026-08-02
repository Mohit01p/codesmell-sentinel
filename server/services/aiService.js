const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
/**
 * Builds the prompt sent to Gemini for a single finding.
 */
function buildPrompt(codeSnippet, rawFinding) {
  return `You are a senior code reviewer. A static analysis tool found this issue:

Tool: ${rawFinding.tool}
Rule: ${rawFinding.ruleId}
Severity: ${rawFinding.severity}
Message: ${rawFinding.rawMessage}
File: ${rawFinding.filePath}, Line: ${rawFinding.lineNumber}

Relevant code:
\`\`\`
${codeSnippet}
\`\`\`

Respond in EXACTLY this format (no extra text, no markdown headers):
EXPLANATION: <one or two plain-English sentences explaining why this is a problem, for a junior developer>
FIX: <a specific, actionable suggested fix, 1-3 sentences>`;
}

/**
 * Calls Gemini and returns { explanation, suggestedFix }.
 * If the API fails or rate-limits, we fall back gracefully instead
 * of crashing the whole scan (see Section 12 of the docs).
 */
async function explainFinding(codeSnippet, rawFinding) {
  try {
    const prompt = buildPrompt(codeSnippet, rawFinding);
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const explanationMatch = text.match(/EXPLANATION:\s*(.+?)(?=\nFIX:|$)/s);
    const fixMatch = text.match(/FIX:\s*(.+)/s);

    return {
      explanation: explanationMatch ? explanationMatch[1].trim() : text.trim(),
      suggestedFix: fixMatch ? fixMatch[1].trim() : "No specific fix suggested.",
    };
  } catch (err) {
    console.error("[aiService] Gemini call failed:", err.message);
    return {
      explanation: null,
      suggestedFix: null,
    };
  }
}

module.exports = { explainFinding, buildPrompt };