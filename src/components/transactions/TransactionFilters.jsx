import { useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { CATEGORY_NAMES, PAYMENT_METHODS } from '../../data/constants';

/*
 * The filter values live in the parent (Transactions page). This component
 * only displays them and reports changes back through onChange – lifting state up.
 */
function TransactionFilters({ filters, onChange, onReset, monthOptions }) {
  const searchRef = useRef(null);

  // Press "/" anywhere to jump to the search box (useRef + useEffect)
  useEffect(() => {
    const handleKey = (event) => {
      const typing = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName);
      if (event.key === '/' && !typing) {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const update = (event) => onChange({ ...filters, [event.target.name]: event.target.value });

  const isFiltered =
    filters.search || filters.category !== 'All' || filters.payment !== 'All' || filters.month !== 'All' || filters.minAmount || filters.maxAmount;

  return (
    <div className="filters">
      <div className="search-box">
        <Search size={17} />
        <input ref={searchRef} name="search" value={filters.search} onChange={update} placeholder="Search title, note…" />
        <kbd>/</kbd>
      </div>

      <select name="category" value={filters.category} onChange={update} aria-label="Category">
        <option value="All">All categories</option>
        {CATEGORY_NAMES.map((name) => (
          <option key={name}>{name}</option>
        ))}
      </select>

      <select name="payment" value={filters.payment} onChange={update} aria-label="Payment method">
        <option value="All">All payments</option>
        {PAYMENT_METHODS.map((m) => (
          <option key={m}>{m}</option>
        ))}
      </select>

      <select name="month" value={filters.month} onChange={update} aria-label="Month">
        <option value="All">All time</option>
        {monthOptions.map((m) => (
          <option key={m.value} value={m.value}>
            {m.label}
          </option>
        ))}
      </select>

      <div className="amount-range">
        <input name="minAmount" type="number" min="0" value={filters.minAmount} onChange={update} placeholder="Min ₹" aria-label="Minimum amount" />
        <span>–</span>
        <input name="maxAmount" type="number" min="0" value={filters.maxAmount} onChange={update} placeholder="Max ₹" aria-label="Maximum amount" />
      </div>

      <select name="sort" value={filters.sort} onChange={update} aria-label="Sort">
        <option value="date-desc">Newest first</option>
        <option value="date-asc">Oldest first</option>
        <option value="amount-desc">Amount: high → low</option>
        <option value="amount-asc">Amount: low → high</option>
      </select>

      {isFiltered && (
        <button className="btn btn-ghost btn-sm" onClick={onReset}>
          <X size={15} /> Clear
        </button>
      )}
    </div>
  );
}

export default TransactionFilters;
