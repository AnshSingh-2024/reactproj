# Pennywise – Expense Tracker & Spending Simulator

A React single-page app that tracks your expenses, analyses spending, manages budgets, forecasts the month and lets you try **what-if** spending plans live in a simulator.
Course micro-project for **Front End Development using ReactJS (ISAEC594)**.

## Run it

```bash
npm install      # first time only
npm run dev      # open http://localhost:5173
```

Production build: `npm run build`, then `npm run preview`.

Deploy to Netlify: build command `npm run build`, publish directory `dist`.
`public/_redirects` makes page refreshes work with React Router.

On first launch the app loads realistic sample data covering the current month and the three before it. You can restore it or clear it from **Budgets → Data**. All data is stored in `localStorage`; there is no backend.

## Features

| Page | What it does |
|---|---|
| Dashboard | Monthly spend vs budget, remaining balance, average per day, projection, transaction count, running-total chart, category donut, weekly/monthly chart, budget alerts, recent expenses |
| Transactions | Add, edit and delete expenses; search; filter by category, payment method, month and amount; sort by date or amount; click a row to open its detail page |
| Analytics | Period switch; category amounts and %; highest and lowest category; average transaction; daily, weekly and monthly trends; monthly category mix; day-of-week pattern; payment methods |
| Budgets | Overall and per-category budgets, progress bars, warning at 80%, over-budget and projected-over alerts, "suggest from history" |
| Live Simulator | Change each category with a slider (−100%…+200%), a ± amount and quick chips (−20%, ×2, +₹2,000…). Total, remaining budget, savings, gauge and charts update instantly |
| What-if Scenarios | Create, rename, modify (opens in simulator), reset, delete and compare scenarios: chart plus a table with % changes and savings |
| Forecast | Average per day, week and month; per-category averages; pace-based and history-based projections; estimated remaining spend; expected utilisation; savings; confidence level |

Simulated values are kept separate from real data: the Simulator and Scenarios pages are never given a function that can change transactions.

## Project structure

```
src/
  main.jsx               BrowserRouter + ErrorBoundary + App
  App.jsx                Lifted state (transactions, budget, scenarios, theme), routes, handlers
  index.css              Global design system (CSS variables, light/dark)
  data/                  constants (categories, .env values), sample data generator
  utils/                 calculations.js (all maths), dates.js, format.js (₹), storage.js
  components/
    layout/              Layout, Sidebar (NavLink), Topbar (useLocation)
    ui/                  Card, StatCard (CSS Module), ProgressBar (CSS Module), Modal, Toast, …
    charts/              Recharts wrappers
    transactions/        TransactionForm, TransactionFilters, TransactionTable, RecentList
    simulator/           CategoryControl, BudgetGauge, CompareBarChart
    ErrorBoundary.jsx    Class component
  pages/                 Dashboard, Transactions, TransactionDetail, Analytics, Budgets,
                         Simulator, Scenarios, Forecast, NotFound
```

## Where each syllabus topic appears (viva guide)

| Unit | Concept | Where |
|---|---|---|
| I | JSX, embedding expressions, conditional rendering | every page, e.g. `Dashboard.jsx` (`onTrack ? … : …`, `&&`) |
| I | Vite project setup and structure | `package.json`, `vite.config.js`, `index.html` |
| II | Functional components and props | `StatCard`, `CategoryControl`, `ScenarioCard` |
| II | `props.children` | `Card.jsx`, `Layout.jsx`, `Modal.jsx`, `ErrorBoundary.jsx` |
| II | Class component | `ErrorBoundary.jsx` (constructor, `this.state`, lifecycle) |
| II | Fragments | `<>…</>` in pages; keyed `<Fragment>` in `TransactionTable.jsx` |
| II | Lists and keys | `.map()` with `key` everywhere |
| II | Props vs state | `TransactionTable` (props only) vs `Transactions` page (state) |
| III | Event handling, SyntheticEvent, arrow functions | `onClick`, `onChange`, `e.preventDefault()` in forms |
| III | `bind()` | `ErrorBoundary.jsx` constructor |
| III | Controlled inputs: input, textarea, select | `TransactionForm.jsx` (one `handleChange` driven by the `name` attribute) |
| III | Uncontrolled input | `Scenarios.jsx` create form (value read from a `useRef`) |
| III | Lifting state up | `App.jsx` holds data; `TransactionFilters` and `CategoryControl` report changes to their parent |
| IV | BrowserRouter, Routes, Route | `main.jsx`, `App.jsx` |
| IV | Link, NavLink | `Sidebar.jsx` (active class), links across pages |
| IV | useParams | `TransactionDetail.jsx` (`/transactions/:id`), `Simulator.jsx` (`/simulator/:scenarioId`) |
| IV | useLocation | `Topbar.jsx` (page title), `Layout.jsx` (close menu on navigation), `NotFound.jsx` |
| V | useState | everywhere (including lazy initial state in `App.jsx`) |
| V | useEffect | localStorage saving, theme, toast timer, Escape key, keyboard shortcut, syncing a draft |
| V | useRef | input focus (`TransactionForm`), `/` search shortcut, previous value + animation frame in `AnimatedNumber` |
| V | CSS Modules | `StatCard.module.css`, `ProgressBar.module.css` |
| V | Inline styles | category colours, progress widths, gauge arcs |
| V | Environment variables | `.env` → `import.meta.env.VITE_*` in `data/constants.js` |
| V | Build and deployment | `npm run build`, `public/_redirects` for Netlify |

React DevTools: install the browser extension and inspect `App` to see the lifted state live while you change things.

## Formulas

- Average daily spend (this month) = spent this month ÷ days elapsed
- Projected month = average daily × days in month
- History projection = spent so far + (all-time daily average × days left)
- Average monthly = mean of **complete** months only
- Simulated category = base × (1 + % / 100) + ± amount (never below ₹0)
- Budget status: < 80% safe · 80–100% approaching · > 100% exceeded
