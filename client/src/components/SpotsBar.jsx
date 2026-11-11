export default function SpotsBar({ registered, capacity }) {
  const spotsLeft = Math.max(capacity - registered, 0);
  const percent = Math.min(Math.round((registered / capacity) * 100), 100);

  return (
    <div className="spots">
      <div className="spots-label">
        <span className={spotsLeft === 0 ? "spots-full" : ""}>
          {spotsLeft === 0 ? "Sold out" : `${spotsLeft} spots left`}
        </span>
        <span>
          {registered}/{capacity}
        </span>
      </div>
      <div className="spots-track">
        <div
          className={`spots-fill ${percent >= 80 ? "almost-full" : ""}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
