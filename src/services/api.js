import axios from 'axios';

const api = axios.create({
  // ✅ الرابط الثابت بتاع ngrok
  baseURL: 'https://kilogram-parabola-showing.ngrok-free.dev/api', 
});

// ✅ Interceptor للطلبات (بيضيف التوكن)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ Interceptor للردود (بيعالج 401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;