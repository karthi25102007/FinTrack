import axios from 'axios';

const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fintrack_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !String(error.config?.url || '').includes('/login')) {
      localStorage.removeItem('fintrack_token');
      window.dispatchEvent(new CustomEvent('fintrack:unauthorized'));
    }
    return Promise.reject(error);
  }
);

export const endpoints = {
  auth: {
    register: '/register',
    login: '/login',
    logout: '/logout',
    me: '/auth/me',
    updateProfile: '/profile',
    changePassword: '/profile/password',
  },
  dashboard: '/dashboard',
  transactions: '/transactions',
  categories: '/categories',
  budgets: '/budgets',
  savings: '/savings',
  analytics: '/analytics',
  insights: '/insights',
  reports: '/reports',
  export: '/reports/export',
  health: '/health',
};

export function getErrorMessage(error) {
  const data = error?.response?.data;
  if (data?.errors && typeof data.errors === 'object') {
    const first = Object.values(data.errors)[0];
    if (typeof first === 'string') return first;
  }
  return data?.message || error?.message || 'Something went wrong. Please try again.';
}

export function downloadFile(url, filename) {
  return api
    .get(url, { responseType: 'blob' })
    .then((response) => {
      const objectUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = objectUrl;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(objectUrl);
    });
}

export default api;
