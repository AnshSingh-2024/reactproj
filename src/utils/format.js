import { parseISO } from './dates';

const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const inrCompact = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  notation: 'compact',
  maximumFractionDigits: 1,
});

// ₹12,450
export function formatINR(value) {
  return inr.format(Math.round(Number(value) || 0));
}

// ₹12.5K – used on chart axes
export function formatCompactINR(value) {
  return inrCompact.format(Number(value) || 0);
}

// +₹1,200 / −₹800
export function formatSignedINR(value) {
  const rounded = Math.round(value);
  if (rounded === 0) return formatINR(0);
  return `${rounded > 0 ? '+' : '−'}${formatINR(Math.abs(rounded))}`;
}

export function formatPercent(value, digits = 0) {
  if (!Number.isFinite(value)) return '—';
  return `${value.toFixed(digits)}%`;
}

export function formatSignedPercent(value, digits = 1) {
  if (!Number.isFinite(value)) return '—';
  const fixed = value.toFixed(digits);
  if (Number(fixed) === 0) return '0%';
  return `${value > 0 ? '+' : '−'}${Math.abs(value).toFixed(digits)}%`;
}

const dateFormatter = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export function formatDate(iso) {
  return dateFormatter.format(parseISO(iso));
}
