import { useState, useEffect } from 'react';
import { Save, RotateCcw, Wand2, AlertTriangle, CheckCircle2, Database, Trash2 } from 'lucide-react';

import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import ProgressBar from '../components/ui/ProgressBar';
import CategoryIcon from '../components/ui/CategoryIcon';
import { monthSummary, categoryBudgetRows, forecast } from '../utils/calculations';
import { formatINR, formatPercent } from '../utils/format';

const STATUS_TEXT = {
  safe: 'On track',
  warning: 'Approaching limit',
  over: 'Exceeded',
  none: 'No budget',
};

function Budgets({ transactions, budget, onSave, onResetData, onClearData }) {
  // Local "draft" copy so the user can edit freely and save when ready
  const [draft, setDraft] = useState(budget);

  // If the saved budget changes (e.g. after restoring sample data), refresh the draft
  useEffect(() => {
    setDraft(budget);
  }, [budget]);

  const today = new Date();
  const total = Number(draft.total) || 0;
  const summary = monthSummary(transactions, total, today);
  const rows = categoryBudgetRows(transactions, draft.categories, today);
  const allocated = rows.reduce((sum, r) => sum + r.budget, 0);
  const hasChanges = JSON.stringify(draft) !== JSON.stringify(budget);
  const overCount = rows.filter((r) => r.status === 'over').length;
  const warnCount = rows.filter((r) => r.status === 'warning').length;

  const setTotal = (value) => setDraft((prev) => ({ ...prev, total: value }));
  const setCategory = (id, value) => setDraft((prev) => ({ ...prev, categories: { ...prev.categories, [id]: value } }));

  // Suggest budgets from the historical monthly average, rounded up to ₹500
  const autoFill = () => {
    const fc = forecast(transactions, total, today);
    const categories = {};
    fc.categoryAverages.forEach((row) => {
      categories[row.id] = Math.max(500, Math.ceil((row.monthlyAvg * 1.05) / 500) * 500);
    });
    const sum = Object.values(categories).reduce((a, b) => a + b, 0);
    setDraft({ total: Math.max(total, sum), categories });
  };

  const handleSave = (event) => {
    event.preventDefault();
    const clean = { total: Math.max(0, Number(draft.total) || 0), categories: {} };
    Object.entries(draft.categories).forEach(([id, value]) => (clean.categories[id] = Math.max(0, Number(value) || 0)));
    setDraft(clean);
    onSave(clean);
  };

  return (
    <form onSubmit={handleSave}>
      <PageHeader title="Budgets" description="Set a monthly limit and per-category budgets. Changes apply to the current month.">
        <button type="button" className="btn btn-ghost" onClick={autoFill}>
          <Wand2 size={16} /> Suggest from history
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => setDraft(budget)} disabled={!hasChanges}>
          <RotateCcw size={16} /> Discard
        </button>
        <button type="submit" className="btn btn-primary" disabled={!hasChanges}>
          <Save size={16} /> Save budgets
        </button>
      </PageHeader>

      <div className="grid-2-1">
        <Card title="Overall monthly budget">
          <div className="budget-hero">
            <div className="field big-input">
              <label htmlFor="total-budget">Monthly limit</label>
              <div className="input-prefix lg">
                <span>₹</span>
                <input id="total-budget" type="number" min="0" step="500" value={draft.total} onChange={(e) => setTotal(e.target.value)} />
              </div>
              <input
                type="range"
                className="range"
                min="5000"
                max="150000"
                step="500"
                value={Math.min(150000, total)}
                onChange={(e) => setTotal(Number(e.target.value))}
                aria-label="Monthly budget slider"
              />
            </div>
            <div className="budget-hero-stats">
              <div>
                <span>Spent</span>
                <strong>{formatINR(summary.spent)}</strong>
              </div>
              <div>
                <span>Remaining</span>
                <strong className={summary.remaining < 0 ? 'neg' : 'pos'}>{formatINR(summary.remaining)}</strong>
              </div>
              <div>
                <span>Projected</span>
                <strong>{formatINR(summary.projected)}</strong>
              </div>
            </div>
          </div>
          <ProgressBar percent={summary.utilization} marker={summary.projectedUtilization} thick />
          <div className="progress-caption">
            <span>{formatPercent(summary.utilization)} used</span>
            <span>Marker = projected month-end ({formatPercent(summary.projectedUtilization)})</span>
          </div>
        </Card>

        <Card title="Health check">
          <ul className="health-list">
            <li className={overCount ? 'bad' : 'good'}>
              {overCount ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
              {overCount ? `${overCount} ${overCount === 1 ? 'category has' : 'categories have'} exceeded the budget` : 'No category over budget'}
            </li>
            <li className={warnCount ? 'warn' : 'good'}>
              {warnCount ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
              {warnCount ? `${warnCount} approaching the limit (80%+)` : 'Nothing close to its limit'}
            </li>
            <li className={allocated > total ? 'warn' : 'good'}>
              {allocated > total ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
              Allocated {formatINR(allocated)} of {formatINR(total)}
              {allocated > total ? ' — categories exceed overall budget' : ` (${formatINR(total - allocated)} unallocated)`}
            </li>
          </ul>
          {hasChanges && <p className="unsaved">You have unsaved changes.</p>}
        </Card>
      </div>

      <h2 className="section-title">Category budgets</h2>
      <div className="budget-grid">
        {rows.map((row) => (
          <div key={row.id} className={`budget-card status-${row.status}`}>
            <div className="budget-card-head">
              <CategoryIcon category={row.id} />
              <div>
                <strong>{row.id}</strong>
                <span className={`status-text ${row.status}`}>{STATUS_TEXT[row.status]}</span>
              </div>
              <div className="input-prefix sm">
                <span>₹</span>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={draft.categories[row.id]}
                  onChange={(e) => setCategory(row.id, e.target.value)}
                  aria-label={`${row.id} budget`}
                />
              </div>
            </div>
            <ProgressBar percent={row.percent} marker={row.budget ? (row.projected / row.budget) * 100 : 0} />
            <div className="budget-card-foot">
              <span>
                {formatINR(row.spent)} <span className="muted">spent</span>
              </span>
              <span className={row.remaining < 0 ? 'neg' : ''}>
                {row.remaining < 0 ? `${formatINR(-row.remaining)} over` : `${formatINR(row.remaining)} left`}
              </span>
            </div>
            {row.budget > 0 && row.status !== 'over' && row.projectedStatus === 'over' && (
              <div className="budget-hint">Projected to reach {formatINR(row.projected)} by month end</div>
            )}
          </div>
        ))}
      </div>

      <Card title="Data" subtitle="Your data is stored only in this browser (localStorage)." className="data-card">
        <div className="data-actions">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              if (window.confirm('Replace all data with fresh sample data?')) {
                onResetData();
              }
            }}
          >
            <Database size={16} /> Restore sample data
          </button>
          <button
            type="button"
            className="btn btn-danger-ghost"
            onClick={() => window.confirm('Delete every transaction? This cannot be undone.') && onClearData()}
          >
            <Trash2 size={16} /> Clear all transactions
          </button>
        </div>
      </Card>
    </form>
  );
}

export default Budgets;
