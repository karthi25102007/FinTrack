import React, { useState } from 'react';
import {
  AlertTriangle, CalendarDays, CheckCircle2, Pencil, Plus, Target, Trash2, TrendingUp,
} from 'lucide-react';
import { api, endpoints, getErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useApiData } from '../utils/useApi';
import { currentMonth, formatMoney, formatMonth, toneForPercentage } from '../utils/format';
import Card, { CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Loader from '../components/ui/Loader';
import ProgressBar from '../components/ui/ProgressBar';
import EmptyState from '../components/ui/EmptyState';
import BudgetForm from '../components/forms/BudgetForm';

export default function Budgets() {
  const { user } = useAuth();
  const { notify } = useToast();
  const currency = user?.currency || 'INR';
  const [month, setMonth] = useState(currentMonth());
  const [modal, setModal] = useState({ open: false, initial: null, overall: false });
  const [saving, setSaving] = useState(false);

  const { data, loading, error, reload } = useApiData(`${endpoints.budgets}?month=${month}`);
  const budgets = data?.budgets || [];
  const overall = data?.overall;
  const categories = data?.categories || [];

  const submit = async (values) => {
    setSaving(true);
    try {
      if (modal.initial) {
        await api.put(`${endpoints.budgets}/${modal.initial.id}`, values);
        notify('Budget updated successfully.');
      } else {
        await api.post(endpoints.budgets, values);
        notify('Budget created successfully.');
      }
      setModal({ open: false, initial: null, overall: false });
      reload();
    } catch (err) {
      notify(getErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (budget) => {
    if (!window.confirm(`Remove the budget for ${budget.category_name}?`)) return;
    try {
      await api.delete(`${endpoints.budgets}/${budget.id}`);
      notify('Budget removed.');
      reload();
    } catch (err) {
      notify(getErrorMessage(err), 'error');
    }
  };

  const openEdit = (budget) => setModal({ open: true, initial: budget, overall: budget.category_id == null });
  const overallLimit = overall?.amount || 0;
  const overallPct = overall?.percentage || 0;

  return (
    <div className="page-stack">
      <div className="page-heading">
        <div>
          <p className="page-eyebrow"><Target size={14} /> SPENDING PLAN</p>
          <h2>Monthly Budgets</h2>
          <p className="page-subtitle">Set limits, track usage and get warned before you overspend.</p>
        </div>
        <div className="heading-actions">
          <div className="select-icon month-picker"><CalendarDays size={15} />
            <input type="month" value={month} onChange={(event) => setMonth(event.target.value || currentMonth())} aria-label="Select month" />
          </div>
          <Button icon={Plus} onClick={() => setModal({ open: true, initial: null, overall: false })}>Set Budget</Button>
        </div>
      </div>

      {error && <div className="alert alert--error">{getErrorMessage(error)} <button onClick={reload}>Retry</button></div>}

      <Card className="overall-budget-card">
        {loading ? <Loader full label="Loading budget…" /> : (
          <div className="overall-budget-grid">
            <div className="overall-budget-main">
              <div className="overall-budget-head">
                <span className="overall-budget-icon"><Target size={22} /></span>
                <div>
                  <p className="page-eyebrow">{formatMonth(month)}</p>
                  <h3>Overall Monthly Budget</h3>
                </div>
                {overall && (
                  <div className="heading-actions">
                    <button type="button" className="icon-btn icon-btn--sm" onClick={() => openEdit(overall)} title="Edit overall budget"><Pencil size={15} /></button>
                    <button type="button" className="icon-btn icon-btn--sm danger-text" onClick={() => remove(overall)} title="Delete overall budget"><Trash2 size={15} /></button>
                  </div>
                )}
              </div>
              {overall ? (
                <>
                  <div className="overall-amount-row">
                    <div><span>Spent</span><strong>{formatMoney(overall.spent, currency)}</strong></div>
                    <div><span>Remaining</span><strong className={overall.remaining <= 0 ? 'text-negative' : 'text-positive'}>{formatMoney(overall.remaining, currency)}</strong></div>
                  </div>
                  <ProgressBar value={overallPct} tone={toneForPercentage(overallPct)} height={12} showValue label="Budget used" />
                  <div className="budget-status-line">
                    {overallPct >= 100
                      ? <span className="text-negative"><AlertTriangle size={15} /> Budget exceeded by {formatMoney(overall.spent - overallLimit, currency)}</span>
                      : overallPct >= 80
                        ? <span className="text-warning"><AlertTriangle size={15} /> You've used {overallPct}% of your budget</span>
                        : <span className="text-positive"><CheckCircle2 size={15} /> You're on track — {formatMoney(overallLimit - overall.spent, currency)} left</span>}
                    <span>Limit: {formatMoney(overallLimit, currency)}</span>
                  </div>
                </>
              ) : (
                <div className="budget-empty-inline">
                  <EmptyState compact icon={Target} title="No overall budget set" description="Create one to track your total monthly spending." action={<Button size="sm" onClick={() => setModal({ open: true, initial: null, overall: true })}>Set Overall Budget</Button>} />
                </div>
              )}
            </div>
            <div className="overall-budget-side">
              <div className="donut" style={{ '--pct': `${Math.min(100, overallPct)}%` }}>
                <div className="donut-inner"><strong>{overallPct}%</strong><span>used</span></div>
              </div>
              <p><TrendingUp size={14} /> {overall ? formatMoney(overall.remaining > 0 ? overall.remaining : 0, currency) : '—'} available</p>
            </div>
          </div>
        )}
      </Card>

      <Card padded={false}>
        <CardHeader className="padded-header" title="Category Budgets" subtitle={`${budgets.filter((b) => b.category_id != null).length} limits for ${formatMonth(month)}`} />
        {loading ? <Loader full label="Loading category budgets…" /> : (
          budgets.filter((budget) => budget.category_id != null).length ? (
            <div className="budget-card-grid">
              {budgets.filter((budget) => budget.category_id != null).map((budget) => (
                <div key={budget.id} className="budget-tile">
                  <div className="budget-tile-head">
                    <span className="budget-tile-icon" style={{ color: budget.category_color, background: `${budget.category_color}1f` }}><Target size={17} /></span>
                    <div><strong>{budget.category_name}</strong><span>{formatMoney(budget.amount, currency)} limit</span></div>
                    <div className="row-actions">
                      <button type="button" className="icon-btn icon-btn--sm" onClick={() => openEdit(budget)} title="Edit"><Pencil size={14} /></button>
                      <button type="button" className="icon-btn icon-btn--sm danger-text" onClick={() => remove(budget)} title="Delete"><Trash2 size={14} /></button>
                    </div>
                  </div>
                  <ProgressBar value={budget.percentage} tone={toneForPercentage(budget.percentage)} showValue />
                  <div className="budget-tile-foot">
                    <span>{formatMoney(budget.spent, currency)} spent</span>
                    <span className={budget.remaining <= 0 ? 'text-negative' : 'muted'}>{formatMoney(budget.remaining, currency)} left</span>
                  </div>
                  {budget.status === 'over' && <div className="budget-warning"><AlertTriangle size={13} /> Over limit by {formatMoney(budget.spent - budget.amount, currency)}</div>}
                  {budget.status === 'warning' && <div className="budget-warning budget-warning--soft"><AlertTriangle size={13} /> Approaching limit</div>}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={Target} title="No category budgets yet" description="Set category-wise limits to see progress bars and warnings." action={<Button icon={Plus} size="sm" onClick={() => setModal({ open: true, initial: null, overall: false })}>Add Category Budget</Button>} />
          )
        )}
      </Card>

      <Modal
        open={modal.open}
        onClose={() => setModal({ open: false, initial: null, overall: false })}
        title={modal.initial ? 'Edit Budget' : modal.overall ? 'Set Overall Budget' : 'Create Budget'}
        subtitle="Choose a month, scope and monthly limit."
      >
        <BudgetForm
          initial={modal.initial}
          categories={categories}
          allowCategory={!modal.overall}
          submitting={saving}
          onCancel={() => setModal({ open: false, initial: null, overall: false })}
          onSubmit={submit}
        />
      </Modal>
    </div>
  );
}
