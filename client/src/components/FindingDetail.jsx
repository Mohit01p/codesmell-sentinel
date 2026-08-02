const severityColor = {
  critical: "#f87171",
  high: "#fb923c",
  medium: "#facc15",
  low: "#94a3b8",
};

function FindingDetail({ finding }) {
  const color = severityColor[finding.severity] || "#94a3b8";

  return (
    <div
      style={{
        border: `1px solid ${color}`,
        borderRadius: "8px",
        padding: "1rem",
        marginBottom: "1rem",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <strong>
          {finding.filePath}:{finding.lineNumber}
        </strong>
        <span style={{ color, fontWeight: "bold", textTransform: "uppercase", fontSize: "0.75rem" }}>
          {finding.severity}
        </span>
      </div>

      <p style={{ color: "#94a3b8", fontSize: "0.85rem", marginTop: "0.25rem" }}>
        {finding.tool} · {finding.ruleId}
      </p>

      <p style={{ marginTop: "0.5rem" }}>{finding.rawMessage}</p>

      {finding.aiExplanation && (
        <div style={{ marginTop: "0.75rem", background: "#1e293b", padding: "0.75rem", borderRadius: "6px" }}>
          <strong>Explanation:</strong>
          <p style={{ margin: "0.25rem 0" }}>{finding.aiExplanation}</p>
          {finding.aiSuggestedFix && (
            <>
              <strong>Suggested fix:</strong>
              <p style={{ margin: "0.25rem 0" }}>{finding.aiSuggestedFix}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default FindingDetail;