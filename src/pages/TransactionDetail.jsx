import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Pencil, Trash2, SearchX } from 'lucide-react';
import Card from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import CategoryIcon from '../components/ui/CategoryIcon';
import CategoryPill from '../components/ui/CategoryPill';
import { formatINR, formatDate, formatPercent } from '../utils/format';
import { currentMonthTransactions, sumAmounts, filterByMonth } from '../utils/calculations';
import { parseISO } from '../utils/dates';

/*
 * Route: /transactions/:id
 * useParams reads the ":id" part of the URL (Unit IV).
 */
function TransactionDetail({ transactions, budget, onEdit, onDelete }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const tx = transactions.find((t) => t.id === id);

  if (!tx) {
    return (
      <Card>
        <EmptyState icon={SearchX} title="Expense not found" message="It may have been deleted.">
          <Link to="/transactions" className="btn btn-primary">
            Back to transactions
          </Link>
        </EmptyState>
      </Card>
    );
  }

  const date = parseISO(tx.date);
  const sameMonth = filterByMonth(transactions, date.getFullYear(), date.getMonth());
  const sameCategory = sameMonth.filter((t) => t.category === tx.category);
  const categoryTotal = sumAmounts(sameCategory);
  const categoryBudget = budget.categories[tx.category] || 0;
  const similar = transactions
    .filter((t) => t.id !== tx.id && t.title.toLowerCase() === tx.title.toLowerCase())
    .slice(0, 5);
  const isCurrentMonth = currentMonthTransactions([tx]).length === 1;

  const handleDelete = () => {
    if (window.confirm(`Delete “${tx.title}”?`)) {
      onDelete(tx.id);
      navigate('/transactions');
    }
  };

  const details = [
    ['Date', formatDate(tx.date)],
    ['Payment method', tx.paymentMethod],
    ['Category', <CategoryPill key="c" category={tx.category} />],
    ['Share of month', formatPercent((tx.amount / (sumAmounts(sameMonth) || 1)) * 100, 1)],
  ];

  return (
    <>
      <button className="btn btn-ghost back-btn" onClick={() => navigate(-1)}>
        <ArrowLeft size={16} /> Back
      </button>

      <div className="grid-2-1">
        <Card>
          <div className="detail-head">
            <CategoryIcon category={tx.category} size={56} />
            <div>
              <h1 className="detail-title">{tx.title}</h1>
              <div className="detail-amount">{formatINR(tx.amount)}</div>
            </div>
          </div>

          <dl className="detail-grid">
            {details.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>

          {tx.note && <p className="detail-note">“{tx.note}”</p>}

          <div className="form-actions start">
            <button className="btn btn-primary" onClick={() => onEdit(tx)}>
              <Pencil size={16} /> Edit
            </button>
            <button className="btn btn-danger-ghost" onClick={handleDelete}>
              <Trash2 size={16} /> Delete
            </button>
          </div>
        </Card>

        <div className="stack">
          <Card title={`${tx.category} that month`}>
            <div className="mini-stat">
              <span>{sameCategory.length} expenses</span>
              <strong>{formatINR(categoryTotal)}</strong>
            </div>
            {isCurrentMonth && categoryBudget > 0 && (
              <p className="muted small">
                {formatPercent((categoryTotal / categoryBudget) * 100)} of the {formatINR(categoryBudget)} {tx.category} budget used.
              </p>
            )}
          </Card>
          <Card title="Similar expenses">
            {similar.length === 0 ? (
              <p className="muted small">No other expenses with this title.</p>
            ) : (
              <ul className="simple-list">
                {similar.map((s) => (
                  <li key={s.id}>
                    <Link to={`/transactions/${s.id}`}>{formatDate(s.date)}</Link>
                    <strong>{formatINR(s.amount)}</strong>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}

export default TransactionDetail;
