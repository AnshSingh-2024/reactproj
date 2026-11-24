/*
 * All financial calculations live here as plain JavaScript functions.
 * Components call these functions with the *actual* transaction data, so every
 * number on screen is derived – nothing is hard-coded.
 */
import { CATEGORIES, CATEGORY_NAMES } from '../data/constants';
import {
  parseISO,
  toISO,
  daysInMonth,
  addDays,
  diffDays,
  monthKey,
  monthLabel,
  shortDate,
  startOfDay,
} from './dates';

/* ---------- basic helpers ---------- */

export function sumAmounts(transactions) {
  return transactions.reduce((total, tx) => total + Number(tx.amount), 0);
}

export function filterByMonth(transactions, year, monthIndex) {
  return transactions.filter((tx) => {
    const d = parseISO(tx.date);
    return d.getFullYear() === year && d.getMonth() === monthIndex;
  });
}

export function currentMonthTransactions(transactions, ref = new Date()) {
  return filterByMonth(transactions, ref.getFullYear(), ref.getMonth());
}

// { Food: 0, Transport: 0, ... } – every category is always present
export function totalsByCategory(transactions) {
  const totals = {};
  CATEGORY_NAMES.forEach((name) => (totals[name] = 0));
  transactions.forEach((tx) => {
    const key = totals[tx.category] !== undefined ? tx.category : 'Other';
    totals[key] += Number(tx.amount);
  });
  return totals;
}

// Sorted list with amount, share (%) and number of transactions per category
export function categoryBreakdown(transactions) {
  const totals = totalsByCategory(transactions);
  const grand = sumAmounts(transactions);
  return CATEGORIES.map((cat) => {
    const count = transactions.filter((tx) => tx.category === cat.id).length;
    return {
      category: cat.id,
      color: cat.color,
      amount: totals[cat.id],
      count,
      percent: grand > 0 ? (totals[cat.id] / grand) * 100 : 0,
    };
  }).sort((a, b) => b.amount - a.amount);
}

export function averageTransaction(transactions) {
  return transactions.length ? sumAmounts(transactions) / transactions.length : 0;
}

export function highestLowestCategory(breakdown) {
  const spent = breakdown.filter((row) => row.amount > 0);
  if (spent.length === 0) return { highest: null, lowest: null };
  return { highest: spent[0], lowest: spent[spent.length - 1] };
}

export function largestTransaction(transactions) {
  return transactions.reduce((max, tx) => (!max || tx.amount > max.amount ? tx : max), null);
}

/* ---------- monthly summary used by the dashboard ---------- */

export function monthSummary(transactions, totalBudget, ref = new Date()) {
  const monthTx = currentMonthTransactions(transactions, ref);
  const spent = sumAmounts(monthTx);
  const totalDays = daysInMonth(ref.getFullYear(), ref.getMonth());
  const daysElapsed = ref.getDate();
  const daysLeft = totalDays - daysElapsed;
  const avgDaily = daysElapsed > 0 ? spent / daysElapsed : 0;
  const projected = avgDaily * totalDays;

  return {
    transactions: monthTx,
    spent,
    count: monthTx.length,
    totalDays,
    daysElapsed,
    daysLeft,
    avgDaily,
    projected,
    remaining: totalBudget - spent,
    utilization: totalBudget > 0 ? (spent / totalBudget) * 100 : 0,
    projectedUtilization: totalBudget > 0 ? (projected / totalBudget) * 100 : 0,
    // what you could still spend per day for the rest of the month
    safeDailySpend: daysLeft > 0 ? Math.max(0, totalBudget - spent) / daysLeft : 0,
  };
}

/* ---------- time series for charts ---------- */

// Day-by-day spending in a month (plus a running total and the budget pace line)
export function dailySeries(transactions, totalBudget, ref = new Date()) {
  const year = ref.getFullYear();
  const month = ref.getMonth();
  const totalDays = daysInMonth(year, month);
  const monthTx = filterByMonth(transactions, year, month);
  const byDay = new Array(totalDays + 1).fill(0);
  monthTx.forEach((tx) => (byDay[parseISO(tx.date).getDate()] += Number(tx.amount)));

  const series = [];
  let cumulative = 0;
  for (let day = 1; day <= totalDays; day++) {
    const isFuture = day > ref.getDate();
    cumulative += byDay[day];
    series.push({
      day,
      label: `${day}`,
      amount: isFuture ? null : byDay[day],
      cumulative: isFuture ? null : cumulative,
      pace: (totalBudget / totalDays) * day,
    });
  }
  return series;
}

// Spending in the last N rolling 7-day windows (oldest first)
export function weeklySeries(transactions, weeks = 8, ref = new Date()) {
  const end = startOfDay(ref);
  const series = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const weekEnd = addDays(end, -7 * i);
    const weekStart = addDays(weekEnd, -6);
    const startISO = toISO(weekStart);
    const endISO = toISO(weekEnd);
    const amount = sumAmounts(transactions.filter((tx) => tx.date >= startISO && tx.date <= endISO));
    series.push({ label: shortDate(weekStart), range: `${shortDate(weekStart)} – ${shortDate(weekEnd)}`, amount });
  }
  return series;
}

// Totals for the last N calendar months, broken down by category
export function monthlySeries(transactions, months = 6, ref = new Date()) {
  const series = [];
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(ref.getFullYear(), ref.getMonth() - i, 1);
    const monthTx = filterByMonth(transactions, date.getFullYear(), date.getMonth());
    const row = {
      key: monthKey(date),
      label: monthLabel(date),
      longLabel: monthLabel(date, true),
      amount: sumAmounts(monthTx),
      count: monthTx.length,
      isCurrent: i === 0,
    };
    Object.assign(row, totalsByCategory(monthTx));
    series.push(row);
  }
  return series;
}

// Spending for each of the last N days (oldest first)
export function lastNDaysSeries(transactions, days = 30, ref = new Date()) {
  const totals = {};
  transactions.forEach((tx) => (totals[tx.date] = (totals[tx.date] || 0) + Number(tx.amount)));
  const series = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = addDays(startOfDay(ref), -i);
    series.push({ label: shortDate(date), amount: totals[toISO(date)] || 0 });
  }
  return series;
}

// Totals per payment method, largest first
export function paymentBreakdown(transactions) {
  const totals = {};
  transactions.forEach((tx) => (totals[tx.paymentMethod] = (totals[tx.paymentMethod] || 0) + Number(tx.amount)));
  const grand = sumAmounts(transactions);
  return Object.entries(totals)
    .map(([method, amount]) => ({ method, amount, percent: grand ? (amount / grand) * 100 : 0 }))
    .sort((a, b) => b.amount - a.amount);
}

// Spending per day of week (Mon..Sun) across all history
export function weekdayPattern(transactions) {
  const names = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const totals = new Array(7).fill(0);
  transactions.forEach((tx) => {
    const jsDay = parseISO(tx.date).getDay(); // 0 = Sunday
    totals[(jsDay + 6) % 7] += Number(tx.amount);
  });
  return names.map((name, i) => ({ label: name, amount: totals[i] }));
}

/* ---------- budgets ---------- */

export function budgetStatus(spent, budget) {
  if (!budget || budget <= 0) return 'none';
  const ratio = spent / budget;
  if (ratio > 1) return 'over';
  if (ratio >= 0.8) return 'warning';
  return 'safe';
}

export function categoryBudgetRows(transactions, categoryBudgets, ref = new Date()) {
  const monthTotals = totalsByCategory(currentMonthTransactions(transactions, ref));
  const totalDays = daysInMonth(ref.getFullYear(), ref.getMonth());
  return CATEGORIES.map((cat) => {
    const spent = monthTotals[cat.id];
    const budget = Number(categoryBudgets[cat.id]) || 0;
    const projected = (spent / ref.getDate()) * totalDays;
    return {
      ...cat,
      spent,
      budget,
      projected,
      remaining: budget - spent,
      percent: budget > 0 ? (spent / budget) * 100 : 0,
      status: budgetStatus(spent, budget),
      projectedStatus: budgetStatus(projected, budget),
    };
  });
}

/* ---------- forecasting ---------- */

/*
 * Simple, explainable forecasting:
 *  - pace projection   = (spent this month ÷ days elapsed) × days in month
 *  - history projection = spent so far + (historical average per day × days left)
 *  - averages are taken over the full history of transactions
 */
export function forecast(transactions, totalBudget, ref = new Date()) {
  const summary = monthSummary(transactions, totalBudget, ref);
  const hasData = transactions.length > 0;

  // History window = first transaction date → today
  const dates = transactions.map((tx) => tx.date).sort();
  const firstDate = hasData ? parseISO(dates[0]) : startOfDay(ref);
  const historyDays = Math.max(1, diffDays(firstDate, ref) + 1);
  const historyTotal = sumAmounts(transactions.filter((tx) => tx.date <= toISO(ref)));
  const histAvgDaily = hasData ? historyTotal / historyDays : 0;

  // Complete months = every month before the current one that falls inside the history window
  const completeMonths = [];
  let cursor = new Date(firstDate.getFullYear(), firstDate.getMonth(), 1);
  const currentStart = new Date(ref.getFullYear(), ref.getMonth(), 1);
  while (hasData && cursor < currentStart) {
    completeMonths.push(filterByMonth(transactions, cursor.getFullYear(), cursor.getMonth()));
    cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
  }

  const avgMonthly = completeMonths.length
    ? completeMonths.reduce((t, m) => t + sumAmounts(m), 0) / completeMonths.length
    : summary.projected; // no complete month yet → fall back to this month's projection

  const historyProjection = summary.spent + histAvgDaily * summary.daysLeft;

  const monthTotals = totalsByCategory(summary.transactions);
  const categoryAverages = CATEGORIES.map((cat) => {
    const monthlyAvg = completeMonths.length
      ? completeMonths.reduce((t, m) => t + totalsByCategory(m)[cat.id], 0) / completeMonths.length
      : (monthTotals[cat.id] / summary.daysElapsed) * summary.totalDays;
    const projected = (monthTotals[cat.id] / summary.daysElapsed) * summary.totalDays;
    return {
      ...cat,
      spentThisMonth: monthTotals[cat.id],
      monthlyAvg,
      dailyAvg: monthlyAvg / 30.44,
      projected,
      trend: monthlyAvg > 0 ? ((projected - monthlyAvg) / monthlyAvg) * 100 : 0,
    };
  }).sort((a, b) => b.projected - a.projected);

  let confidence = 'High';
  if (!hasData) confidence = 'No data';
  else if (summary.daysElapsed < 7 || summary.count < 5) confidence = 'Low';
  else if (summary.daysElapsed < 15 || completeMonths.length < 2) confidence = 'Medium';

  return {
    hasData,
    summary,
    historyDays,
    completeMonthCount: completeMonths.length,
    avgDaily: histAvgDaily,
    avgWeekly: histAvgDaily * 7,
    avgMonthly,
    paceProjection: summary.projected,
    historyProjection,
    estimatedRemaining: Math.max(0, summary.projected - summary.spent),
    expectedUtilization: summary.projectedUtilization,
    potentialSavings: totalBudget - summary.projected,
    categoryAverages,
    confidence,
  };
}

/* ---------- simulator ---------- */

// Baseline monthly spending per category the simulator starts from
export function simulatorBaseline(transactions, mode, ref = new Date()) {
  if (mode === 'average') {
    const fc = forecast(transactions, 0, ref);
    const base = {};
    fc.categoryAverages.forEach((row) => (base[row.id] = row.monthlyAvg));
    return base;
  }
  // 'projected' – this month's pace extended to the full month
  const summary = monthSummary(transactions, 0, ref);
  const totals = totalsByCategory(summary.transactions);
  const base = {};
  CATEGORY_NAMES.forEach((name) => {
    base[name] = summary.daysElapsed > 0 ? (totals[name] / summary.daysElapsed) * summary.totalDays : 0;
  });
  return base;
}

// new value = base × (1 + pct / 100) + flat   (never below zero)
export function applyAdjustment(base, adjustment) {
  const pct = Number(adjustment?.pct) || 0;
  const flat = Number(adjustment?.flat) || 0;
  return Math.max(0, base * (1 + pct / 100) + flat);
}

export function simulate(baseline, adjustments, budget) {
  const rows = CATEGORIES.map((cat) => {
    const base = baseline[cat.id] || 0;
    const simulated = applyAdjustment(base, adjustments[cat.id]);
    return {
      ...cat,
      base,
      simulated,
      diff: simulated - base,
      changePct: base > 0 ? ((simulated - base) / base) * 100 : simulated > 0 ? 100 : 0,
    };
  });
  const baseTotal = rows.reduce((t, r) => t + r.base, 0);
  const total = rows.reduce((t, r) => t + r.simulated, 0);
  rows.forEach((r) => (r.share = total > 0 ? (r.simulated / total) * 100 : 0));

  return {
    rows,
    baseTotal,
    total,
    diff: total - baseTotal,
    changePct: baseTotal > 0 ? ((total - baseTotal) / baseTotal) * 100 : 0,
    budget,
    remaining: budget - total,
    utilization: budget > 0 ? (total / budget) * 100 : 0,
    savings: Math.max(0, budget - total),
    savedVsBaseline: baseTotal - total,
  };
}

export function isUnchanged(adjustments) {
  return Object.values(adjustments).every((a) => !Number(a.pct) && !Number(a.flat));
}
