import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

// Page shell. Children = the current route's page (props.children).
function Layout({ children, theme, onToggleTheme, onAddExpense }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  // Close the mobile menu and scroll to the top whenever the route changes
  useEffect(() => {
    setMenuOpen(false);
    window.scrollTo({ top: 0 });
  }, [location.pathname]);

  return (
    <div className="app-shell">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      {menuOpen && <div className="sidebar-backdrop" onClick={() => setMenuOpen(false)} />}
      <div className="main-area">
        <Topbar
          theme={theme}
          onToggleTheme={onToggleTheme}
          onAddExpense={onAddExpense}
          onOpenMenu={() => setMenuOpen(true)}
        />
        <main className="page" key={location.pathname}>
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;
