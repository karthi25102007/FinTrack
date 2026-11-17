export function getCurrency(user) {
  return user?.currency || 'INR';
}

export function formatMoney(value, currency = 'INR', compact = false) {
  const amount = Number(value || 0);
  if (compact && Math.abs(amount) >= 100000) {
    return `${symbolFor(currency)}${(amount / 100000).toFixed(1)}L`;
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(amount);
}

export function symbolFor(currency = 'INR') {
  return ({ INR: '₹', USD: '$', EUR: '€', GBP: '£', AED: 'د.إ', SGD: 'S$', AUD: 'A$', CAD: 'C$', JPY: '¥' })[currency] || '₹';
}

export function formatDate(value, options = { day: '2-digit', month: 'short', year: 'numeric' }) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat('en-IN', options).format(date);
}

export function formatMonth(value) {
  if (!value) return '—';
  const [year, month] = String(value).split('-');
  const names = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return `${names[Number(month) - 1]} ${year}`;
}

export function todayISO() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  return new Date(now.getTime() - offset * 60000).toISOString().slice(0, 10);
}

export function currentMonth() {
  return todayISO().slice(0, 7);
}

export function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function initials(name = '') {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join('') || 'FT';
}

export function toneForPercentage(value) {
  if (value >= 100) return 'danger';
  if (value >= 80) return 'warning';
  return 'success';
}
