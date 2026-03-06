import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.PROD ? '/api' : 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para inyectar token si existe
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('clp_term_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
