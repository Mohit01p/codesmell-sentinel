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
    return <ScanDetail scanId={selectedScanId} onBack={() => setSelectedScanId(null)} />;
  }

  return (
    <div className="page">
      <main className="content">
        <button className="btn btn--ghost btn--back" onClick={onBack}>← Back to repositories</button>

        <div className="section-heading">
          <h1 className="mono">{repo.repoName}</h1>
          <p className="muted">Scan history</p>
        </div>

        {loading ? (
          <p className="muted">Loading scans…</p>
        ) : (
          <ScanHistoryTable scans={scans} onSelectScan={setSelectedScanId} />
        )}
      </main>
    </div>
  );
}

export default RepoDetail;