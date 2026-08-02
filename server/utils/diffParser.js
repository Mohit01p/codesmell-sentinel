/**
 * Parses a GitHub "patch" string (unified diff format) and returns
 * the list of NEW line numbers that were added/changed in this PR.
 *
 * We only want to report issues on lines the developer actually
 * touched - not pre-existing code they didn't write.
 *
 * Example patch snippet:
 *   @@ -10,6 +10,8 @@ function foo() {
 *   +  const x = 1;
 *   +  console.log(x);
 */
function getChangedLineNumbers(patch) {
  if (!patch) return [];

  const changedLines = [];
  const lines = patch.split("\n");

  // This tracks the current line number in the NEW version of the file
  let currentNewLine = 0;

  for (const line of lines) {
    // Hunk header, e.g. "@@ -10,6 +10,8 @@ function foo() {"
    const hunkMatch = line.match(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
    if (hunkMatch) {
      currentNewLine = parseInt(hunkMatch[1], 10);
      continue;
    }

    if (line.startsWith("+") && !line.startsWith("+++")) {
      // This is a newly added/changed line
      changedLines.push(currentNewLine);
      currentNewLine++;
    } else if (line.startsWith("-") && !line.startsWith("---")) {
      // Removed line - doesn't exist in the new file, don't advance
      continue;
    } else {
      // Unchanged context line - still advances the new-file line counter
      currentNewLine++;
    }
  }

  return changedLines;
}

module.exports = { getChangedLineNumbers };