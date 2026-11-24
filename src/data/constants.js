import {
  Utensils,
  Car,
  ShoppingBag,
  Clapperboard,
  Receipt,
  GraduationCap,
  HeartPulse,
  Package,
} from 'lucide-react';

// Values read from the .env file (Unit V – Environment Variables)
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Pennywise';
export const APP_TAGLINE = import.meta.env.VITE_APP_TAGLINE || 'Expense Tracker';
export const DEFAULT_BUDGET = Number(import.meta.env.VITE_DEFAULT_BUDGET) || 40000;

// Every category has a colour + icon so the whole UI stays consistent.
export const CATEGORIES = [
  { id: 'Food', color: '#F97316', soft: 'rgba(249,115,22,.14)', icon: Utensils },
  { id: 'Transport', color: '#3B82F6', soft: 'rgba(59,130,246,.14)', icon: Car },
  { id: 'Shopping', color: '#EC4899', soft: 'rgba(236,72,153,.14)', icon: ShoppingBag },
  { id: 'Entertainment', color: '#8B5CF6', soft: 'rgba(139,92,246,.14)', icon: Clapperboard },
  { id: 'Bills', color: '#EAB308', soft: 'rgba(234,179,8,.16)', icon: Receipt },
  { id: 'Education', color: '#14B8A6', soft: 'rgba(20,184,166,.14)', icon: GraduationCap },
  { id: 'Healthcare', color: '#EF4444', soft: 'rgba(239,68,68,.14)', icon: HeartPulse },
  { id: 'Other', color: '#64748B', soft: 'rgba(100,116,139,.16)', icon: Package },
];

export const CATEGORY_NAMES = CATEGORIES.map((c) => c.id);

export function getCategory(id) {
  return CATEGORIES.find((c) => c.id === id) || CATEGORIES[CATEGORIES.length - 1];
}

export const PAYMENT_METHODS = ['UPI', 'Credit Card', 'Debit Card', 'Cash', 'Net Banking', 'Wallet'];

export const DEFAULT_CATEGORY_BUDGETS = {
  Food: 9000,
  Transport: 4000,
  Shopping: 6000,
  Entertainment: 3000,
  Bills: 8000,
  Education: 4000,
  Healthcare: 2500,
  Other: 2000,
};

// Colours used to tell scenarios apart in comparison charts
export const SCENARIO_COLORS = ['#C2571A', '#0EA5E9', '#16A34A', '#9333EA', '#DB2777', '#CA8A04'];
