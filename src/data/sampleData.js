import { toISO } from '../utils/dates';
import { DEFAULT_BUDGET, DEFAULT_CATEGORY_BUDGETS, CATEGORY_NAMES } from './constants';

/*
 * Generates realistic sample transactions for the current month (up to today)
 * and the three previous months. A seeded random generator is used so the
 * data looks "random" but is the same every time it is generated.
 */

function seededRandom(seed) {
  let t = seed;
  return function () {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), t | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

// Random spending templates: [titles, min amount, max amount, times per month, payment methods]
const TEMPLATES = {
  Food: [
    ['Swiggy order', 'Zomato dinner', 'BigBasket groceries', 'Third Wave Coffee', 'College canteen lunch', 'Blinkit groceries', 'Weekend brunch', 'Chaat & street food', 'Domino\'s pizza'],
    90, 1350, 15, ['UPI', 'UPI', 'Credit Card', 'Cash', 'Wallet'],
  ],
  Transport: [
    ['Uber ride', 'Ola auto', 'Metro card recharge', 'Petrol refill', 'Rapido bike taxi', 'IRCTC train ticket'],
    45, 1600, 9, ['UPI', 'Wallet', 'Debit Card', 'Cash'],
  ],
  Shopping: [
    ['Amazon order', 'Myntra – apparel', 'Decathlon sports gear', 'Flipkart – accessories', 'Nykaa skincare', 'Local market'],
    299, 3400, 3, ['Credit Card', 'UPI', 'Debit Card'],
  ],
  Entertainment: [
    ['PVR movie tickets', 'BookMyShow concert', 'Gaming top-up', 'Bowling with friends', 'Stand-up comedy show'],
    199, 1400, 2, ['UPI', 'Credit Card'],
  ],
  Education: [
    ['Udemy course', 'Reference books', 'Stationery', 'Coursera certificate', 'Exam registration fee'],
    120, 2200, 2, ['UPI', 'Net Banking', 'Debit Card'],
  ],
  Healthcare: [
    ['Apollo Pharmacy', 'Doctor consultation', 'Lab tests', 'Tata 1mg medicines'],
    150, 1500, 1.5, ['UPI', 'Debit Card', 'Cash'],
  ],
  Other: [
    ['Birthday gift', 'Laundry', 'Haircut', 'Courier charges', 'Donation'],
    100, 1100, 2, ['UPI', 'Cash'],
  ],
};

// Fixed monthly payments: [day, title, category, min, max, method]
const RECURRING = [
  [1, 'Gym membership', 'Healthcare', 1200, 1200, 'Debit Card'],
  [3, 'Netflix subscription', 'Entertainment', 649, 649, 'Credit Card'],
  [5, 'Electricity bill – BESCOM', 'Bills', 1650, 2550, 'Net Banking'],
  [8, 'Airtel broadband', 'Bills', 999, 999, 'UPI'],
  [12, 'Jio mobile recharge', 'Bills', 349, 349, 'UPI'],
  [15, 'Spotify premium', 'Entertainment', 119, 119, 'Credit Card'],
  [18, 'Water & maintenance', 'Bills', 1500, 1500, 'Net Banking'],
  [22, 'LPG cylinder', 'Bills', 905, 905, 'UPI'],
];

export function generateSampleTransactions(today = new Date()) {
  const random = seededRandom(20261118);
  const transactions = [];
  let counter = 1;

  const pick = (list) => list[Math.floor(random() * list.length)];
  const amountBetween = (min, max) => {
    const value = min + random() * (max - min);
    return value > 500 ? Math.round(value / 10) * 10 : Math.round(value);
  };

  for (let offset = 3; offset >= 0; offset--) {
    const monthStart = new Date(today.getFullYear(), today.getMonth() - offset, 1);
    const year = monthStart.getFullYear();
    const month = monthStart.getMonth();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const lastDay = offset === 0 ? today.getDate() : totalDays;

    const add = (day, title, category, amount, paymentMethod) => {
      transactions.push({
        id: `tx-${counter++}`,
        title,
        amount,
        category,
        date: toISO(new Date(year, month, day)),
        paymentMethod,
        note: '',
      });
    };

    RECURRING.forEach(([day, title, category, min, max, method]) => {
      if (day <= lastDay) add(day, title, category, amountBetween(min, max), method);
    });

    Object.entries(TEMPLATES).forEach(([category, [titles, min, max, perMonth, methods]]) => {
      // slight variation each month so the trends are interesting
      const count = Math.max(1, Math.round(perMonth * (0.75 + random() * 0.5)));
      for (let i = 0; i < count; i++) {
        const day = 1 + Math.floor(random() * totalDays);
        if (day > lastDay) continue;
        add(day, pick(titles), category, amountBetween(min, max), pick(methods));
      }
    });
  }

  // Newest first
  return transactions.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function defaultBudget() {
  return { total: DEFAULT_BUDGET, categories: { ...DEFAULT_CATEGORY_BUDGETS } };
}

export function emptyAdjustments() {
  const adjustments = {};
  CATEGORY_NAMES.forEach((name) => {
    adjustments[name] = { pct: 0, flat: 0 };
  });
  return adjustments;
}

export function defaultScenarios() {
  const frugal = emptyAdjustments();
  frugal.Food = { pct: -15, flat: 0 };
  frugal.Shopping = { pct: -40, flat: 0 };
  frugal.Entertainment = { pct: -30, flat: 0 };
  frugal.Transport = { pct: -10, flat: 0 };

  const festive = emptyAdjustments();
  festive.Shopping = { pct: 60, flat: 2000 };
  festive.Food = { pct: 0, flat: 2000 };
  festive.Entertainment = { pct: 50, flat: 0 };
  festive.Transport = { pct: 100, flat: 0 };

  return [
    { id: 'sc-current', name: 'Current pattern', colorIndex: 0, budget: null, adjustments: emptyAdjustments() },
    { id: 'sc-frugal', name: 'Frugal month', colorIndex: 2, budget: null, adjustments: frugal },
    { id: 'sc-festive', name: 'Festive splurge', colorIndex: 4, budget: null, adjustments: festive },
  ];
}
