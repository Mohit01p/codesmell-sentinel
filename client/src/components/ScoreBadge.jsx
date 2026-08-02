function ScoreBadge({ score }) {
  let tier = "score--good";
  if (score < 50) tier = "score--bad";
  else if (score < 80) tier = "score--warn";

  return (
    <span className={`score ${tier}`}>
      <span className="score__value">{score}</span>
      <span className="score__max">/100</span>
    </span>
  );
}

export default ScoreBadge;