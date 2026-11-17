import React, { useEffect, useState } from 'react';
import Button from '../ui/Button';
import Field from '../ui/Field';
import { todayISO } from '../../utils/format';

const PAYMENT_METHODS = [
  { value: 'upi', label: 'UPI / Digital Wallet' },
  { value: 'card', label: 'Credit / Debit Card' },
  { value: 'bank', label: 'Bank Transfer' },
  { value: 'cash', label: 'Cash' },
  { value: 'other', label: 'Other' },
];

export default function TransactionForm({ type = 'expense', categories = [], initial, onSubmit, submitting, onCancel }) {
  const [form, setForm] = useState({
    amount: initial?.amount ?? '',
    category_id: initial?.category_id ?? '',
    description: initial?.description ?? '',
    date: initial?.transaction_date ? String(initial.transaction_date).slice(0, 10) : todayISO(),
    payment_method: initial?.payment_method || 'upi',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!form.category_id && categories.length) {
      setForm((current) => ({ ...current, category_id: String(categories[0].id) }));
    }
  }, [categories, form.category_id]);

  const change = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    setErrors((current) => ({ ...current, [event.target.name]: undefined, amount: event.target.name === 'amount' ? undefined : current.amount }));
  };

  const submit = (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!form.amount || Number(form.amount) <= 0) nextErrors.amount = 'Enter an amount greater than zero.';
    if (!form.category_id) nextErrors.category_id = 'Select a category.';
    if (!form.date) nextErrors.date = 'Select a date.';
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }
    onSubmit({
      type,
      amount: Number(form.amount),
      category_id: Number(form.category_id),
      description: form.description.trim(),
      date: form.date,
      payment_method: form.payment_method,
    });
  };

  return (
    <form onSubmit={submit} className="form-grid">
      <Field
        label={`${type === 'income' ? 'Income' : 'Expense'} amount`}
        name="amount"
        type="number"
        step="0.01"
        min="0.01"
        placeholder="0.00"
        value={form.amount}
        onChange={change}
        error={errors.amount}
        required
      />
      <Field
        label="Category"
        name="category_id"
        as="select"
        value={form.category_id}
        onChange={change}
        error={errors.category_id}
        required
      >
        {categories.map((category) => (
          <option key={category.id} value={category.id}>{category.name}</option>
        ))}
      </Field>
      <Field
        label="Description"
        name="description"
        placeholder={type === 'income' ? 'e.g. Monthly salary' : 'e.g. Grocery shopping'}
        value={form.description}
        onChange={change}
        maxLength={255}
        className="form-grid--full"
      />
      <Field
        label="Date"
        name="date"
        type="date"
        value={form.date}
        onChange={change}
        error={errors.date}
        required
      />
      <Field label="Payment method" name="payment_method" as="select" value={form.payment_method} onChange={change}>
        {PAYMENT_METHODS.map((method) => <option key={method.value} value={method.value}>{method.label}</option>)}
      </Field>
      <div className="form-actions form-grid--full">
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={submitting}>{initial ? 'Save Changes' : `Add ${type}`}</Button>
      </div>
    </form>
  );
}
