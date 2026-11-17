import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, LockKeyhole, ShieldCheck } from 'lucide-react';
import { AuthBrand } from './Login';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../api/client';
import Button from '../components/ui/Button';
import Field from '../components/ui/Field';

const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'AED', 'SGD', 'AUD', 'CAD', 'JPY'];

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { notify } = useToast();
  const [form, setForm] = useState({ name: '', email: '', currency: 'INR', password: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState({});

  const change = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
    setErrors({ ...errors, [event.target.name]: undefined });
  };

  const submit = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (form.name.trim().length < 2) nextErrors.name = 'Enter your full name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) nextErrors.email = 'Enter a valid email address.';
    if (form.password.length < 8) nextErrors.password = 'Use at least 8 characters.';
    else if (!/[a-z]/i.test(form.password) || !/\d/.test(form.password)) nextErrors.password = 'Include at least one letter and one number.';
    if (form.confirm !== form.password) nextErrors.confirm = 'Passwords do not match.';
    if (Object.keys(nextErrors).length) return setErrors(nextErrors);

    setBusy(true);
    try {
      await register({ name: form.name.trim(), email: form.email.trim(), currency: form.currency, password: form.password });
      notify('Your FinTrack account is ready!');
      navigate('/', { replace: true });
    } catch (error) {
      notify(getErrorMessage(error), 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      <AuthBrand />
      <main className="auth-panel auth-panel--register">
        <div className="auth-form-wrap">
          <div className="auth-mobile-logo"><span className="brand-mark">F</span><strong>FinTrack</strong></div>
          <p className="auth-eyebrow">GET STARTED FREE</p>
          <h1>Create your account</h1>
          <p className="auth-intro">Start building a clearer financial future in under a minute.</p>

          <form onSubmit={submit} className="auth-form">
            <Field label="Full name" name="name" placeholder="Aarav Sharma" value={form.name} onChange={change} error={errors.name} required />
            <Field label="Email address" name="email" type="email" placeholder="you@example.com" value={form.email} onChange={change} error={errors.email} required />
            <Field label="Preferred currency" name="currency" as="select" value={form.currency} onChange={change}>
              {CURRENCIES.map((currency) => <option key={currency} value={currency}>{currency}</option>)}
            </Field>
            <div className="field">
              <label htmlFor="password" className="field-label">Password</label>
              <div className="password-wrap">
                <LockKeyhole size={17} />
                <input id="password" name="password" type={showPassword ? 'text' : 'password'} placeholder="At least 8 characters" value={form.password} onChange={change} className={`control ${errors.password ? 'control--error' : ''}`} />
                <button type="button" className="password-toggle" onClick={() => setShowPassword((v) => !v)} aria-label="Toggle password visibility">
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {errors.password ? <span className="field-error">{errors.password}</span> : <span className="field-hint">Use a mix of letters and numbers.</span>}
            </div>
            <Field label="Confirm password" name="confirm" type={showPassword ? 'text' : 'password'} placeholder="Re-enter password" value={form.confirm} onChange={change} error={errors.confirm} required />
            <Button type="submit" size="lg" loading={busy} className="auth-submit">
              Create Account <ArrowRight size={17} />
            </Button>
          </form>

          <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
          <div className="auth-security"><ShieldCheck size={15} /> Passwords are securely hashed. No card required.</div>
        </div>
      </main>
    </div>
  );
}
