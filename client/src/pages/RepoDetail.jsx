import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import ScanHistoryTable from "../components/ScanHistoryTable";
import ScanDetail from "./ScanDetail";

function RepoDetail({ repo, onBack }) {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedScanId, setSelectedScanId] = useState(null);

  useEffect(() => {
    axiosInstance
      .get(`/scans/${repo._id}`)
      .then((res) => setScans(res.data.scans))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [repo._id]);

  if (selectedScanId) {
    return (
      <ScanDetail scanId={selectedScanId} onBack={() => setSelectedScanId(null)} />
    );
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <button onClick={onBack} style={{ marginBottom: "1rem" }}>
        ← Back to Dashboard
      </button>
      <h1>{repo.repoName}</h1>
      <h2>Scan History</h2>
      {loading ? (
        <p>Loading scans...</p>
      ) : (
        <ScanHistoryTable scans={scans} onSelectScan={setSelectedScanId} />
      )}
    </div>
  );
}

export default RepoDetail;