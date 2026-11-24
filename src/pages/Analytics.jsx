import { useState } from 'react';
import { Receipt, Calculator, Crown, Feather, Flame } from 'lucide-react';

import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';
import Segmented from '../components/ui/Segmented';
import ProgressBar from '../components/ui/ProgressBar';
import CategoryIcon from '../components/ui/CategoryIcon';
import EmptyState from '../components/ui/EmptyState';
import CategoryDonut from '../components/charts/CategoryDonut';
import TrendBarChart from '../components/charts/TrendBarChart';
import StackedMonthlyChart from '../components/charts/StackedMonthlyChart';

import {
  sumAmounts,
  categoryBreakdown,
  averageTransaction,
  highestLowestCategory,
  largestTransaction,
  lastNDaysSeries,
  weeklySeries,
  monthlySeries,
  weekdayPattern,
  paymentBreakdown,
} from '../utils/calculations';
import { formatINR, formatPercent } from '../utils/format';
import { toISO } from '../utils/dates';

const PERIODS = [
  { value: 'month', label: 'This month' },
  { value: '90', label: 'Last 90 days' },
  { value: 'all', label: 'All time' },
];

function filterByPeriod(transactions, period, today) {
  if (period === 'all') return transactions;
  if (period === 'month') {
    const prefix = toISO(today).slice(0, 7);
    return transactions.filter((tx) => tx.date.startsWith(prefix));
  }
  const from = new Date(today);
  from.setDate(from.getDate() - 89);
  const fromISO = toISO(from);
  return transactions.filter((tx) => tx.date >= fromISO);
}

function Analytics({ transactions }) {
  const [period, setPeriod] = useState('month');
  const [trend, setTrend] = useState('daily');

  const today = new Date();
  const scoped = filterByPeriod(transactions, period, today);
  const total = sumAmounts(scoped);
  const breakdown = categoryBreakdown(scoped);
  const { highest, lowest } = highestLowestCategory(breakdown);
  const largest = largestTransaction(scoped);
  const payments = paymentBreakdown(scoped);
  const weekdays = weekdayPattern(scoped);
  const busiestDay = [...weekdays].sort((a, b) => b.amount - a.amount)[0];

  const trendData =
    trend === 'daily' ? lastNDaysSeries(transactions, 30, today) : trend === 'weekly' ? weeklySeries(transactions, 12, today) : monthlySeries(transactions, 6, today);
  const trendAverage = trendData.length ? sumAmounts(trendData) / trendData.length : 0;

  return (
    <>
      <PageHeader title="Analytics" description="Where your money goes, and how it changes over time.">
        <Segmented options={PERIODS} value={period} onChange={setPeriod} />
      </PageHeader>

      {scoped.length === 0 ? (
        <Card>
          <EmptyState title="Nothing to analyse" message="No expenses in this period yet. Try a longer period or add an expense." />
        </Card>
      ) : (
        <>
          <div className="stats-grid five">
            <StatCard label="Total spent" value={formatINR(total)} icon={Receipt} color="#D9682B" hint={`${scoped.length} transactions`} />
            <StatCard label="Avg. transaction" value={formatINR(averageTransaction(scoped))} icon={Calculator} color="#3B82F6" />
            <StatCard
              label="Highest category"
              value={highest ? highest.category : '—'}
              icon={Crown}
              color={highest?.color}
              hint={highest ? `${formatINR(highest.amount)} · ${formatPercent(highest.percent)}` : ''}
            />
            <StatCard
              label="Lowest category"
              value={lowest ? lowest.category : '—'}
              icon={Feather}
              color={lowest?.color}
              hint={lowest ? `${formatINR(lowest.amount)} · ${formatPercent(lowest.percent, 1)}` : ''}
            />
            <StatCard label="Largest expense" value={largest ? formatINR(largest.amount) : '—'} icon={Flame} color="#EF4444" hint={largest?.title} />
          </div>

          <div className="grid-1-2">
            <Card title="Distribution" subtitle="Percentage of spending per category">
              <CategoryDonut data={breakdown} centerLabel={PERIODS.find((p) => p.value === period).label} centerValue={formatINR(total)} height={250} />
            </Card>

            <Card title="Category breakdown" subtitle="Amount, share and number of expenses">
              <div className="breakdown-table">
                {breakdown.map((row) => (
                  <div key={row.category} className="breakdown-row">
                    <CategoryIcon category={row.category} size={34} />
                    <div className="breakdown-main">
                      <div className="breakdown-top">
                        <strong>{row.category}</strong>
                        <span className="muted small">{row.count} expenses</span>
                      </div>
                      <ProgressBar percent={highest ? (row.amount / highest.amount) * 100 : 0} color={row.color} />
                    </div>
                    <div className="breakdown-values">
                      <strong>{formatINR(row.amount)}</strong>
                      <span className="muted small">{formatPercent(row.percent, 1)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <Card
            title="Spending trend"
            subtitle={trend === 'daily' ? 'Last 30 days' : trend === 'weekly' ? 'Last 12 weeks' : 'Last 6 months'}
            action={
              <Segmented
                value={trend}
                onChange={setTrend}
                options={[
                  { value: 'daily', label: 'Daily' },
                  { value: 'weekly', label: 'Weekly' },
                  { value: 'monthly', label: 'Monthly' },
                ]}
              />
            }
          >
            <TrendBarChart
              data={trendData}
              average={trendAverage}
              tooltipLabelKey={trend === 'weekly' ? 'range' : trend === 'monthly' ? 'longLabel' : undefined}
              height={280}
            />
          </Card>

          <div className="grid-2-1">
            <Card title="Monthly mix" subtitle="How each month splits across categories">
              <StackedMonthlyChart data={monthlySeries(transactions, 6, today)} />
            </Card>

            <div className="stack">
              <Card title="Day-of-week pattern" subtitle={busiestDay?.amount ? `You spend the most on ${busiestDay.label}s` : ''}>
                <TrendBarChart data={weekdays} color="#8B5CF6" height={170} highlightLast={false} />
              </Card>
              <Card title="Payment methods">
                <ul className="payment-list">
                  {payments.map((p) => (
                    <li key={p.method}>
                      <div className="payment-top">
                        <span>{p.method}</span>
                        <span>
                          <strong>{formatINR(p.amount)}</strong> <span className="muted small">{formatPercent(p.percent)}</span>
                        </span>
                      </div>
                      <ProgressBar percent={p.percent} color="var(--accent)" />
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default Analytics;
