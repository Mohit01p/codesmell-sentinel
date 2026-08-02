function ScanHistoryTable({ scans, onSelectScan }) {
  if (scans.length === 0) {
    return <p style={{ color: "#94a3b8" }}>No scans yet. Open a PR on this repo to trigger one.</p>;
  }

  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr style={{ borderBottom: "1px solid #334155", textAlign: "left" }}>
          <th style={{ padding: "0.5rem" }}>PR</th>
          <th style={{ padding: "0.5rem" }}>Author</th>
          <th style={{ padding: "0.5rem" }}>Score</th>
          <th style={{ padding: "0.5rem" }}>Findings</th>
          <th style={{ padding: "0.5rem" }}>Date</th>
        </tr>
      </thead>
      <tbody>
        {scans.map((scan) => (
          <tr
            key={scan._id}
            onClick={() => onSelectScan(scan._id)}
            style={{ borderBottom: "1px solid #1e293b", cursor: "pointer" }}
          >
            <td style={{ padding: "0.5rem" }}>
              #{scan.prNumber} {scan.prTitle}
            </td>
            <td style={{ padding: "0.5rem" }}>{scan.prAuthor}</td>
            <td style={{ padding: "0.5rem" }}>
              <ScoreBadgeInline score={scan.overallScore} />
            </td>
            <td style={{ padding: "0.5rem" }}>{scan.totalFindings}</td>
            <td style={{ padding: "0.5rem" }}>
              {new Date(scan.createdAt).toLocaleDateString()}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ScoreBadgeInline({ score }) {
  let color = "#4ade80";
  if (score < 50) color = "#f87171";
  else if (score < 80) color = "#facc15";

  return (
    <span
      style={{
        color,
        fontWeight: "bold",
        border: `1px solid ${color}`,
        borderRadius: "4px",
        padding: "0.15rem 0.5rem",
      }}
    >
      {score}/100
    </span>
  );
}

export default ScanHistoryTable;