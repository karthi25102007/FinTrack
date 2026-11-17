import React from 'react';
import { ArrowDownLeft, ArrowUpRight, Pencil, Trash2 } from 'lucide-react';
import Badge from '../ui/Badge';
import EmptyState from '../ui/EmptyState';
import { formatDate, formatMoney } from '../../utils/format';

export default function TransactionTable({ transactions = [], currency = 'INR', onEdit, onDelete, compact = false, idPrefix = 'TX' }) {
  if (!transactions.length) {
    return <EmptyState compact title="No transactions found" description="Try adjusting your filters or add a new transaction." />;
  }

  return (
    <div className="table-scroll">
      <table className="data-table">
        <thead>
          <tr>
            {!compact && <th>ID</th>}
            <th>Type</th>
            <th>Category</th>
            <th>Description</th>
            <th className="align-right">Amount</th>
            <th>Date</th>
            {(onEdit || onDelete) && <th className="align-right">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {transactions.map((item) => {
            const income = item.type === 'income';
            return (
              <tr key={item.id}>
                {!compact && <td className="mono muted">#{idPrefix}-{String(item.id).padStart(4, '0')}</td>}
                <td>
                  <Badge tone={income ? 'success' : 'danger'} icon={income ? ArrowDownLeft : ArrowUpRight}>
                    {income ? 'Income' : 'Expense'}
                  </Badge>
                </td>
                <td>
                  <span className="category-cell">
                    <span className="category-dot" style={{ background: item.category_color || '#7c5cff' }} />
                    {item.category_name || item.category || 'Uncategorised'}
                  </span>
                </td>
                <td className="desc-cell" title={item.description}>{item.description || '—'}</td>
                <td className={`align-right amount-cell ${income ? 'text-positive' : 'text-negative'}`}>
                  {income ? '+' : '−'}{formatMoney(item.amount, currency)}
                </td>
                <td className="muted nowrap">{formatDate(item.transaction_date || item.date, { day: '2-digit', month: 'short', year: '2-digit' })}</td>
                {(onEdit || onDelete) && (
                  <td className="align-right">
                    <div className="row-actions">
                      {onEdit && <button type="button" className="icon-btn icon-btn--sm" onClick={() => onEdit(item)} title="Edit" aria-label="Edit transaction"><Pencil size={15} /></button>}
                      {onDelete && <button type="button" className="icon-btn icon-btn--sm danger-text" onClick={() => onDelete(item)} title="Delete" aria-label="Delete transaction"><Trash2 size={15} /></button>}
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
