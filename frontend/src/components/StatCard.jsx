import "./StatCard.css";

function StatCard({ title, value, icon, variant }) {
  return (
    <article className={`stat-card stat-card--${variant}`}>
      <div className="stat-card-icon">{icon}</div>

      <div>
        <p className="stat-card-title">{title}</p>
        <strong className="stat-card-value">{value}</strong>
      </div>
    </article>
  );
}

export default StatCard;