import axios from 'axios';

// Vite proxies /api to localhost:3001 in dev, so the same base URL works everywhere.
const apiClient = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Add the token to every request so we don't have to do it manually each time.
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On a 401, clear the stale session and send the user back to login.
// Skip the redirect on the login page itself — wrong credentials also return 401
// and we want that error to reach the form's catch block, not cause a reload.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && window.location.pathname !== '/login') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
