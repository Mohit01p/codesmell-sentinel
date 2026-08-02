import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import FindingDetail from "../components/FindingDetail";

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

  if (loading) return <p style={{ padding: "2rem" }}>Loading scan...</p>;
  if (!scan) return <p style={{ padding: "2rem" }}>Scan not found.</p>;

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <button onClick={onBack} style={{ marginBottom: "1rem" }}>
        ← Back to Scan History
      </button>
      <h1>
        PR #{scan.prNumber} — {scan.prTitle}
      </h1>
      <p style={{ color: "#94a3b8" }}>
        by {scan.prAuthor} · Score: {scan.overallScore}/100 · {scan.totalFindings} finding(s)
      </p>

      <h2 style={{ marginTop: "1.5rem" }}>Findings</h2>
      {findings.length === 0 ? (
        <p>No issues found on the changed lines. ✅</p>
      ) : (
        findings.map((f) => <FindingDetail key={f._id} finding={f} />)
      )}
    </div>
  );
}

export default ScanDetail;