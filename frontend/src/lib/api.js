import axios from 'axios';
import { API_BASE_URL } from '../Config';

const api = axios.create({ baseURL: API_BASE_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;

// פונקציה נוחה לבניית URL ציבורי לקבצים/תמונות
export const toPublicUrl = (path) =>
  `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
