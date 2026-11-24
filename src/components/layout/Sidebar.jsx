import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowLeftRight,
  PieChart,
  Wallet,
  SlidersHorizontal,
  GitCompareArrows,
  TrendingUp,
  X,
} from 'lucide-react';
import { APP_NAME, APP_TAGLINE } from '../../data/constants';

// Navigation items rendered from an array (lists & keys)
const NAV_SECTIONS = [
  {
    title: 'Track',
    items: [
      { to: '/', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
      { to: '/analytics', label: 'Analytics', icon: PieChart },
      { to: '/budgets', label: 'Budgets', icon: Wallet },
    ],
  },
  {
    title: 'Plan',
    items: [
      { to: '/simulator', label: 'Live Simulator', icon: SlidersHorizontal, badge: 'Live' },
      { to: '/scenarios', label: 'What-if Scenarios', icon: GitCompareArrows },
      { to: '/forecast', label: 'Forecast', icon: TrendingUp },
    ],
  },
];

function Sidebar({ open, onClose }) {
  return (
    <aside className={`sidebar ${open ? 'is-open' : ''}`}>
      <div className="brand">
        <div className="brand-mark">₹</div>
        <div>
          <div className="brand-name">{APP_NAME}</div>
          <div className="brand-tagline">{APP_TAGLINE}</div>
        </div>
        <button className="icon-btn sidebar-close" onClick={onClose} aria-label="Close menu">
          <X size={18} />
        </button>
      </div>

      <nav className="nav">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title} className="nav-section">
            <div className="nav-title">{section.title}</div>
            {section.items.map((item) => {
              const Icon = item.icon;
              return (
                // NavLink adds the "active" class automatically for the current route
                <NavLink key={item.to} to={item.to} end={item.to === '/'} className="nav-link">
                  <Icon size={18} strokeWidth={2} />
                  <span>{item.label}</span>
                  {item.badge && <span className="nav-badge">{item.badge}</span>}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="sidebar-card">
        <div className="sidebar-card-title">Try the simulator</div>
        <p>Drag a slider and watch your month change, without touching real expenses.</p>
        <NavLink to="/simulator" className="btn btn-light btn-sm">
          Open simulator
        </NavLink>
      </div>
    </aside>
  );
}

export default Sidebar;
