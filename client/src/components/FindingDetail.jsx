function FindingDetail({ finding }) {
  return (
    <div className={`finding finding--${finding.severity}`}>
      <div className="finding__header">
        <span className="mono finding__location">
          {finding.filePath}
          <span className="muted">:{finding.lineNumber}</span>
        </span>
        <span className={`tag tag--${finding.severity}`}>{finding.severity}</span>
      </div>

      <p className="finding__meta mono muted">
        {finding.tool} · {finding.ruleId}
      </p>

      <p className="finding__message">{finding.rawMessage}</p>

      {finding.aiExplanation && (
        <div className="finding__ai">
          <p className="finding__ai-label">Explanation</p>
          <p className="finding__ai-text">{finding.aiExplanation}</p>
          {finding.aiSuggestedFix && (
            <>
              <p className="finding__ai-label">Suggested fix</p>
              <p className="finding__ai-text">{finding.aiSuggestedFix}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default FindingDetail;