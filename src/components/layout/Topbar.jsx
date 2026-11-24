import { useLocation, Link } from 'react-router-dom';
import { Menu, Moon, Sun, Plus } from 'lucide-react';
import { monthLabel } from '../../utils/dates';

// Page titles are chosen from the current URL using useLocation (Unit IV)
const TITLES = {
  '/': 'Dashboard',
  '/transactions': 'Transactions',
  '/analytics': 'Analytics',
  '/budgets': 'Budgets',
  '/simulator': 'Live Simulator',
  '/scenarios': 'What-if Scenarios',
  '/forecast': 'Forecast',
};

function getTitle(pathname) {
  if (TITLES[pathname]) return TITLES[pathname];
  if (pathname.startsWith('/transactions/')) return 'Transaction details';
  if (pathname.startsWith('/simulator/')) return 'Scenario editor';
  return 'Not found';
}

function Topbar({ theme, onToggleTheme, onAddExpense, onOpenMenu }) {
  const { pathname } = useLocation();
  const title = getTitle(pathname);

  return (
    <header className="topbar">
      <button className="icon-btn menu-btn" onClick={onOpenMenu} aria-label="Open menu">
        <Menu size={20} />
      </button>
      <div className="topbar-title">
        <div className="crumbs">
          <Link to="/">Pennywise</Link> <span>/</span> {title}
        </div>
        <div className="topbar-date">{monthLabel(new Date(), true)}</div>
      </div>
      <div className="topbar-actions">
        <button className="icon-btn" onClick={onToggleTheme} aria-label="Toggle theme" title="Toggle theme">
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
        <button className="btn btn-primary" onClick={onAddExpense}>
          <Plus size={18} /> <span className="hide-sm">Add expense</span>
        </button>
      </div>
    </header>
  );
}

export default Topbar;
