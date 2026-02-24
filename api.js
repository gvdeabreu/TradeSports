// frontend/lib/api.js
import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:4001' });

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const t = localStorage.getItem('token');
    if (t) config.headers.Authorization = `Bearer ${t}`;
  }
  return config;
});

export default api;
