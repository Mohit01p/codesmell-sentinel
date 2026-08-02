function RepoCard({ repo, isConnected, connectedRepoId, onActivate, onDeactivate, onViewHistory, activating }) {
  return (
    <div className="repo-card">
      <div className="repo-card__info">
        <span className="repo-card__name">{repo.fullName || repo.repoName}</span>
        {repo.private && <span className="tag tag--muted">private</span>}
      </div>

      {isConnected ? (
        <div className="repo-card__actions">
          <span className="status-dot status-dot--active">active</span>
          <button className="btn btn--ghost" onClick={onViewHistory}>View history</button>
          <button className="btn btn--ghost btn--danger" onClick={() => onDeactivate(connectedRepoId)}>
            Deactivate
          </button>
        </div>
      ) : (
        <button className="btn btn--primary" onClick={() => onActivate(repo)} disabled={activating}>
          {activating ? "Activating…" : "Activate"}
        </button>
      )}
    </div>
  );
}

export default RepoCard;