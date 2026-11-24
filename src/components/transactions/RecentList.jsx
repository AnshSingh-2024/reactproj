import { Link } from 'react-router-dom';
import CategoryIcon from '../ui/CategoryIcon';
import { formatINR, formatDate } from '../../utils/format';

// Compact list of the latest expenses (used on the dashboard)
function RecentList({ transactions, onEdit }) {
  return (
    <ul className="recent-list">
      {transactions.map((tx) => (
        <li key={tx.id}>
          <CategoryIcon category={tx.category} />
          <Link to={`/transactions/${tx.id}`} className="recent-main">
            <span className="tx-title">{tx.title}</span>
            <span className="tx-sub">
              {tx.category} · {formatDate(tx.date)}
            </span>
          </Link>
          <button className="recent-amount" onClick={() => onEdit(tx)} title="Edit">
            −{formatINR(tx.amount)}
          </button>
        </li>
      ))}
    </ul>
  );
}

export default RecentList;
