import styles from './ProgressBar.module.css';

// Colour depends on how much of the budget is used (conditional logic)
export function statusColor(percent) {
  if (percent > 100) return 'var(--bad)';
  if (percent >= 80) return 'var(--warn)';
  return 'var(--good)';
}

/*
 * percent : how full the bar is (0-100+, clamped visually)
 * color   : optional fixed colour, otherwise green / amber / red by status
 * marker  : optional position (in %) of a thin marker line, e.g. projected spend
 */
function ProgressBar({ percent, color, marker, thick = false }) {
  const width = Math.min(100, Math.max(0, percent || 0));
  return (
    <div className={`${styles.track} ${thick ? styles.thick : ''}`}>
      <div className={styles.fill} style={{ width: `${width}%`, background: color || statusColor(percent) }} />
      {marker > 0 && (
        <div className={styles.marker} style={{ left: `calc(${Math.min(100, marker)}% - 1px)` }} title="Projected by month end" />
      )}
    </div>
  );
}

export default ProgressBar;
