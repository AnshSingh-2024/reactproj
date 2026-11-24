import { useState } from 'react';
import { Plus, SearchX } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import TransactionFilters from '../components/transactions/TransactionFilters';
import TransactionTable from '../components/transactions/TransactionTable';
import { sumAmounts } from '../utils/calculations';
import { formatINR } from '../utils/format';
import { parseISO, monthKey, monthLabel } from '../utils/dates';

const DEFAULT_FILTERS = {
  search: '',
  category: 'All',
  payment: 'All',
  month: 'All',
  minAmount: '',
  maxAmount: '',
  sort: 'date-desc',
};

// Filtering and sorting are plain functions, kept outside the component
function applyFilters(transactions, f) {
  const query = f.search.trim().toLowerCase();
  const min = f.minAmount === '' ? -Infinity : Number(f.minAmount);
  const max = f.maxAmount === '' ? Infinity : Number(f.maxAmount);

  const result = transactions.filter((tx) => {
    if (query && !`${tx.title} ${tx.note} ${tx.category} ${tx.paymentMethod}`.toLowerCase().includes(query)) return false;
    if (f.category !== 'All' && tx.category !== f.category) return false;
    if (f.payment !== 'All' && tx.paymentMethod !== f.payment) return false;
    if (f.month !== 'All' && !tx.date.startsWith(f.month)) return false;
    if (tx.amount < min || tx.amount > max) return false;
    return true;
  });

  const [field, direction] = f.sort.split('-');
  const factor = direction === 'asc' ? 1 : -1;
  return result.sort((a, b) => {
    if (field === 'amount') return (a.amount - b.amount) * factor;
    if (a.date === b.date) return (a.amount - b.amount) * -1;
    return (a.date < b.date ? -1 : 1) * factor;
  });
}

function Transactions({ transactions, onAdd, onEdit, onDelete }) {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [visibleCount, setVisibleCount] = useState(40);

  const filtered = applyFilters(transactions, filters);
  const visible = filtered.slice(0, visibleCount);

  // Unique months present in the data, for the month filter
  const monthOptions = [...new Set(transactions.map((tx) => tx.date.slice(0, 7)))]
    .sort()
    .reverse()
    .map((key) => {
      const date = parseISO(`${key}-01`);
      return { value: monthKey(date), label: monthLabel(date, true) };
    });

  const handleFilterChange = (next) => {
    setFilters(next);
    setVisibleCount(40);
  };

  return (
    <>
      <PageHeader title="Transactions" description="Every rupee you've spent, searchable and sortable.">
        <button className="btn btn-primary" onClick={onAdd}>
          <Plus size={16} /> Add expense
        </button>
      </PageHeader>

      <Card padded={false}>
        <div className="card-pad">
          <TransactionFilters
            filters={filters}
            onChange={handleFilterChange}
            onReset={() => handleFilterChange(DEFAULT_FILTERS)}
            monthOptions={monthOptions}
          />
          <div className="result-summary">
            <span>
              Showing <strong>{filtered.length}</strong> of {transactions.length} expenses
            </span>
            <span>
              Total <strong>{formatINR(sumAmounts(filtered))}</strong>
            </span>
          </div>
        </div>

        {transactions.length === 0 ? (
          <EmptyState title="No expenses yet" message="Start by adding your first expense.">
            <button className="btn btn-primary" onClick={onAdd}>
              <Plus size={16} /> Add expense
            </button>
          </EmptyState>
        ) : filtered.length === 0 ? (
          <EmptyState icon={SearchX} title="No matches" message="Try a different search term or clear the filters." />
        ) : (
          <>
            <TransactionTable
              transactions={visible}
              groupByDate={filters.sort.startsWith('date')}
              onEdit={onEdit}
              onDelete={onDelete}
            />
            {filtered.length > visibleCount && (
              <div className="load-more">
                <button className="btn btn-ghost" onClick={() => setVisibleCount((c) => c + 40)}>
                  Show more ({filtered.length - visibleCount} remaining)
                </button>
              </div>
            )}
          </>
        )}
      </Card>
    </>
  );
}

export default Transactions;
