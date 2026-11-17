import React, { useState } from 'react';
import {
  CalendarDays, CheckCircle2, Flag, Pencil, PiggyBank, Plus, Target, Trash2, TrendingUp,
} from 'lucide-react';
import { api, endpoints, getErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useApiData } from '../utils/useApi';
import { formatDate, formatMoney } from '../utils/format';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Loader from '../components/ui/Loader';
import ProgressBar from '../components/ui/ProgressBar';
import EmptyState from '../components/ui/EmptyState';
import SavingsForm from '../components/forms/SavingsForm';

export default function Savings() {
  const { user } = useAuth();
  const { notify } = useToast();
  const currency = user?.currency || 'INR';
  const [modal, setModal] = useState({ open: false, initial: null, contribution: false });
  const [saving, setSaving] = useState(false);

  const { data, loading, error, reload } = useApiData(endpoints.savings);
  const goals = data?.savings || [];
  const totals = data?.totals || {};

  const submit = async (values) => {
    setSaving(true);
    try {
      if (modal.contribution) {
        await api.post(`${endpoints.savings}/${modal.initial.id}/contribute`, values);
        notify('Contribution added to your goal.');
      } else if (modal.initial) {
        await api.put(`${endpoints.savings}/${modal.initial.id}`, values);
        notify('Savings goal updated.');
      } else {
        await api.post(endpoints.savings, values);
        notify('Savings goal created.');
      }
      setModal({ open: false, initial: null, contribution: false });
      reload();
    } catch (err) {
      notify(getErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (goal) => {
    if (!window.confirm(`Delete the savings goal "${goal.name}"?`)) return;
    try {
      await api.delete(`${endpoints.savings}/${goal.id}`);
      notify('Savings goal deleted.');
      reload();
    } catch (err) {
      notify(getErrorMessage(err), 'error');
    }
  };

  return (
    <div className="page-stack">
      <div className="page-heading">
        <div>
          <p className="page-eyebrow"><PiggyBank size={14} /> FUTURE PLANNING</p>
          <h2>Savings Goals</h2>
          <p className="page-subtitle">Turn your plans into milestones, one contribution at a time.</p>
        </div>
        <Button icon={Plus} onClick={() => setModal({ open: true, initial: null, contribution: false })}>New Goal</Button>
      </div>

      <div className="mini-stats-grid">
        <div className="mini-stat"><span>Total saved</span><strong className="text-positive">{formatMoney(totals.saved, currency)}</strong></div>
        <div className="mini-stat"><span>Target amount</span><strong>{formatMoney(totals.targeted, currency)}</strong></div>
        <div className="mini-stat"><span>Overall progress</span><strong>{totals.progress || 0}%</strong></div>
        <div className="mini-stat"><span>Goals completed</span><strong>{totals.completed || 0} / {totals.goals || 0}</strong></div>
      </div>

      <Card>
        <div className="overall-savings-bar">
          <div className="overall-savings-label"><Target size={17} /><strong>Progress across all goals</strong></div>
          <ProgressBar value={totals.progress || 0} tone="cyan" height={10} showValue />
        </div>
      </Card>

      {error && <div className="alert alert--error">{getErrorMessage(error)} <button onClick={reload}>Retry</button></div>}

      {loading ? <Loader full label="Loading goals…" /> : goals.length ? (
        <div className="goal-grid">
          {goals.map((goal) => {
            const complete = goal.status === 'completed' || goal.progress >= 100;
            return (
              <Card key={goal.id} className={`goal-card ${complete ? 'goal-card--complete' : ''}`}>
                <div className="goal-card-head">
                  <span className="goal-icon" style={{ color: goal.color, background: `${goal.color}20` }}>
                    {complete ? <CheckCircle2 size={20} /> : <Flag size={20} />}
                  </span>
                  <div className="goal-title">
                    <h3>{goal.name}</h3>
                    <span className={`goal-status goal-status--${goal.status}`}>{complete ? 'Completed' : goal.status}</span>
                  </div>
                  <div className="row-actions">
                    <button type="button" className="icon-btn icon-btn--sm" onClick={() => setModal({ open: true, initial: goal, contribution: false })} title="Edit goal"><Pencil size={14} /></button>
                    <button type="button" className="icon-btn icon-btn--sm danger-text" onClick={() => remove(goal)} title="Delete goal"><Trash2 size={14} /></button>
                  </div>
                </div>
                {goal.description && <p className="goal-description">{goal.description}</p>}
                <div className="goal-amounts">
                  <div><span>Saved</span><strong>{formatMoney(goal.current_amount, currency)}</strong></div>
                  <div className="align-right"><span>Target</span><strong>{formatMoney(goal.target_amount, currency)}</strong></div>
                </div>
                <ProgressBar value={goal.progress} tone={complete ? 'success' : 'primary'} height={9} showValue />
                <div className="goal-foot">
                  <span><CalendarDays size={13} /> {goal.target_date ? `Target: ${formatDate(goal.target_date, { day: '2-digit', month: 'short', year: 'numeric' })}` : 'No deadline'}</span>
                  <strong>{goal.remaining > 0 ? `${formatMoney(goal.remaining, currency)} to go` : 'Goal reached!'}</strong>
                </div>
                {!complete && (
                  <Button variant="secondary" size="sm" icon={TrendingUp} className="goal-contribute" onClick={() => setModal({ open: true, initial: goal, contribution: true })}>
                    Add Contribution
                  </Button>
                )}
              </Card>
            );
          })}
        </div>
      ) : (
        <Card><EmptyState icon={PiggyBank} title="No savings goals yet" description="Create your first goal — a laptop, a trip, an emergency fund — and start tracking progress." action={<Button icon={Plus} onClick={() => setModal({ open: true, initial: null, contribution: false })}>Create Goal</Button>} /></Card>
      )}

      <Modal
        open={modal.open}
        onClose={() => setModal({ open: false, initial: null, contribution: false })}
        title={modal.contribution ? 'Add Contribution' : modal.initial ? 'Edit Savings Goal' : 'Create Savings Goal'}
        subtitle={modal.contribution ? `Adding to "${modal.initial?.name}"` : 'Define what you are saving for.'}
      >
        <SavingsForm initial={modal.initial} contribution={modal.contribution} submitting={saving} onCancel={() => setModal({ open: false, initial: null, contribution: false })} onSubmit={submit} />
      </Modal>
    </div>
  );
}
