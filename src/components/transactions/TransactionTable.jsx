import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Trash2 } from 'lucide-react';
import CategoryIcon from '../ui/CategoryIcon';
import CategoryPill from '../ui/CategoryPill';
import { formatINR, formatDate } from '../../utils/format';
import { sumAmounts } from '../../utils/calculations';

/*
 * Transaction table. When sorted by date the rows are grouped under date
 * headings – each group is a <Fragment key=...> because a list item needs a
 * key but we don't want an extra wrapper element inside <tbody>.
 */
function TransactionTable({ transactions, groupByDate, onEdit, onDelete }) {
  const groups = [];
  if (groupByDate) {
    transactions.forEach((tx) => {
      const last = groups[groups.length - 1];
      if (last && last.date === tx.date) last.items.push(tx);
      else groups.push({ date: tx.date, items: [tx] });
    });
  } else {
    groups.push({ date: null, items: transactions });
  }

  const handleDelete = (tx) => {
    if (window.confirm(`Delete “${tx.title}” (${formatINR(tx.amount)})?`)) onDelete(tx.id);
  };

  return (
    <div className="table-wrap">
      <table className="tx-table">
        <thead>
          <tr>
            <th>Expense</th>
            <th>Category</th>
            <th className="hide-md">Payment</th>
            {!groupByDate && <th className="hide-md">Date</th>}
            <th className="num">Amount</th>
            <th className="actions-col" aria-label="Actions" />
          </tr>
        </thead>
        <tbody>
          {groups.map((group) => (
            <Fragment key={group.date ?? 'all'}>
              {group.date && (
                <tr className="group-row">
                  <td colSpan={6}>
                    <div className="group-row-inner">
                      <span>{formatDate(group.date)}</span>
                      <span>
                        {group.items.length} {group.items.length === 1 ? 'expense' : 'expenses'} · {formatINR(sumAmounts(group.items))}
                      </span>
                    </div>
                  </td>
                </tr>
              )}
              {group.items.map((tx) => (
                <tr key={tx.id}>
                  <td>
                    <Link to={`/transactions/${tx.id}`} className="tx-cell">
                      <CategoryIcon category={tx.category} size={34} />
                      <span>
                        <span className="tx-title">{tx.title}</span>
                        <span className="tx-sub show-md">
                          {tx.paymentMethod} · {formatDate(tx.date)}
                        </span>
                      </span>
                    </Link>
                  </td>
                  <td>
                    <CategoryPill category={tx.category} />
                  </td>
                  <td className="hide-md muted">{tx.paymentMethod}</td>
                  {!groupByDate && <td className="hide-md muted">{formatDate(tx.date)}</td>}
                  <td className="num amount">{formatINR(tx.amount)}</td>
                  <td className="actions-col">
                    <div className="row-actions">
                      <button className="icon-btn sm" onClick={() => onEdit(tx)} aria-label="Edit">
                        <Pencil size={15} />
                      </button>
                      <button className="icon-btn sm danger" onClick={() => handleDelete(tx)} aria-label="Delete">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TransactionTable;
