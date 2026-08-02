import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import RepoCard from "../components/RepoCard";
import { useAuth } from "../context/AuthContext";
import RepoDetail from "./RepoDetail";

function Dashboard() {
  const { user, logout } = useAuth();
  const [availableRepos, setAvailableRepos] = useState([]);
  const [connectedRepos, setConnectedRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activatingId, setActivatingId] = useState(null);
  const [warning, setWarning] = useState(null);
  const [selectedRepo, setSelectedRepo] = useState(null);

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
    <div className="page">
      <header className="topbar">
        <div className="brand">
          <span className="brand__mark" />
          <span className="brand__name">CodeSmell Sentinel</span>
        </div>
        <div className="topbar__user">
          <img className="avatar" src={user.avatarUrl} alt={user.username} />
          <span>{user.username}</span>
          <button className="btn btn--ghost" onClick={logout}>Logout</button>
        </div>
      </header>

      <main className="content">
        {warning && <div className="banner banner--warn">{warning}</div>}

        <div className="section-heading">
          <h1>Repositories</h1>
          <p className="muted">Activate a repo to start scanning its pull requests automatically.</p>
        </div>

        {loading ? (
          <p className="muted">Loading repositories…</p>
        ) : availableRepos.length === 0 ? (
          <div className="empty-state">
            <p className="empty-state__title">No repositories found</p>
            <p className="empty-state__body">Nothing came back from your GitHub account.</p>
          </div>
        ) : (
          <div className="repo-list">
            {availableRepos.map((repo) => (
              <RepoCard
                key={repo.githubRepoId}
                repo={repo}
                isConnected={connectedMap.has(repo.githubRepoId)}
                connectedRepoId={connectedMap.get(repo.githubRepoId)}
                onActivate={handleActivate}
                onDeactivate={handleDeactivate}
                activating={activatingId === repo.githubRepoId}
                onViewHistory={() =>
                  setSelectedRepo(connectedRepos.find((r) => r.githubRepoId === repo.githubRepoId))
                }
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Dashboard;