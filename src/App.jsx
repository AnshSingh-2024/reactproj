import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';

import Layout from './components/layout/Layout';
import Modal from './components/ui/Modal';
import Toast from './components/ui/Toast';
import TransactionForm from './components/transactions/TransactionForm';

import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import TransactionDetail from './pages/TransactionDetail';
import Analytics from './pages/Analytics';
import Budgets from './pages/Budgets';
import Simulator from './pages/Simulator';
import Scenarios from './pages/Scenarios';
import Forecast from './pages/Forecast';
import NotFound from './pages/NotFound';

import { loadState, saveState, createId } from './utils/storage';
import { generateSampleTransactions, defaultBudget, defaultScenarios, emptyAdjustments } from './data/sampleData';
import { SCENARIO_COLORS } from './data/constants';

/*
 * App is the single source of truth. Transactions, budgets and scenarios are
 * "lifted up" here and passed down to pages through props, together with the
 * functions that change them.
 */
function App() {
  // Lazy initial state: read from localStorage once, or fall back to sample data
  const [transactions, setTransactions] = useState(() => loadState('transactions', null) ?? generateSampleTransactions());
  const [budget, setBudget] = useState(() => loadState('budget', null) ?? defaultBudget());
  const [scenarios, setScenarios] = useState(() => loadState('scenarios', null) ?? defaultScenarios());
  const [theme, setTheme] = useState(() => loadState('theme', 'light'));

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null); // transaction being edited, or null when adding
  const [toast, setToast] = useState(null);

  // Persist to localStorage whenever the data changes
  useEffect(() => saveState('transactions', transactions), [transactions]);
  useEffect(() => saveState('budget', budget), [budget]);
  useEffect(() => saveState('scenarios', scenarios), [scenarios]);

  // Apply the theme to <html> so CSS variables switch
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    saveState('theme', theme);
  }, [theme]);

  // Auto-hide toast after 2.6s (cleanup clears the timer)
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(timer);
  }, [toast]);

  const notify = (message, type = 'success') => setToast({ message, type, id: Date.now() });

  /* ----- transaction handlers ----- */
  const openAddForm = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEditForm = (tx) => {
    setEditing(tx);
    setFormOpen(true);
  };

  const closeForm = () => setFormOpen(false);

  const saveTransaction = (data) => {
    if (editing) {
      setTransactions((prev) => prev.map((tx) => (tx.id === editing.id ? { ...tx, ...data } : tx)));
      notify('Expense updated');
    } else {
      setTransactions((prev) => [{ ...data, id: createId('tx') }, ...prev]);
      notify('Expense added');
    }
    setFormOpen(false);
  };

  const deleteTransaction = (id) => {
    setTransactions((prev) => prev.filter((tx) => tx.id !== id));
    notify('Expense deleted', 'danger');
  };

  /* ----- budget handlers ----- */
  const updateBudget = (newBudget) => {
    setBudget(newBudget);
    notify('Budgets saved');
  };

  /* ----- scenario handlers (never touch real transactions) ----- */
  const createScenario = (name, adjustments = emptyAdjustments(), scenarioBudget = null) => {
    const scenario = {
      id: createId('sc'),
      name: name.trim() || `Scenario ${scenarios.length + 1}`,
      colorIndex: scenarios.length % SCENARIO_COLORS.length,
      budget: scenarioBudget,
      adjustments,
    };
    setScenarios((prev) => [...prev, scenario]);
    notify(`Scenario “${scenario.name}” created`);
    return scenario;
  };

  const updateScenario = (id, changes, message) => {
    setScenarios((prev) => prev.map((sc) => (sc.id === id ? { ...sc, ...changes } : sc)));
    if (message) notify(message);
  };

  const deleteScenario = (id) => {
    setScenarios((prev) => prev.filter((sc) => sc.id !== id));
    notify('Scenario deleted', 'danger');
  };

  /* ----- data management ----- */
  const resetSampleData = () => {
    setTransactions(generateSampleTransactions());
    setBudget(defaultBudget());
    setScenarios(defaultScenarios());
    notify('Sample data restored');
  };

  const clearAllData = () => {
    setTransactions([]);
    notify('All transactions cleared', 'danger');
  };

  // Props shared by many pages
  const shared = { transactions, budget };

  return (
    <>
      <Layout
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
        onAddExpense={openAddForm}
      >
        <Routes>
          <Route path="/" element={<Dashboard {...shared} onAdd={openAddForm} onEdit={openEditForm} />} />
          <Route
            path="/transactions"
            element={<Transactions {...shared} onAdd={openAddForm} onEdit={openEditForm} onDelete={deleteTransaction} />}
          />
          <Route
            path="/transactions/:id"
            element={<TransactionDetail {...shared} onEdit={openEditForm} onDelete={deleteTransaction} />}
          />
          <Route path="/analytics" element={<Analytics {...shared} />} />
          <Route
            path="/budgets"
            element={<Budgets {...shared} onSave={updateBudget} onResetData={resetSampleData} onClearData={clearAllData} />}
          />
          <Route
            path="/simulator"
            element={<Simulator {...shared} scenarios={scenarios} onCreateScenario={createScenario} onUpdateScenario={updateScenario} />}
          />
          <Route
            path="/simulator/:scenarioId"
            element={<Simulator {...shared} scenarios={scenarios} onCreateScenario={createScenario} onUpdateScenario={updateScenario} />}
          />
          <Route
            path="/scenarios"
            element={
              <Scenarios
                {...shared}
                scenarios={scenarios}
                onCreate={createScenario}
                onUpdate={updateScenario}
                onDelete={deleteScenario}
              />
            }
          />
          <Route path="/forecast" element={<Forecast {...shared} />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>

      {formOpen && (
        <Modal title={editing ? 'Edit expense' : 'Add expense'} onClose={closeForm}>
          <TransactionForm initial={editing} onSubmit={saveTransaction} onCancel={closeForm} />
        </Modal>
      )}

      {toast && <Toast key={toast.id} message={toast.message} type={toast.type} />}
    </>
  );
}

export default App;
