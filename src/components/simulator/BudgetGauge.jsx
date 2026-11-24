import { statusColor } from '../ui/ProgressBar';
import { formatPercent } from '../../utils/format';

/*
 * Semicircle gauge drawn with SVG. The coloured arc length is controlled by
 * strokeDasharray, so it animates with a CSS transition when percent changes.
 * The faint second arc shows the baseline for comparison.
 */
function BudgetGauge({ percent, basePercent, label = 'of budget' }) {
  const radius = 80;
  const arc = Math.PI * radius; // length of half a circle
  const clamp = (p) => Math.min(100, Math.max(0, p || 0));
  const fill = (clamp(percent) / 100) * arc;
  const baseFill = (clamp(basePercent) / 100) * arc;

  return (
    <div className="gauge">
      <svg viewBox="0 0 200 112" role="img" aria-label={`${formatPercent(percent)} ${label}`}>
        <path d="M 20 100 A 80 80 0 0 1 180 100" className="gauge-track" />
        {basePercent !== undefined && (
          <path d="M 20 100 A 80 80 0 0 1 180 100" className="gauge-base" style={{ strokeDasharray: `${baseFill} ${arc}` }} />
        )}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          className="gauge-fill"
          style={{ strokeDasharray: `${fill} ${arc}`, stroke: statusColor(percent) }}
        />
      </svg>
      <div className="gauge-center">
        <strong style={{ color: statusColor(percent) }}>{formatPercent(percent)}</strong>
        <span>{label}</span>
      </div>
    </div>
  );
}

export default BudgetGauge;
