import { formatINR } from '../../utils/format';

/*
 * Custom tooltip used by every chart so they all look the same.
 * Recharts passes { active, payload, label } as props.
 */
function ChartTooltip({ active, payload, label, labelFormatter, hideZero = true }) {
  if (!active || !payload || payload.length === 0) return null;
  const rows = payload.filter((p) => p.value !== null && (!hideZero || p.value !== 0));
  if (rows.length === 0) return null;
  const title = labelFormatter ? labelFormatter(label, payload) : label;

  return (
    <div className="chart-tooltip">
      {title && <div className="chart-tooltip-title">{title}</div>}
      {rows.map((p) => (
        <div key={p.dataKey ?? p.name} className="chart-tooltip-row">
          <span className="dot" style={{ background: p.color || p.payload?.color || p.fill }} />
          <span className="name">{p.name}</span>
          <strong>{formatINR(p.value)}</strong>
        </div>
      ))}
    </div>
  );
}

export default ChartTooltip;
