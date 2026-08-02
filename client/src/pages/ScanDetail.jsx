import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import FindingDetail from "../components/FindingDetail";
import ScoreBadge from "../components/ScoreBadge";

function ScanDetail({ scanId, onBack }) {
  const [scan, setScan] = useState(null);
  const [findings, setFindings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance
      .get(`/scans/detail/${scanId}`)
      .then((res) => {
        setScan(res.data.scan);
        setFindings(res.data.findings);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [scanId]);

  if (loading) return <div className="page"><main className="content"><p className="muted">Loading scan…</p></main></div>;
  if (!scan) return <div className="page"><main className="content"><p className="muted">Scan not found.</p></main></div>;

  return (
    <div className="page">
      <main className="content">
        <button className="btn btn--ghost btn--back" onClick={onBack}>← Back to scan history</button>

        <div className="scan-summary">
          <div>
            <h1>PR #{scan.prNumber} — {scan.prTitle}</h1>
            <p className="muted">by {scan.prAuthor} · {scan.totalFindings} finding(s)</p>
          </div>
          <ScoreBadge score={scan.overallScore} />
        </div>

        <h2 className="section-subheading">Findings</h2>
        {findings.length === 0 ? (
          <div className="empty-state empty-state--success">
            <p className="empty-state__title">No issues found</p>
            <p className="empty-state__body">Nothing flagged on the changed lines.</p>
          </div>
        ) : (
          findings.map((f) => <FindingDetail key={f._id} finding={f} />)
        )}
      </main>
    </div>
  );
}

export default ScanDetail;