function RepoCard({ repo, isConnected, connectedRepoId, onActivate, onDeactivate, onViewHistory, activating }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "1rem",
        border: "1px solid #334155",
        borderRadius: "8px",
        marginBottom: "0.75rem",
      }}
    >
      <div>
        <strong>{repo.fullName || repo.repoName}</strong>
        {repo.private && (
          <span style={{ marginLeft: "0.5rem", fontSize: "0.75rem", color: "#94a3b8" }}>
            (private)
          </span>
        )}
      </div>

      {isConnected ? (
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span style={{ color: "#4ade80", fontSize: "0.9rem" }}>✓ Activated</span>
          <button onClick={onViewHistory}>View History</button>
          <button onClick={() => onDeactivate(connectedRepoId)}>Deactivate</button>
        </div>
      ) : (
        <button onClick={() => onActivate(repo)} disabled={activating}>
          {activating ? "Activating..." : "Activate"}
        </button>
      )}
    </div>
  );
}

export default RepoCard;