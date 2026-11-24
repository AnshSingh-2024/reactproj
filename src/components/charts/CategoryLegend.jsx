import { formatINR, formatPercent } from '../../utils/format';

// List legend next to donut charts: colour dot, name, amount and share
function CategoryLegend({ rows, limit }) {
  const visible = rows.filter((r) => r.amount > 0).slice(0, limit ?? rows.length);
  if (visible.length === 0) return <p className="muted small">No spending recorded yet.</p>;

  return (
    <ul className="legend-list">
      {visible.map((row) => (
        <li key={row.category}>
          <span className="legend-dot" style={{ background: row.color }} />
          <span className="legend-name">{row.category}</span>
          <span className="legend-pct">{formatPercent(row.percent, 1)}</span>
          <span className="legend-amt">{formatINR(row.amount)}</span>
        </li>
      ))}
    </ul>
  );
}

export default CategoryLegend;
