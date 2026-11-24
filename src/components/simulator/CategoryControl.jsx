import { RotateCcw } from 'lucide-react';
import CategoryIcon from '../ui/CategoryIcon';
import { formatINR, formatSignedINR, formatSignedPercent } from '../../utils/format';

const QUICK_ACTIONS = [
  { label: '−20%', apply: (a) => ({ ...a, pct: Math.max(-100, a.pct - 20) }) },
  { label: '+10%', apply: (a) => ({ ...a, pct: Math.min(200, a.pct + 10) }) },
  { label: '×2', apply: () => ({ pct: 100, flat: 0 }) },
  { label: '+₹2,000', apply: (a) => ({ ...a, flat: (Number(a.flat) || 0) + 2000 }) },
  { label: '−₹1,000', apply: (a) => ({ ...a, flat: (Number(a.flat) || 0) - 1000 }) },
];

/*
 * One row of the simulator. It does NOT keep its own state – the adjustment
 * value comes from the parent (Simulator page) via props and every change is
 * sent back up with onChange. This is "lifting state up".
 */
function CategoryControl({ row, adjustment, onChange }) {
  const changed = Number(adjustment.pct) !== 0 || Number(adjustment.flat) !== 0;

  const setPct = (value) => onChange({ ...adjustment, pct: Number(value) });
  // The raw text is stored so that typing "-" or clearing the box works naturally;
  // calculations convert it with Number() (see applyAdjustment).
  const setFlat = (value) => onChange({ ...adjustment, flat: value });

  return (
    <div className={`sim-control ${changed ? 'changed' : ''}`} style={{ '--cat': row.color }}>
      <div className="sim-control-head">
        <CategoryIcon category={row.id} size={34} />
        <div className="sim-control-name">
          <strong>{row.id}</strong>
          <span className="muted small">base {formatINR(row.base)}</span>
        </div>
        <div className="sim-control-result">
          <strong>{formatINR(row.simulated)}</strong>
          <span className={row.diff > 0.5 ? 'up' : row.diff < -0.5 ? 'down' : 'muted'}>
            {Math.abs(row.diff) < 0.5 ? 'no change' : `${formatSignedINR(row.diff)} · ${formatSignedPercent(row.changePct, 0)}`}
          </span>
        </div>
      </div>

      <div className="sim-control-inputs">
        <label className="slider-field">
          <span className="slider-label">
            Change <strong>{adjustment.pct > 0 ? '+' : ''}{adjustment.pct}%</strong>
          </span>
          <input
            type="range"
            className="range cat-range"
            min="-100"
            max="200"
            step="5"
            value={adjustment.pct}
            onChange={(e) => setPct(e.target.value)}
            style={{ '--fill': `${((adjustment.pct + 100) / 300) * 100}%` }}
          />
        </label>
        <label className="flat-field">
          <span className="slider-label">± Amount</span>
          <div className="input-prefix sm">
            <span>₹</span>
            <input type="number" step="500" value={adjustment.flat} onChange={(e) => setFlat(e.target.value)} />
          </div>
        </label>
      </div>

      <div className="chip-row">
        {QUICK_ACTIONS.map((action) => (
          <button key={action.label} type="button" className="chip" onClick={() => onChange(action.apply(adjustment))}>
            {action.label}
          </button>
        ))}
        {changed && (
          <button type="button" className="chip chip-reset" onClick={() => onChange({ pct: 0, flat: 0 })}>
            <RotateCcw size={12} /> Reset
          </button>
        )}
      </div>
    </div>
  );
}

export default CategoryControl;
