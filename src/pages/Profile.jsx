import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound, LogOut, ShieldCheck, UserRound, Wallet } from 'lucide-react';
import { api, endpoints, getErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatDate, initials } from '../utils/format';
import Card, { CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Field from '../components/ui/Field';

const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'AED', 'SGD', 'AUD', 'CAD', 'JPY'];

export default function Profile() {
  const { user, logout, setCurrentUser } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();
  const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '', currency: user?.currency || 'INR' });
  const [password, setPassword] = useState({ current_password: '', new_password: '', confirm: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const saveProfile = async (event) => {
    event.preventDefault();
    setSavingProfile(true);
    try {
      const { data } = await api.put(endpoints.auth.updateProfile, profile);
      setCurrentUser(data.user);
      notify('Profile updated successfully.');
    } catch (err) {
      notify(getErrorMessage(err), 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async (event) => {
    event.preventDefault();
    if (password.new_password !== password.confirm) {
      notify('New passwords do not match.', 'error');
      return;
    }
    setSavingPassword(true);
    try {
      const { data } = await api.put(endpoints.auth.changePassword, {
        current_password: password.current_password,
        new_password: password.new_password,
      });
      notify(data.message || 'Password changed.');
      setPassword({ current_password: '', new_password: '', confirm: '' });
      if (data.require_relogin) {
        localStorage.removeItem('fintrack_token');
        setCurrentUser(null);
        navigate('/login', { replace: true });
      }
    } catch (err) {
      notify(getErrorMessage(err), 'error');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="page-stack profile-page">
      <div className="page-heading">
        <div>
          <p className="page-eyebrow"><UserRound size={14} /> ACCOUNT SETTINGS</p>
          <h2>My Profile</h2>
          <p className="page-subtitle">Manage your personal details and account security.</p>
        </div>
      </div>

      <Card className="profile-hero">
        <div className="avatar avatar--xl">{initials(user?.name)}</div>
        <div>
          <h3>{user?.name}</h3>
          <p>{user?.email}</p>
          <div className="profile-tags">
            <span className="badge badge--primary"><ShieldCheck size={13} /> Verified account</span>
            <span className="badge badge--neutral"><Wallet size={13} /> {user?.currency}</span>
          </div>
        </div>
        <div className="profile-joined">
          <span>Member since</span>
          <strong>{formatDate(user?.created_at, { month: 'long', year: 'numeric' })}</strong>
        </div>
      </Card>

      <div className="profile-grid">
        <Card>
          <CardHeader title="Personal Information" subtitle="Update the details associated with your account." />
          <form onSubmit={saveProfile} className="form-grid">
            <Field label="Full name" name="name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className="form-grid--full" required />
            <Field label="Email address" name="email" type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} required />
            <Field label="Currency" name="currency" as="select" value={profile.currency} onChange={(e) => setProfile({ ...profile, currency: e.target.value })}>
              {CURRENCIES.map((currency) => <option key={currency} value={currency}>{currency}</option>)}
            </Field>
            <div className="form-actions form-grid--full">
              <Button type="submit" loading={savingProfile}>Save Changes</Button>
            </div>
          </form>
        </Card>

        <Card>
          <CardHeader title="Security" subtitle="Keep your account protected with a strong password." />
          <form onSubmit={savePassword} className="form-grid">
            <Field label="Current password" name="current_password" type="password" placeholder="••••••••" value={password.current_password} onChange={(e) => setPassword({ ...password, current_password: e.target.value })} className="form-grid--full" required />
            <Field label="New password" name="new_password" type="password" placeholder="At least 8 characters" value={password.new_password} onChange={(e) => setPassword({ ...password, new_password: e.target.value })} required />
            <Field label="Confirm new password" name="confirm" type="password" placeholder="Re-enter password" value={password.confirm} onChange={(e) => setPassword({ ...password, confirm: e.target.value })} required />
            <div className="form-actions form-grid--full">
              <Button type="submit" variant="secondary" icon={KeyRound} loading={savingPassword}>Change Password</Button>
              <Button variant="ghost" icon={LogOut} onClick={logout}>Sign Out</Button>
            </div>
          </form>
          <div className="profile-security-note"><ShieldCheck size={16} /> Passwords are hashed with scrypt. Changing it signs you out everywhere.</div>
        </Card>
      </div>
    </div>
  );
}
