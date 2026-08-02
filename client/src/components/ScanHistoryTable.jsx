import ScoreBadge from "./ScoreBadge";

function ScanHistoryTable({ scans, onSelectScan }) {
  if (scans.length === 0) {
    return (
      <div className="empty-state">
        <p className="empty-state__title">No scans yet</p>
        <p className="empty-state__body">Open a pull request on this repo to trigger a scan.</p>
      </div>
    );
  }

  return (
    <table className="table">
      <thead>
        <tr>
          <th>Pull request</th>
          <th>Author</th>
          <th>Score</th>
          <th>Findings</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        {scans.map((scan) => (
          <tr key={scan._id} onClick={() => onSelectScan(scan._id)} className="table__row--clickable">
            <td>
              <span className="mono muted">#{scan.prNumber}</span> {scan.prTitle}
            </td>
            <td>{scan.prAuthor}</td>
            <td><ScoreBadge score={scan.overallScore} /></td>
            <td className="mono">{scan.totalFindings}</td>
            <td className="muted">{new Date(scan.createdAt).toLocaleDateString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default ScanHistoryTable;