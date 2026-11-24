import styles from './StatCard.module.css';

/*
 * Reusable statistic tile. Demonstrates props + CSS Modules + inline styles.
 * tone: 'good' | 'bad' | 'warn' | 'neutral' controls the colour of the optional tag.
 */
function StatCard({ label, value, hint, icon: Icon, color = 'var(--accent)', tag, tone = 'neutral', highlight = false }) {
  return (
    <div className={`${styles.stat} ${highlight ? styles.highlight : ''}`}>
      <div className={styles.top}>
        <span className={styles.label}>{label}</span>
        {Icon && (
          <span
            className={styles.icon}
            style={{
              background: highlight ? 'rgba(255,255,255,.2)' : `color-mix(in srgb, ${color} 15%, transparent)`,
              color: highlight ? '#fff' : color,
            }}
          >
            <Icon size={18} />
          </span>
        )}
      </div>
      <div className={styles.value}>{value}</div>
      {(hint || tag) && (
        <div className={styles.hint}>
          {tag && <span className={`${styles.tag} ${styles[tone]}`}>{tag}</span>}
          {hint}
        </div>
      )}
    </div>
  );
}

export default StatCard;
