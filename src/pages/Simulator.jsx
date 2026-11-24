import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FlaskConical, RotateCcw, Save, Scissors, ArrowLeft, Sparkles, PiggyBank, Target, Wallet, TrendingUp, TrendingDown } from 'lucide-react';

import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Segmented from '../components/ui/Segmented';
import AnimatedNumber from '../components/ui/AnimatedNumber';
import EmptyState from '../components/ui/EmptyState';
import CategoryDonut from '../components/charts/CategoryDonut';
import CategoryControl from '../components/simulator/CategoryControl';
import BudgetGauge from '../components/simulator/BudgetGauge';
import CompareBarChart from '../components/simulator/CompareBarChart';

import { simulatorBaseline, simulate, isUnchanged } from '../utils/calculations';
import { emptyAdjustments } from '../data/sampleData';
import { CATEGORY_NAMES } from '../data/constants';
import { formatINR, formatSignedINR, formatSignedPercent, formatPercent } from '../utils/format';

// Convert raw input values (strings) to clean numbers before saving
function cleanAdjustments(adjustments) {
  const clean = {};
  CATEGORY_NAMES.forEach((name) => {
    const a = adjustments[name] || { pct: 0, flat: 0 };
    clean[name] = { pct: Number(a.pct) || 0, flat: Number(a.flat) || 0 };
  });
  return clean;
}

/*
 * Live Spending Simulator.
 *  - /simulator               → free experimentation (sandbox)
 *  - /simulator/:scenarioId   → edit a saved what-if scenario (useParams)
 * The simulator only works on a COPY of the numbers. Real transactions are
 * read-only here – no function that changes transactions is ever passed in.
 */
function Simulator({ transactions, budget, scenarios, onCreateScenario, onUpdateScenario }) {
  const { scenarioId } = useParams();
  const navigate = useNavigate();
  const scenario = scenarioId ? scenarios.find((s) => s.id === scenarioId) : null;

  const [mode, setMode] = useState('projected');
  const [adjustments, setAdjustments] = useState(() => scenario?.adjustments ?? emptyAdjustments());
  const [simBudget, setSimBudget] = useState(() => scenario?.budget ?? budget.total);
  const [scenarioName, setScenarioName] = useState('');

  // When the URL switches to a different scenario, load its values
  useEffect(() => {
    if (scenario) {
      setAdjustments(scenario.adjustments);
      setSimBudget(scenario.budget ?? budget.total);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenarioId]);

  if (scenarioId && !scenario) {
    return (
      <Card>
        <EmptyState title="Scenario not found" message="It may have been deleted.">
          <Link to="/scenarios" className="btn btn-primary">
            Back to scenarios
          </Link>
        </EmptyState>
      </Card>
    );
  }

  // ---- derived values: recalculated on every change, so everything is live ----
  const baseline = simulatorBaseline(transactions, mode);
  const sim = simulate(baseline, adjustments, Number(simBudget) || 0);
  const baseSim = simulate(baseline, emptyAdjustments(), budget.total);
  const unchanged = isUnchanged(cleanAdjustments(adjustments)) && Number(simBudget) === budget.total;
  const dirty =
    scenario &&
    (JSON.stringify(cleanAdjustments(adjustments)) !== JSON.stringify(cleanAdjustments(scenario.adjustments)) ||
      Number(simBudget) !== (scenario.budget ?? budget.total));

  const updateCategory = (id, value) => setAdjustments((prev) => ({ ...prev, [id]: value }));

  const applyToAll = (pct) => {
    setAdjustments((prev) => {
      const next = {};
      CATEGORY_NAMES.forEach((name) => (next[name] = { ...prev[name], pct: Math.max(-100, (Number(prev[name].pct) || 0) + pct) }));
      return next;
    });
  };

  const resetAll = () => {
    setAdjustments(emptyAdjustments());
    setSimBudget(budget.total);
  };

  const handleSaveNew = (event) => {
    event.preventDefault();
    const name = scenarioName.trim() || `My scenario ${scenarios.length + 1}`;
    const budgetValue = Number(simBudget) === budget.total ? null : Number(simBudget);
    const created = onCreateScenario(name, cleanAdjustments(adjustments), budgetValue);
    setScenarioName('');
    navigate(`/simulator/${created.id}`);
  };

  const handleSaveExisting = () => {
    const budgetValue = Number(simBudget) === budget.total ? null : Number(simBudget);
    onUpdateScenario(scenario.id, { adjustments: cleanAdjustments(adjustments), budget: budgetValue }, `“${scenario.name}” saved`);
  };

  const overBudget = sim.remaining < 0;
  const DiffIcon = sim.diff > 0 ? TrendingUp : TrendingDown;

  return (
    <>
      {scenario && (
        <Link to="/scenarios" className="btn btn-ghost back-btn">
          <ArrowLeft size={16} /> All scenarios
        </Link>
      )}

      <PageHeader
        eyebrow={scenario ? 'Editing scenario' : 'Sandbox'}
        title={scenario ? scenario.name : 'Live Spending Simulator'}
        description="Drag the sliders to imagine a different month. Every number and chart updates instantly."
      >
        <Segmented
          value={mode}
          onChange={setMode}
          options={[
            { value: 'projected', label: 'This month (projected)' },
            { value: 'average', label: 'Average month' },
          ]}
        />
      </PageHeader>

      <div className="hypo-banner">
        <FlaskConical size={18} />
        <span>
          <strong>Hypothetical mode.</strong> Values here are simulations based on your{' '}
          {mode === 'projected' ? "projected spending for this month" : 'historical monthly average'}. Your real transactions are never modified.
        </span>
      </div>

      <div className="sim-layout">
        {/* ---------- controls ---------- */}
        <div className="sim-controls">
          <Card title="Simulated budget" subtitle={`Your real budget is ${formatINR(budget.total)}`}>
            <div className="sim-budget">
              <input
                type="range"
                className="range"
                min="5000"
                max="150000"
                step="500"
                value={Math.min(150000, Number(simBudget) || 0)}
                onChange={(e) => setSimBudget(Number(e.target.value))}
                aria-label="Simulated budget"
              />
              <div className="input-prefix sm">
                <span>₹</span>
                <input type="number" min="0" step="500" value={simBudget} onChange={(e) => setSimBudget(e.target.value)} aria-label="Simulated budget amount" />
              </div>
            </div>
          </Card>

          <div className="sim-toolbar">
            <span className="muted small">Quick actions</span>
            <button type="button" className="chip" onClick={() => applyToAll(-10)}>
              <Scissors size={12} /> Cut all 10%
            </button>
            <button type="button" className="chip" onClick={() => applyToAll(10)}>
              Raise all 10%
            </button>
            <button type="button" className="chip chip-reset" onClick={resetAll} disabled={unchanged}>
              <RotateCcw size={12} /> Reset everything
            </button>
          </div>

          <div className="sim-control-list">
            {sim.rows.map((row) => (
              <CategoryControl key={row.id} row={row} adjustment={adjustments[row.id]} onChange={(value) => updateCategory(row.id, value)} />
            ))}
          </div>
        </div>

        {/* ---------- live results ---------- */}
        <div className="sim-results">
          <div className={`sim-total-card ${overBudget ? 'over' : ''}`}>
            <div className="sim-total-top">
              <span>Simulated monthly spend</span>
              <span className="sim-badge">
                <Sparkles size={12} /> Hypothetical
              </span>
            </div>
            <div className="sim-total-value">
              <AnimatedNumber value={sim.total} />
            </div>
            <div className="sim-total-diff">
              {Math.abs(sim.diff) < 1 ? (
                <span>Same as baseline ({formatINR(sim.baseTotal)})</span>
              ) : (
                <span className={sim.diff > 0 ? 'up' : 'down'}>
                  <DiffIcon size={15} /> {formatSignedINR(sim.diff)} ({formatSignedPercent(sim.changePct)}) vs baseline {formatINR(sim.baseTotal)}
                </span>
              )}
            </div>
          </div>

          <div className="sim-metrics">
            <div className="sim-metric">
              <Wallet size={16} />
              <span>Remaining budget</span>
              <strong className={overBudget ? 'neg' : 'pos'}>
                <AnimatedNumber value={sim.remaining} />
              </strong>
            </div>
            <div className="sim-metric">
              <PiggyBank size={16} />
              <span>Potential savings</span>
              <strong className="pos">
                <AnimatedNumber value={sim.savings} />
              </strong>
            </div>
            <div className="sim-metric">
              <Target size={16} />
              <span>Saved vs baseline</span>
              <strong className={sim.savedVsBaseline >= 0 ? 'pos' : 'neg'}>{formatSignedINR(sim.savedVsBaseline)}</strong>
            </div>
          </div>

          <Card title="Budget utilisation" subtitle="Faint arc = baseline with your real budget">
            <BudgetGauge percent={sim.utilization} basePercent={baseSim.utilization} />
            <p className="gauge-caption">
              {overBudget
                ? `Over budget by ${formatINR(-sim.remaining)}.`
                : `${formatINR(sim.remaining)} left, about ${formatINR(sim.remaining / 30)} a day spare.`}
            </p>
          </Card>

          <Card title="Category comparison" subtitle="Baseline vs simulated">
            <CompareBarChart rows={sim.rows} />
          </Card>

          <Card title="Simulated distribution">
            <div className="sim-dist">
              <CategoryDonut
                data={sim.rows.map((r) => ({ category: r.id, color: r.color, amount: Math.round(r.simulated) }))}
                centerLabel="Simulated"
                centerValue={formatINR(sim.total)}
                height={200}
              />
              <ul className="legend-list compact">
                {sim.rows
                  .filter((r) => r.simulated > 0)
                  .sort((a, b) => b.simulated - a.simulated)
                  .map((r) => (
                    <li key={r.id}>
                      <span className="legend-dot" style={{ background: r.color }} />
                      <span className="legend-name">{r.id}</span>
                      <span className="legend-pct">{formatPercent(r.share, 1)}</span>
                    </li>
                  ))}
              </ul>
            </div>
          </Card>

          {/* ---------- save ---------- */}
          {scenario ? (
            <Card title="Scenario">
              <p className="muted small">{dirty ? 'You have unsaved changes to this scenario.' : 'All changes saved.'}</p>
              <div className="form-actions start">
                <button type="button" className="btn btn-primary" onClick={handleSaveExisting} disabled={!dirty}>
                  <Save size={16} /> Save scenario
                </button>
                <Link to="/scenarios" className="btn btn-ghost">
                  Compare scenarios
                </Link>
              </div>
            </Card>
          ) : (
            <Card title="Save as a what-if scenario" subtitle="Compare it later with other scenarios">
              <form className="inline-form" onSubmit={handleSaveNew}>
                <input value={scenarioName} onChange={(e) => setScenarioName(e.target.value)} placeholder="e.g. Cook at home more" maxLength={40} />
                <button type="submit" className="btn btn-primary" disabled={unchanged}>
                  <Save size={16} /> Save
                </button>
              </form>
              {unchanged && <p className="muted small">Change something first, then save it as a scenario.</p>}
            </Card>
          )}
        </div>
      </div>
    </>
  );
}

export default Simulator;
