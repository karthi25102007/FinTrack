import React, { useState } from 'react';
import Button from '../ui/Button';
import Field from '../ui/Field';
import { currentMonth } from '../../utils/format';

export default function BudgetForm({ initial, categories = [], onSubmit, submitting, onCancel, allowCategory = true }) {
  const [form, setForm] = useState({
    month: initial?.budget_month || currentMonth(),
    category_id: initial?.category_id == null ? 'overall' : String(initial.category_id),
    amount: initial?.amount ?? '',
  });
  const [errors, setErrors] = useState({});

  const change = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    setErrors({});
  };

  const submit = (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!form.month) nextErrors.month = 'Select a month.';
    if (!form.amount || Number(form.amount) <= 0) nextErrors.amount = 'Enter a limit greater than zero.';
    if (Object.keys(nextErrors).length) return setErrors(nextErrors);
    onSubmit({
      month: form.month,
      category_id: form.category_id === 'overall' ? null : Number(form.category_id),
      amount: Number(form.amount),
    });
  };

  return (
    <form onSubmit={submit} className="form-grid">
      <Field label="Month" name="month" type="month" value={form.month} onChange={change} error={errors.month} required />
      {allowCategory && (
        <Field label="Applies to" name="category_id" as="select" value={form.category_id} onChange={change}>
          <option value="overall">Overall monthly budget</option>
          {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
        </Field>
      )}
      <Field
        label="Monthly limit"
        name="amount"
        type="number"
        step="0.01"
        min="0.01"
        placeholder="15000"
        value={form.amount}
        onChange={change}
        error={errors.amount}
        className={allowCategory ? '' : 'form-grid--full'}
        required
      />
      <div className="form-actions form-grid--full">
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={submitting}>{initial ? 'Update Budget' : 'Set Budget'}</Button>
      </div>
    </form>
  );
}
