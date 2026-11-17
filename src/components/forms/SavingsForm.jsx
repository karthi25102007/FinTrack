import React, { useState } from 'react';
import Button from '../ui/Button';
import Field from '../ui/Field';

const COLORS = ['#22d3ee', '#7c5cff', '#34d399', '#fbbf24', '#f472b6', '#fb7185', '#818cf8'];

export default function SavingsForm({ initial, onSubmit, submitting, onCancel, contribution = false }) {
  const [form, setForm] = useState({
    name: initial?.name || '',
    target_amount: initial?.target_amount ?? '',
    current_amount: initial?.current_amount ?? 0,
    target_date: initial?.target_date ? String(initial.target_date).slice(0, 10) : '',
    description: initial?.description || '',
    color: initial?.color || COLORS[0],
  });
  const [errors, setErrors] = useState({});

  const change = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    setErrors((current) => ({ ...current, [event.target.name]: undefined }));
  };

  const submit = (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!contribution && form.name.trim().length < 2) nextErrors.name = 'Give your goal a name.';
    if (!contribution && (!form.target_amount || Number(form.target_amount) <= 0)) nextErrors.target_amount = 'Enter a target amount.';
    if (contribution && (!form.current_amount || Number(form.current_amount) <= 0)) nextErrors.current_amount = 'Enter an amount to add.';
    if (Object.keys(nextErrors).length) return setErrors(nextErrors);
    onSubmit(contribution
      ? { amount: Number(form.current_amount) }
      : {
          name: form.name.trim(),
          target_amount: Number(form.target_amount),
          current_amount: Number(form.current_amount || 0),
          target_date: form.target_date || null,
          description: form.description.trim(),
          color: form.color,
        });
  };

  if (contribution) {
    return (
      <form onSubmit={submit} className="form-grid">
        <Field
          label="Amount to add"
          name="current_amount"
          type="number"
          step="0.01"
          min="0.01"
          placeholder="0.00"
          value={form.current_amount}
          onChange={change}
          error={errors.current_amount}
          autoFocus
          required
        />
        <div className="form-actions form-grid--full">
          <Button variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button type="submit" loading={submitting}>Add Contribution</Button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={submit} className="form-grid">
      <Field label="Goal name" name="name" placeholder="e.g. Buy a Laptop" value={form.name} onChange={change} error={errors.name} required />
      <Field label="Target amount" name="target_amount" type="number" step="0.01" min="1" placeholder="60000" value={form.target_amount} onChange={change} error={errors.target_amount} required />
      <Field label="Already saved" name="current_amount" type="number" step="0.01" min="0" placeholder="0" value={form.current_amount} onChange={change} hint="Optional — you can add contributions later." />
      <Field label="Target date" name="target_date" type="date" value={form.target_date} onChange={change} />
      <Field label="Description" name="description" placeholder="What are you saving for?" value={form.description} onChange={change} className="form-grid--full" />
      <div className="field form-grid--full">
        <label className="field-label">Goal colour</label>
        <div className="color-picker">
          {COLORS.map((color) => (
            <button
              key={color}
              type="button"
              className={`color-swatch ${form.color === color ? 'color-swatch--active' : ''}`}
              style={{ background: color }}
              onClick={() => setForm((current) => ({ ...current, color }))}
              aria-label={`Choose ${color}`}
            />
          ))}
        </div>
      </div>
      <div className="form-actions form-grid--full">
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={submitting}>{initial ? 'Save Changes' : 'Create Goal'}</Button>
      </div>
    </form>
  );
}
