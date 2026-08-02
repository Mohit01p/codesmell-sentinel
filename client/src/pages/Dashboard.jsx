import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import RepoCard from "../components/RepoCard";
import { useAuth } from "../context/AuthContext";
import RepoDetail from "./RepoDetail";

function Dashboard() {
  const { user, logout } = useAuth();
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [availableRepos, setAvailableRepos] = useState([]);
  const [connectedRepos, setConnectedRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activatingId, setActivatingId] = useState(null);
  const [warning, setWarning] = useState(null);

  async function loadData() {
    setLoading(true);
    try {
      const [availableRes, connectedRes] = await Promise.all([
        axiosInstance.get("/repos/available"),
        axiosInstance.get("/repos"),
      ]);
      setAvailableRepos(availableRes.data.repos);
      setConnectedRepos(connectedRes.data.repos);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleActivate(repo) {
    setActivatingId(repo.githubRepoId);
    setWarning(null);
    try {
      const res = await axiosInstance.post("/repos/activate", {
        repoFullName: repo.fullName,
        githubRepoId: repo.githubRepoId,
      });
      if (res.data.warning) setWarning(res.data.warning);
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setActivatingId(null);
    }
  }

  async function handleDeactivate(repoId) {
    try {
      await axiosInstance.delete(`/repos/${repoId}`);
      await loadData();
    } catch (err) {
      console.error(err);
    }
  }

 const connectedMap = new Map(connectedRepos.map((r) => [r.githubRepoId, r._id]));

  if (selectedRepo) {
    return <RepoDetail repo={selectedRepo} onBack={() => setSelectedRepo(null)} />;
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "700px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>CodeSmell Sentinel</h1>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <img src={user.avatarUrl} alt={user.username} style={{ width: 32, borderRadius: "50%" }} />
          <span>{user.username}</span>
          <button onClick={logout}>Logout</button>
        </div>
      </div>

      {warning && (
        <p style={{ background: "#78350f", color: "#fde68a", padding: "0.75rem", borderRadius: "6px" }}>
          ⚠️ {warning}
        </p>
      )}

      <h2 style={{ marginTop: "2rem" }}>Your Repositories</h2>
      {loading ? (
        <p>Loading repos...</p>
      ) : availableRepos.length === 0 ? (
        <p>No repositories found on your GitHub account.</p>
      ) : (
        availableRepos.map((repo) => (
          <RepoCard
            key={repo.githubRepoId}
            repo={repo}
            isConnected={connectedMap.has(repo.githubRepoId)}
            connectedRepoId={connectedMap.get(repo.githubRepoId)}
            onActivate={handleActivate}
            onDeactivate={handleDeactivate}
            activating={activatingId === repo.githubRepoId}
            onViewHistory={() =>
              setSelectedRepo(
                connectedRepos.find((r) => r.githubRepoId === repo.githubRepoId)
              )
            }
          />
        ))
      )}
    </div>
  );
}

export default Dashboard;