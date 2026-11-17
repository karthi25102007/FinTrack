import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, BarChart3, Check, Eye, EyeOff, LockKeyhole, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../api/client';
import Button from '../components/ui/Button';
import Field from '../components/ui/Field';

export function AuthBrand() {
  return (
    <aside className="auth-brand">
      <div className="auth-brand-glow" />
      <Link to="/" className="auth-brand-logo">
        <span className="brand-mark">F</span>
        <span><strong>FinTrack</strong><small>SMART FINANCE</small></span>
      </Link>
      <div className="auth-brand-content">
        <span className="auth-pill"><Sparkles size={14} /> Your money, made clear</span>
        <h2>Take control of<br />every rupee.</h2>
        <p>Track spending, plan budgets, grow savings and understand your finances with intelligent insights — all in one beautiful workspace.</p>
        <ul className="auth-features">
          <li><span><Check size={14} /></span> Real-time financial dashboard</li>
          <li><span><Check size={14} /></span> Smart budgets & savings goals</li>
          <li><span><Check size={14} /></span> AI-ready spending insights</li>
          <li><span><Check size={14} /></span> Exportable reports & analytics</li>
        </ul>
      </div>
      <div className="auth-brand-foot">
        <div className="auth-mini-card">
          <div className="auth-mini-icon"><BarChart3 size={18} /></div>
          <div><strong>+24.8%</strong><span>Smarter savings this month</span></div>
        </div>
        <p><ShieldCheck size={14} /> Bank-grade security · Private by design</p>
      </div>
    </aside>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { notify } = useToast();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState({});

  const submit = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!form.email.trim()) nextErrors.email = 'Email is required.';
    if (!form.password) nextErrors.password = 'Password is required.';
    if (Object.keys(nextErrors).length) return setErrors(nextErrors);
    setErrors({});
    setBusy(true);
    try {
      const user = await login(form.email.trim(), form.password);
      notify(`Welcome back, ${user.name.split(' ')[0]}!`);
      navigate(location.state?.from?.pathname || '/', { replace: true });
    } catch (error) {
      notify(getErrorMessage(error), 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      <AuthBrand />
      <main className="auth-panel">
        <div className="auth-form-wrap">
          <div className="auth-mobile-logo"><span className="brand-mark">F</span><strong>FinTrack</strong></div>
          <p className="auth-eyebrow">WELCOME BACK</p>
          <h1>Sign in to your account</h1>
          <p className="auth-intro">Enter your details to access your financial dashboard.</p>

          <form onSubmit={submit} className="auth-form">
            <Field
              label="Email address"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(event) => { setForm({ ...form, email: event.target.value }); setErrors({ ...errors, email: undefined }); }}
              error={errors.email}
              required
            />
            <div className="field">
              <label htmlFor="password" className="field-label">Password</label>
              <div className="password-wrap">
                <LockKeyhole size={17} />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(event) => { setForm({ ...form, password: event.target.value }); setErrors({ ...errors, password: undefined }); }}
                  className={`control ${errors.password ? 'control--error' : ''}`}
                />
                <button type="button" className="password-toggle" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {errors.password && <span className="field-error">{errors.password}</span>}
            </div>
            <Button type="submit" size="lg" loading={busy} className="auth-submit">
              Sign In <ArrowRight size={17} />
            </Button>
          </form>

          <p className="auth-switch">Don't have an account? <Link to="/register">Create one free</Link></p>
          <div className="auth-security"><ShieldCheck size={15} /> Your data is encrypted and never shared.</div>
        </div>
      </main>
    </div>
  );
}
