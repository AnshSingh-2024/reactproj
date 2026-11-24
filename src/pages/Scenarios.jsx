import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Plus, SlidersHorizontal, RotateCcw, Trash2, Pencil, Check, X, GitCompareArrows } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Segmented from '../components/ui/Segmented';
import EmptyState from '../components/ui/EmptyState';
import ChartTooltip from '../components/charts/ChartTooltip';
import { simulatorBaseline, simulate, isUnchanged } from '../utils/calculations';
import { emptyAdjustments } from '../data/sampleData';
import { CATEGORIES, SCENARIO_COLORS } from '../data/constants';
import { formatINR, formatSignedINR, formatSignedPercent, formatCompactINR, formatPercent } from '../utils/format';

/* ---------- one scenario card (with inline rename) ---------- */
function ScenarioCard({ scenario, result, baseTotal, selected, onToggle, onRename, onReset, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(scenario.name);
  const color = SCENARIO_COLORS[scenario.colorIndex % SCENARIO_COLORS.length];
  const diff = result.total - baseTotal;

  const save = (event) => {
    event.preventDefault();
    if (name.trim()) onRename(name.trim());
    setEditing(false);
  };

  const cancel = () => {
    setName(scenario.name);
    setEditing(false);
  };

  return (
    <div className={`scenario-card ${selected ? 'selected' : ''}`} style={{ '--sc': color }}>
      <div className="scenario-card-top">
        {editing ? (
          <form className="rename-form" onSubmit={save}>
            <input autoFocus value={name} onChange={(e) => setName(e.target.value)} maxLength={40} onKeyDown={(e) => e.key === 'Escape' && cancel()} />
            <button type="submit" className="icon-btn sm" aria-label="Save name">
              <Check size={15} />
            </button>
            <button type="button" className="icon-btn sm" onClick={cancel} aria-label="Cancel">
              <X size={15} />
            </button>
          </form>
        ) : (
          <>
            <span className="scenario-dot" />
            <h3 className="scenario-name">{scenario.name}</h3>
            <button className="icon-btn sm" onClick={() => setEditing(true)} aria-label="Rename">
              <Pencil size={14} />
            </button>
          </>
        )}
      </div>

      <div className="scenario-total">{formatINR(result.total)}</div>
      <div className={`scenario-diff ${diff > 1 ? 'up' : diff < -1 ? 'down' : ''}`}>
        {Math.abs(diff) < 1 ? 'Same as current' : `${formatSignedINR(diff)} (${formatSignedPercent((diff / (baseTotal || 1)) * 100)})`}
      </div>

      <dl className="scenario-stats">
        <div>
          <dt>Budget</dt>
          <dd>{formatINR(result.budget)}</dd>
        </div>
        <div>
          <dt>{result.remaining >= 0 ? 'Savings' : 'Over by'}</dt>
          <dd className={result.remaining >= 0 ? 'pos' : 'neg'}>{formatINR(Math.abs(result.remaining))}</dd>
        </div>
        <div>
          <dt>Utilisation</dt>
          <dd>{formatPercent(result.utilization)}</dd>
        </div>
      </dl>

      <div className="scenario-actions">
        <label className="compare-toggle">
          <input type="checkbox" checked={selected} onChange={onToggle} /> Compare
        </label>
        <div className="row-actions">
          <Link to={`/simulator/${scenario.id}`} className="icon-btn sm" title="Modify in simulator">
            <SlidersHorizontal size={15} />
          </Link>
          <button className="icon-btn sm" onClick={onReset} title="Reset to current pattern" disabled={isUnchanged(scenario.adjustments) && scenario.budget === null}>
            <RotateCcw size={15} />
          </button>
          <button className="icon-btn sm danger" onClick={onDelete} title="Delete">
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- page ---------- */
function Scenarios({ transactions, budget, scenarios, onCreate, onUpdate, onDelete }) {
  const [mode, setMode] = useState('projected');
  const [selectedIds, setSelectedIds] = useState(() => scenarios.map((s) => s.id));
  // Uncontrolled input: we read its value through a ref only when the form is submitted
  const newNameRef = useRef(null);

  const baseline = simulatorBaseline(transactions, mode);
  const base = simulate(baseline, emptyAdjustments(), budget.total);
  const results = scenarios.map((sc) => ({
    scenario: sc,
    color: SCENARIO_COLORS[sc.colorIndex % SCENARIO_COLORS.length],
    result: simulate(baseline, sc.adjustments, sc.budget ?? budget.total),
  }));
  const compared = results.filter((r) => selectedIds.includes(r.scenario.id));

  const handleCreate = (event) => {
    event.preventDefault();
    const created = onCreate(newNameRef.current.value);
    setSelectedIds((prev) => [...prev, created.id]);
    newNameRef.current.value = '';
  };

  const toggle = (id) => setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const handleDelete = (sc) => {
    if (window.confirm(`Delete scenario “${sc.name}”?`)) {
      onDelete(sc.id);
      setSelectedIds((prev) => prev.filter((x) => x !== sc.id));
    }
  };

  // Chart data: one row per category, one key per compared scenario
  const chartData = CATEGORIES.map((cat) => {
    const row = { name: cat.id, Current: Math.round(base.rows.find((r) => r.id === cat.id).simulated) };
    compared.forEach(({ scenario, result }) => {
      row[scenario.id] = Math.round(result.rows.find((r) => r.id === cat.id).simulated);
    });
    return row;
  });

  return (
    <>
      <PageHeader title="What-if Scenarios" description="Build alternative spending plans and compare them side by side. Real expenses are never touched.">
        <Segmented
          value={mode}
          onChange={setMode}
          options={[
            { value: 'projected', label: 'Based on this month' },
            { value: 'average', label: 'Based on average' },
          ]}
        />
      </PageHeader>

      <form className="create-scenario" onSubmit={handleCreate}>
        <input ref={newNameRef} placeholder="New scenario name, e.g. “Weekend diet”" maxLength={40} />
        <button type="submit" className="btn btn-primary">
          <Plus size={16} /> Create scenario
        </button>
      </form>

      {scenarios.length === 0 ? (
        <Card>
          <EmptyState icon={GitCompareArrows} title="No scenarios yet" message="Create one above, or save one from the Live Simulator." />
        </Card>
      ) : (
        <>
          <div className="scenario-grid">
            <div className="scenario-card baseline">
              <div className="scenario-card-top">
                <span className="scenario-dot" style={{ background: '#94A3B8' }} />
                <h3 className="scenario-name">Actual baseline</h3>
              </div>
              <div className="scenario-total">{formatINR(base.total)}</div>
              <div className="scenario-diff">{mode === 'projected' ? 'Projected from real expenses' : 'Real monthly average'}</div>
              <dl className="scenario-stats">
                <div>
                  <dt>Budget</dt>
                  <dd>{formatINR(budget.total)}</dd>
                </div>
                <div>
                  <dt>{base.remaining >= 0 ? 'Savings' : 'Over by'}</dt>
                  <dd className={base.remaining >= 0 ? 'pos' : 'neg'}>{formatINR(Math.abs(base.remaining))}</dd>
                </div>
                <div>
                  <dt>Utilisation</dt>
                  <dd>{formatPercent(base.utilization)}</dd>
                </div>
              </dl>
              <p className="muted small">Read-only · derived from transactions</p>
            </div>

            {results.map(({ scenario, result }) => (
              <ScenarioCard
                key={scenario.id}
                scenario={scenario}
                result={result}
                baseTotal={base.total}
                selected={selectedIds.includes(scenario.id)}
                onToggle={() => toggle(scenario.id)}
                onRename={(name) => onUpdate(scenario.id, { name }, 'Scenario renamed')}
                onReset={() => onUpdate(scenario.id, { adjustments: emptyAdjustments(), budget: null }, `“${scenario.name}” reset`)}
                onDelete={() => handleDelete(scenario)}
              />
            ))}
          </div>

          {compared.length === 0 ? (
            <Card>
              <EmptyState icon={GitCompareArrows} title="Pick scenarios to compare" message="Tick “Compare” on one or more scenario cards." />
            </Card>
          ) : (
            <>
              <Card title="Category comparison" subtitle="Monthly spending per category in each scenario">
                <div style={{ height: 320 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid vertical={false} />
                      <XAxis dataKey="name" tickLine={false} axisLine={false} interval={0} tick={{ fontSize: 11 }} />
                      <YAxis tickFormatter={formatCompactINR} tickLine={false} axisLine={false} width={58} />
                      <Tooltip cursor={{ fill: 'var(--surface-2)' }} content={<ChartTooltip hideZero={false} />} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Bar dataKey="Current" fill="#94A3B8" radius={[4, 4, 0, 0]} maxBarSize={18} />
                      {compared.map(({ scenario, color }) => (
                        <Bar key={scenario.id} dataKey={scenario.id} name={scenario.name} fill={color} radius={[4, 4, 0, 0]} maxBarSize={18} />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card title="Detailed comparison" subtitle="Percent change is measured against the actual baseline" padded={false}>
                <div className="table-wrap">
                  <table className="compare-table">
                    <thead>
                      <tr>
                        <th>Category</th>
                        <th className="num">Current</th>
                        {compared.map(({ scenario, color }) => (
                          <th key={scenario.id} className="num">
                            <span className="th-dot" style={{ background: color }} />
                            {scenario.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {base.rows.map((baseRow) => (
                        <tr key={baseRow.id}>
                          <td>
                            <span className="legend-dot" style={{ background: baseRow.color }} /> {baseRow.id}
                          </td>
                          <td className="num">{formatINR(baseRow.simulated)}</td>
                          {compared.map(({ scenario, result }) => {
                            const row = result.rows.find((r) => r.id === baseRow.id);
                            const diff = row.simulated - baseRow.simulated;
                            return (
                              <td key={scenario.id} className="num">
                                {formatINR(row.simulated)}
                                {Math.abs(diff) >= 1 && (
                                  <span className={`delta ${diff > 0 ? 'up' : 'down'}`}>
                                    {baseRow.simulated > 0 ? formatSignedPercent((diff / baseRow.simulated) * 100, 0) : formatSignedINR(diff)}
                                  </span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td>Total</td>
                        <td className="num">{formatINR(base.total)}</td>
                        {compared.map(({ scenario, result }) => (
                          <td key={scenario.id} className="num">
                            {formatINR(result.total)}
                            <span className={`delta ${result.total > base.total ? 'up' : result.total < base.total ? 'down' : ''}`}>
                              {formatSignedPercent(base.total ? ((result.total - base.total) / base.total) * 100 : 0)}
                            </span>
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td>Saved vs current</td>
                        <td className="num muted">—</td>
                        {compared.map(({ scenario, result }) => (
                          <td key={scenario.id} className={`num ${base.total - result.total >= 0 ? 'pos' : 'neg'}`}>
                            {formatSignedINR(base.total - result.total)}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td>Left from budget</td>
                        <td className={`num ${base.remaining >= 0 ? 'pos' : 'neg'}`}>{formatINR(base.remaining)}</td>
                        {compared.map(({ scenario, result }) => (
                          <td key={scenario.id} className={`num ${result.remaining >= 0 ? 'pos' : 'neg'}`}>
                            {formatINR(result.remaining)}
                          </td>
                        ))}
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </Card>
            </>
          )}
        </>
      )}
    </>
  );
}

export default Scenarios;
