export function StatCard({ label, value, hint, tone = 'neutral' }) {
  return (
    <article className={`stat stat--${tone}`}>
      <p className="stat__label">{label}</p>
      <p className="stat__value">{value}</p>
      {hint ? <p className="stat__hint">{hint}</p> : null}
    </article>
  );
}
