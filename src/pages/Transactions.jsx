import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ArrowDownLeft, ArrowLeftRight, ArrowUpRight, CalendarDays, ChevronLeft, ChevronRight,
  Download, Filter, Plus, Search, X,
} from 'lucide-react';
import { api, downloadFile, endpoints, getErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useApiData } from '../utils/useApi';
import { formatMoney } from '../utils/format';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Loader from '../components/ui/Loader';
import TransactionTable from '../components/transactions/TransactionTable';
import TransactionForm from '../components/forms/TransactionForm';

export default function Transactions() {
  const { user } = useAuth();
  const { notify } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const currency = user?.currency || 'INR';

  const [filters, setFilters] = useState({
    type: '', search: searchParams.get('search') || '', category_id: '',
    start_date: '', end_date: '', sort: 'date', order: 'desc', page: 1,
  });
  const [debouncedSearch, setDebouncedSearch] = useState(filters.search);
  const [modal, setModal] = useState({ open: false, initial: null, type: 'expense' });
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
      setModal({ open: true, initial: null, type: 'expense' });
      const next = new URLSearchParams(searchParams);
      next.delete('new');
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const query = new URLSearchParams({ limit: '12', page: String(filters.page), sort: filters.sort, order: filters.order });
  if (debouncedSearch) query.set('search', debouncedSearch);
  if (filters.type) query.set('type', filters.type);
  if (filters.category_id) query.set('category_id', filters.category_id);
  if (filters.start_date) query.set('start_date', filters.start_date);
  if (filters.end_date) query.set('end_date', filters.end_date);

  const { data, loading, error, reload } = useApiData(`${endpoints.transactions}?${query.toString()}`);
  const { data: expenseCategories } = useApiData(`${endpoints.categories}?type=expense`);
  const { data: incomeCategories } = useApiData(`${endpoints.categories}?type=income`);
  const categories = [...(expenseCategories?.categories || []), ...(incomeCategories?.categories || [])];
  const pagination = data?.pagination || {};
  const transactions = data?.transactions || [];

  const change = (event) => setFilters((current) => ({ ...current, [event.target.name]: event.target.value, page: 1 }));

  const openCreate = () => setModal({ open: true, initial: null, type: 'expense' });
  const openEdit = (item) => setModal({ open: true, initial: item, type: item.type });

  const submit = async (values) => {
    setSaving(true);
    try {
      if (modal.initial) await api.put(`${endpoints.transactions}/${modal.initial.id}`, values);
      else await api.post(endpoints.transactions, values);
      notify(modal.initial ? 'Transaction updated.' : 'Transaction added.');
      setModal({ open: false, initial: null, type: 'expense' });
      reload();
    } catch (err) {
      notify(getErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (item) => {
    if (!window.confirm(`Delete transaction #${item.id}? This cannot be undone.`)) return;
    try {
      await api.delete(`${endpoints.transactions}/${item.id}`);
      notify('Transaction deleted.');
      reload();
    } catch (err) {
      notify(getErrorMessage(err), 'error');
    }
  };

  const exportCsv = async () => {
    try {
      await downloadFile(`${endpoints.transactions}/export?${query.toString()}`, 'fintrack-transactions.csv');
      notify('Transactions exported as CSV.');
    } catch (err) {
      notify(getErrorMessage(err), 'error');
    }
  };

  const clearFilters = () => {
    setFilters({ type: '', search: '', category_id: '', start_date: '', end_date: '', sort: 'date', order: 'desc', page: 1 });
    setDebouncedSearch('');
  };

  const activeCategories = modal.type === 'income' ? (incomeCategories?.categories || []) : (expenseCategories?.categories || []);

  return (
    <div className="page-stack">
      <div className="page-heading">
        <div>
          <p className="page-eyebrow"><ArrowLeftRight size={14} /> COMPLETE LEDGER</p>
          <h2>Transaction History</h2>
          <p className="page-subtitle">Every income and expense in one searchable, exportable place.</p>
        </div>
        <div className="heading-actions">
          <Button variant="secondary" icon={Download} onClick={exportCsv}>Export CSV</Button>
          <Button icon={Plus} onClick={openCreate}>Add Transaction</Button>
        </div>
      </div>

      <div className="mini-stats-grid">
        <div className="mini-stat"><span>Total income</span><strong className="text-positive">{formatMoney(pagination.income_total, currency)}</strong></div>
        <div className="mini-stat"><span>Total expenses</span><strong className="text-negative">{formatMoney(pagination.expense_total, currency)}</strong></div>
        <div className="mini-stat"><span>Net position</span><strong>{formatMoney((pagination.income_total || 0) - (pagination.expense_total || 0), currency)}</strong></div>
        <div className="mini-stat"><span>Records found</span><strong>{pagination.total || 0}</strong></div>
      </div>

      <Card padded={false}>
        <div className="filter-bar">
          <div className="search-box">
            <Search size={17} />
            <input type="search" name="search" placeholder="Search by description or category…" value={filters.search} onChange={change} />
            {filters.search && <button type="button" onClick={() => setFilters((c) => ({ ...c, search: '' }))} aria-label="Clear search"><X size={14} /></button>}
          </div>
          <div className="filter-selects">
            <div className="select-icon"><Filter size={15} />
              <select name="type" value={filters.type} onChange={change} aria-label="Filter by type">
                <option value="">All types</option>
                <option value="income">Income only</option>
                <option value="expense">Expenses only</option>
              </select>
            </div>
            <select name="category_id" value={filters.category_id} onChange={change} aria-label="Filter by category">
              <option value="">All categories</option>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
            <div className="select-icon"><CalendarDays size={15} />
              <input type="date" name="start_date" value={filters.start_date} onChange={change} aria-label="From date" title="From date" />
            </div>
            <div className="select-icon"><CalendarDays size={15} />
              <input type="date" name="end_date" value={filters.end_date} onChange={change} aria-label="To date" title="To date" />
            </div>
            <select name="sort" value={filters.sort} onChange={change} aria-label="Sort by">
              <option value="date">Sort: Date</option>
              <option value="amount">Sort: Amount</option>
              <option value="category">Sort: Category</option>
              <option value="description">Sort: Description</option>
            </select>
            <select name="order" value={filters.order} onChange={change} aria-label="Order">
              <option value="desc">Newest first</option>
              <option value="asc">Oldest first</option>
            </select>
            <Button variant="ghost" size="sm" onClick={clearFilters}>Clear</Button>
          </div>
        </div>

        {error && <div className="alert alert--error">{getErrorMessage(error)} <button onClick={reload}>Retry</button></div>}
        {loading && !data ? <Loader full label="Loading ledger…" /> : (
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
        onClose={() => setModal({ open: false, initial: null, type: 'expense' })}
        title={modal.initial ? 'Edit Transaction' : 'Add Transaction'}
        subtitle="Record money coming in or going out."
      >
        {!modal.initial && (
          <div className="type-toggle">
            <button type="button" className={modal.type === 'expense' ? 'active' : ''} onClick={() => setModal((m) => ({ ...m, type: 'expense' }))}><ArrowUpRight size={15} /> Expense</button>
            <button type="button" className={modal.type === 'income' ? 'active' : ''} onClick={() => setModal((m) => ({ ...m, type: 'income' }))}><ArrowLeftRight size={15} /> Income</button>
          </div>
        )}
        <TransactionForm
          type={modal.type}
          categories={activeCategories}
          initial={modal.initial}
          submitting={saving}
          onCancel={() => setModal({ open: false, initial: null, type: 'expense' })}
          onSubmit={submit}
        />
      </Modal>
    </div>
  );
}
