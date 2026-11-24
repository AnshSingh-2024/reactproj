import { ResponsiveContainer, ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from 'recharts';
import { CalendarDays, CalendarRange, CalendarClock, TrendingUp, Hourglass, Gauge, PiggyBank, Receipt, Info } from 'lucide-react';

import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';
import ProgressBar from '../components/ui/ProgressBar';
import CategoryIcon from '../components/ui/CategoryIcon';
import EmptyState from '../components/ui/EmptyState';
import ChartTooltip from '../components/charts/ChartTooltip';
import { forecast } from '../utils/calculations';
import { formatINR, formatPercent, formatSignedPercent, formatCompactINR } from '../utils/format';
import { monthLabel } from '../utils/dates';

// Builds the "actual so far + projected rest of month" series for the chart
function projectionSeries(fc, budgetTotal) {
  const { summary } = fc;
  const daily = new Array(summary.totalDays + 1).fill(0);
  summary.transactions.forEach((tx) => (daily[Number(tx.date.slice(8, 10))] += Number(tx.amount)));

  const data = [];
  let running = 0;
  for (let day = 1; day <= summary.totalDays; day++) {
    running += daily[day];
    const isPast = day <= summary.daysElapsed;
    const ahead = day - summary.daysElapsed;
    data.push({
      label: `${day}`,
      actual: isPast ? running : null,
      pace: day >= summary.daysElapsed ? summary.spent + summary.avgDaily * ahead : null,
      history: day >= summary.daysElapsed ? summary.spent + fc.avgDaily * ahead : null,
      budget: budgetTotal,
    });
  }
  return data;
}

function Forecast({ transactions, budget }) {
  const today = new Date();
  const fc = forecast(transactions, budget.total, today);
  const { summary } = fc;

  if (!fc.hasData) {
    return (
      <>
        <PageHeader title="Forecast" />
        <Card>
          <EmptyState title="Not enough data" message="Add a few expenses and Pennywise will start forecasting your month." />
        </Card>
      </>
    );
  }

  const data = projectionSeries(fc, budget.total);
  const savingsPositive = fc.potentialSavings >= 0;
  const confidenceTone = { High: 'good', Medium: 'warn', Low: 'bad' }[fc.confidence] || 'neutral';

  return (
    <>
      <PageHeader
        eyebrow={`${monthLabel(today, true)} · day ${summary.daysElapsed} of ${summary.totalDays}`}
        title="Forecast"
        description="Simple, transparent projections built only from your real transaction history."
      >
        <span className={`confidence ${confidenceTone}`}>Confidence: {fc.confidence}</span>
      </PageHeader>

      <div className="legend-key">
        <span className="tag-actual">Actual</span> recorded spending
        <span className="tag-estimate">Estimate</span> calculated forecast
      </div>

      <div className="stats-grid">
        <StatCard label="Spent so far" value={formatINR(summary.spent)} icon={Receipt} color="#64748B" tag="Actual" tone="neutral" hint={`${summary.count} expenses`} />
        <StatCard label="Avg. daily spend" value={formatINR(fc.avgDaily)} icon={CalendarDays} color="#3B82F6" tag="Actual" hint={`over ${fc.historyDays} days`} />
        <StatCard label="Avg. weekly spend" value={formatINR(fc.avgWeekly)} icon={CalendarRange} color="#14B8A6" tag="Actual" hint="daily avg × 7" />
        <StatCard
          label="Avg. monthly spend"
          value={formatINR(fc.avgMonthly)}
          icon={CalendarClock}
          color="#8B5CF6"
          tag={fc.completeMonthCount ? 'Actual' : 'Estimate'}
          tone={fc.completeMonthCount ? 'neutral' : 'warn'}
          hint={fc.completeMonthCount ? `${fc.completeMonthCount} complete months` : 'no complete month yet'}
        />
      </div>

      <div className="stats-grid">
        <StatCard
          highlight
          label="Projected this month"
          value={formatINR(fc.paceProjection)}
          icon={TrendingUp}
          tag="Estimate"
          hint={`History-based: ${formatINR(fc.historyProjection)}`}
        />
        <StatCard label="Est. remaining spend" value={formatINR(fc.estimatedRemaining)} icon={Hourglass} color="#D9682B" tag="Estimate" tone="warn" hint={`over the next ${summary.daysLeft} days`} />
        <StatCard
          label="Expected utilisation"
          value={formatPercent(fc.expectedUtilization)}
          icon={Gauge}
          color={fc.expectedUtilization > 100 ? '#EF4444' : '#16A34A'}
          tag="Estimate"
          tone={fc.expectedUtilization > 100 ? 'bad' : fc.expectedUtilization >= 80 ? 'warn' : 'good'}
          hint={`of ${formatINR(budget.total)}`}
        />
        <StatCard
          label={savingsPositive ? 'Potential savings' : 'Projected overspend'}
          value={formatINR(Math.abs(fc.potentialSavings))}
          icon={PiggyBank}
          color={savingsPositive ? '#16A34A' : '#EF4444'}
          tag="Estimate"
          tone={savingsPositive ? 'good' : 'bad'}
          hint="budget − projected"
        />
      </div>

      <Card title="Month-end projection" subtitle="Solid = actual · dashed = projected · red line = budget">
        <div style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="fcFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#D9682B" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#D9682B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={16} />
              <YAxis tickFormatter={formatCompactINR} tickLine={false} axisLine={false} width={58} />
              <Tooltip content={<ChartTooltip hideZero={false} labelFormatter={(l) => `${l} ${monthLabel(today)}`} />} />
              <ReferenceLine y={budget.total} stroke="#EF4444" strokeDasharray="3 3" />
              <Area dataKey="actual" name="Actual" stroke="#D9682B" strokeWidth={2.5} fill="url(#fcFill)" dot={false} />
              <Line dataKey="pace" name="Pace projection" stroke="#D9682B" strokeWidth={2} strokeDasharray="6 5" dot={false} />
              <Line dataKey="history" name="History projection" stroke="#3B82F6" strokeWidth={2} strokeDasharray="2 4" dot={false} />
              <Line dataKey="budget" name="Budget" stroke="transparent" dot={false} activeDot={false} legendType="none" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-legend-inline">
          <span><i style={{ background: '#D9682B' }} /> Actual</span>
          <span><i className="dashed" style={{ borderColor: '#D9682B' }} /> Pace projection</span>
          <span><i className="dashed" style={{ borderColor: '#3B82F6' }} /> History projection</span>
          <span><i className="dashed" style={{ borderColor: '#EF4444' }} /> Budget</span>
        </div>
      </Card>

      <div className="grid-2-1">
        <Card title="Category forecast" subtitle="Projected month-end spend compared with your usual month" padded={false}>
          <div className="table-wrap">
            <table className="compare-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th className="num">Spent</th>
                  <th className="num">Projected</th>
                  <th className="num hide-md">Monthly avg</th>
                  <th className="num hide-md">Daily avg</th>
                  <th className="num">vs avg</th>
                </tr>
              </thead>
              <tbody>
                {fc.categoryAverages.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <span className="cell-with-icon">
                        <CategoryIcon category={row.id} size={28} /> {row.id}
                      </span>
                    </td>
                    <td className="num">{formatINR(row.spentThisMonth)}</td>
                    <td className="num strong">{formatINR(row.projected)}</td>
                    <td className="num hide-md muted">{formatINR(row.monthlyAvg)}</td>
                    <td className="num hide-md muted">{formatINR(row.dailyAvg)}</td>
                    <td className="num">
                      {row.monthlyAvg > 0 ? (
                        <span className={`delta ${row.trend > 5 ? 'up' : row.trend < -5 ? 'down' : ''}`}>{formatSignedPercent(row.trend, 0)}</span>
                      ) : (
                        <span className="muted">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="stack">
          <Card title="Budget at month end">
            <ProgressBar percent={summary.utilization} marker={fc.expectedUtilization} thick />
            <div className="progress-caption">
              <span>Now {formatPercent(summary.utilization)}</span>
              <span>Expected {formatPercent(fc.expectedUtilization)}</span>
            </div>
            <p className="muted small" style={{ marginTop: 12 }}>
              To stay within budget you can spend up to <strong>{formatINR(summary.safeDailySpend)}</strong> per day for the rest of the month.
            </p>
          </Card>

          <Card title="How it's calculated">
            <ul className="method-list">
              <li>
                <Info size={14} /> <span><b>Pace projection</b> = spent this month ÷ days elapsed × days in month</span>
              </li>
              <li>
                <Info size={14} /> <span><b>History projection</b> = spent so far + (all-time daily average × days left)</span>
              </li>
              <li>
                <Info size={14} /> <span><b>Monthly average</b> = mean of complete months only (the current month is excluded)</span>
              </li>
              <li>
                <Info size={14} /> <span><b>Confidence</b> is lower early in the month or with few transactions</span>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </>
  );
}

export default Forecast;
