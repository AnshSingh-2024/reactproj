import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Wallet, CalendarDays, TrendingUp, Receipt, ArrowRight, Sparkles, AlertTriangle, Plus } from 'lucide-react';

import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';
import ProgressBar from '../components/ui/ProgressBar';
import Segmented from '../components/ui/Segmented';
import EmptyState from '../components/ui/EmptyState';
import CategoryIcon from '../components/ui/CategoryIcon';
import CategoryDonut from '../components/charts/CategoryDonut';
import CategoryLegend from '../components/charts/CategoryLegend';
import CumulativeChart from '../components/charts/CumulativeChart';
import TrendBarChart from '../components/charts/TrendBarChart';
import RecentList from '../components/transactions/RecentList';

import {
  monthSummary,
  categoryBreakdown,
  dailySeries,
  weeklySeries,
  monthlySeries,
  categoryBudgetRows,
} from '../utils/calculations';
import { formatINR, formatPercent } from '../utils/format';
import { monthLabel } from '../utils/dates';

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function Dashboard({ transactions, budget, onAdd, onEdit }) {
  const [trendView, setTrendView] = useState('weekly');

  // Everything below is derived from the real transactions on every render
  const today = new Date();
  const summary = monthSummary(transactions, budget.total, today);
  const breakdown = categoryBreakdown(summary.transactions);
  const daily = dailySeries(transactions, budget.total, today);
  const weekly = weeklySeries(transactions, 8, today);
  const monthly = monthlySeries(transactions, 6, today);
  const recent = [...transactions].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 6);
  const alerts = categoryBudgetRows(transactions, budget.categories, today)
    .filter((row) => row.status === 'over' || row.status === 'warning' || row.projectedStatus === 'over')
    .sort((a, b) => b.percent - a.percent)
    .slice(0, 3);

  const topCategory = breakdown[0];
  const teaserSaving = topCategory && topCategory.amount > 0 ? (topCategory.amount / summary.daysElapsed) * summary.totalDays * 0.2 : 0;
  const onTrack = summary.projected <= budget.total;

  if (transactions.length === 0) {
    return (
      <>
        <PageHeader eyebrow={`${monthLabel(today, true)} overview`} title={greeting()} />
        <Card>
          <EmptyState title="No expenses yet" message="Add your first expense to see your dashboard come alive.">
            <button className="btn btn-primary" onClick={onAdd}>
              <Plus size={16} /> Add expense
            </button>
          </EmptyState>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow={`${monthLabel(today, true)} overview`}
        title={greeting()}
        description={
          onTrack
            ? `You're on track — at this pace you'll finish the month ${formatINR(budget.total - summary.projected)} under budget.`
            : `Heads up — at this pace you'll overshoot your budget by ${formatINR(summary.projected - budget.total)}.`
        }
      >
        <Link to="/simulator" className="btn btn-outline">
          <Sparkles size={16} /> Simulate
        </Link>
      </PageHeader>

      {/* Hero: monthly spend vs budget */}
      <section className="hero-card">
        <div className="hero-main">
          <span className="hero-label">Spent in {monthLabel(today, true)}</span>
          <div className="hero-value">{formatINR(summary.spent)}</div>
          <div className="hero-sub">
            of {formatINR(budget.total)} budget · {summary.daysLeft} {summary.daysLeft === 1 ? 'day' : 'days'} left
          </div>
          <div className="hero-progress">
            <ProgressBar percent={summary.utilization} marker={summary.projectedUtilization} thick color="#fff" />
            <div className="hero-progress-labels">
              <span>{formatPercent(summary.utilization)} used</span>
              <span>Projected {formatPercent(summary.projectedUtilization)}</span>
            </div>
          </div>
        </div>
        <div className="hero-side">
          <div className="hero-metric">
            <span>Remaining</span>
            <strong className={summary.remaining < 0 ? 'neg' : ''}>{formatINR(summary.remaining)}</strong>
          </div>
          <div className="hero-metric">
            <span>Safe to spend / day</span>
            <strong>{formatINR(summary.safeDailySpend)}</strong>
          </div>
          <div className="hero-metric">
            <span>Day of month</span>
            <strong>
              {summary.daysElapsed}/{summary.totalDays}
            </strong>
          </div>
        </div>
      </section>

      <div className="stats-grid">
        <StatCard
          label="Remaining balance"
          value={formatINR(summary.remaining)}
          icon={Wallet}
          color="#16A34A"
          tone={summary.remaining >= 0 ? 'good' : 'bad'}
          tag={summary.remaining >= 0 ? 'Within budget' : 'Over budget'}
        />
        <StatCard label="Average daily spend" value={formatINR(summary.avgDaily)} icon={CalendarDays} color="#3B82F6" hint={`over ${summary.daysElapsed} days`} />
        <StatCard
          label="Projected this month"
          value={formatINR(summary.projected)}
          icon={TrendingUp}
          color="#D9682B"
          tone={onTrack ? 'good' : 'bad'}
          tag={onTrack ? 'On track' : 'Over pace'}
          hint="estimate"
        />
        <StatCard label="Transactions" value={summary.count} icon={Receipt} color="#8B5CF6" hint={`avg ${formatINR(summary.count ? summary.spent / summary.count : 0)} each`} />
      </div>

      <div className="grid-2-1">
        <Card title="Spending this month" subtitle="Running total against an even budget pace">
          <CumulativeChart data={daily} monthName={monthLabel(today)} />
          <div className="chart-legend-inline">
            <span><i style={{ background: '#D9682B' }} /> Spent so far</span>
            <span><i className="dashed" /> Budget pace</span>
            <span><i style={{ background: '#94A3B8' }} /> Daily spend</span>
          </div>
        </Card>

        <Card title="By category" subtitle="Share of this month's spending" action={<Link to="/analytics" className="link-sm">Details</Link>}>
          <CategoryDonut data={breakdown} centerLabel="Total" centerValue={formatINR(summary.spent)} height={210} />
          <CategoryLegend rows={breakdown} limit={5} />
        </Card>
      </div>

      <div className="grid-2-1">
        <Card
          title={trendView === 'weekly' ? 'Weekly spending' : 'Monthly spending'}
          subtitle={trendView === 'weekly' ? 'Last 8 weeks (rolling 7-day windows)' : 'Last 6 months'}
          action={
            <Segmented
              value={trendView}
              onChange={setTrendView}
              options={[
                { value: 'weekly', label: 'Weekly' },
                { value: 'monthly', label: 'Monthly' },
              ]}
            />
          }
        >
          {trendView === 'weekly' ? (
            <TrendBarChart data={weekly} tooltipLabelKey="range" />
          ) : (
            <TrendBarChart data={monthly} color="#3B82F6" tooltipLabelKey="longLabel" />
          )}
        </Card>

        <div className="stack">
          <Card title="Budget alerts" action={<Link to="/budgets" className="link-sm">Manage</Link>}>
            {alerts.length === 0 ? (
              <p className="muted small">All categories are comfortably within budget. 🎉</p>
            ) : (
              <ul className="alert-list">
                {alerts.map((row) => (
                  <li key={row.id}>
                    <CategoryIcon category={row.id} size={32} />
                    <div className="alert-body">
                      <div className="alert-top">
                        <strong>{row.id}</strong>
                        <span className={`status-text ${row.status === 'safe' ? 'warning' : row.status}`}>
                          {row.status === 'over' ? 'Exceeded' : row.status === 'warning' ? 'Approaching' : 'Projected over'}
                        </span>
                      </div>
                      <ProgressBar percent={row.percent} marker={row.budget ? (row.projected / row.budget) * 100 : 0} />
                      <span className="tx-sub">
                        {formatINR(row.spent)} of {formatINR(row.budget)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {teaserSaving > 0 && (
            <Link to="/simulator" className="teaser-card">
              <Sparkles size={18} />
              <div>
                <strong>What if you cut {topCategory.category} by 20%?</strong>
                <span>You could save about {formatINR(teaserSaving)} this month.</span>
              </div>
              <ArrowRight size={18} />
            </Link>
          )}
        </div>
      </div>

      <Card title="Recent transactions" action={<Link to="/transactions" className="link-sm">View all</Link>}>
        <RecentList transactions={recent} onEdit={onEdit} />
      </Card>

      {alerts.some((a) => a.status === 'over') && (
        <p className="footnote">
          <AlertTriangle size={14} /> Some categories have exceeded their budget. Try the simulator to plan a correction.
        </p>
      )}
    </>
  );
}

export default Dashboard;
