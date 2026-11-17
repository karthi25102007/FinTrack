import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CalendarDays, ChevronLeft, ChevronRight, Filter, Plus, Search, X } from 'lucide-react';
import { api, endpoints, getErrorMessage } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useApiData } from '../../utils/useApi';
import { formatMoney } from '../../utils/format';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import Loader from '../ui/Loader';
import TransactionTable from './TransactionTable';
import TransactionForm from '../forms/TransactionForm';

export default function ManageTransactions({ type }) {
  const isIncome = type === 'income';
  const { user } = useAuth();
  const { notify } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const currency = user?.currency || 'INR';

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category_id: '',
    start_date: '',
    end_date: '',
    sort: 'date',
    order: 'desc',
    page: 1,
  });
  const [debouncedSearch, setDebouncedSearch] = useState(filters.search);
  const [modal, setModal] = useState({ open: false, initial: null });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(filters.search);
      setFilters((current) => ({ ...current, page: 1 }));
    }, 350);
    return () => window.clearTimeout(timer);
  }, [filters.search]);

  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setModal({ open: true, initial: null });
      const next = new URLSearchParams(searchParams);
      next.delete('new');
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const query = new URLSearchParams({
    type, limit: '10', page: String(filters.page),
    sort: filters.sort, order: filters.order,
  });
  if (debouncedSearch) query.set('search', debouncedSearch);
  if (filters.category_id) query.set('category_id', filters.category_id);
  if (filters.start_date) query.set('start_date', filters.start_date);
  if (filters.end_date) query.set('end_date', filters.end_date);

  const { data, loading, error, reload } = useApiData(`${endpoints.transactions}?${query.toString()}`);
  const { data: categoryData } = useApiData(`${endpoints.categories}?type=${type}`);
  const categories = categoryData?.categories || [];
  const pagination = data?.pagination || {};
  const transactions = data?.transactions || [];

  const change = (event) => {
    setFilters((current) => ({ ...current, [event.target.name]: event.target.value, page: 1 }));
  };

  const openCreate = () => setModal({ open: true, initial: null });
  const openEdit = (item) => setModal({ open: true, initial: item });

  const submit = async (values) => {
    setSaving(true);
    try {
      if (modal.initial) {
        await api.put(`${endpoints.transactions}/${modal.initial.id}`, values);
        notify(`${isIncome ? 'Income' : 'Expense'} updated successfully.`);
      } else {
        await api.post(endpoints.transactions, values);
        notify(`${isIncome ? 'Income' : 'Expense'} added successfully.`);
      }
      setModal({ open: false, initial: null });
      reload();
    } catch (err) {
      notify(getErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (item) => {
    if (!window.confirm(`Delete "${item.description || item.category_name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`${endpoints.transactions}/${item.id}`);
      notify('Transaction deleted.');
      reload();
    } catch (err) {
      notify(getErrorMessage(err), 'error');
    }
  };

  const clearFilters = () => {
    setFilters({ search: '', category_id: '', start_date: '', end_date: '', sort: 'date', order: 'desc', page: 1 });
    setDebouncedSearch('');
  };

  const hasFilters = filters.category_id || filters.start_date || filters.end_date || filters.search || filters.sort !== 'date' || filters.order !== 'desc';

  return (
    <div className="page-stack">
      <div className="page-heading">
        <div>
          <p className="page-eyebrow">{isIncome ? 'MONEY IN' : 'MONEY OUT'}</p>
          <h2>{isIncome ? 'Income Management' : 'Expense Management'}</h2>
          <p className="page-subtitle">{isIncome ? 'Track and organise every source of income.' : 'Monitor, search and control everything you spend.'}</p>
        </div>
        <Button icon={Plus} onClick={openCreate}>Add {isIncome ? 'Income' : 'Expense'}</Button>
      </div>

      <div className="mini-stats-grid">
        <div className="mini-stat"><span>{isIncome ? 'Total income' : 'Total expenses'}</span><strong>{formatMoney(isIncome ? pagination.income_total : pagination.expense_total, currency)}</strong></div>
        <div className="mini-stat"><span>Transactions</span><strong>{pagination.total || 0}</strong></div>
        <div className="mini-stat"><span>Average per entry</span><strong>{formatMoney(pagination.total ? (isIncome ? pagination.income_total : pagination.expense_total) / pagination.total : 0, currency)}</strong></div>
      </div>

      <Card padded={false}>
        <div className="filter-bar">
          <div className="search-box">
            <Search size={17} />
            <input type="search" name="search" placeholder={`Search ${isIncome ? 'income' : 'transactions'}…`} value={filters.search} onChange={change} />
            {filters.search && <button type="button" onClick={() => setFilters((c) => ({ ...c, search: '' }))} aria-label="Clear search"><X size={14} /></button>}
          </div>
          <div className="filter-selects">
            <div className="select-icon"><Filter size={15} />
              <select name="category_id" value={filters.category_id} onChange={change} aria-label="Filter by category">
                <option value="">All categories</option>
                {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
            </div>
            <div className="select-icon"><CalendarDays size={15} />
              <input type="date" name="start_date" value={filters.start_date} onChange={change} aria-label="Start date" title="From date" />
            </div>
            <div className="select-icon"><CalendarDays size={15} />
              <input type="date" name="end_date" value={filters.end_date} onChange={change} aria-label="End date" title="To date" />
            </div>
            <select name="sort" value={filters.sort} onChange={change} aria-label="Sort by">
              <option value="date">Sort: Date</option>
              <option value="amount">Sort: Amount</option>
              <option value="category">Sort: Category</option>
              <option value="description">Sort: Description</option>
            </select>
            <select name="order" value={filters.order} onChange={change} aria-label="Sort order">
              <option value="desc">Newest first</option>
              <option value="asc">Oldest first</option>
            </select>
            {hasFilters && <Button variant="ghost" size="sm" onClick={clearFilters}>Clear</Button>}
          </div>
        </div>

        {error && <div className="alert alert--error">{getErrorMessage(error)} <button onClick={reload}>Retry</button></div>}
        {loading && !data ? <Loader full label="Loading transactions…" /> : (
          <TransactionTable transactions={transactions} currency={currency} onEdit={openEdit} onDelete={remove} />
        )}

        {pagination.pages > 1 && (
          <div className="pagination">
            <span>Page {pagination.page} of {pagination.pages} · {pagination.total} records</span>
            <div className="pagination-buttons">
              <button type="button" disabled={filters.page <= 1} onClick={() => setFilters((c) => ({ ...c, page: c.page - 1 }))}><ChevronLeft size={16} /> Previous</button>
              <button type="button" disabled={filters.page >= pagination.pages} onClick={() => setFilters((c) => ({ ...c, page: c.page + 1 }))}>Next <ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </Card>

      <Modal
        open={modal.open}
        onClose={() => setModal({ open: false, initial: null })}
        title={modal.initial ? `Edit ${isIncome ? 'Income' : 'Expense'}` : `Add ${isIncome ? 'Income' : 'Expense'}`}
        subtitle={modal.initial ? 'Update the details below.' : 'Record a new transaction in your ledger.'}
      >
        <TransactionForm
          type={type}
          categories={categories}
          initial={modal.initial}
          submitting={saving}
          onCancel={() => setModal({ open: false, initial: null })}
          onSubmit={submit}
        />
      </Modal>
    </div>
  );
}
